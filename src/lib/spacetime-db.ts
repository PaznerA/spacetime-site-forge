
import * as SpaceTimeDB from '@clockworklabs/spacetimedb-sdk';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  content?: any;
}

class SpaceTimeDBService {
  private db: SpaceTimeDB.SpaceTimeDBClient | null = null;
  private isConnected: boolean = false;
  private projectsCallbacks: Array<(projects: Project[]) => void> = [];
  
  constructor() {
    this.init();
  }
  
  private init() {
    try {
      // Initialize SpaceTimeDB client
      this.db = new SpaceTimeDB.SpaceTimeDBClient();
      
      // Configure connection settings
      this.db.on('connected', () => {
        console.log('Connected to SpaceTimeDB');
        this.isConnected = true;
        this.fetchProjects();
      });
      
      this.db.on('disconnected', () => {
        console.log('Disconnected from SpaceTimeDB');
        this.isConnected = false;
      });
      
      // Setup table subscriptions when available
      this.db.on('subscription_applied', (tableName: string) => {
        console.log(`Subscribed to table: ${tableName}`);
      });
      
      // Handle project updates
      this.db.on('reducer_event', (event: SpaceTimeDB.ReducerEvent<any>) => {
        if (event.reducerName === 'projects') {
          this.fetchProjects();
        }
      });
    } catch (error) {
      console.error('Failed to initialize SpaceTimeDB:', error);
    }
  }
  
  public async connect(address: string = 'localhost:3000') {
    if (!this.db) {
      console.error('SpaceTimeDB not initialized');
      return;
    }
    
    try {
      await this.db.connect(`ws://${address}`);
    } catch (error) {
      console.error('Failed to connect to SpaceTimeDB:', error);
    }
  }
  
  public disconnect() {
    if (this.db && this.isConnected) {
      this.db.disconnect();
    }
  }
  
  public subscribeToProjects(callback: (projects: Project[]) => void) {
    this.projectsCallbacks.push(callback);
    if (this.isConnected) {
      this.fetchProjects();
    }
    
    return () => {
      this.projectsCallbacks = this.projectsCallbacks.filter(cb => cb !== callback);
    };
  }
  
  private fetchProjects() {
    // In a real implementation, this would query the projects table
    // For demo purposes, we're returning mock data
    const mockProjects: Project[] = [
      { id: '1', name: 'Landing Page', description: 'Company landing page', createdAt: new Date().toISOString() },
      { id: '2', name: 'Blog', description: 'Personal blog template', createdAt: new Date().toISOString() },
      { id: '3', name: 'E-commerce', description: 'Online store template', createdAt: new Date().toISOString() }
    ];
    
    this.projectsCallbacks.forEach(callback => callback(mockProjects));
  }
  
  public async saveProject(project: Project) {
    if (!this.db || !this.isConnected) {
      console.error('Not connected to SpaceTimeDB');
      return;
    }
    
    try {
      // In a real implementation, this would call a reducer function
      console.log('Saving project to SpaceTimeDB:', project);
      // Mock successful save
      return { success: true, projectId: project.id || Date.now().toString() };
    } catch (error) {
      console.error('Failed to save project:', error);
      return { success: false, error };
    }
  }
}

// Create a singleton instance
export const spacetimeDBService = new SpaceTimeDBService();

// Hook for using SpaceTimeDB in components
export const useSpaceTimeDB = () => {
  return {
    connect: spacetimeDBService.connect.bind(spacetimeDBService),
    disconnect: spacetimeDBService.disconnect.bind(spacetimeDBService),
    subscribeToProjects: spacetimeDBService.subscribeToProjects.bind(spacetimeDBService),
    saveProject: spacetimeDBService.saveProject.bind(spacetimeDBService)
  };
};
