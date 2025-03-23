export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected' | 'pending-verification';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  issuerId: string;
  issuerName: string;
  assignedTo?: string;
  assignedOfficerName?: string;
  category: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  zone?: string;
  images?: string[];
  beforeImages?: string[];
  afterImages?: string[];
  ai_verification_status?: 'pending' | 'verified' | 'rejected';
  ai_resolution_status?: 'pending' | 'verified' | 'rejected';
  comments?: IssueComment[];
}

export interface IssueComment {
  id: string;
  issueId: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorRole: 'issuer' | 'officer';
}

export interface Officer {
  id: string;
  name: string;
  email: string;
  category: string;
  designation: string;
  zone: string;
}

// Mock categories
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

// Mock zones
export const zones = [
  'North Zone',
  'South Zone',
  'East Zone',
  'West Zone',
  'Central Zone'
];

// Mock designations
export const designations = [
  'Junior Engineer',
  'Senior Engineer',
  'Assistant Officer',
  'Deputy Officer',
  'Chief Officer'
];

// Mock storage keys
const ISSUES_STORAGE_KEY = 'jagruthi_issues';
const OFFICERS_STORAGE_KEY = 'jagruthi_officers';

// Initialize with some mock data
const initializeIssues = () => {
  const existingIssues = localStorage.getItem(ISSUES_STORAGE_KEY);
  if (!existingIssues) {
    const mockIssues: Issue[] = [
      {
        id: '1',
        title: 'Broken street light',
        description: 'The street light at the corner of Main and 5th has been out for a week.',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        issuerId: 'user1',
        issuerName: 'Jane Smith',
        category: 'Street Lights',
        location: 'Main St & 5th Ave',
        zone: 'North Zone',
        images: ['https://placehold.co/600x400/png?text=Street+Light+Issue'],
        beforeImages: ['https://placehold.co/600x400/png?text=Street+Light+Issue'],
        ai_verification_status: 'verified',
      },
      {
        id: '2',
        title: 'Pothole on Oak Avenue',
        description: 'Large pothole causing damage to vehicles.',
        status: 'in-progress',
        priority: 'high',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        issuerId: 'user2',
        issuerName: 'John Doe',
        assignedTo: 'officer1',
        assignedOfficerName: 'Officer Johnson',
        category: 'Roads',
        location: 'Oak Avenue',
        zone: 'South Zone',
        images: ['https://placehold.co/600x400/png?text=Pothole'],
        beforeImages: ['https://placehold.co/600x400/png?text=Pothole'],
        ai_verification_status: 'verified',
        comments: [
          {
            id: 'c1',
            issueId: '2',
            content: 'We have scheduled repairs for next week.',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            authorId: 'officer1',
            authorName: 'Officer Johnson',
            authorRole: 'officer',
          }
        ]
      },
      {
        id: '3',
        title: 'Water leakage on Community Center road',
        description: 'Water pipe leakage causing road damage near the community center.',
        status: 'resolved',
        priority: 'high',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        issuerId: 'user1',
        issuerName: 'Jane Smith',
        assignedTo: 'officer2',
        assignedOfficerName: 'Officer Williams',
        category: 'Water Supply',
        location: 'Community Center Road',
        zone: 'Central Zone',
        images: ['https://placehold.co/600x400/png?text=Water+Leakage'],
        beforeImages: ['https://placehold.co/600x400/png?text=Water+Leakage+Before'],
        afterImages: ['https://placehold.co/600x400/png?text=Water+Leakage+After'],
        ai_verification_status: 'verified',
        ai_resolution_status: 'verified',
        comments: [
          {
            id: 'c2',
            issueId: '3',
            content: 'Our team has been assigned to fix this issue.',
            createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            authorId: 'officer2',
            authorName: 'Officer Williams',
            authorRole: 'officer',
          },
          {
            id: 'c3',
            issueId: '3',
            content: 'The water leakage has been fixed and the road has been repaired.',
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            authorId: 'officer2',
            authorName: 'Officer Williams',
            authorRole: 'officer',
          }
        ]
      }
    ];
    
    localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(mockIssues));
  }
};

