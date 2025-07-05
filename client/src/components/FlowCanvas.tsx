
import { useState, useRef, useCallback } from 'react';
import type { FlowNode, FlowEdge } from '@/App';

interface FlowCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNode: FlowNode | null;
  onNodeSelect: (node: FlowNode | null) => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onDisconnect: (edgeId: string) => void;
}

export function FlowCanvas({
  nodes,
  edges,
  selectedNode,
  onNodeSelect,
  onNodeMove,
  onConnect,
  onDisconnect,
}: FlowCanvasProps) {
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, node: FlowNode) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const offsetX = e.clientX - rect.left - node.position.x;
      const offsetY = e.clientY - rect.top - node.position.y;
      setDragOffset({ x: offsetX, y: offsetY });
      setDraggedNode(node.id);
      onNodeSelect(node);
    }
  }, [onNodeSelect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = e.clientX - rect.left - dragOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y;
        onNodeMove(draggedNode, { x: Math.max(0, newX), y: Math.max(0, newY) });
      }
    }
  }, [draggedNode, dragOffset, onNodeMove]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  const handleNodeConnect = useCallback((sourceId: string, targetId: string) => {
    if (sourceId !== targetId) {
      onConnect(sourceId, targetId);
    }
    setConnectingFrom(null);
  }, [onConnect]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start': return '🚀';
      case 'httpRequest': return '🌐';
      case 'databaseQuery': return '🗄️';
      case 'response': return '📤';
      default: return '📄';
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return 'bg-green-100 border-green-300';
      case 'httpRequest': return 'bg-blue-100 border-blue-300';
      case 'databaseQuery': return 'bg-purple-100 border-purple-300';
      case 'response': return 'bg-orange-100 border-orange-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-500';
      case 'POST': return 'bg-green-500';
      case 'PUT': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      case 'PATCH': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getQueryTypeColor = (queryType: string) => {
    switch (queryType) {
      case 'SELECT': return 'bg-blue-500';
      case 'INSERT': return 'bg-green-500';
      case 'UPDATE': return 'bg-yellow-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-500';
    if (statusCode >= 300 && statusCode < 400) return 'bg-yellow-500';
    if (statusCode >= 400 && statusCode < 500) return 'bg-orange-500';
    if (statusCode >= 500) return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div
      ref={canvasRef}
      className="h-full w-full bg-gray-50 relative overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: `
          radial-gradient(circle, #e5e7eb 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      }}
    >
      {/* Render Edges */}
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {edges.map((edge: FlowEdge) => {
          const sourceNode = nodes.find((n: FlowNode) => n.id === edge.source);
          const targetNode = nodes.find((n: FlowNode) => n.id === edge.target);
          
          if (!sourceNode || !targetNode) return null;
          
          const sourceX = sourceNode.position.x + 120; // Approximate node width
          const sourceY = sourceNode.position.y + 25; // Approximate node height / 2
          const targetX = targetNode.position.x;
          const targetY = targetNode.position.y + 25;
          
          return (
            <g key={edge.id}>
              <line
                x1={sourceX}
                y1={sourceY}
                x2={targetX}
                y2={targetY}
                stroke="#6b7280"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
              <circle
                cx={(sourceX + targetX) / 2}
                cy={(sourceY + targetY) / 2}
                r="6"
                fill="#ef4444"
                className="cursor-pointer"
                onClick={() => onDisconnect(edge.id)}
              >
                <title>Click to remove connection</title>
              </circle>
            </g>
          );
        })}
        
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6b7280"
            />
          </marker>
        </defs>
      </svg>

      {/* Render Nodes */}
      {nodes.map((node: FlowNode) => (
        <div
          key={node.id}
          className={`absolute cursor-move select-none ${getNodeColor(node.type)} border-2 rounded-lg shadow-lg p-3 min-w-[120px] ${
            selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{
            left: node.position.x,
            top: node.position.y,
            zIndex: selectedNode?.id === node.id ? 10 : 2,
          }}
          onMouseDown={(e) => handleMouseDown(e, node)}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getNodeIcon(node.type)}</span>
            <div className="flex-1">
              <div className="font-bold text-gray-800">{node.data.label}</div>
              
              {/* Node-specific content */}
              {node.type === 'start' && node.data.description && (
                <div className="text-xs text-green-600 mt-1 truncate">
                  {node.data.description}
                </div>
              )}
              
              {node.type === 'httpRequest' && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getMethodColor(node.data.method || 'GET')}`}>
                    {node.data.method || 'GET'}
                  </span>
                  {node.data.url && (
                    <span className="text-xs text-blue-600 truncate max-w-[80px]">
                      {node.data.url}
                    </span>
                  )}
                </div>
              )}
              
              {node.type === 'databaseQuery' && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getQueryTypeColor(node.data.queryType || 'SELECT')}`}>
                    {node.data.queryType || 'SELECT'}
                  </span>
                  {node.data.table && (
                    <span className="text-xs text-purple-600 truncate max-w-[80px]">
                      {node.data.table}
                    </span>
                  )}
                </div>
              )}
              
              {node.type === 'response' && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getStatusColor(node.data.statusCode || 200)}`}>
                    {node.data.statusCode || 200}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Connection handles */}
          {node.type !== 'response' && (
            <div
              className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-pointer border-2 border-white hover:bg-blue-600"
              onClick={() => {
                if (connectingFrom) {
                  handleNodeConnect(connectingFrom, node.id);
                } else {
                  setConnectingFrom(node.id);
                }
              }}
              title={connectingFrom ? "Click to connect" : "Click to start connection"}
            />
          )}
          
          {node.type !== 'start' && (
            <div
              className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full cursor-pointer border-2 border-white hover:bg-blue-600"
              onClick={() => {
                if (connectingFrom) {
                  handleNodeConnect(connectingFrom, node.id);
                } else {
                  setConnectingFrom(node.id);
                }
              }}
              title={connectingFrom ? "Click to connect" : "Click to start connection"}
            />
          )}
        </div>
      ))}
      
      {/* Connection indicator */}
      {connectingFrom && (
        <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
          🔗 Click another node to connect
        </div>
      )}
    </div>
  );
}
