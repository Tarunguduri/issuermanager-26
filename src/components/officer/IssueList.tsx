import React, { useState } from 'react';
import { Issue, IssueComment, addComment, updateIssueStatus } from '@/utils/issues-service';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Clock, MapPin, AlertCircle, Send, CheckCircle, XCircle } from 'lucide-react';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import { useQueryClient } from '@tanstack/react-query';

export interface IssueListProps {
  issues: Issue[];
  onUpdate: () => void;
  isLoading?: boolean; // Making this optional with a default value
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

const IssueCard: React.FC<{ issue: Issue; onUpdate: () => void }> = ({ issue, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Issue['status']>(issue.status);
  
  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      await addComment({
        issueId: issue.id,
        content: newComment,
        authorId: user.id,
        authorRole: user.role as 'issuer' | 'officer',
        authorName: user.name,
        author: {
          name: user.name
        }
      });
      
      setNewComment('');
      toast({ title: 'Comment added successfully' });
      
      // Invalidate the query for the issue list to trigger a refetch
      queryClient.invalidateQueries({queryKey: ['issues']});
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error(error);
      toast({ 
        title: 'Error', 
        description: 'Failed to add comment',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStatusChange = async (status: Issue['status']) => {
    setIsUpdatingStatus(true);
    try {
      await updateIssueStatus(issue.id, status);
      setSelectedStatus(status);
      toast({ title: 'Status updated successfully' });
      
      // Invalidate the query for the issue list to trigger a refetch
      queryClient.invalidateQueries({queryKey: ['issues']});
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error(error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update status',
        variant: 'destructive'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle field name differences between the mock data and actual API data
  const officerName = issue.officer?.name || issue.assignedOfficerName;
  const createdDate = new Date(issue.createdAt);

  return (
    <GlassmorphicCard className="p-5 h-full flex flex-col">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg line-clamp-1">{issue.title}</h3>
          
          <div className={`ml-2 text-xs px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
            {issue.status === 'in-progress' ? 'In Progress' : 
              issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
          </div>
        </div>
        
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <Clock className="h-3 w-3 mr-1" /> 
          <span>
            {formatDistanceToNow(createdDate, { addSuffix: true })}
          </span>
          
          <span className="mx-2">•</span>
          
          <MapPin className="h-3 w-3 mr-1" /> 
          <span>{issue.location}</span>
          
          <span className="mx-2">•</span>
          
          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getPriorityColor(issue.priority)}`}>
            <AlertCircle className="h-3 w-3 mr-1" />
            {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)} Priority
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {issue.description}
        </p>
        
        {officerName && (
          <div className="text-xs text-muted-foreground mb-3">
            <span className="font-medium">Assigned to:</span> {officerName}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Select value={selectedStatus} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
          <SelectTrigger className="glass-input w-full text-xs">
            <SelectValue placeholder="Update Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">
              Pending
              {selectedStatus === 'pending' && <CheckCircle className="ml-auto h-4 w-4" />}
            </SelectItem>
            <SelectItem value="in-progress">
              In Progress
              {selectedStatus === 'in-progress' && <CheckCircle className="ml-auto h-4 w-4" />}
            </SelectItem>
            <SelectItem value="resolved">
              Resolved
              {selectedStatus === 'resolved' && <CheckCircle className="ml-auto h-4 w-4" />}
            </SelectItem>
             <SelectItem value="rejected">
              Rejected
              {selectedStatus === 'rejected' && <XCircle className="ml-auto h-4 w-4" />}
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 text-xs"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageSquare className="h-3 w-3 mr-2" />
          {issue.comments?.length || 0} Comments
        </Button>
        
        {showComments && (
          <div className="mt-4">
            <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map(comment => (
                  <div key={comment.id} className="bg-secondary/50 p-3 rounded-md text-sm">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">
                        {comment.author?.name || comment.authorName} 
                        <span className="text-muted-foreground ml-1">
                          ({comment.authorRole === 'issuer' ? 'Issuer' : 'You'})
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
            
            <div className="flex gap-2 mt-3">
              <Textarea
                placeholder="Add a comment..."
                className="text-sm min-h-[60px]"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button 
                size="icon" 
                disabled={!newComment.trim() || isSubmittingComment}
                onClick={handleAddComment}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </GlassmorphicCard>
  );
};

const IssueList: React.FC<IssueListProps> = ({ issues, onUpdate, isLoading = false }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {isLoading ? (
        // Skeleton loading state
        [...Array(6)].map((_, i) => (
          <GlassmorphicCard key={i} className="p-5 h-full flex flex-col animate-pulse">
            <div className="h-6 bg-muted rounded-md w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded-md w-1/2 mb-4"></div>
            <div className="h-24 bg-muted rounded-md mb-4"></div>
            <div className="h-8 bg-muted rounded-md mt-auto"></div>
          </GlassmorphicCard>
        ))
      ) : issues.length > 0 ? (
        issues.map(issue => (
          <IssueCard 
            key={issue.id} 
            issue={issue} 
            onUpdate={onUpdate} 
          />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">
            No issues found.
          </p>
        </div>
      )}
    </div>
  );
};

export default IssueList;
