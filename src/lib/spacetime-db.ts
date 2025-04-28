
// Import SDK correctly based on the available exports
import * as SpaceTimeDB from '@clockworklabs/spacetimedb-sdk';

// Create a mock client that will be replaced by the real one when backend is ready
const createMockClient = () => {
  return {
    connect: async () => {
      console.log('Mock client connected');
      return true;
    },
    disconnect: () => {
      console.log('Mock client disconnected');
    },
    subscribeToProjects: (callback) => {
      // Return some mock projects
      setTimeout(() => {
        callback([
          {
            id: '1',
            name: 'Sample Project',
            description: 'A sample project to demonstrate the editor',
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
        ]);
      }, 500);
      
      // Return unsubscribe function
      return () => {
        console.log('Unsubscribed from projects');
      };
    },
    saveProject: async (project) => {
      console.log('Mock saving project:', project);
      return { success: true };
    }
  };
};

// Export the client
export const spaceTimeDBClient = createMockClient();

// Connect function
export const connectToSpaceTimeDB = async () => {
  try {
    await spaceTimeDBClient.connect();
    console.log('Connected to SpaceTimeDB');
    return true;
  } catch (error) {
    console.error('Failed to connect to SpaceTimeDB:', error);
    return false;
  }
};

// Create a custom hook for easier use in components
import { useState, useEffect } from 'react';

export const useSpaceTimeDB = () => {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const connect = async () => {
      try {
        await spaceTimeDBClient.connect();
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
  
  return {
    isConnected,
    connect: connectToSpaceTimeDB,
    disconnect: () => {
      spaceTimeDBClient.disconnect();
      setIsConnected(false);
    },
    subscribeToProjects: spaceTimeDBClient.subscribeToProjects,
    saveProject: spaceTimeDBClient.saveProject
  };
};
