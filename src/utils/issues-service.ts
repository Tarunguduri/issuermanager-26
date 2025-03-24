
import { supabase } from '@/integrations/supabase/client';

// Re-export types and functions from supabase-service with field mapping
import { 
  Issue as DbIssue, 
  IssueImage as DbIssueImage, 
  AIVerification as DbAIVerification, 
  IssueComment as DbIssueComment,
  createIssue as createDbIssue,
  updateIssue as updateDbIssue,
  getIssueById as getDbIssueById,
  getUserIssues as getDbUserIssues,
  addIssueComment as addDbIssueComment
} from '@/services/supabase-service';

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
  
  // We don't map UI-specific fields like assignedOfficerName, issuerName, etc.
  // as they're not stored directly in the database
  
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
  const dbIssue = mapFrontendIssueToDb(issueData);
  const result = await createDbIssue(dbIssue as any);
  return mapDbIssueToFrontend(result as unknown as DbIssue);
};

export const updateIssue = async (issueId: string, updateData: Partial<Issue>) => {
  const dbUpdateData = mapFrontendIssueToDb(updateData);
  const result = await updateDbIssue(issueId, dbUpdateData as any);
  return mapDbIssueToFrontend(result as unknown as DbIssue);
};

// Add the missing updateIssueStatus function
export const updateIssueStatus = async (issueId: string, status: string) => {
  // Validate that status is one of the accepted values
  const validStatus = ['pending', 'in-progress', 'resolved', 'rejected'];
  const statusToUse = validStatus.includes(status) ? status : 'pending';
  
  const result = await updateDbIssue(issueId, { status: statusToUse });
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

// Mock function to verify an image with AI
export const verifyImageWithAI = async (imageUrl: string, category: string) => {
  console.log('Verifying image with AI:', imageUrl, category);
  
  // Simulate AI verification
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock AI verification result
  const isMatch = Math.random() > 0.2; // 80% chance of matching
  
  if (isMatch) {
    return {
      success: true,
      message: `Image verified successfully for category: ${category}`
    };
  } else {
    return {
      success: false,
      message: `Image does not seem to match the category: ${category}`
    };
  }
};
