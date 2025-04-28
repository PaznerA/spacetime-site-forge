
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor } from '@/context/EditorContext';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const ProjectsPage = () => {
  const { projects, createProject } = useEditor();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateProject = async () => {
    try {
      const newProject = await createProject('New Project', 'A blank project');
      toast({
        title: 'Project Created',
        description: `${newProject.name} has been created successfully.`,
      });
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/editor/${projectId}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Button onClick={handleCreateProject}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-medium text-gray-600">No projects yet</h2>
          <p className="text-gray-500 mb-6">Create your first project to get started</p>
          <Button onClick={handleCreateProject}>
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {project.description || 'No description available'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditProject(project.id)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
