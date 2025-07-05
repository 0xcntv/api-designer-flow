
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NodePalette } from '@/components/NodePalette';
import { NodePropertiesPanel } from '@/components/NodePropertiesPanel';
import { SaveLoadPanel } from '@/components/SaveLoadPanel';
import { FlowCanvas } from '@/components/FlowCanvas';
import { trpc } from '@/utils/trpc';
import type { ApiDesign } from '../../server/src/schema';

export interface FlowNode {
  id: string;
  type: 'start' | 'httpRequest' | 'databaseQuery' | 'response';
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: string;
    table?: string;
    queryType?: string;
    query?: string;
    statusCode?: number;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

interface DesignData {
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: { x: number; y: number; zoom: number };
}

function App() {
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [designs, setDesigns] = useState<ApiDesign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [currentDesignName, setCurrentDesignName] = useState<string>('');

  const loadDesigns = useCallback(async () => {
    try {
      const result = await trpc.getApiDesigns.query();
      setDesigns(result);
    } catch (error) {
      console.error('Failed to load designs:', error);
    }
  }, []);

  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  const addNode = useCallback((type: FlowNode['type'], label: string) => {
    const newNode: FlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label,
        // Initialize with default properties based on node type
        ...(type === 'start' && { description: '' }),
        ...(type === 'httpRequest' && { 
          method: 'GET', 
          url: '', 
          headers: {}, 
          body: '' 
        }),
        ...(type === 'databaseQuery' && { 
          table: '', 
          queryType: 'SELECT', 
          query: '' 
        }),
        ...(type === 'response' && { 
          statusCode: 200, 
          body: '{}' 
        }),
      },
    };
    setNodes((prev: FlowNode[]) => [...prev, newNode]);
  }, []);

  const updateNodeData = useCallback((nodeId: string, newData: Partial<FlowNode['data']>) => {
    setNodes((prev: FlowNode[]) =>
      prev.map((node: FlowNode) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
    
    // Update selected node if it's the one being updated
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode((prev: FlowNode | null) => 
        prev ? { ...prev, data: { ...prev.data, ...newData } } : null
      );
    }
  }, [selectedNode]);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes((prev: FlowNode[]) =>
      prev.map((node: FlowNode) =>
        node.id === nodeId ? { ...node, position } : node
      )
    );
  }, []);

  const connectNodes = useCallback((sourceId: string, targetId: string) => {
    const edgeId = `${sourceId}-${targetId}`;
    const existingEdge = edges.find((edge: FlowEdge) => edge.id === edgeId);
    
    if (!existingEdge) {
      setEdges((prev: FlowEdge[]) => [...prev, { id: edgeId, source: sourceId, target: targetId }]);
    }
  }, [edges]);

  const removeEdge = useCallback((edgeId: string) => {
    setEdges((prev: FlowEdge[]) => prev.filter((edge: FlowEdge) => edge.id !== edgeId));
  }, []);

  const saveDesign = useCallback(async (name: string) => {
    if (!name.trim()) return;
    
    setIsLoading(true);
    try {
      const designData: DesignData = {
        nodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      if (currentDesignId) {
        // Update existing design
        const result = await trpc.updateApiDesign.mutate({
          id: currentDesignId,
          name,
          design_data: designData,
        });
        if (result) {
          setCurrentDesignName(name);
          await loadDesigns();
        }
      } else {
        // Create new design
        const result = await trpc.createApiDesign.mutate({
          name,
          design_data: designData,
        });
        setCurrentDesignId(result.id);
        setCurrentDesignName(name);
        await loadDesigns();
      }
    } catch (error) {
      console.error('Failed to save design:', error);
    } finally {
      setIsLoading(false);
    }
  }, [nodes, edges, currentDesignId, loadDesigns]);

  const loadDesign = useCallback(async (designId: string) => {
    setIsLoading(true);
    try {
      const result = await trpc.getApiDesign.query({ id: designId });
      if (result && result.design_data) {
        const designData = result.design_data as DesignData;
        setNodes(designData.nodes || []);
        setEdges(designData.edges || []);
        setCurrentDesignId(result.id);
        setCurrentDesignName(result.name);
        setSelectedNode(null);
      }
    } catch (error) {
      console.error('Failed to load design:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDesign = useCallback(async (designId: string) => {
    setIsLoading(true);
    try {
      const result = await trpc.deleteApiDesign.mutate({ id: designId });
      if (result.success) {
        await loadDesigns();
        if (currentDesignId === designId) {
          setCurrentDesignId(null);
          setCurrentDesignName('');
          setNodes([]);
          setEdges([]);
          setSelectedNode(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete design:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadDesigns, currentDesignId]);

  const newDesign = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setCurrentDesignId(null);
    setCurrentDesignName('');
  }, []);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">🔗 API Flow Designer</h1>
              {currentDesignName && (
                <Badge variant="secondary" className="text-sm">
                  {currentDesignName}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={newDesign} variant="outline" size="sm">
                📄 New Design
              </Button>
              <SaveLoadPanel
                designs={designs}
                isLoading={isLoading}
                onSave={saveDesign}
                onLoad={loadDesign}
                onDelete={deleteDesign}
                currentDesignName={currentDesignName}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Left Sidebar - Node Palette */}
          <div className="w-64 bg-white shadow-sm border-r border-gray-200 p-4">
            <NodePalette onAddNode={addNode} />
          </div>

          {/* Main Canvas */}
          <div className="flex-1 relative">
            <FlowCanvas
              nodes={nodes}
              edges={edges}
              selectedNode={selectedNode}
              onNodeSelect={setSelectedNode}
              onNodeMove={updateNodePosition}
              onConnect={connectNodes}
              onDisconnect={removeEdge}
            />
          </div>

          {/* Right Sidebar - Node Properties */}
          {selectedNode && (
            <div className="w-80 bg-white shadow-sm border-l border-gray-200">
              <NodePropertiesPanel
                node={selectedNode}
                onUpdateNode={updateNodeData}
              />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>📊 Nodes: {nodes.length}</span>
              <span>🔗 Connections: {edges.length}</span>
            </div>
            {selectedNode && (
              <span>✏️ Selected: {selectedNode.data.label}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
