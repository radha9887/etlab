import { useCallback, useRef, useMemo, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DagNode } from './DagNode';
import { DagNodeContextMenu } from './DagNodeContextMenu';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { isDagPage } from '../../types';
import type { DagTaskNodeData, DagNodeType, DagNodeCategory } from '../../types';

// Context menu state interface
interface ContextMenuState {
  show: boolean;
  position: { x: number; y: number };
  nodeId: string;
  nodeData: DagTaskNodeData | null;
}

// Custom node types
const nodeTypes = {
  dagNode: DagNode,
} as const;

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Get category from node type
const getCategoryFromType = (type: DagNodeType): DagNodeCategory => {
  switch (type) {
    case 'etl_task':
      return 'etl';
    case 'spark_submit':
    case 'python':
    case 'bash':
      return 'action';
    case 'file_sensor':
    case 's3_sensor':
    case 'sql_sensor':
    case 'http_sensor':
    case 'external_sensor':
      return 'sensor';
    case 'branch':
    case 'trigger_dag':
    case 'dummy':
    case 'task_group':
      return 'control';
    case 'email':
    case 'slack':
      return 'notify';
    case 'sql_execute':
      return 'action';
    default:
      return 'action';
  }
};

// Create default config for a node type
const createDefaultConfig = (type: DagNodeType, label: string, pageId?: string, pageName?: string) => {
  const baseConfig = { taskId: label.toLowerCase().replace(/\s+/g, '_') };

  switch (type) {
    case 'etl_task':
      return { ...baseConfig, pageId: pageId || '', pageName: pageName || '' };
    case 'spark_submit':
      return { ...baseConfig, application: '', sparkConfig: { driverMemory: '2g', executorMemory: '4g' } };
    case 'python':
      return { ...baseConfig, pythonCode: '# Python code here\ndef execute():\n    pass' };
    case 'bash':
      return { ...baseConfig, bashCommand: '', env: {} };
    case 'file_sensor':
      return { ...baseConfig, filepath: '', pokeIntervalSeconds: 60, timeoutSeconds: 3600, mode: 'poke' as const, softFail: false };
    case 's3_sensor':
      return { ...baseConfig, bucketName: '', bucketKey: '', wildcardMatch: false, pokeIntervalSeconds: 300, timeoutSeconds: 7200 };
    case 'sql_sensor':
      return { ...baseConfig, connId: '', sql: '', pokeIntervalSeconds: 120, timeoutSeconds: 3600 };
    case 'http_sensor':
      return { ...baseConfig, endpoint: '', method: 'GET' as const, pokeIntervalSeconds: 30, timeoutSeconds: 1800 };
    case 'external_sensor':
      return { ...baseConfig, externalDagId: '', pokeIntervalSeconds: 60, timeoutSeconds: 3600 };
    case 'branch':
      return { ...baseConfig, conditions: [], defaultTaskId: '' };
    case 'trigger_dag':
      return { ...baseConfig, triggerDagId: '', waitForCompletion: false };
    case 'dummy':
      return baseConfig;
    case 'email':
      return { ...baseConfig, to: '', subject: '', htmlContent: '' };
    case 'slack':
      return { ...baseConfig, channel: '', message: '' };
    case 'sql_execute':
      return { ...baseConfig, connId: '', sql: '' };
    default:
      return baseConfig;
  }
};

interface DagCanvasProps {
  onNodeSelect?: (nodeId: string | null) => void;
}

