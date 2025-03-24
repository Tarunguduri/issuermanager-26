import { supabase } from '@/integrations/supabase/client';
import { categories, zones, designations } from '@/utils/issues-service';

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
    throw error;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UserData | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
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
};

// Issue Types
export interface Issue {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  zone?: string;
  priority: string;
  status: 'pending' | 'in-progress' | 'resolved';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  user?: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  officer?: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
}

// Issue Methods
export const createIssue = async (issueData: Omit<Issue, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('issues')
    .insert([issueData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getUserIssues = async (userId: string) => {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      user:user_id (name, email, phone, location),
      officer:assigned_to (name, email, phone, designation)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as Issue[];
};

export const getOfficerIssues = async (category: string) => {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      user:user_id (name, email, phone, location),
      officer:assigned_to (name, email, phone, designation)
    `)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as Issue[];
};

export const getIssueById = async (issueId: string) => {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      user:user_id (name, email, phone, location),
      officer:assigned_to (name, email, phone, designation)
    `)
    .eq('id', issueId)
    .single();

  if (error) {
    throw error;
  }

  return data as Issue;
};

export const updateIssue = async (issueId: string, updateData: Partial<Issue>) => {
  const { data, error } = await supabase
    .from('issues')
    .update(updateData)
    .eq('id', issueId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Image Handling
export interface IssueImage {
  id: string;
  issue_id: string;
  image_url: string;
  image_type: 'before' | 'after';
  uploaded_at: string;
  uploaded_by: string;
}

export const uploadIssueImage = async (
  issueId: string, 
  file: File, 
  imageType: 'before' | 'after',
  userId: string
) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${issueId}/${imageType}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('issue_images')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('issue_images')
    .getPublicUrl(filePath);

  // Add to database
  const { data, error } = await supabase
    .from('issue_images')
    .insert({
      issue_id: issueId,
      image_url: publicUrl,
      image_type: imageType,
      uploaded_by: userId
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getIssueImages = async (issueId: string, imageType?: 'before' | 'after') => {
  let query = supabase
    .from('issue_images')
    .select('*')
    .eq('issue_id', issueId);

  if (imageType) {
    query = query.eq('image_type', imageType);
  }

  const { data, error } = await query.order('uploaded_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data as IssueImage[];
};

// AI Verification
export interface AIVerification {
  id: string;
  issue_id: string;
  is_valid: boolean;
  processing_steps: any;
  verification_type: 'issue' | 'resolution';
  verified_at: string;
}

export const createAIVerification = async (verificationData: Omit<AIVerification, 'id' | 'verified_at'>) => {
  const { data, error } = await supabase
    .from('ai_verifications')
    .insert([verificationData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getAIVerifications = async (issueId: string, verificationType?: 'issue' | 'resolution') => {
  let query = supabase
    .from('ai_verifications')
    .select('*')
    .eq('issue_id', issueId);

  if (verificationType) {
    query = query.eq('verification_type', verificationType);
  }

  const { data, error } = await query.order('verified_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as AIVerification[];
};

// Comments
export interface IssueComment {
  id: string;
  issue_id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_role: 'issuer' | 'officer';
  author?: {
    name: string;
  };
}

export const addIssueComment = async (commentData: Omit<IssueComment, 'id' | 'created_at' | 'author'>) => {
  const { data, error } = await supabase
    .from('issue_comments')
    .insert([commentData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getIssueComments = async (issueId: string) => {
  const { data, error } = await supabase
    .from('issue_comments')
    .select(`
      *,
      author:author_id (name)
    `)
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  // Fix by type casting to handle the SelectQueryError
  return data as unknown as IssueComment[];
};

// Utility functions
export const getFilteredOfficers = async (category?: string, zone?: string) => {
  let query = supabase
    .from('officers')
    .select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (zone) {
    query = query.eq('zone', zone);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data;
};

export const getIssueStats = async (userId: string, role: UserRole) => {
  if (role === 'issuer') {
    const { data, error } = await supabase
      .from('issues')
      .select('status')
      .eq('user_id', userId);
      
    if (error) {
      throw error;
    }
    
    return {
      total: data.length,
      pending: data.filter(i => i.status === 'pending').length,
      inProgress: data.filter(i => i.status === 'in-progress').length,
      resolved: data.filter(i => i.status === 'resolved').length
    };
  } else if (role === 'officer') {
    // Get officer category
    const { data: officerData, error: officerError } = await supabase
      .from('officers')
      .select('category')
      .eq('id', userId)
      .single();
      
    if (officerError) {
      throw officerError;
    }
    
    const { data, error } = await supabase
      .from('issues')
      .select('status, assigned_to')
      .eq('category', officerData.category);
      
    if (error) {
      throw error;
    }
    
    return {
      total: data.length,
      pending: data.filter(i => i.status === 'pending').length,
      inProgress: data.filter(i => i.status === 'in-progress').length,
      resolved: data.filter(i => i.status === 'resolved').length,
      assignedToMe: data.filter(i => i.assigned_to === userId).length
    };
  }
  
  return {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  };
};

// Reference data functions (these are placeholders, but in a real app would fetch from Supabase)
export const getCategories = () => {
  return categories;
};

export const getZones = () => {
  return zones;
};

export const getDesignations = () => {
  return designations;
};
