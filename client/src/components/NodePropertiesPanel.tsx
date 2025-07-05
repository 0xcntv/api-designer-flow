
import { useState } from 'react';
import type { FlowNode } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NodePropertiesPanelProps {
  node: FlowNode;
  onUpdateNode: (nodeId: string, data: Partial<FlowNode['data']>) => void;
}

export function NodePropertiesPanel({ node, onUpdateNode }: NodePropertiesPanelProps) {
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');

  const updateData = (key: string, value: string | number | Record<string, string>) => {
    onUpdateNode(node.id, { [key]: value });
  };

  const addHeader = () => {
    if (headerKey && headerValue) {
      const currentHeaders = node.data.headers || {};
      updateData('headers', { ...currentHeaders, [headerKey]: headerValue });
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const removeHeader = (key: string) => {
    const currentHeaders = node.data.headers || {};
    const newHeaders = { ...currentHeaders };
    delete newHeaders[key];
    updateData('headers', newHeaders);
  };

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
      case 'start': return 'bg-green-100 text-green-800';
      case 'httpRequest': return 'bg-blue-100 text-blue-800';
      case 'databaseQuery': return 'bg-purple-100 text-purple-800';
      case 'response': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center space-x-2">
            <span className="text-xl">{getNodeIcon(node.type)}</span>
            <span>Properties</span>
          </CardTitle>
          <Badge className={`w-fit ${getNodeColor(node.type)}`}>
            {node.data.label}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Start Node Properties */}
          {node.type === 'start' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter start node description"
                  value={node.data.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateData('description', e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* HTTP Request Node Properties */}
          {node.type === 'httpRequest' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="method">HTTP Method</Label>
                <Select value={node.data.method || 'GET'} onValueChange={(value: string) => updateData('method', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://api.example.com/endpoint"
                  value={node.data.url || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateData('url', e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Headers</Label>
                <div className="space-y-2">
                  {Object.entries(node.data.headers || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{key}:</span>
                      <span className="text-sm">{value}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeHeader(key)}
                        className="ml-auto h-6 w-6 p-0"
                      >
                        ❌
                      </Button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Key"
                      value={headerKey}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeaderKey(e.target.value)}
                    />
                    <Input
                      placeholder="Value"
                      value={headerValue}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHeaderValue(e.target.value)}
                    />
                    <Button onClick={addHeader} size="sm">
                      ➕
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="body">Request Body</Label>
                <Textarea
                  id="body"
                  placeholder="Request body (JSON, XML, etc.)"
                  value={node.data.body || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    updateData('body', e.target.value)
                  }
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Database Query Node Properties */}
          {node.type === 'databaseQuery' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="table">Database Table</Label>
                <Input
                  id="table"
                  placeholder="table_name"
                  value={node.data.table || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateData('table', e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="queryType">Query Type</Label>
                <Select value={node.data.queryType || 'SELECT'} onValueChange={(value: string) => updateData('queryType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SELECT">SELECT</SelectItem>
                    <SelectItem value="INSERT">INSERT</SelectItem>
                    <SelectItem value="UPDATE">UPDATE</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="query">SQL Query</Label>
                <Textarea
                  id="query"
                  placeholder="SELECT * FROM table_name WHERE..."
                  value={node.data.query || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    updateData('query', e.target.value)
                  }
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Response Node Properties */}
          {node.type === 'response' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="statusCode">HTTP Status Code</Label>
                <Input
                  id="statusCode"
                  type="number"
                  placeholder="200"
                  value={node.data.statusCode || 200}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateData('statusCode', parseInt(e.target.value) || 200)
                  }
                />
              </div>

              <div>
                <Label htmlFor="responseBody">Response Body</Label>
                <Textarea
                  id="responseBody"
                  placeholder='{"message": "Success", "data": {}}'
                  value={node.data.body || '{}'}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    updateData('body', e.target.value)
                  }
                  rows={6}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
