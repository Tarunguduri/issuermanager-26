
import React, { useState } from 'react';
import { Issue, addComment } from '@/utils/issues-service';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Clock, MapPin, AlertCircle, Send } from 'lucide-react';
import GlassmorphicCard from '../ui/GlassmorphicCard';

interface IssueCardProps {
  issue: Issue;
  onUpdate?: () => void;
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

const IssueCard: React.FC<IssueCardProps> = ({ issue, onUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addComment(
        issue.id,
        newComment,
        user.id,
        user.name,
        user.role as 'issuer' | 'officer'
      );
      
      setNewComment('');
      toast({ title: 'Comment added successfully' });
      
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
      setIsSubmitting(false);
    }
  };

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
            {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
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
        
        {issue.assignedOfficerName && (
          <div className="text-xs text-muted-foreground mb-3">
            <span className="font-medium">Assigned to:</span> {issue.assignedOfficerName}
          </div>
        )}
      </div>
      
      <div>
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
                        {comment.authorName} 
                        <span className="text-muted-foreground ml-1">
                          ({comment.authorRole === 'issuer' ? 'You' : 'Officer'})
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
                disabled={!newComment.trim() || isSubmitting}
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

export default IssueCard;
