
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { ApiDesign } from '../../../server/src/schema';

interface SaveLoadPanelProps {
  designs: ApiDesign[];
  isLoading: boolean;
  onSave: (name: string) => Promise<void>;
  onLoad: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currentDesignName: string;
}

export function SaveLoadPanel({
  designs,
  isLoading,
  onSave,
  onLoad,
  onDelete,
  currentDesignName
}: SaveLoadPanelProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState(currentDesignName);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async () => {
    if (saveName.trim()) {
      await onSave(saveName);
      setSaveDialogOpen(false);
    }
  };

  const handleLoad = async (id: string) => {
    await onLoad(id);
    setLoadDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            💾 Save Design
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save API Design</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="designName" className="block text-sm font-medium mb-2">
                Design Name
              </label>
              <Input
                id="designName"
                placeholder="Enter design name"
                value={saveName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSaveName(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!saveName.trim() || isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            📂 Load Design
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load API Design</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {designs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No saved designs found.</p>
                <p className="text-sm">Create and save your first design to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {designs.map((design: ApiDesign) => (
                  <Card key={design.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{design.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Created: {design.created_at.toLocaleDateString()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Updated: {design.updated_at.toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleLoad(design.id)}
                            disabled={isLoading}
                          >
                            📥 Load
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteId(design.id)}
                              >
                                🗑️
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Design</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{design.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
