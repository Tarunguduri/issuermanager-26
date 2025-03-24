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

// Mock function to create an issue
export const createIssue = async (issueData: any) => {
  // In a real application, this would call an API
  console.log('Creating issue:', issueData);
  
  // Clean up data to match the Issue interface
  const cleanedData = {
    ...issueData,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Remove any fields that aren't in the Issue interface
  const { beforeImages, afterImages, ai_verification_status, issuerName, issuerId, ...validIssueData } = cleanedData;
  
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Store in localStorage for demo purposes
  const existingIssues = JSON.parse(localStorage.getItem('issues') || '[]');
  existingIssues.push(validIssueData);
  localStorage.setItem('issues', JSON.stringify(existingIssues));
  
  return validIssueData;
};
