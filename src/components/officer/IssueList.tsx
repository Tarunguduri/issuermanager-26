import React, { useState } from 'react';
import { Issue, updateIssue, IssueComment } from '@/utils/issues-service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Loader2, MessageSquare, Clock, MapPin, AlertCircle, Send, CheckCircle, XCircle } from 'lucide-react';

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

const IssueList: React.FC<IssueListProps> = ({ 
  issues,
  onUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Issue['status']>('pending');
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleStatusChange = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsDialogOpen(true);
    setNewStatus(issue.status);
  };
  
  const confirmStatusChange = async () => {
    if (!selectedIssue) return;
    
    setIsSubmitting(true);
    
    try {
      await updateIssue(selectedIssue.id, { status: newStatus });
      toast({ title: 'Status updated successfully' });
      onUpdate();
    } catch (error) {
      console.error(error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update status',
        variant: 'destructive'
      });
    } finally {
      setIsDialogOpen(false);
      setIsSubmitting(false);
    }
  };
  
  const addComment = async () => {
    if (!newComment.trim() || !selectedIssue || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Create a new comment object with proper structure
      const newCommentObj: IssueComment = {
        id: crypto.randomUUID(),
        issueId: selectedIssue.id,
        content: newComment,
        authorId: user.id,
        authorRole: user.role as 'issuer' | 'officer',
        authorName: user.name,
        createdAt: new Date().toISOString(),
        author: {
          name: user.name
        }
      };
      
      // Update the issue with the new comment
      await updateIssue(selectedIssue.id, {
        comments: [
          ...(selectedIssue.comments || []),
          newCommentObj
        ]
      });
      
      setNewComment('');
      toast({ title: 'Comment added successfully' });
      onUpdate();
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
    <div>
      <Table>
        <TableCaption>A list of your recent issues.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell className="font-medium">{issue.title}</TableCell>
              <TableCell>{issue.category}</TableCell>
              <TableCell>{issue.location}</TableCell>
              <TableCell>
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getPriorityColor(issue.priority)}`}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                </div>
              </TableCell>
              <TableCell>
                <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
                  {issue.status === 'in-progress' ? 'In Progress' : 
                    issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedIssue(issue)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>{selectedIssue?.title}</DrawerTitle>
                      <DrawerDescription>
                        {selectedIssue?.description}
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium">Issue Details</h3>
                          <p className="text-muted-foreground text-xs">
                            Created {selectedIssue && formatDistanceToNow(new Date(selectedIssue.createdAt), { addSuffix: true })}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Category: {selectedIssue?.category}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Location: {selectedIssue?.location}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Priority: {selectedIssue?.priority}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Update Status</h3>
                          <Select 
                            value={newStatus} 
                            onValueChange={(value) => setNewStatus(value as Issue['status'])}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => selectedIssue && handleStatusChange(selectedIssue)}
                          >
                            Update Status
                          </Button>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Add Comment</h3>
                          <Textarea 
                            value={newComment} 
                            onChange={(e) => setNewComment(e.target.value)} 
                            placeholder="Enter your comment here..." 
                            className="text-sm"
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            disabled={isSubmitting}
                            onClick={addComment}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Add Comment
                              </>
                            )}
                          </Button>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Comments</h3>
                          {selectedIssue?.comments?.map((comment, index) => (
                            <div key={index} className="p-4 border rounded-lg mb-2 bg-secondary/30">
                              <div className="flex justify-between items-start">
                                <p className="font-medium">
                                  {comment.author?.name || comment.authorName}
                                  <span className="text-muted-foreground ml-2 text-xs">
                                    ({comment.authorRole === 'issuer' ? 'Citizen' : 'Officer'})
                                  </span>
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="mt-2">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DrawerFooter>
                      <DrawerClose>Cancel</DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of this issue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isSubmitting} onClick={confirmStatusChange}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Confirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IssueList;
