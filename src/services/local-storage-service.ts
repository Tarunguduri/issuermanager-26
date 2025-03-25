
import { v4 as uuidv4 } from 'uuid';

// Types
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
  password?: string; // We'll store this for demo purposes (hashed in a real app)
}

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
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  comments?: IssueComment[];
  images?: string[];
  officer?: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  user?: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
}

export interface IssueImage {
  id: string;
  issue_id: string;
  image_url: string;
  image_type: 'before' | 'after';
  uploaded_at: string;
  uploaded_by: string;
}

export interface AIVerification {
  id: string;
  issue_id: string;
  is_valid: boolean;
  processing_steps: any;
  verification_type: 'issue' | 'resolution';
  verified_at: string;
}

export interface IssueComment {
  id: string;
  issue_id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_role: 'issuer' | 'officer';
  author: {
    name: string;
  };
}

// Local Storage Keys
const USERS_KEY = 'jagruthi_users';
const OFFICERS_KEY = 'jagruthi_officers';
const ISSUES_KEY = 'jagruthi_issues';
const ISSUE_IMAGES_KEY = 'jagruthi_issue_images';
const AI_VERIFICATIONS_KEY = 'jagruthi_ai_verifications';
const ISSUE_COMMENTS_KEY = 'jagruthi_issue_comments';
const CURRENT_USER_KEY = 'jagruthi_current_user';

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setItem = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize with demo data if not exists
const initializeStorage = () => {
  // Check if already initialized
  if (localStorage.getItem(USERS_KEY)) return;

  // Demo users
  const users: UserData[] = [
    {
      id: '1',
      name: 'John Citizen',
      email: 'john@example.com',
      phone: '1234567890',
      location: 'Central Zone, City',
      role: 'issuer',
      password: 'password123'
    },
    {
      id: '2',
      name: 'Jane Officer',
      email: 'jane@example.com',
      phone: '9876543210',
      designation: 'Senior Officer',
      category: 'Roads',
      zone: 'Central',
      role: 'officer',
      password: 'password123'
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '5555555555',
      designation: 'Administrator',
      role: 'officer',
      category: 'Water Supply',
      zone: 'North',
      password: 'admin123'
    }
  ];

  // Demo issues
  const issues: Issue[] = [
    {
      id: '1',
      user_id: '1',
      title: 'Pothole on Main Street',
      category: 'Roads',
      description: 'Large pothole causing traffic issues and vehicle damage',
      location: 'Main Street, Central Zone',
      priority: 'high',
      status: 'in-progress',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: '2',
      images: ['https://placehold.co/600x400?text=Pothole'],
      zone: 'Central'
    },
    {
      id: '2',
      user_id: '1',
      title: 'Broken Street Light',
      category: 'Street Lights',
      description: 'Street light not working for past 3 days causing safety concerns',
      location: 'Park Avenue, North Zone',
      priority: 'medium',
      status: 'pending',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      zone: 'North'
    },
    {
      id: '3',
      user_id: '1',
      title: 'Water Supply Interruption',
      category: 'Water Supply',
      description: 'No water supply in the residential area for 24 hours',
      location: 'Residential Block C, East Zone',
      priority: 'high',
      status: 'resolved',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      assigned_to: '3',
      images: ['https://placehold.co/600x400?text=WaterSupply'],
      zone: 'East'
    }
  ];

  // Demo comments
  const comments: IssueComment[] = [
    {
      id: '1',
      issue_id: '1',
      content: 'We have assigned an officer to address this issue.',
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      author_id: '2',
      author_role: 'officer',
      author: {
        name: 'Jane Officer'
      }
    },
    {
      id: '2',
      issue_id: '1',
      content: 'Thank you for the quick response!',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      author_id: '1',
      author_role: 'issuer',
      author: {
        name: 'John Citizen'
      }
    },
    {
      id: '3',
      issue_id: '3',
      content: 'The water supply has been restored. Please confirm.',
      created_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      author_id: '3',
      author_role: 'officer',
      author: {
        name: 'Admin User'
      }
    }
  ];

  // Save demo data
  setItem(USERS_KEY, users);
  setItem(ISSUES_KEY, issues);
  setItem(ISSUE_COMMENTS_KEY, comments);
  setItem(ISSUE_IMAGES_KEY, []);
  setItem(AI_VERIFICATIONS_KEY, []);
};

