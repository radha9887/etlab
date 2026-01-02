import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
} from '@xyflow/react';
import type { ETLNodeData } from '../types';
import { isWorkflowPage } from '../types';
import { useWorkspaceStore } from './workspaceStore';

interface WorkflowState {
  selectedNode: Node<ETLNodeData> | null;

  // Computed getters that delegate to workspace store
  getNodes: () => Node<ETLNodeData>[];
  getEdges: () => Edge[];

  // For React Flow compatibility - these are computed
  nodes: Node<ETLNodeData>[];
  edges: Edge[];

  // Actions
  onNodesChange: OnNodesChange<Node<ETLNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node<ETLNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<ETLNodeData>) => void;
  setSelectedNode: (node: Node<ETLNodeData> | null) => void;
  deleteNode: (nodeId: string) => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  selectedNode: null,

  // These will be updated by the subscription below
  nodes: [],
  edges: [],

  getNodes: () => {
    return useWorkspaceStore.getState().getActiveNodes();
  },

  getEdges: () => {
    return useWorkspaceStore.getState().getActiveEdges();
  },

  onNodesChange: (changes) => {
    const currentNodes = useWorkspaceStore.getState().getActiveNodes();
    const newNodes = applyNodeChanges(changes, currentNodes);
    useWorkspaceStore.getState().setNodes(newNodes as Node<ETLNodeData>[]);
  },

  onEdgesChange: (changes) => {
    const currentEdges = useWorkspaceStore.getState().getActiveEdges();
    const newEdges = applyEdgeChanges(changes, currentEdges);
    useWorkspaceStore.getState().setEdges(newEdges);
  },

  onConnect: (connection: Connection) => {
    const currentEdges = useWorkspaceStore.getState().getActiveEdges();
    const newEdges = addEdge(
      {
        ...connection,
        animated: true,
        style: { stroke: '#4f46e5', strokeWidth: 2 },
      },
      currentEdges
    );
    useWorkspaceStore.getState().setEdges(newEdges);
  },

  addNode: (node) => {
    const currentNodes = useWorkspaceStore.getState().getActiveNodes();
    useWorkspaceStore.getState().setNodes([...currentNodes, node]);
  },

  updateNodeData: (nodeId, data) => {
    const currentNodes = useWorkspaceStore.getState().getActiveNodes();
    const updatedNodes = currentNodes.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...data } as ETLNodeData }
        : node
    ) as Node<ETLNodeData>[];
    useWorkspaceStore.getState().setNodes(updatedNodes);

    // Update selected node if it matches
    const selectedNode = get().selectedNode;
    if (selectedNode?.id === nodeId) {
      const updatedNode = updatedNodes.find(n => n.id === nodeId);
      if (updatedNode) {
        set({ selectedNode: updatedNode });
      }
    }
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },

  deleteNode: (nodeId) => {
    const currentNodes = useWorkspaceStore.getState().getActiveNodes();
    const currentEdges = useWorkspaceStore.getState().getActiveEdges();

    const newNodes = currentNodes.filter((node) => node.id !== nodeId);
    const newEdges = currentEdges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );

    useWorkspaceStore.getState().updatePageContent(newNodes, newEdges);

    // Clear selected node if deleted
    const selectedNode = get().selectedNode;
    if (selectedNode?.id === nodeId) {
      set({ selectedNode: null });
    }
  },

  clearWorkflow: () => {
    useWorkspaceStore.getState().updatePageContent([], []);
    set({ selectedNode: null });
  },
}));

// Subscribe to workspace store changes and sync nodes/edges
useWorkspaceStore.subscribe((state) => {
  const activePage = state.getActivePage();
  // Only sync if it's a workflow page
  if (activePage && isWorkflowPage(activePage)) {
    useWorkflowStore.setState({
      nodes: activePage.nodes || [],
      edges: activePage.edges || [],
    });
  } else {
    // Clear nodes/edges for non-workflow pages
    useWorkflowStore.setState({
      nodes: [],
      edges: [],
    });
  }
});

// Initialize nodes/edges from workspace store
const initActivePage = useWorkspaceStore.getState().getActivePage();
if (initActivePage && isWorkflowPage(initActivePage)) {
  useWorkflowStore.setState({
    nodes: initActivePage.nodes,
    edges: initActivePage.edges,
  });
}
