
import { handleServiceError, supabase } from './base-service';

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
  try {
    const { data, error } = await supabase
      .from('issue_comments')
      .insert([commentData])
      .select()
      .single();

    if (error) {
      throw handleServiceError(error, 'Failed to add comment');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Failed to add comment');
  }
};

export const getIssueComments = async (issueId: string) => {
  try {
    const { data, error } = await supabase
      .from('issue_comments')
      .select(`
        *,
        author:author_id (name)
      `)
      .eq('issue_id', issueId)
      .order('created_at', { ascending: true });

    if (error) {
      throw handleServiceError(error, 'Failed to get issue comments');
    }

    // Fix by type casting to handle the SelectQueryError
    return data as unknown as IssueComment[];
  } catch (error) {
    throw handleServiceError(error, 'Failed to get issue comments');
  }
};
