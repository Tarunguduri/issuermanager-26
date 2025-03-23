
import { handleServiceError, supabase } from './base-service';

// User Types
export type UserRole = 'issuer' | 'officer' | null;

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  designation?: string;
  category?: string;
  zone?: string;
  role: UserRole;
}

// Authentication Methods
export const signUp = async (
  email: string, 
  password: string, 
  userData: Omit<UserData, 'id' | 'email'>
) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData
        }
      }
    });

    if (error) {
      throw handleServiceError(error, 'Failed to sign up');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Failed to sign up');
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw handleServiceError(error, 'Failed to sign in');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Failed to sign in');
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw handleServiceError(error, 'Failed to sign out');
    }
  } catch (error) {
    throw handleServiceError(error, 'Failed to sign out');
  }
};

export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      if (error) {
        throw handleServiceError(error, 'Failed to get session');
      }
      return null;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      if (userError) {
        throw handleServiceError(userError, 'Failed to get user');
      }
      return null;
    }

    const userData = user.user_metadata as Omit<UserData, 'id' | 'email'>;
    
    return {
      id: user.id,
      email: user.email || '',
      name: userData.name,
      phone: userData.phone,
      location: userData.location,
      designation: userData.designation,
      category: userData.category,
      zone: userData.zone,
      role: userData.role
    };
  } catch (error) {
    throw handleServiceError(error, 'Failed to get current user');
  }
};
