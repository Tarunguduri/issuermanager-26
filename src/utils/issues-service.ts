
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
export interface Issue extends Omit<DbIssue, 'created_at' | 'updated_at' | 'user_id' | 'assigned_to'> {
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignedTo?: string;
  assignedOfficerName?: string;
  issuerName?: string;
  beforeImages?: string[];
  afterImages?: string[];
  ai_verification_status?: string;
}

export interface IssueImage extends Omit<DbIssueImage, 'issue_id' | 'uploaded_at' | 'uploaded_by'> {
  issueId: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface AIVerification extends Omit<DbAIVerification, 'issue_id' | 'verified_at'> {
  issueId: string;
  verifiedAt: string;
}

export interface IssueComment extends Omit<DbIssueComment, 'issue_id' | 'created_at' | 'author_id' | 'author_role'> {
  issueId: string;
  createdAt: string;
  authorId: string;
  authorRole: 'issuer' | 'officer';
  authorName?: string;
}

// Mapping functions to convert between DB and frontend formats
const mapDbIssueToFrontend = (dbIssue: DbIssue): Issue => ({
  id: dbIssue.id,
  title: dbIssue.title,
  category: dbIssue.category,
  description: dbIssue.description,
  location: dbIssue.location,
  priority: dbIssue.priority,
  status: dbIssue.status as 'pending' | 'in-progress' | 'resolved' | 'rejected',
  zone: dbIssue.zone,
  createdAt: dbIssue.created_at,
  updatedAt: dbIssue.updated_at || dbIssue.created_at,
  userId: dbIssue.user_id,
  assignedTo: dbIssue.assigned_to,
  // Map user and officer fields
  issuerName: dbIssue.user?.name,
  assignedOfficerName: dbIssue.officer?.name,
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
  return mapDbIssueToFrontend(result);
};

export const updateIssue = async (issueId: string, updateData: Partial<Issue>) => {
  const dbUpdateData = mapFrontendIssueToDb(updateData);
  const result = await updateDbIssue(issueId, dbUpdateData);
  return mapDbIssueToFrontend(result);
};

export const getIssueById = async (issueId: string) => {
  const result = await getDbIssueById(issueId);
  return mapDbIssueToFrontend(result);
};

export const getIssuesByIssuer = async (userId: string) => {
  const results = await getDbUserIssues(userId);
  return results.map(mapDbIssueToFrontend);
};

export const addComment = async (commentData: Omit<IssueComment, 'id' | 'createdAt'>) => {
  const dbComment = mapFrontendCommentToDb(commentData);
  const result = await addDbIssueComment(dbComment as any);
  return mapDbCommentToFrontend(result);
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
