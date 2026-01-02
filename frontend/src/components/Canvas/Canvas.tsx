import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
} from '@xyflow/react';
import type { Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../stores/workflowStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { ETLNode } from '../Nodes/ETLNode';
import { NodeContextMenu } from './NodeContextMenu';
import type { DraggableNodeItem, ETLNodeData, SourceNodeData, TransformNodeData, SinkNodeData, ActionNodeData, ActionType, ActionConfig } from '../../types';

const nodeTypes = {
  etlNode: ETLNode,
};

let nodeId = 0;
const getNodeId = () => `node_${nodeId++}`;

// Default configurations for action nodes
const getDefaultActionConfig = (actionType: ActionType): ActionConfig => {
  switch (actionType) {
    case 'show':
      return { numRows: 20, truncate: true, vertical: false };
    case 'take':
      return { numRows: 10 };
    case 'head':
      return { numRows: 5 };
    default:
      return {};
  }
};

interface ContextMenuState {
  show: boolean;
  position: { x: number; y: number };
  nodeId: string;
  nodeCategory: 'source' | 'transform' | 'sink' | 'action';
  nodeData: ETLNodeData | null;
}

const CanvasContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    position: { x: 0, y: 0 },
    nodeId: '',
    nodeCategory: 'source',
    nodeData: null,
  });

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const addNode = useWorkflowStore((state) => state.addNode);
  const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  // Check if user can edit
  const canEdit = useWorkspaceStore((state) => state.canEdit);
  const isReadOnly = !canEdit();

  // Wrap change handlers to prevent editing for viewers
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      if (isReadOnly) {
        // Only allow selection changes for viewers
        const allowedChanges = changes.filter(
          (change) => change.type === 'select'
        );
        if (allowedChanges.length > 0) {
          onNodesChange(allowedChanges);
        }
        return;
      }
      onNodesChange(changes);
    },
    [onNodesChange, isReadOnly]
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof onEdgesChange>[0]) => {
      if (isReadOnly) {
        // Only allow selection changes for viewers
        const allowedChanges = changes.filter(
          (change) => change.type === 'select'
        );
        if (allowedChanges.length > 0) {
          onEdgesChange(allowedChanges);
        }
        return;
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, isReadOnly]
  );

  const handleConnect = useCallback(
    (connection: Parameters<typeof onConnect>[0]) => {
      if (isReadOnly) {
        return; // Block all connections for viewers
      }
      onConnect(connection);
    },
    [onConnect, isReadOnly]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = isReadOnly ? 'none' : 'move';
  }, [isReadOnly]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Don't allow drop if read-only
      if (isReadOnly) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = event.dataTransfer.getData('application/reactflow');

      if (!data || !reactFlowBounds) {
        return;
      }

      const nodeData: DraggableNodeItem = JSON.parse(data);

      const position = {
        x: event.clientX - reactFlowBounds.left - 80,
        y: event.clientY - reactFlowBounds.top - 40,
      };

      let newNodeData: ETLNodeData;

      if (nodeData.category === 'source') {
        newNodeData = {
          label: nodeData.label,
          category: 'source',
          sourceType: nodeData.sourceType!,
          configured: false,
          schema: (nodeData as any).schema?.columns,
        } as SourceNodeData;
      } else if (nodeData.category === 'transform') {
        newNodeData = {
          label: nodeData.label,
          category: 'transform',
          transformType: nodeData.transformType!,
          configured: false,
        } as TransformNodeData;
      } else if (nodeData.category === 'action') {
        newNodeData = {
          label: nodeData.label,
          category: 'action',
          actionType: nodeData.actionType!,
          configured: true, // Actions typically don't need config (or have sensible defaults)
          config: getDefaultActionConfig(nodeData.actionType!),
        } as ActionNodeData;
      } else {
        newNodeData = {
          label: nodeData.label,
          category: 'sink',
          sinkType: nodeData.sinkType!,
          configured: false,
        } as SinkNodeData;
      }

      const newNode: Node<ETLNodeData> = {
        id: getNodeId(),
        type: 'etlNode',
        position,
        data: newNodeData,
      };

      addNode(newNode);
    },
    [addNode, isReadOnly]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node<ETLNodeData>) => {
      event.preventDefault();

      // Set selected node for properties panel
      setSelectedNode(node);

      // Show context menu
      setContextMenu({
        show: true,
        position: {
          x: event.clientX,
          y: event.clientY,
        },
        nodeId: node.id,
        nodeCategory: node.data.category,
        nodeData: node.data,
      });
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    // Don't deselect node or close context menu when clicking on pane
    // User can close context menu via X button or by selecting an option
    // This keeps the properties panel open for better UX
    if (!contextMenu.show) {
      setSelectedNode(null);
    }
  }, [setSelectedNode, contextMenu.show]);

  // Handle connecting primary input to any transform/sink node
  const handleConnectInput = useCallback(
    (sourceNodeId: string, targetNodeId: string, handleId?: string) => {
      // Remove existing connection to the target handle if any
      const targetHandle = handleId || null;
      const existingEdge = edges.find(
        edge => edge.target === targetNodeId &&
          (targetHandle ? edge.targetHandle === targetHandle : !edge.targetHandle || edge.targetHandle === 'input-1')
      );

      if (existingEdge) {
        // Remove the existing edge first
        onEdgesChange([{ type: 'remove', id: existingEdge.id }]);
      }

      // Create new connection
      setTimeout(() => {
        onConnect({
          source: sourceNodeId,
          target: targetNodeId,
          sourceHandle: null,
          targetHandle: targetHandle,
        });
      }, 10);
    },
    [edges, onEdgesChange, onConnect]
  );

  // Handle connecting a second input to Join/Union nodes
  const handleConnectSecondInput = useCallback(
    (sourceNodeId: string, targetNodeId: string) => {
      // Remove existing connection to input-2 if any
      const existingEdge = edges.find(
        edge => edge.target === targetNodeId && edge.targetHandle === 'input-2'
      );

      if (existingEdge) {
        // Remove the existing edge first
        onEdgesChange([{ type: 'remove', id: existingEdge.id }]);
      }

      // Create new connection to input-2
      setTimeout(() => {
        onConnect({
          source: sourceNodeId,
          target: targetNodeId,
          sourceHandle: null,
          targetHandle: 'input-2',
        });
      }, 10);
    },
    [edges, onEdgesChange, onConnect]
  );

  // Handle adding a new connected node from context menu
  const handleContextMenuSelect = useCallback(
    (item: { type?: string; label: string; category?: 'transform' | 'sink' | 'action' }, sourceNodeId: string) => {
      if (!item.type || !item.category || item.category === 'action') return;

      // Find the source node to get its position
      const sourceNode = nodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) return;

      // Create new node position (to the right of source node)
      const newPosition = {
        x: sourceNode.position.x + 250,
        y: sourceNode.position.y,
      };

      let newNodeData: ETLNodeData;
      const newId = getNodeId();

      if (item.category === 'transform') {
        newNodeData = {
          label: item.label,
          category: 'transform',
          transformType: item.type as TransformNodeData['transformType'],
          configured: false,
        } as TransformNodeData;
      } else {
        newNodeData = {
          label: item.label,
          category: 'sink',
          sinkType: item.type as SinkNodeData['sinkType'],
          configured: false,
        } as SinkNodeData;
      }

      const newNode: Node<ETLNodeData> = {
        id: newId,
        type: 'etlNode',
        position: newPosition,
        data: newNodeData,
      };

      // Add the new node
      addNode(newNode);

      // Connect source to new node
      const targetHandle = (item.type === 'join' || item.type === 'union') ? 'input-1' : undefined;

      setTimeout(() => {
        onConnect({
          source: sourceNodeId,
          target: newId,
          sourceHandle: null,
          targetHandle: targetHandle || null,
        });

        // Select the new node to open properties panel
        setSelectedNode({ ...newNode });
      }, 10);

      // Close the context menu
      setContextMenu((prev) => ({ ...prev, show: false }));
    },
    [nodes, addNode, onConnect, setSelectedNode]
  );

  // Handle action from context menu
  const handleContextMenuAction = useCallback(
    (action: string, nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      // Block edit actions for viewers
      const editActions = ['delete', 'duplicate', 'configure', 'swapInputs', 'changeJoinType',
        'addCondition', 'addAggregation', 'addSortColumn', 'addDerived', 'selectAll', 'reverseOrder', 'toggleSql'];
      if (isReadOnly && editActions.includes(action)) {
        setContextMenu((prev) => ({ ...prev, show: false }));
        return;
      }

      switch (action) {
        case 'configure':
          // Open properties panel (already selected)
          setSelectedNode(node);
          break;

        case 'delete':
          deleteNode(nodeId);
          break;

        case 'duplicate':
          // Create a copy of the node
          const newId = getNodeId();
          const duplicatedNode: Node<ETLNodeData> = {
            id: newId,
            type: 'etlNode',
            position: {
              x: node.position.x + 50,
              y: node.position.y + 50,
            },
            data: { ...node.data, configured: false },
          };
          addNode(duplicatedNode);
          setSelectedNode(duplicatedNode);
          break;

        case 'preview':
          // TODO: Implement data preview
          alert('Preview feature coming soon!');
          break;

        case 'viewSchema':
          // Show schema in properties panel
          setSelectedNode(node);
          break;

        case 'swapInputs':
          // TODO: Swap join inputs
          alert('Swap inputs feature coming soon!');
          break;

        case 'changeJoinType':
          // Open properties panel for join config
          setSelectedNode(node);
          break;

        case 'addCondition':
        case 'addAggregation':
        case 'addSortColumn':
        case 'addDerived':
          // Open properties panel
          setSelectedNode(node);
          break;

        case 'selectAll':
          // Set select config to "*"
          // TODO: Implement
          setSelectedNode(node);
          break;

        case 'reverseOrder':
          // TODO: Implement reverse sort
          alert('Reverse order feature coming soon!');
          break;

        case 'toggleSql':
          // TODO: Toggle SQL mode in filter
          setSelectedNode(node);
          break;

        default:
          console.log('Action:', action, 'Node:', nodeId);
      }

      // Close the context menu
      setContextMenu((prev) => ({ ...prev, show: false }));
    },
    [nodes, addNode, deleteNode, setSelectedNode, isReadOnly]
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, show: false }));
  }, []);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        elementsSelectable={true}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#4f46e5', strokeWidth: 2 },
        }}
        className="bg-canvas"
      >
        <Background color="#374151" gap={20} size={1} />
        <Controls className="!bg-panel !border-gray-700 !shadow-lg" />
      </ReactFlow>

      {/* Context Menu */}
      {contextMenu.show && contextMenu.nodeData && (
        <NodeContextMenu
          position={contextMenu.position}
          nodeId={contextMenu.nodeId}
          nodeCategory={contextMenu.nodeCategory}
          nodeData={contextMenu.nodeData}
          allNodes={nodes}
          allEdges={edges}
          onSelect={handleContextMenuSelect}
          onAction={handleContextMenuAction}
          onConnectInput={handleConnectInput}
          onConnectSecondInput={handleConnectSecondInput}
          onClose={closeContextMenu}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
};

export const Canvas = () => {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
};
