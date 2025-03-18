
export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  issuerId: string;
  issuerName: string;
  assignedTo?: string;
  assignedOfficerName?: string;
  category: string;
  location: string;
  images?: string[];
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

// Mock storage key
const ISSUES_STORAGE_KEY = 'issue_manager_issues';

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
        category: 'Infrastructure',
        location: 'Main St & 5th Ave',
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
        title: 'Graffiti on public building',
        description: 'Graffiti on the west wall of the community center.',
        status: 'resolved',
        priority: 'low',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        issuerId: 'user1',
        issuerName: 'Jane Smith',
        assignedTo: 'officer2',
        assignedOfficerName: 'Officer Williams',
        category: 'Public Property',
        location: 'Community Center',
        comments: [
          {
            id: 'c2',
            issueId: '3',
            content: 'Cleaning crew has been assigned.',
            createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
            authorId: 'officer2',
            authorName: 'Officer Williams',
            authorRole: 'officer',
          },
          {
            id: 'c3',
            issueId: '3',
            content: 'Graffiti has been removed.',
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

// Initialize on import
initializeIssues();

// Get all issues
export const getAllIssues = (): Issue[] => {
  const issues = localStorage.getItem(ISSUES_STORAGE_KEY) || '[]';
  return JSON.parse(issues);
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
