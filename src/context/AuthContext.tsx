
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signIn, 
  signUp, 
  signOut, 
  getCurrentUser, 
  UserData, 
  UserRole
} from '@/services/supabase-service';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole, 
    category?: string, 
    designation?: string, 
    zone?: string,
    phone?: string,
    location?: string
  ) => Promise<void>;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load user data on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      await signIn(email, password);
      const userData = await getCurrentUser();
      setUser(userData);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData?.name || 'User'}!`,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole,
    category?: string,
    designation?: string,
    zone?: string,
    phone?: string,
    location?: string
  ): Promise<void> => {
    setIsLoading(true);
    
    try {
      await signUp(email, password, {
        name,
        role,
        phone: phone || '',
        location: location || '',
        ...(role === 'officer' && {
          category: category || '',
          designation: designation || '',
          zone: zone || ''
        })
      });
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created. You can now log in.",
      });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive"
      });
    }
  };

  const setUserRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUserRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook directly from the context file
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
