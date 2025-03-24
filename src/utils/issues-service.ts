
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
  authorRole: string;
  authorName?: string;
}

// Mapping functions to convert between DB and frontend formats
const mapDbIssueToFrontend = (dbIssue: DbIssue): Issue => ({
  ...dbIssue,
  createdAt: dbIssue.created_at,
  updatedAt: dbIssue.updated_at || dbIssue.created_at,
  userId: dbIssue.user_id,
  assignedTo: dbIssue.assigned_to,
  // Map user and officer fields
  issuerName: dbIssue.user?.name,
  assignedOfficerName: dbIssue.officer?.name,
});

const mapFrontendIssueToDb = (issue: Partial<Issue>): Partial<DbIssue> => {
  const dbIssue: Partial<DbIssue> = { ...issue };
  
  // Map camelCase to snake_case
  if (issue.createdAt !== undefined) {
    dbIssue.created_at = issue.createdAt;
    delete dbIssue.createdAt;
  }
  
  if (issue.updatedAt !== undefined) {
    dbIssue.updated_at = issue.updatedAt;
    delete dbIssue.updatedAt;
  }
  
  if (issue.userId !== undefined) {
    dbIssue.user_id = issue.userId;
    delete dbIssue.userId;
  }
  
  if (issue.assignedTo !== undefined) {
    dbIssue.assigned_to = issue.assignedTo;
    delete dbIssue.assignedTo;
  }
  
  // Remove frontend-only fields
  delete dbIssue.assignedOfficerName;
  delete dbIssue.issuerName;
  delete dbIssue.beforeImages;
  delete dbIssue.afterImages;
  
  return dbIssue;
};

const mapDbCommentToFrontend = (comment: DbIssueComment): IssueComment => ({
  ...comment,
  issueId: comment.issue_id,
  createdAt: comment.created_at,
  authorId: comment.author_id,
  authorRole: comment.author_role,
  authorName: comment.author?.name,
});

const mapFrontendCommentToDb = (comment: Partial<IssueComment>): Partial<DbIssueComment> => {
  const dbComment: Partial<DbIssueComment> = { ...comment };
  
  if (comment.issueId !== undefined) {
    dbComment.issue_id = comment.issueId;
    delete dbComment.issueId;
  }
  
  if (comment.createdAt !== undefined) {
    dbComment.created_at = comment.createdAt;
    delete dbComment.createdAt;
  }
  
  if (comment.authorId !== undefined) {
    dbComment.author_id = comment.authorId;
    delete dbComment.authorId;
  }
  
  if (comment.authorRole !== undefined) {
    dbComment.author_role = comment.authorRole;
    delete dbComment.authorRole;
  }
  
  // Remove frontend-only fields
  delete dbComment.authorName;
  
  return dbComment;
};

// Wrapped API functions
export const createIssue = async (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
  const dbIssue = mapFrontendIssueToDb(issueData);
  const result = await createDbIssue(dbIssue as Omit<DbIssue, 'id' | 'created_at' | 'updated_at'>);
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
  const result = await addDbIssueComment(dbComment as Omit<DbIssueComment, 'id' | 'created_at'>);
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
