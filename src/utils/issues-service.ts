
import { v4 as uuidv4 } from 'uuid';
import { 
  Issue as DbIssue, 
  IssueImage as DbIssueImage, 
  AIVerification as DbAIVerification, 
  IssueComment as DbIssueComment,
  createIssue as createDbIssue,
  updateIssue as updateDbIssue,
  getIssueById as getDbIssueById,
  getUserIssues as getDbUserIssues,
  addIssueComment as addDbIssueComment,
  verifyImageWithAI as apiVerifyImageWithAI,
  categories,
  zones,
  designations
} from '@/services/local-storage-service';

// Create camelCase versions of the types for frontend use
export interface Issue {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  zone?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignedTo?: string;
  // Added fields for UI convenience
  assignedOfficerName?: string;
  issuerName?: string;
  images?: string[];
  beforeImages?: string[];
  afterImages?: string[];
  ai_verification_status?: string;
  comments?: IssueComment[];
  officer?: {
    name: string;
    email?: string;
    phone?: string;
    designation?: string;
  };
  user?: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
  };
}

export interface IssueImage {
  id: string;
  issueId: string;
  image_url: string;
  image_type: 'before' | 'after';
  uploadedAt: string;
  uploadedBy: string;
}

export interface AIVerification {
  id: string;
  issueId: string;
  is_valid: boolean;
  processing_steps: any;
  verification_type: 'issue' | 'resolution';
  verifiedAt: string;
}

export interface IssueComment {
  id: string;
  issueId: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorRole: 'issuer' | 'officer';
  authorName?: string;
  author: {
    name: string;
  };
}

// Mapping functions to convert between DB and frontend formats
const mapDbIssueToFrontend = (dbIssue: DbIssue): Issue => ({
  id: dbIssue.id,
  title: dbIssue.title,
  category: dbIssue.category,
  description: dbIssue.description,
  location: dbIssue.location,
  coordinates: dbIssue.coordinates,
  priority: dbIssue.priority as 'low' | 'medium' | 'high',
  status: dbIssue.status as 'pending' | 'in-progress' | 'resolved' | 'rejected',
  zone: dbIssue.zone,
  createdAt: dbIssue.created_at,
  updatedAt: dbIssue.updated_at || dbIssue.created_at,
  userId: dbIssue.user_id,
  assignedTo: dbIssue.assigned_to,
  // Map user and officer fields
  issuerName: dbIssue.user?.name,
  assignedOfficerName: dbIssue.officer?.name,
  officer: dbIssue.officer,
  user: dbIssue.user,
  comments: dbIssue.comments?.map(mapDbCommentToFrontend),
  // Include images if present
  images: dbIssue.images
});

const mapFrontendIssueToDb = (issue: Partial<Issue>): Partial<DbIssue> => {
  const dbIssue: Partial<DbIssue> = {};
  
  // Copy all properties that don't need mapping
  if (issue.id !== undefined) dbIssue.id = issue.id;
  if (issue.title !== undefined) dbIssue.title = issue.title;
  if (issue.category !== undefined) dbIssue.category = issue.category;
  if (issue.description !== undefined) dbIssue.description = issue.description;
  if (issue.location !== undefined) dbIssue.location = issue.location;
  if (issue.coordinates !== undefined) dbIssue.coordinates = issue.coordinates;
  if (issue.priority !== undefined) dbIssue.priority = issue.priority;
  if (issue.status !== undefined) dbIssue.status = issue.status;
  if (issue.zone !== undefined) dbIssue.zone = issue.zone;
  
  // Map camelCase to snake_case
  if (issue.createdAt !== undefined) {
    dbIssue.created_at = issue.createdAt;
  }
  
  if (issue.updatedAt !== undefined) {
    dbIssue.updated_at = issue.updatedAt;
  }
  
  if (issue.userId !== undefined) {
    dbIssue.user_id = issue.userId;
  }
  
  if (issue.assignedTo !== undefined) {
    dbIssue.assigned_to = issue.assignedTo;
  }
  
  if (issue.images !== undefined) {
    dbIssue.images = issue.images;
  }
  
  return dbIssue;
};

const mapDbCommentToFrontend = (comment: DbIssueComment): IssueComment => ({
  id: comment.id,
  content: comment.content,
  issueId: comment.issue_id,
  createdAt: comment.created_at,
  authorId: comment.author_id,
  authorRole: comment.author_role as 'issuer' | 'officer',
  authorName: comment.author?.name,
  author: comment.author || { name: '' } // Ensure author is always present
});

const mapFrontendCommentToDb = (comment: Partial<IssueComment>): Partial<DbIssueComment> => {
  const dbComment: Partial<DbIssueComment> = {};
  
  // Copy all properties that don't need mapping
  if (comment.id !== undefined) dbComment.id = comment.id;
  if (comment.content !== undefined) dbComment.content = comment.content;
  
  // Map camelCase to snake_case
  if (comment.issueId !== undefined) {
    dbComment.issue_id = comment.issueId;
  }
  
  if (comment.createdAt !== undefined) {
    dbComment.created_at = comment.createdAt;
  }
  
  if (comment.authorId !== undefined) {
    dbComment.author_id = comment.authorId;
  }
  
  if (comment.authorRole !== undefined) {
    dbComment.author_role = comment.authorRole;
  }
  
  return dbComment;
};

// Wrapped API functions
export const createIssue = async (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Add proper error handling and logging
    console.log('Creating issue with data:', issueData);
    
    // Make sure we have the required fields
    if (!issueData.title || !issueData.description || !issueData.category || !issueData.location || !issueData.userId) {
      throw new Error('Missing required issue fields');
    }
    
    const dbIssue = mapFrontendIssueToDb(issueData);
    const result = await createDbIssue(dbIssue as any);
    
    if (!result) {
      throw new Error('Failed to create issue in database');
    }
    
    console.log('Issue created successfully:', result);
    return mapDbIssueToFrontend(result as unknown as DbIssue);
  } catch (error) {
    console.error('Error creating issue:', error);
    throw error; // Re-throw to handle in the component
  }
};

export const updateIssue = async (issueId: string, updateData: Partial<Issue>) => {
  const dbUpdateData = mapFrontendIssueToDb(updateData);
  const result = await updateDbIssue(issueId, dbUpdateData as any);
  return mapDbIssueToFrontend(result as unknown as DbIssue);
};

// Add the updateIssueStatus function with proper typing
export const updateIssueStatus = async (
  issueId: string, 
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected'
) => {
  const result = await updateDbIssue(issueId, { status });
  return mapDbIssueToFrontend(result as unknown as DbIssue);
};

export const getIssueById = async (issueId: string) => {
  const result = await getDbIssueById(issueId);
  return mapDbIssueToFrontend(result as unknown as DbIssue);
};

export const getIssuesByIssuer = async (userId: string) => {
  const results = await getDbUserIssues(userId);
  return results.map(result => mapDbIssueToFrontend(result as unknown as DbIssue));
};

export const addComment = async (commentData: Omit<IssueComment, 'id' | 'createdAt'>) => {
  const dbComment = mapFrontendCommentToDb(commentData);
  const result = await addDbIssueComment(dbComment as any);
  return mapDbCommentToFrontend(result as unknown as DbIssueComment);
};

export { categories, zones, designations };

// Enhanced AI verification function with better reliability
export const verifyImageWithAI = async (imageUrl: string, category: string) => {
  return await apiVerifyImageWithAI(imageUrl, category);
};