// Initialize officers data
const initializeOfficers = () => {
  const existingOfficers = localStorage.getItem(OFFICERS_STORAGE_KEY);
  if (!existingOfficers) {
    const mockOfficers: Officer[] = [
      {
        id: 'officer1',
        name: 'Officer Johnson',
        email: 'johnson@jagruthi.gov',
        category: 'Roads',
        designation: 'Junior Engineer',
        zone: 'South Zone'
      },
      {
        id: 'officer2',
        name: 'Officer Williams',
        email: 'williams@jagruthi.gov',
        category: 'Water Supply',
        designation: 'Senior Engineer',
        zone: 'Central Zone'
      },
      {
        id: 'officer3',
        name: 'Officer Rodriguez',
        email: 'rodriguez@jagruthi.gov',
        category: 'Street Lights',
        designation: 'Assistant Officer',
        zone: 'North Zone'
      }
    ];
    
    localStorage.setItem(OFFICERS_STORAGE_KEY, JSON.stringify(mockOfficers));
  }
};

// Initialize on import
initializeIssues();
initializeOfficers();

// Get all issues
export const getAllIssues = (): Issue[] => {
  const issues = localStorage.getItem(ISSUES_STORAGE_KEY) || '[]';
  return JSON.parse(issues);
};

// Get all officers
export const getAllOfficers = (): Officer[] => {
  const officers = localStorage.getItem(OFFICERS_STORAGE_KEY) || '[]';
  return JSON.parse(officers);
};

// Get issues for a specific issuer
export const getIssuesByIssuer = (issuerId: string): Issue[] => {
  const allIssues = getAllIssues();
  return allIssues.filter(issue => issue.issuerId === issuerId);
};

// Get issues assigned to a specific officer
export const getIssuesByOfficer = (officerId: string): Issue[] => {
  const allIssues = getAllIssues();
  return allIssues.filter(issue => issue.assignedTo === officerId);
};

// Get issues by category and zone (for officer assignment)
export const getIssuesByCategoryAndZone = (category: string, zone: string): Issue[] => {
  const allIssues = getAllIssues();
  return allIssues.filter(issue => 
    issue.category === category && 
    (issue.zone === zone || !issue.zone)
  );
};

// Get an issue by ID
export const getIssueById = (issueId: string): Issue | undefined => {
  const allIssues = getAllIssues();
  return allIssues.find(issue => issue.id === issueId);
};

// Create a new issue
export const createIssue = (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Issue => {
  const allIssues = getAllIssues();
  
  const newIssue: Issue = {
    ...issue,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending',
    comments: []
  };
  
  allIssues.push(newIssue);
  localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(allIssues));
  
  return newIssue;
};

// Update an issue
export const updateIssue = (issueId: string, updates: Partial<Issue>): Issue => {
  const allIssues = getAllIssues();
  const index = allIssues.findIndex(issue => issue.id === issueId);
  
  if (index === -1) {
    throw new Error('Issue not found');
  }
  
  const updatedIssue = {
    ...allIssues[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  allIssues[index] = updatedIssue;
  localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(allIssues));
  
  return updatedIssue;
};

// Add before images to an issue
export const addBeforeImages = (issueId: string, imageUrls: string[]): Issue => {
  const allIssues = getAllIssues();
  const index = allIssues.findIndex(issue => issue.id === issueId);
  
  if (index === -1) {
    throw new Error('Issue not found');
  }
  
  const updatedIssue = {
    ...allIssues[index],
    beforeImages: [...(allIssues[index].beforeImages || []), ...imageUrls],
    updatedAt: new Date().toISOString()
  };
  
  allIssues[index] = updatedIssue;
  localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(allIssues));
  
  return updatedIssue;
};

// Add after images to an issue
export const addAfterImages = (issueId: string, imageUrls: string[]): Issue => {
  const allIssues = getAllIssues();
  const index = allIssues.findIndex(issue => issue.id === issueId);
  
  if (index === -1) {
    throw new Error('Issue not found');
  }
  
  const updatedIssue = {
    ...allIssues[index],
    afterImages: [...(allIssues[index].afterImages || []), ...imageUrls],
    updatedAt: new Date().toISOString()
  };
  
  allIssues[index] = updatedIssue;
  localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(allIssues));
  
  return updatedIssue;
};

