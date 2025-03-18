
import React, { createContext, useContext, useState, useEffect } from 'react';
import { categories, zones, designations } from '@/utils/issues-service';

type UserRole = 'issuer' | 'officer' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  category?: string; // For officers
  designation?: string; // For officers
  zone?: string; // For officers
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole, 
    category?: string, 
    designation?: string, 
    zone?: string
  ) => Promise<void>;
  logout: () => void;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data store for demo purposes
const USERS_STORAGE_KEY = 'jagruthi_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from localStorage on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Save current user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get users from storage
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY) || '[]';
      const users: User[] = JSON.parse(usersJson);
      
      // Find user with matching email
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // In a real app, you would verify the password hash here
      // For demo, we'll just set the user
      setUser({
        ...foundUser,
        role: role || foundUser.role
      });
      
    } catch (error) {
      console.error('Login error:', error);
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
    zone?: string
  ): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get existing users
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY) || '[]';
      const users: User[] = JSON.parse(usersJson);
      
      // Check if user already exists
      if (users.some(user => user.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        role,
        ...(role === 'officer' && {
          category,
          designation,
          zone
        })
      };
      
      // Add user to storage
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      
      // Set as current user
      setUser(newUser);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
