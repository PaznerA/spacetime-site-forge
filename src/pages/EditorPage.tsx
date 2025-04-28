
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor } from '@/context/EditorContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, Code, ArrowLeft } from 'lucide-react';

const EditorPage = () => {
  const { projectId } = useParams();
  const { selectedProject, selectProject, saveProject, exportProject } = useEditor();
  const [previewMode, setPreviewMode] = useState(false);
  const [exportCode, setExportCode] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (projectId) {
      selectProject(projectId);
    }
  }, [projectId]);
  
  const handleSave = async () => {
    if (!selectedProject) return;
    
    try {
      const result = await saveProject(selectedProject);
      
      if (result.success) {
        toast({
          title: 'Project Saved',
          description: 'All changes have been saved successfully.',
        });
      } else {
        throw new Error('Failed to save project');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save project',
        variant: 'destructive',
      });
    }
  };
  
  const handleExport = () => {
    if (!selectedProject) return;
    setExportCode(exportProject(selectedProject));
  };
  
  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Button onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Input 
            value={selectedProject.name} 
            onChange={(e) => {
              selectProject(selectedProject.id);
            }}
            className="w-48 font-medium"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
            {previewMode ? <Code className="ml-2 h-4 w-4" /> : <Eye className="ml-2 h-4 w-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
          >
            Export
          </Button>
          <Button 
            size="sm"
            onClick={handleSave}
          >
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </header>
      
      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar (only visible in edit mode) */}
        {!previewMode && (
          <div className="w-64 border-r overflow-y-auto p-4">
            <h3 className="font-medium mb-4">Components</h3>
            <div className="space-y-2">
              <div className="p-2 border rounded cursor-grab bg-white">Text</div>
              <div className="p-2 border rounded cursor-grab bg-white">Button</div>
              <div className="p-2 border rounded cursor-grab bg-white">Image</div>
              <div className="p-2 border rounded cursor-grab bg-white">Container</div>
              <div className="p-2 border rounded cursor-grab bg-white">Card</div>
            </div>
          </div>
        )}
        
        {/* Canvas area */}
        <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
          {previewMode ? (
            <div className="bg-white shadow-md w-full max-w-3xl min-h-[500px] p-8">
              <h1 className="text-2xl font-bold">Preview: {selectedProject.name}</h1>
              <p>{selectedProject.description}</p>
              <div className="mt-4 p-4 border-2 border-dashed border-gray-200 rounded-md">
                <p className="text-gray-500 text-center">Preview content would appear here</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md w-full max-w-3xl min-h-[500px] p-8 border-2 border-blue-200">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center">
                <p className="text-gray-500">Drag components here to start building</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Right sidebar (only visible in edit mode) */}
        {!previewMode && (
          <div className="w-72 border-l overflow-y-auto">
            <Tabs defaultValue="properties">
              <TabsList className="w-full">
                <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
                <TabsTrigger value="styles" className="flex-1">Styles</TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="p-4">
                <p className="text-gray-500 text-sm">Select a component to edit its properties</p>
              </TabsContent>
              <TabsContent value="styles" className="p-4">
                <p className="text-gray-500 text-sm">Select a component to edit its styles</p>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Export code modal */}
      {exportCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Exported Code</h3>
              <Button variant="ghost" size="sm" onClick={() => setExportCode('')}>
                Close
              </Button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <pre className="bg-gray-100 p-4 rounded">{exportCode}</pre>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={() => {
                navigator.clipboard.writeText(exportCode);
                toast({
                  title: 'Copied',
                  description: 'Code copied to clipboard',
                });
              }}>
                Copy Code
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;
