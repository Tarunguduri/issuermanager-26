
import { supabase } from '@/integrations/supabase/client';

// Re-export types and functions from supabase-service
export type { Issue, IssueImage, AIVerification, IssueComment } from '@/services/supabase-service';
export { 
  createIssue, 
  updateIssue, 
  getIssueById, 
  getUserIssues as getIssuesByIssuer,
  addIssueComment as addComment
} from '@/services/supabase-service';

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
