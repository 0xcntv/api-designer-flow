
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FlowNode } from '@/App';

interface NodePaletteProps {
  onAddNode: (type: FlowNode['type'], label: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const nodeTypes = [
    {
      type: 'start' as const,
      label: 'Start',
      icon: '🚀',
      description: 'Beginning of API flow',
      color: 'bg-green-100 border-green-300 hover:bg-green-200',
    },
    {
      type: 'httpRequest' as const,
      label: 'HTTP Request',
      icon: '🌐',
      description: 'Outbound HTTP request',
      color: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
    },
    {
      type: 'databaseQuery' as const,
      label: 'Database Query',
      icon: '🗄️',
      description: 'Database interaction',
      color: 'bg-purple-100 border-purple-300 hover:bg-purple-200',
    },
    {
      type: 'response' as const,
      label: 'Response',
      icon: '📤',
      description: 'Final API response',
      color: 'bg-orange-100 border-orange-300 hover:bg-orange-200',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🎨 Node Palette</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nodeTypes.map((nodeType) => (
          <Button
            key={nodeType.type}
            onClick={() => onAddNode(nodeType.type, nodeType.label)}
            className={`w-full justify-start p-3 h-auto ${nodeType.color} text-gray-800 border-2 transition-all duration-200 hover:scale-105`}
            variant="outline"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{nodeType.icon}</span>
              <div className="text-left">
                <div className="font-medium">{nodeType.label}</div>
                <div className="text-xs text-gray-600">{nodeType.description}</div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
