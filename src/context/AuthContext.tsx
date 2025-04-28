
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/autogen/user_type';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { DbConnection } from '@/autogen';
import { connectToSpaceTimeDB } from '@/lib/spacetime-db';

// Define the authentication context state
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
  deactivateAccount: (userId: string) => Promise<boolean>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  changePassword: async () => false,
  deactivateAccount: async () => false,
});

// Connection to SpaceTimeDB
let connection: DbConnection | null = null;

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize connection to SpaceTimeDB
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        // Create a connection to SpaceTimeDB
        await connectToSpaceTimeDB();
        connection = DbConnection.builder()
          .address('editor')
          .clientId()
          .identity()
          .build();

        // Subscribe to all tables to detect changes
        connection.subscriptionBuilder()
          .subscribeToAllTables()
          .build();

        // Check for stored user session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        setIsLoading(false);
        
        // Listen for auth state changes (user updates)
        connection.db.user.onUpdate((ctx, oldUserData, newUserData) => {
          if (user && user.id === newUserData.id) {
            setUser(newUserData);
            localStorage.setItem('user', JSON.stringify(newUserData));
          }
        });

      } catch (error) {
        console.error('Failed to connect to SpaceTimeDB:', error);
        setIsLoading(false);
        toast({
          title: "Connection Error",
          description: "Could not connect to the server.",
          variant: "destructive",
        });
      }
    };

    initializeConnection();

    return () => {
      if (connection) {
        // Simply nullify the connection since close() doesn't exist
        connection = null;
      }
    };
  }, []);

  // Login function
  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    if (!connection) {
      toast({
        title: "Connection Error",
        description: "Not connected to the server.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Call the LoginUser reducer
      connection.reducers.loginUser(usernameOrEmail, password);
      
      // Set up a promise that resolves when login is successful
      return new Promise((resolve) => {
        const onLoginSuccess = (ctx: any, userData: User) => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.username}!`,
          });
          resolve(true);
          // Remove the event listener after successful login
          connection?.db.user.removeOnInsert(onLoginSuccess);
        };

        // Set a timeout to handle failed login
        const timeout = setTimeout(() => {
          connection?.db.user.removeOnInsert(onLoginSuccess);
          toast({
            title: "Login Failed",
            description: "Invalid username/email or password.",
            variant: "destructive",
          });
          resolve(false);
        }, 5000);

        // Listen for user data
        connection?.db.user.onInsert(onLoginSuccess);
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    if (!connection) {
      toast({
        title: "Connection Error",
        description: "Not connected to the server.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Call the RegisterUser reducer
      connection.reducers.registerUser(username, email, password);
      
      // Set up a promise that resolves when registration is successful
      return new Promise((resolve) => {
        const onRegisterSuccess = (ctx: any, userData: User) => {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          toast({
            title: "Registration Successful",
            description: `Welcome, ${userData.username}!`,
          });
          resolve(true);
          // Remove the event listener after successful registration
          connection?.db.user.removeOnInsert(onRegisterSuccess);
        };

        // Set a timeout to handle failed registration
        const timeout = setTimeout(() => {
          connection?.db.user.removeOnInsert(onRegisterSuccess);
          toast({
            title: "Registration Failed",
            description: "Username or email may already be in use.",
            variant: "destructive",
          });
          resolve(false);
        }, 5000);

        // Listen for user data
        connection?.db.user.onInsert(onRegisterSuccess);
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  // Change password function
  const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!connection) {
      toast({
        title: "Connection Error",
        description: "Not connected to the server.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Call the ChangePassword reducer
      connection.reducers.changePassword(userId, currentPassword, newPassword);
      
      // Set up a promise that resolves when password change is successful
      return new Promise((resolve) => {
        // Listen for user data update
        const onPasswordChanged = (ctx: any, updatedUser: User) => {
          if (user && user.id === updatedUser.id) {
            toast({
              title: "Password Changed",
              description: "Your password has been successfully updated.",
            });
            resolve(true);
          }
        };

        // Set a timeout to handle failed password change
        const timeout = setTimeout(() => {
          connection?.db.user.removeOnUpdate(onPasswordChanged);
          toast({
            title: "Password Change Failed",
            description: "Current password may be incorrect.",
            variant: "destructive",
          });
          resolve(false);
        }, 5000);

        connection?.db.user.onUpdate(onPasswordChanged);
      });
    } catch (error) {
      console.error('Change password error:', error);
      toast({
        title: "Password Change Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Deactivate account function
  const deactivateAccount = async (userId: string): Promise<boolean> => {
    if (!connection) {
      toast({
        title: "Connection Error",
        description: "Not connected to the server.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Call the DeactivateUser reducer
      connection.reducers.deactivateUser(userId);
      
      // Set up a promise that resolves when account deactivation is successful
      return new Promise((resolve) => {
        // Listen for user data update
        const onAccountDeactivated = (ctx: any, oldData: User, updatedUser: User) => {
          if (user && user.id === updatedUser.id && !updatedUser.isActive) {
            setUser(null);
            localStorage.removeItem('user');
            toast({
              title: "Account Deactivated",
              description: "Your account has been deactivated.",
            });
            navigate('/');
            resolve(true);
          }
        };

        // Set a timeout to handle failed deactivation
        const timeout = setTimeout(() => {
          connection?.db.user.removeOnUpdate(onAccountDeactivated);
          toast({
            title: "Account Deactivation Failed",
            description: "An error occurred while deactivating your account.",
            variant: "destructive",
          });
          resolve(false);
        }, 5000);

        connection?.db.user.onUpdate(onAccountDeactivated);
      });
    } catch (error) {
      console.error('Deactivate account error:', error);
      toast({
        title: "Account Deactivation Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Provide the auth context to the app
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        changePassword,
        deactivateAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
