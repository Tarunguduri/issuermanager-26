
import { handleServiceError, supabase } from './base-service';

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
  try {
    const { data, error } = await supabase
      .from('ai_verifications')
      .insert([verificationData])
      .select()
      .single();

    if (error) {
      throw handleServiceError(error, 'Failed to create AI verification');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Failed to create AI verification');
  }
};

export const getAIVerifications = async (issueId: string, verificationType?: 'issue' | 'resolution') => {
  try {
    let query = supabase
      .from('ai_verifications')
      .select('*')
      .eq('issue_id', issueId);

    if (verificationType) {
      query = query.eq('verification_type', verificationType);
    }

    const { data, error } = await query.order('verified_at', { ascending: false });

    if (error) {
      throw handleServiceError(error, 'Failed to get AI verifications');
    }

    return data as AIVerification[];
  } catch (error) {
    throw handleServiceError(error, 'Failed to get AI verifications');
  }
};

// Mock function for image verification
export const verifyImageWithAI = async (
  imageUrl: string, 
  category: string
): Promise<{ success: boolean; message: string }> => {
  // In a real application, this would call an actual AI service
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock successful verification (80% success rate for demo)
    const isSuccess = Math.random() > 0.2;
    
    if (isSuccess) {
      return {
        success: true,
        message: `Image successfully verified as ${category} issue`
      };
    } else {
      return {
        success: false,
        message: `Image does not appear to show a ${category} issue. Please upload a clearer image.`
      };
    }
  } catch (error) {
    throw handleServiceError(error, 'Failed to verify image with AI');
  }
};

// Mock function for before/after image comparison
export const compareBeforeAfterImages = async (
  beforeImageUrl: string,
  afterImageUrl: string
): Promise<{ resolved: boolean; message: string }> => {
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock resolution verification (80% success rate for demo)
    const isResolved = Math.random() > 0.2;
    
    if (isResolved) {
      return {
        resolved: true,
        message: 'AI has verified that the issue has been successfully resolved.'
      };
    } else {
      return {
        resolved: false,
        message: 'AI could not verify that the issue has been resolved. The problem may still exist.'
      };
    }
  } catch (error) {
    throw handleServiceError(error, 'Failed to compare before/after images');
  }
};