// Update AI verification status
export const updateAIVerificationStatus = (
  issueId: string, 
  status: 'pending' | 'verified' | 'rejected'
): Issue => {
  const allIssues = getAllIssues();
  const index = allIssues.findIndex(issue => issue.id === issueId);
  
  if (index === -1) {
    throw new Error('Issue not found');
  }
  
  const updatedIssue = {
    ...allIssues[index],
    ai_verification_status: status,
    updatedAt: new Date().toISOString()
  };
  
  allIssues[index] = updatedIssue;
  localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(allIssues));
  
  return updatedIssue;
};

// Update AI resolution status
export const updateAIResolutionStatus = (
  issueId: string, 
  status: 'pending' | 'verified' | 'rejected'
): Issue => {
  const allIssues = getAllIssues();
  const index = allIssues.findIndex(issue => issue.id === issueId);
  
  if (index === -1) {
    throw new Error('Issue not found');
  }
  
  const updatedIssue = {
    ...allIssues[index],
    ai_resolution_status: status,
    updatedAt: new Date().toISOString()
  };
  
  allIssues[index] = updatedIssue;
  localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(allIssues));
  
  return updatedIssue;
};

// Verify image with AI (mock implementation)
export const verifyImageWithAI = async (
  imageUrl: string, 
  category: string
): Promise<{ success: boolean; message: string }> => {
  // This is a mock implementation - in a real app, you would call an AI service API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        resolve({
          success: true,
          message: `Image successfully verified as ${category} issue`
        });
      } else {
        resolve({
          success: false,
          message: `Image does not appear to show a ${category} issue. Please upload a clearer image.`
        });
      }
    }, 1500);
  });
};

// Compare before/after images with AI (mock implementation)
export const compareBeforeAfterImages = async (
  beforeImageUrl: string,
  afterImageUrl: string
): Promise<{ resolved: boolean; message: string }> => {
  // This is a mock implementation - in a real app, you would call an AI service API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      const isResolved = Math.random() > 0.3;
      
      if (isResolved) {
        resolve({
          resolved: true,
          message: 'AI has verified that the issue has been successfully resolved.'
        });
      } else {
        resolve({
          resolved: false,
          message: 'AI could not verify that the issue has been resolved. The problem may still exist.'
        });
      }
    }, 1500);
  });
};

// Add a comment to an issue
export const addComment = (
  issueId: string, 
  content: string, 
  authorId: string, 
  authorName: string, 
  authorRole: 'issuer' | 'officer'
): IssueComment => {
  const allIssues = getAllIssues();
  const index = allIssues.findIndex(issue => issue.id === issueId);
  
  if (index === -1) {
    throw new Error('Issue not found');
  }
  
  const issue = allIssues[index];
  
  const newComment: IssueComment = {
    id: crypto.randomUUID(),
    issueId,
    content,
    createdAt: new Date().toISOString(),
    authorId,
    authorName,
    authorRole
  };
  
  if (!issue.comments) {
    issue.comments = [];
  }
  
  issue.comments.push(newComment);
  issue.updatedAt = new Date().toISOString();
  
  localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(allIssues));
  
  return newComment;
};

// Delete an issue
export const deleteIssue = (issueId: string): void => {
  const allIssues = getAllIssues();
  const filteredIssues = allIssues.filter(issue => issue.id !== issueId);
  
  localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(filteredIssues));
};

// Add or update an officer
export const saveOfficer = (officer: Officer): Officer => {
  const allOfficers = getAllOfficers();
  const existingIndex = allOfficers.findIndex(o => o.id === officer.id);
  
  if (existingIndex >= 0) {
    allOfficers[existingIndex] = officer;
  } else {
    allOfficers.push({
      ...officer,
      id: officer.id || crypto.randomUUID()
    });
  }
  
  localStorage.setItem(OFFICERS_STORAGE_KEY, JSON.stringify(allOfficers));
  return officer;
};

// Get an officer by ID
export const getOfficerById = (officerId: string): Officer | undefined => {
  const allOfficers = getAllOfficers();
  return allOfficers.find(officer => officer.id === officerId);
};

// Find appropriate officers for an issue
export const findOfficersForIssue = (category: string, zone: string): Officer[] => {
  const allOfficers = getAllOfficers();
  return allOfficers.filter(
    officer => officer.category === category && officer.zone === zone
  );
};
