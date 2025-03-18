
import React, { useState } from 'react';
import { Issue, updateIssue } from '@/utils/issues-service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Clock, 
  MapPin, 
  MoreHorizontal, 
  Filter, 
  Search, 
  CheckCircle, 
  XCircle, 
  PlayCircle, 
  MessageSquare 
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import GlassmorphicCard from '../ui/GlassmorphicCard';

interface IssueListProps {
  issues: Issue[];
  onUpdate: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    case 'in-progress':
      return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
    case 'resolved':
      return 'bg-green-500/20 text-green-700 dark:text-green-400';
    case 'rejected':
      return 'bg-red-500/20 text-red-700 dark:text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    case 'high':
      return 'bg-red-500/20 text-red-700 dark:text-red-400';
    default:
      return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
  }
};

const IssueList: React.FC<IssueListProps> = ({ issues, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // Sorting and filtering
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const handleUpdateStatus = async (issueId: string, newStatus: Issue['status']) => {
    try {
      await updateIssue(issueId, { 
        status: newStatus,
        ...(newStatus === 'in-progress' && !issues.find(i => i.id === issueId)?.assignedTo ? {
          assignedTo: user?.id,
          assignedOfficerName: user?.name
        } : {})
      });
      toast({ title: 'Status updated successfully' });
      onUpdate();
    } catch (error) {
      console.error(error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const handleAddComment = async () => {
    if (!selectedIssue || !user || !newComment.trim()) return;
    
    try {
      await updateIssue(selectedIssue.id, {
        comments: [
          ...(selectedIssue.comments || []),
          {
            id: crypto.randomUUID(),
            issueId: selectedIssue.id,
            content: newComment,
            createdAt: new Date().toISOString(),
            authorId: user.id,
            authorName: user.name,
            authorRole: 'officer'
          }
        ]
      });
      
      setNewComment('');
      setCommentDialogOpen(false);
      toast({ title: 'Comment added successfully' });
      onUpdate();
    } catch (error) {
      console.error(error);
      toast({ 
        title: 'Error', 
        description: 'Failed to add comment',
        variant: 'destructive'
      });
    }
  };

  const filteredIssues = issues.filter(issue => {
    // Filter by tab (status)
    if (selectedTab !== 'all' && issue.status !== selectedTab) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !issue.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !issue.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !issue.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (filterCategory && issue.category !== filterCategory) {
      return false;
    }
    
    return true;
  });

  // Get unique categories from issues
  const categories = [...new Set(issues.map(issue => issue.category))];

  // Sort issues
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      // Priority: high > medium > low
      const priorityValues = { high: 3, medium: 2, low: 1 };
      return sortOrder === 'desc'
        ? priorityValues[b.priority] - priorityValues[a.priority]
        : priorityValues[a.priority] - priorityValues[b.priority];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterCategory(null)}>
                All Categories
              </DropdownMenuItem>
              {categories.map(category => (
                <DropdownMenuItem 
                  key={category}
                  onClick={() => setFilterCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort: {sortBy === 'date' ? 'Date' : 'Priority'} ({sortOrder === 'desc' ? 'Newest' : 'Oldest'})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('date')}>
                Date {sortBy === 'date' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('priority')}>
                Priority {sortBy === 'priority' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder('desc')}>
                Descending {sortOrder === 'desc' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('asc')}>
                Ascending {sortOrder === 'asc' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Issues</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="mt-0">
          {sortedIssues.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {sortedIssues.map(issue => (
                <GlassmorphicCard key={issue.id} className="transition-all duration-300 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{issue.title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3" /> 
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                            </span>
                            
                            <span>•</span>
                            
                            <MapPin className="h-3 w-3" /> 
                            <span className="text-xs">{issue.location}</span>
                          </div>
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
                          {issue.status === 'in-progress' ? 'In Progress' : 
                            issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                        </div>
                        
                        <div className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(issue.priority)}`}>
                          {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm line-clamp-2">{issue.description}</p>
                    
                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reported by:</span> {issue.issuerName}
                      </div>
                      
                      {issue.assignedOfficerName && (
                        <div>
                          <span className="text-muted-foreground">Assigned to:</span> {issue.assignedOfficerName}
                        </div>
                      )}
                      
                      <div>
                        <span className="text-muted-foreground">Category:</span> {issue.category}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedIssue(issue);
                        setCommentDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {issue.comments?.length || 0} Comments
                    </Button>
                    
                    <div className="flex gap-2">
                      {issue.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateStatus(issue.id, 'in-progress')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Progress
                        </Button>
                      )}
                      
                      {issue.status === 'in-progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateStatus(issue.id, 'resolved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {issue.status !== 'pending' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, 'pending')}>
                              Set as Pending
                            </DropdownMenuItem>
                          )}
                          
                          {issue.status !== 'in-progress' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, 'in-progress')}>
                              Set as In Progress
                            </DropdownMenuItem>
                          )}
                          
                          {issue.status !== 'resolved' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, 'resolved')}>
                              Set as Resolved
                            </DropdownMenuItem>
                          )}
                          
                          {issue.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(issue.id, 'rejected')}>
                              Reject Issue
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardFooter>
                </GlassmorphicCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No issues found matching your criteria.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedIssue?.title}</DialogTitle>
            <DialogDescription>
              Add a comment to this issue
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="max-h-48 overflow-y-auto space-y-3">
              {selectedIssue?.comments && selectedIssue.comments.length > 0 ? (
                selectedIssue.comments.map(comment => (
                  <div key={comment.id} className="bg-secondary/50 p-3 rounded-md text-sm">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">
                        {comment.authorName} 
                        <span className="text-muted-foreground ml-1">
                          ({comment.authorRole === 'officer' ? 'Officer' : 'Issuer'})
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground">No comments yet.</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Your comment</Label>
              <Textarea
                id="comment"
                placeholder="Add your comment here..."
                className="min-h-[100px]"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IssueList;