// Initialize on import
initializeStorage();

// Authentication Methods
export const signUp = async (
  email: string, 
  password: string, 
  userData: Omit<UserData, 'id' | 'email'>
): Promise<{ user: UserData }> => {
  const users = getItem<UserData[]>(USERS_KEY, []);
  
  // Check if email already exists
  if (users.some(user => user.email === email)) {
    throw new Error('Email already in use');
  }
  
  const newUser: UserData = {
    id: uuidv4(),
    email,
    ...userData,
    password // In a real app, you would hash this
  };
  
  users.push(newUser);
  setItem(USERS_KEY, users);
  
  // Remove password from returned user
  const { password: _, ...userWithoutPassword } = newUser;
  return { user: userWithoutPassword };
};

export const signIn = async (email: string, password: string): Promise<{ user: UserData }> => {
  const users = getItem<UserData[]>(USERS_KEY, []);
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Store current user
  const { password: _, ...userWithoutPassword } = user;
  setItem(CURRENT_USER_KEY, userWithoutPassword);
  
  return { user: userWithoutPassword };
};

export const signOut = async (): Promise<void> => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = async (): Promise<UserData | null> => {
  return getItem<UserData | null>(CURRENT_USER_KEY, null);
};

// Issue Methods
export const createIssue = async (issueData: Omit<Issue, 'id' | 'created_at' | 'updated_at'>) => {
  const issues = getItem<Issue[]>(ISSUES_KEY, []);
  
  const newIssue: Issue = {
    id: uuidv4(),
    ...issueData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  issues.push(newIssue);
  setItem(ISSUES_KEY, issues);
  
  return newIssue;
};

export const getUserIssues = async (userId: string): Promise<Issue[]> => {
  const issues = getItem<Issue[]>(ISSUES_KEY, []);
  const filteredIssues = issues.filter(issue => issue.user_id === userId);
  
  // Add user and officer data
  const users = getItem<UserData[]>(USERS_KEY, []);
  
  return filteredIssues.map(issue => {
    const issueUser = users.find(u => u.id === issue.user_id);
    const officer = issue.assigned_to ? users.find(u => u.id === issue.assigned_to) : undefined;
    
    return {
      ...issue,
      user: issueUser ? {
        name: issueUser.name,
        email: issueUser.email,
        phone: issueUser.phone,
        location: issueUser.location || ''
      } : undefined,
      officer: officer ? {
        name: officer.name,
        email: officer.email,
        phone: officer.phone,
        designation: officer.designation || ''
      } : undefined,
      comments: getIssueCommentsSync(issue.id)
    };
  });
};

export const getOfficerIssues = async (category: string): Promise<Issue[]> => {
  const issues = getItem<Issue[]>(ISSUES_KEY, []);
  const filteredIssues = issues.filter(issue => issue.category === category);
  
  // Add user and officer data
  const users = getItem<UserData[]>(USERS_KEY, []);
  
  return filteredIssues.map(issue => {
    const issueUser = users.find(u => u.id === issue.user_id);
    const officer = issue.assigned_to ? users.find(u => u.id === issue.assigned_to) : undefined;
    
    return {
      ...issue,
      user: issueUser ? {
        name: issueUser.name,
        email: issueUser.email,
        phone: issueUser.phone,
        location: issueUser.location || ''
      } : undefined,
      officer: officer ? {
        name: officer.name,
        email: officer.email,
        phone: officer.phone,
        designation: officer.designation || ''
      } : undefined,
      comments: getIssueCommentsSync(issue.id)
    };
  });
};

export const getIssueById = async (issueId: string): Promise<Issue> => {
  const issues = getItem<Issue[]>(ISSUES_KEY, []);
  const issue = issues.find(i => i.id === issueId);
  
  if (!issue) {
    throw new Error('Issue not found');
  }
  
  // Add user and officer data
  const users = getItem<UserData[]>(USERS_KEY, []);
  const issueUser = users.find(u => u.id === issue.user_id);
  const officer = issue.assigned_to ? users.find(u => u.id === issue.assigned_to) : undefined;
  
  return {
    ...issue,
    user: issueUser ? {
      name: issueUser.name,
      email: issueUser.email,
      phone: issueUser.phone,
      location: issueUser.location || ''
    } : undefined,
    officer: officer ? {
      name: officer.name,
      email: officer.email,
      phone: officer.phone,
      designation: officer.designation || ''
    } : undefined,
    comments: getIssueCommentsSync(issue.id)
  };
};

export const updateIssue = async (issueId: string, updateData: Partial<Issue>): Promise<Issue> => {
  const issues = getItem<Issue[]>(ISSUES_KEY, []);
  const index = issues.findIndex(i => i.id === issueId);
  
  if (index === -1) {
    throw new Error('Issue not found');
  }
  
  const updatedIssue = {
    ...issues[index],
    ...updateData,
    updated_at: new Date().toISOString()
  };
  
  issues[index] = updatedIssue;
  setItem(ISSUES_KEY, issues);
  
  // Add user and officer data
  const users = getItem<UserData[]>(USERS_KEY, []);
  const issueUser = users.find(u => u.id === updatedIssue.user_id);
  const officer = updatedIssue.assigned_to ? users.find(u => u.id === updatedIssue.assigned_to) : undefined;
  
  return {
    ...updatedIssue,
    user: issueUser ? {
      name: issueUser.name,
      email: issueUser.email,
      phone: issueUser.phone,
      location: issueUser.location || ''
    } : undefined,
    officer: officer ? {
      name: officer.name,
      email: officer.email,
      phone: officer.phone,
      designation: officer.designation || ''
    } : undefined,
    comments: getIssueCommentsSync(updatedIssue.id)
  };
};

// Image Handling
export const uploadIssueImage = async (
  issueId: string, 
  file: File, 
  imageType: 'before' | 'after',
  userId: string
): Promise<IssueImage> => {
  // In a real app, we'd upload to cloud storage
  // For this demo, we'll use a placeholder URL based on the file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${issueId}_${imageType}_${Date.now()}.${fileExt}`;
  const publicUrl = `https://placehold.co/600x400?text=${fileName}`;
  
  const newImage: IssueImage = {
    id: uuidv4(),
    issue_id: issueId,
    image_url: publicUrl,
    image_type: imageType,
    uploaded_at: new Date().toISOString(),
    uploaded_by: userId
  };
  
  const images = getItem<IssueImage[]>(ISSUE_IMAGES_KEY, []);
  images.push(newImage);
  setItem(ISSUE_IMAGES_KEY, images);
  
  return newImage;
};

export const getIssueImages = async (issueId: string, imageType?: 'before' | 'after'): Promise<IssueImage[]> => {
  const images = getItem<IssueImage[]>(ISSUE_IMAGES_KEY, []);
  
  if (imageType) {
    return images.filter(img => img.issue_id === issueId && img.image_type === imageType);
  }
  
  return images.filter(img => img.issue_id === issueId);
};

// AI Verification
export const createAIVerification = async (verificationData: Omit<AIVerification, 'id' | 'verified_at'>): Promise<AIVerification> => {
  const verifications = getItem<AIVerification[]>(AI_VERIFICATIONS_KEY, []);
  
  const newVerification: AIVerification = {
    id: uuidv4(),
    ...verificationData,
    verified_at: new Date().toISOString()
  };
  
  verifications.push(newVerification);
  setItem(AI_VERIFICATIONS_KEY, verifications);
  
  return newVerification;
};

export const getAIVerifications = async (issueId: string, verificationType?: 'issue' | 'resolution'): Promise<AIVerification[]> => {
  const verifications = getItem<AIVerification[]>(AI_VERIFICATIONS_KEY, []);
  
  if (verificationType) {
    return verifications.filter(v => v.issue_id === issueId && v.verification_type === verificationType);
  }
  
  return verifications.filter(v => v.issue_id === issueId);
};

// Comments
export const addIssueComment = async (commentData: Omit<IssueComment, 'id' | 'created_at' | 'author'>): Promise<IssueComment> => {
  const comments = getItem<IssueComment[]>(ISSUE_COMMENTS_KEY, []);
  const users = getItem<UserData[]>(USERS_KEY, []);
  const user = users.find(u => u.id === commentData.author_id);
  
  const newComment: IssueComment = {
    id: uuidv4(),
    ...commentData,
    created_at: new Date().toISOString(),
    author: {
      name: user?.name || 'Unknown User'
    }
  };
  
  comments.push(newComment);
  setItem(ISSUE_COMMENTS_KEY, comments);
  
  return newComment;
};

// Synchronous version for internal use
const getIssueCommentsSync = (issueId: string): IssueComment[] => {
  const comments = getItem<IssueComment[]>(ISSUE_COMMENTS_KEY, []);
  return comments.filter(c => c.issue_id === issueId);
};

export const getIssueComments = async (issueId: string): Promise<IssueComment[]> => {
  return getIssueCommentsSync(issueId);
};

// Utility functions
export const getFilteredOfficers = async (category?: string, zone?: string): Promise<UserData[]> => {
  const users = getItem<UserData[]>(USERS_KEY, []);
  const officers = users.filter(user => user.role === 'officer');
  
  return officers.filter(officer => {
    if (category && officer.category !== category) return false;
    if (zone && officer.zone !== zone) return false;
    return true;
  });
};

export const getIssueStats = async (userId: string, role: UserRole) => {
  const issues = getItem<Issue[]>(ISSUES_KEY, []);
  
  if (role === 'issuer') {
    const userIssues = issues.filter(i => i.user_id === userId);
    
    return {
      total: userIssues.length,
      pending: userIssues.filter(i => i.status === 'pending').length,
      inProgress: userIssues.filter(i => i.status === 'in-progress').length,
      resolved: userIssues.filter(i => i.status === 'resolved').length
    };
  } else if (role === 'officer') {
    const user = getItem<UserData[]>(USERS_KEY, []).find(u => u.id === userId);
    
    if (!user || !user.category) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        assignedToMe: 0
      };
    }
    
    const categoryIssues = issues.filter(i => i.category === user.category);
    
    return {
      total: categoryIssues.length,
      pending: categoryIssues.filter(i => i.status === 'pending').length,
      inProgress: categoryIssues.filter(i => i.status === 'in-progress').length,
      resolved: categoryIssues.filter(i => i.status === 'resolved').length,
      assignedToMe: categoryIssues.filter(i => i.assigned_to === userId).length
    };
  }
  
  return {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  };
};

// Reference data
export const categories = [
  'Water Supply',
  'Electricity',
  'Roads',
  'Garbage Collection',
  'Sewage',
  'Street Lights',
  'Public Property',
  'Parks',
  'Other'
];

export const zones = [
  'North',
  'South',
  'East',
  'West',
  'Central'
];

export const designations = [
  'Junior Officer',
  'Senior Officer',
  'Supervisor',
  'Manager'
];

export const getCategories = () => categories;
export const getZones = () => zones;
export const getDesignations = () => designations;

// Mock AI verification function for image verification
export const verifyImageWithAI = async (imageUrl: string, category: string) => {
  console.log('Verifying image with AI:', imageUrl, category);
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock AI verification with less randomness for testing
  const isMatch = Math.random() > 0.15; // 85% success rate
  
  console.log(`AI verification result for ${category}: ${isMatch ? 'Success' : 'Failed'}`);
  
  if (isMatch) {
    return {
      success: true,
      message: `Image verified successfully for category: ${category}`
    };
  } else {
    return {
      success: false,
      message: `Image does not clearly show a ${category} issue. Please upload a clearer image.`
    };
  }
};
