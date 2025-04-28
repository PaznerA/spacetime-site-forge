import * as SpaceTimeDB from '@clockworklabs/spacetimedb-sdk';
import { DbConnection } from '@/autogen';

// Keep track of the connection
let dbConnection: DbConnection | null = null;

// Export the client for reuse
export const connectToSpaceTimeDB = async () => {
  try {
    if (!dbConnection) {
      dbConnection = await DbConnection.builder()
        .withEndpoint('https://spacetimedb.com/spacetimedbmidwest')
        .withAddress('editor')
        .withClientId()
        .withIdentity()
        .build();
      
      console.log('Connected to SpaceTimeDB');
    }
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
  
  return {
    isConnected,
    connect: connectToSpaceTimeDB,
    disconnect: () => {
      if (dbConnection) {
        dbConnection.close();
        dbConnection = null;
      }
      setIsConnected(false);
    },
    getConnection: () => dbConnection
  };
};

// Export the connection for direct access
export const getConnection = () => dbConnection;
