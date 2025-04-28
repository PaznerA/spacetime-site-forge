
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSpaceTimeDB } from '@/lib/spacetime-db';

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  content?: any;
}

interface EditorContextType {
  projects: Project[];
  selectedProject: Project | null;
  selectProject: (projectId: string) => void;
  createProject: (name: string, description?: string) => Promise<Project>;
  saveProject: (project: Project) => Promise<{ success: boolean }>;
  exportProject: (project: Project) => string;
}

const initialEditorContext: EditorContextType = {
  projects: [],
  selectedProject: null,
  selectProject: () => {},
  createProject: async () => ({ id: '', name: '', createdAt: '' }),
  saveProject: async () => ({ success: false }),
  exportProject: () => '',
};

const EditorContext = createContext<EditorContextType>(initialEditorContext);

export const useEditor = () => useContext(EditorContext);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const spaceTimeDB = useSpaceTimeDB();

  useEffect(() => {
    // Make sure we have the subscribeToProjects method
    if (typeof spaceTimeDB.subscribeToProjects === 'function') {
      // Subscribe to projects updates
      const unsubscribe = spaceTimeDB.subscribeToProjects((fetchedProjects) => {
        console.log('Received projects:', fetchedProjects);
        setProjects(fetchedProjects);
      });
      
      return () => {
        unsubscribe();
        spaceTimeDB.disconnect();
      };
    } else {
      console.error('subscribeToProjects is not a function');
      return () => {}; // Return empty cleanup function
    }
  }, [spaceTimeDB]);

  const selectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId) || null;
    setSelectedProject(project);
    return project;
  };

  const createProject = async (name: string, description: string = '') => {
    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date().toISOString(),
      content: {
        nodes: {},
        root: {
          type: 'div',
          isCanvas: true,
          props: { className: 'h-full w-full p-4' },
          nodes: [],
        }
      }
    };
    
    // Check if saveProject exists
    if (typeof spaceTimeDB.saveProject === 'function') {
      const result = await spaceTimeDB.saveProject(newProject);
      
      if (result.success) {
        setProjects([...projects, newProject]);
        setSelectedProject(newProject);
      }
    } else {
      // Fallback if saveProject is not available
      console.warn('saveProject is not available, adding project directly to state');
      setProjects([...projects, newProject]);
      setSelectedProject(newProject);
    }
    
    return newProject;
  };

  const saveProject = async (project: Project) => {
    // Check if saveProject exists
    if (typeof spaceTimeDB.saveProject === 'function') {
      const result = await spaceTimeDB.saveProject(project);
      
      if (result.success) {
        setProjects(projects.map(p => p.id === project.id ? project : p));
        setSelectedProject(project);
      }
      
      return { success: result.success };
    } else {
      // Fallback if saveProject is not available
      console.warn('saveProject is not available, updating project directly in state');
      setProjects(projects.map(p => p.id === project.id ? project : p));
      setSelectedProject(project);
      return { success: true };
    }
  };

  const exportProject = (project: Project) => {
    // In a real implementation, this would generate React component code
    // For demo, return simple component
    return `
import React from 'react';

export default function ${project.name.replace(/\s+/g, '')}() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">${project.name}</h1>
      <p>${project.description || ''}</p>
      {/* Generated content would be inserted here */}
    </div>
  );
}
    `.trim();
  };

  const value = {
    projects,
    selectedProject,
    selectProject,
    createProject,
    saveProject,
    exportProject
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};
