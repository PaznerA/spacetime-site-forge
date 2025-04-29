
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor } from '@/context/EditorContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Save, Eye, Code, ArrowLeft } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

// Define component types for the editor
interface ComponentDefinition {
  type: string;
  label: string;
  defaultProps: Record<string, any>;
}

const EditorPage = () => {
  const { projectId } = useParams();
  const { selectedProject, selectProject, saveProject, exportProject } = useEditor();
  const [previewMode, setPreviewMode] = useState(false);
  const [exportCode, setExportCode] = useState('');
  const [canvasComponents, setCanvasComponents] = useState<any[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<any | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Component definitions
  const components: ComponentDefinition[] = [
    { 
      type: 'text', 
      label: 'Text', 
      defaultProps: { 
        text: 'Text block', 
        className: 'p-2 text-base' 
      } 
    },
    { 
      type: 'button', 
      label: 'Button', 
      defaultProps: { 
        text: 'Button', 
        className: 'px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors' 
      } 
    },
    { 
      type: 'image', 
      label: 'Image', 
      defaultProps: { 
        src: '/placeholder.svg', 
        alt: 'Image', 
        className: 'w-full h-auto' 
      } 
    },
    { 
      type: 'container', 
      label: 'Container', 
      defaultProps: { 
        className: 'p-4 border rounded bg-background' 
      } 
    },
    { 
      type: 'card', 
      label: 'Card', 
      defaultProps: { 
        title: 'Card Title', 
        content: 'Card content goes here', 
        className: 'p-4 border rounded shadow bg-card' 
      } 
    },
  ];
  
  useEffect(() => {
    if (projectId) {
      selectProject(projectId);
    }
    
    // Initialize canvas components from project content if available
    if (selectedProject?.content?.nodes) {
      // TODO: Convert project content to components array
      // For now, we'll just use an empty array
      setCanvasComponents([]);
    }
  }, [projectId, selectedProject]);
  
  const handleSave = async () => {
    if (!selectedProject) return;
    
    try {
      // Update the project content with the current canvas components
      const updatedProject = {
        ...selectedProject,
        content: {
          nodes: {}, // TODO: Convert components to content format
          root: {
            type: 'div',
            isCanvas: true,
            props: { className: 'h-full w-full p-4' },
            nodes: [] // TODO: Add component IDs here
          }
        }
      };
      
      const result = await saveProject(updatedProject);
      
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
  
  // Handle drag start from component palette
  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    e.dataTransfer.setData('componentType', component.type);
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  // Handle drag over on canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };
  
  // Handle drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType');
    
    if (!componentType) return;
    
    // Find the component definition
    const componentDef = components.find(c => c.type === componentType);
    
    if (!componentDef) return;
    
    // Get canvas position for drop
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Calculate position relative to canvas
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    // Create new component instance
    const newComponent = {
      id: `${componentType}-${Date.now()}`,
      type: componentType,
      position: { x, y },
      props: { ...componentDef.defaultProps }
    };
    
    setCanvasComponents([...canvasComponents, newComponent]);
    setSelectedComponent(newComponent);
    
    toast({
      title: 'Component Added',
      description: `Added ${componentDef.label} to canvas.`,
    });
  };
  
  // Render component on canvas
  const renderComponent = (component: any) => {
    const style = {
      position: 'absolute',
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
      cursor: selectedComponent?.id === component.id ? 'move' : 'pointer',
      border: selectedComponent?.id === component.id ? '2px dashed #7c3aed' : 'none',
    } as React.CSSProperties;
    
    const handleComponentClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedComponent(component);
    };
    
    switch(component.type) {
      case 'text':
        return (
          <div 
            key={component.id} 
            style={style} 
            onClick={handleComponentClick}
            className={component.props.className}
            draggable={true}
          >
            {component.props.text}
          </div>
        );
      case 'button':
        return (
          <button
            key={component.id}
            style={style}
            onClick={handleComponentClick}
            className={component.props.className}
            draggable={true}
          >
            {component.props.text}
          </button>
        );
      case 'image':
        return (
          <img
            key={component.id}
            src={component.props.src}
            alt={component.props.alt}
            style={style}
            onClick={handleComponentClick}
            className={component.props.className}
            draggable={true}
          />
        );
      case 'container':
        return (
          <div
            key={component.id}
            style={{...style, minWidth: '100px', minHeight: '100px'}}
            onClick={handleComponentClick}
            className={component.props.className}
            draggable={true}
          >
            Container
          </div>
        );
      case 'card':
        return (
          <div
            key={component.id}
            style={{...style, width: '200px'}}
            onClick={handleComponentClick}
            className={component.props.className}
            draggable={true}
          >
            <h3 className="text-lg font-medium mb-2">{component.props.title}</h3>
            <p>{component.props.content}</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Handle canvas click to deselect
  const handleCanvasClick = () => {
    setSelectedComponent(null);
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
        {/* Main area with resizable panels */}
        <ResizablePanelGroup direction="horizontal">
          {/* Left sidebar (only visible in edit mode) */}
          {!previewMode && (
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div className="h-full border-r overflow-y-auto p-4">
                <h3 className="font-medium mb-4">Components</h3>
                <div className="space-y-2">
                  {components.map((component) => (
                    <div 
                      key={component.type} 
                      className="p-2 border rounded cursor-grab bg-white hover:bg-gray-50 active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => handleDragStart(e, component)}
                    >
                      {component.label}
                    </div>
                  ))}
                </div>
              </div>
            </ResizablePanel>
          )}

          {!previewMode && <ResizableHandle withHandle />}

          {/* Canvas area */}
          <ResizablePanel defaultSize={previewMode ? 100 : 50}>
            <div 
              className="h-full overflow-auto bg-gray-50 flex items-center justify-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleCanvasClick}
            >
              {previewMode ? (
                <div className="bg-white shadow-md w-full max-w-3xl min-h-[500px] p-8 relative">
                  <h1 className="text-2xl font-bold">Preview: {selectedProject.name}</h1>
                  <p>{selectedProject.description}</p>
                  <div className="mt-4 p-4 border-2 border-dashed border-gray-200 rounded-md relative">
                    {canvasComponents.length > 0 ? (
                      canvasComponents.map(renderComponent)
                    ) : (
                      <p className="text-gray-500 text-center">No components added yet</p>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  ref={canvasRef}
                  className="bg-white shadow-md w-full max-w-3xl min-h-[500px] p-8 border-2 border-blue-200 relative"
                >
                  {canvasComponents.length > 0 ? (
                    canvasComponents.map(renderComponent)
                  ) : (
                    <p className="text-gray-500 text-center">Drag components here to start building</p>
                  )}
                </div>
              )}
            </div>
          </ResizablePanel>

          {!previewMode && <ResizableHandle withHandle />}
          
          {/* Right sidebar (only visible in edit mode) */}
          {!previewMode && (
            <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
              <div className="h-full border-l overflow-y-auto">
                <Tabs defaultValue="properties">
                  <TabsList className="w-full">
                    <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
                    <TabsTrigger value="styles" className="flex-1">Styles</TabsTrigger>
                  </TabsList>
                  <TabsContent value="properties" className="p-4">
                    {selectedComponent ? (
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Component: {selectedComponent.type}</h3>
                        {selectedComponent.type === 'text' && (
                          <div>
                            <label className="block text-sm font-medium mb-1">Text</label>
                            <Input 
                              value={selectedComponent.props.text} 
                              onChange={(e) => {
                                const updated = canvasComponents.map(c => 
                                  c.id === selectedComponent.id 
                                    ? {...c, props: {...c.props, text: e.target.value}} 
                                    : c
                                );
                                setCanvasComponents(updated);
                                setSelectedComponent({...selectedComponent, props: {...selectedComponent.props, text: e.target.value}});
                              }}
                            />
                          </div>
                        )}
                        {selectedComponent.type === 'button' && (
                          <div>
                            <label className="block text-sm font-medium mb-1">Button Text</label>
                            <Input 
                              value={selectedComponent.props.text} 
                              onChange={(e) => {
                                const updated = canvasComponents.map(c => 
                                  c.id === selectedComponent.id 
                                    ? {...c, props: {...c.props, text: e.target.value}} 
                                    : c
                                );
                                setCanvasComponents(updated);
                                setSelectedComponent({...selectedComponent, props: {...selectedComponent.props, text: e.target.value}});
                              }}
                            />
                          </div>
                        )}
                        {selectedComponent.type === 'image' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Image Source</label>
                              <Input 
                                value={selectedComponent.props.src} 
                                onChange={(e) => {
                                  const updated = canvasComponents.map(c => 
                                    c.id === selectedComponent.id 
                                      ? {...c, props: {...c.props, src: e.target.value}} 
                                      : c
                                  );
                                  setCanvasComponents(updated);
                                  setSelectedComponent({...selectedComponent, props: {...selectedComponent.props, src: e.target.value}});
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Alt Text</label>
                              <Input 
                                value={selectedComponent.props.alt} 
                                onChange={(e) => {
                                  const updated = canvasComponents.map(c => 
                                    c.id === selectedComponent.id 
                                      ? {...c, props: {...c.props, alt: e.target.value}} 
                                      : c
                                  );
                                  setCanvasComponents(updated);
                                  setSelectedComponent({...selectedComponent, props: {...selectedComponent.props, alt: e.target.value}});
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {selectedComponent.type === 'card' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Card Title</label>
                              <Input 
                                value={selectedComponent.props.title} 
                                onChange={(e) => {
                                  const updated = canvasComponents.map(c => 
                                    c.id === selectedComponent.id 
                                      ? {...c, props: {...c.props, title: e.target.value}} 
                                      : c
                                  );
                                  setCanvasComponents(updated);
                                  setSelectedComponent({...selectedComponent, props: {...selectedComponent.props, title: e.target.value}});
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Card Content</label>
                              <Input 
                                value={selectedComponent.props.content} 
                                onChange={(e) => {
                                  const updated = canvasComponents.map(c => 
                                    c.id === selectedComponent.id 
                                      ? {...c, props: {...c.props, content: e.target.value}} 
                                      : c
                                  );
                                  setCanvasComponents(updated);
                                  setSelectedComponent({...selectedComponent, props: {...selectedComponent.props, content: e.target.value}});
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              setCanvasComponents(canvasComponents.filter(c => c.id !== selectedComponent.id));
                              setSelectedComponent(null);
                              toast({
                                title: 'Component Removed',
                                description: `Removed ${selectedComponent.type} from canvas.`,
                              });
                            }}
                          >
                            Remove Component
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Select a component to edit its properties</p>
                    )}
                  </TabsContent>
                  <TabsContent value="styles" className="p-4">
                    {selectedComponent ? (
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Style: {selectedComponent.type}</h3>
                        <div>
                          <label className="block text-sm font-medium mb-1">Classes</label>
                          <Input 
                            value={selectedComponent.props.className || ''} 
                            onChange={(e) => {
                              const updated = canvasComponents.map(c => 
                                c.id === selectedComponent.id 
                                  ? {...c, props: {...c.props, className: e.target.value}} 
                                  : c
                              );
                              setCanvasComponents(updated);
                              setSelectedComponent({...selectedComponent, props: {...selectedComponent.props, className: e.target.value}});
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">Enter Tailwind CSS classes separated by spaces</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Select a component to edit its styles</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
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
