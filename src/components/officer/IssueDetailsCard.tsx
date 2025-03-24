
import React from 'react';
import { Issue } from '@/utils/issues-service';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import ResolutionVerificationForm from './ResolutionVerificationForm';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Map, User, BarChart3, CheckCircle, AlarmClock } from 'lucide-react';
import { format } from 'date-fns';

interface IssueDetailsCardProps {
  issue: Issue;
  onSuccess?: () => void;
}

const IssueDetailsCard: React.FC<IssueDetailsCardProps> = ({ issue, onSuccess }) => {
  const statusColors = {
    'pending': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    'in-progress': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    'resolved': 'bg-green-500/10 text-green-500 border-green-500/30',
    'rejected': 'bg-red-500/10 text-red-500 border-red-500/30',
    'pending-verification': 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  };

  const priorityColors = {
    'low': 'bg-green-500/10 text-green-500 border-green-500/30',
    'medium': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    'high': 'bg-red-500/10 text-red-500 border-red-500/30',
  };

  // Determine the correct username from issue data
  const issuerName = issue.user?.name || "Unknown User";

  return (
    <div className="space-y-6">
      <GlassmorphicCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">{issue.title}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className={statusColors[issue.status]}>
                {issue.status.charAt(0).toUpperCase() + issue.status.slice(1).replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className={priorityColors[issue.priority]}>
                {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)} Priority
              </Badge>
              <Badge variant="outline">{issue.category}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Reported by</p>
                  <p className="font-medium">{issuerName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Map className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{issue.location}</p>
                  {issue.zone && <p className="text-sm text-muted-foreground">{issue.zone}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CalendarClock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Reported on</p>
                  <p className="font-medium">{format(new Date(issue.createdAt), 'PPP')}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(issue.createdAt), 'p')}
                  </p>
                </div>
              </div>

              {issue.status === 'in-progress' && (
                <div className="flex items-start space-x-3">
                  <AlarmClock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">In progress since</p>
                    <p className="font-medium">{format(new Date(issue.updatedAt), 'PPP')}</p>
                  </div>
                </div>
              )}

              {issue.status === 'resolved' && (
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved on</p>
                    <p className="font-medium">{format(new Date(issue.updatedAt), 'PPP')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Description</h3>
            <p className="text-muted-foreground whitespace-pre-line">{issue.description}</p>
          </div>

          {issue.images && issue.images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {issue.images.map((image, index) => (
                  <div 
                    key={index}
                    className="aspect-square rounded-md overflow-hidden border border-border"
                  >
                    <img
                      src={image}
                      alt={`Issue ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {issue.comments && issue.comments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Comments</h3>
              <div className="space-y-4">
                {issue.comments.map(comment => (
                  <div 
                    key={comment.id}
                    className="p-4 rounded-lg bg-secondary/20 border border-border"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{comment.author.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'PPp')}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassmorphicCard>

      {/* Resolution verification form for "in-progress" issues */}
      {issue.status === 'in-progress' && (
        <ResolutionVerificationForm issue={issue} onSuccess={onSuccess} />
      )}
    </div>
  );
};

export default IssueDetailsCard;
