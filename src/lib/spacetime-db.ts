import * as SpaceTimeDB from '@clockworklabs/spacetimedb-sdk';
import { DbConnection } from '@/autogen';
import { useState, useEffect } from 'react';

// Keep track of the connection
let dbConnection: DbConnection | null = null;

// Export the client for reuse
export const connectToSpaceTimeDB = async () => {
  try {
    if (!dbConnection) {
      // Create a new connection with the correct API methods
      dbConnection = new DbConnection({
        uri: 'editor',
        clientId: SpaceTimeDB.generateClientId(),
        identity: SpaceTimeDB.generateIdentity()
      });
      
      console.log('Connected to SpaceTimeDB');
    }
    return true;
  } catch (error) {
    console.error('Failed to connect to SpaceTimeDB:', error);
    return false;
  }
};

// Projects interface
interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  content?: any;
}

// Create a custom hook for easier use in components
export const useSpaceTimeDB = () => {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const connect = async () => {
      try {
        await connectToSpaceTimeDB();
        if (mounted) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Failed to connect in hook:', error);
      }
    };
    
    connect();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  // Add functionality to work with projects (mock implementation)
  const saveProject = async (project: Project) => {
    if (!dbConnection) {
      console.error('Not connected to SpaceTimeDB');
      return { success: false };
    }
    
    try {
      // In a real implementation, we'd call the reducer to save the project
      console.log('Saving project:', project);
      return { success: true };
    } catch (error) {
      console.error('Failed to save project:', error);
      return { success: false };
    }
  };
  
  // Mock subscribeToProjects function
  const subscribeToProjects = (callback: (projects: Project[]) => void) => {
    if (!dbConnection) {
      console.log('Not connected, returning empty projects list');
      callback([]);
      return () => {};
    }
    
    // Initialize with some mock data until real data is available
    const mockProjects = [
      {
        id: '1',
        name: 'Sample Project',
        description: 'A demonstration project',
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
      }
    ];
    
    // Call the callback with mock data
    callback(mockProjects);
    
    // In a real implementation, we would subscribe to project changes
    console.log('Subscribed to projects');
    
    // Return unsubscribe function
    return () => {
      console.log('Unsubscribed from projects');
    };
  };
  
  return {
    isConnected,
    connect: connectToSpaceTimeDB,
    disconnect: () => {
      if (dbConnection) {
        // Simply nullify the connection since close() doesn't exist
        dbConnection = null;
        setIsConnected(false);
        console.log('Disconnected from SpaceTimeDB');
      }
    },
    getConnection: () => dbConnection,
    saveProject,
    subscribeToProjects
  };
};

// Export the connection for direct access
export const getConnection = () => dbConnection;
