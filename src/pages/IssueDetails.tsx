
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProtectedRoute } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { getIssueById } from '@/utils/issues-service';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import IssueDetailsCard from '@/components/officer/IssueDetailsCard';
import { useToast } from '@/hooks/use-toast';
import { Issue } from '@/utils/issues-service';

const IssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useProtectedRoute();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;
      
      try {
        const issueData = getIssueById(id);
        if (!issueData) {
          toast({
            title: "Error",
            description: "Issue not found",
            variant: "destructive"
          });
          navigate(user?.role === 'issuer' ? '/issuer' : '/officer');
          return;
        }
        
        setIssue(issueData);
      } catch (error) {
        console.error("Failed to fetch issue:", error);
        toast({
          title: "Error",
          description: "Failed to load issue details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id, navigate, toast, user?.role]);

  const handleSuccess = () => {
    // Refresh issue data
    if (id) {
      const updatedIssue = getIssueById(id);
      if (updatedIssue) {
        setIssue(updatedIssue);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <PageTransition className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse text-center">
                  <div className="h-8 w-64 bg-muted rounded mb-4 mx-auto"></div>
                  <div className="h-4 w-40 bg-muted rounded mx-auto"></div>
                </div>
              </div>
            ) : issue ? (
              <IssueDetailsCard issue={issue} onSuccess={handleSuccess} />
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Issue Not Found</h2>
                <p className="text-muted-foreground">
                  The issue you're looking for doesn't exist or has been removed.
                </p>
              </div>
            )}
          </div>
        </PageTransition>
      </main>
    </div>
  );
};

export default IssueDetails;
