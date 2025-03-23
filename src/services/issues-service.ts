
import { handleServiceError, supabase } from './base-service';
import { UserRole } from './auth-service';

// Issue Types
export interface Issue {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  location: string;
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
  try {
    const { data, error } = await supabase
      .from('issues')
      .insert([issueData])
      .select()
      .single();

    if (error) {
      throw handleServiceError(error, 'Failed to create issue');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Failed to create issue');
  }
};

export const getUserIssues = async (userId: string) => {
  try {
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
      throw handleServiceError(error, 'Failed to get user issues');
    }

    return data as Issue[];
  } catch (error) {
    throw handleServiceError(error, 'Failed to get user issues');
  }
};

export const getOfficerIssues = async (category: string) => {
  try {
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
      throw handleServiceError(error, 'Failed to get officer issues');
    }

    return data as Issue[];
  } catch (error) {
    throw handleServiceError(error, 'Failed to get officer issues');
  }
};

export const getIssueById = async (issueId: string) => {
  try {
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
      throw handleServiceError(error, 'Failed to get issue by id');
    }

    return data as Issue;
  } catch (error) {
    throw handleServiceError(error, 'Failed to get issue by id');
  }
};

export const updateIssue = async (issueId: string, updateData: Partial<Issue>) => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', issueId)
      .select()
      .single();

    if (error) {
      throw handleServiceError(error, 'Failed to update issue');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Failed to update issue');
  }
};

// Gets issue statistics for a user or officer
export const getIssueStats = async (userId: string, role: UserRole) => {
  try {
    if (role === 'issuer') {
      const { data, error } = await supabase
        .from('issues')
        .select('status')
        .eq('user_id', userId);
        
      if (error) {
        throw handleServiceError(error, 'Failed to get issue stats');
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
        throw handleServiceError(officerError, 'Failed to get officer data');
      }
      
      const { data, error } = await supabase
        .from('issues')
        .select('status, assigned_to')
        .eq('category', officerData.category);
        
      if (error) {
        throw handleServiceError(error, 'Failed to get issue stats');
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
  } catch (error) {
    throw handleServiceError(error, 'Failed to get issue stats');
  }
};

// Get filtered officers by category and zone
export const getFilteredOfficers = async (category?: string, zone?: string) => {
  try {
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
      throw handleServiceError(error, 'Failed to get filtered officers');
    }
    
    return data;
  } catch (error) {
    throw handleServiceError(error, 'Failed to get filtered officers');
  }
};