// Inner component that uses React Flow hooks
const DagCanvasContent = ({ onNodeSelect }: DagCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    position: { x: 0, y: 0 },
    nodeId: '',
    nodeData: null,
  });

  // Get DAG page data from store
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const setDagTasks = useWorkspaceStore((state) => state.setDagTasks);
  const setDagEdges = useWorkspaceStore((state) => state.setDagEdges);

  // Derive active page - memoized to prevent unnecessary rerenders
  const { nodes, edges } = useMemo(() => {
    const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
    const activePage = activeWorkspace?.pages.find(p => p.id === activeWorkspace?.activePageId);
    const dagPage = activePage && isDagPage(activePage) ? activePage : null;
    return {
      nodes: dagPage?.tasks || [],
      edges: dagPage?.edges || [],
    };
  }, [workspaces, activeWorkspaceId]);

  // Handle node changes
  const handleNodesChange: OnNodesChange<Node<DagTaskNodeData>> = useCallback(
    (changes) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setDagTasks(newNodes as Node<DagTaskNodeData>[]);
    },
    [nodes, setDagTasks]
  );

  // Handle edge changes
  const handleEdgesChange: OnEdgesChange<Edge> = useCallback(
    (changes) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setDagEdges(newEdges);
    },
    [edges, setDagEdges]
  );

  // Handle new connections
  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `edge-${generateId()}`,
        source: connection.source || '',
        target: connection.target || '',
        type: 'smoothstep',
        animated: true,
      };
      const newEdges = addEdge(newEdge, edges);
      setDagEdges(newEdges);
    },
    [edges, setDagEdges]
  );

  // Handle node selection
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      const nodeId = selectedNodes.length > 0 ? selectedNodes[0].id : null;
      onNodeSelect?.(nodeId);
    },
    [onNodeSelect]
  );

  // Handle drop from sidebar
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      if (!reactFlowWrapper.current) return;

      const data = e.dataTransfer.getData('application/json');
      if (!data) return;

      try {
        const { type, label, pageId, pageName } = JSON.parse(data) as {
          type: DagNodeType;
          category: DagNodeCategory;
          label: string;
          pageId?: string;
          pageName?: string;
        };

        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = {
          x: e.clientX - bounds.left - 90,
          y: e.clientY - bounds.top - 40,
        };

        const nodeLabel = pageName || label;
        const category = getCategoryFromType(type);

        const newNode: Node<DagTaskNodeData> = {
          id: generateId(),
          type: 'dagNode',
          position,
          data: {
            label: nodeLabel,
            type,
            category,
            config: createDefaultConfig(type, nodeLabel, pageId, pageName),
            configured: type === 'etl_task' ? !!pageId : false,
          },
        };

        setDagTasks([...nodes, newNode]);
      } catch (err) {
        console.error('Failed to parse drop data:', err);
      }
    },
    [nodes, setDagTasks]
  );

  // Handle node click - show context menu
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node<DagTaskNodeData>) => {
      event.preventDefault();
      onNodeSelect?.(node.id);
      setContextMenu({
        show: true,
        position: { x: event.clientX, y: event.clientY },
        nodeId: node.id,
        nodeData: node.data,
      });
    },
    [onNodeSelect]
  );

  // Handle pane click - close context menu
  const handlePaneClick = useCallback(() => {
    onNodeSelect?.(null);
    setContextMenu((prev) => ({ ...prev, show: false }));
  }, [onNodeSelect]);

  // Handle connecting input from context menu
  const handleConnectInput = useCallback(
    (sourceNodeId: string, targetNodeId: string) => {
      // Remove existing connection to the target if any
      const existingEdge = edges.find(edge => edge.target === targetNodeId);
      if (existingEdge) {
        const newEdges = edges.filter(e => e.id !== existingEdge.id);
        setDagEdges(newEdges);
      }

      // Create new connection
      setTimeout(() => {
        const newEdge: Edge = {
          id: `edge-${generateId()}`,
          source: sourceNodeId,
          target: targetNodeId,
          type: 'smoothstep',
          animated: true,
        };
        setDagEdges(addEdge(newEdge, edges.filter(e => e.target !== targetNodeId)));
      }, 10);
    },
    [edges, setDagEdges]
  );

  // Handle adding a new connected node from context menu
  const handleContextMenuSelect = useCallback(
    (item: { type?: DagNodeType; label: string; category?: DagNodeCategory }, sourceNodeId: string) => {
      if (!item.type || !item.category) return;

      // Find the source node to get its position
      const sourceNode = nodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) return;

      // Create new node position (to the right of source node)
      const newPosition = {
        x: sourceNode.position.x + 250,
        y: sourceNode.position.y,
      };

      const category = getCategoryFromType(item.type);
      const newId = generateId();

      const newNode: Node<DagTaskNodeData> = {
        id: newId,
        type: 'dagNode',
        position: newPosition,
        data: {
          label: item.label,
          type: item.type,
          category,
          config: createDefaultConfig(item.type, item.label),
          configured: false,
        },
      };

      // Add the new node
      setDagTasks([...nodes, newNode]);

      // Connect source to new node
      setTimeout(() => {
        const newEdge: Edge = {
          id: `edge-${generateId()}`,
          source: sourceNodeId,
          target: newId,
          type: 'smoothstep',
          animated: true,
        };
        setDagEdges(addEdge(newEdge, edges));

        // Select the new node
        onNodeSelect?.(newId);
      }, 10);

      // Close the context menu
      setContextMenu((prev) => ({ ...prev, show: false }));
    },
    [nodes, edges, setDagTasks, setDagEdges, onNodeSelect]
  );

  // Handle action from context menu
  const handleContextMenuAction = useCallback(
    (action: string, nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      switch (action) {
        case 'configure':
          onNodeSelect?.(nodeId);
          break;

        case 'preview':
          // TODO: Show code preview
          onNodeSelect?.(nodeId);
          break;

        case 'delete':
          // Remove node and its edges
          const newNodes = nodes.filter((n) => n.id !== nodeId);
          const newEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
          setDagTasks(newNodes);
          setDagEdges(newEdges);
          onNodeSelect?.(null);
          break;

        case 'duplicate':
          const newId = generateId();
          const duplicatedNode: Node<DagTaskNodeData> = {
            id: newId,
            type: 'dagNode',
            position: {
              x: node.position.x + 50,
              y: node.position.y + 50,
            },
            data: { ...node.data, configured: false },
          };
          setDagTasks([...nodes, duplicatedNode]);
          onNodeSelect?.(newId);
          break;

        default:
          console.log('Action:', action, 'Node:', nodeId);
      }

      // Close the context menu
      setContextMenu((prev) => ({ ...prev, show: false }));
    },
    [nodes, edges, setDagTasks, setDagEdges, onNodeSelect]
  );

  // Close context menu
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
        onSelectionChange={handleSelectionChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6b7280', strokeWidth: 2 },
        }}
        className="bg-canvas"
      >
        <Background color="#374151" gap={20} size={1} />
        <Controls className="!bg-panel !border-gray-700" />
      </ReactFlow>

      {/* Context Menu */}
      {contextMenu.show && contextMenu.nodeData && (
        <DagNodeContextMenu
          position={contextMenu.position}
          nodeId={contextMenu.nodeId}
          nodeData={contextMenu.nodeData}
          allNodes={nodes}
          allEdges={edges}
          onSelect={handleContextMenuSelect}
          onAction={handleContextMenuAction}
          onConnectInput={handleConnectInput}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

// Exported component with ReactFlowProvider wrapper
export const DagCanvas = ({ onNodeSelect }: DagCanvasProps) => {
  return (
    <ReactFlowProvider>
      <DagCanvasContent onNodeSelect={onNodeSelect} />
    </ReactFlowProvider>
  );
};
