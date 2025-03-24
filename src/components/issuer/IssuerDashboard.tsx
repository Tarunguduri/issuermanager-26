
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getIssuesByIssuer, Issue } from '@/utils/issues-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import IssueForm from './IssueForm';
import IssueCard from './IssueCard';
import GlassmorphicCard from '../ui/GlassmorphicCard';

const IssuerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isReportingIssue, setIsReportingIssue] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    if (user) {
      fetchIssues();
    }
  }, [user]);
  
  const fetchIssues = async () => {
    if (user) {
      try {
        const userIssues = await getIssuesByIssuer(user.id);
        setIssues(userIssues);
      } catch (error) {
        console.error("Failed to fetch issues:", error);
      }
    }
  };
  
  const handleNewIssueSuccess = () => {
    setIsReportingIssue(false);
    fetchIssues();
  };
  
  const getFilteredIssues = () => {
    if (activeTab === 'all') {
      return issues;
    }
    return issues.filter(issue => issue.status === activeTab);
  };
  
  const getStatusCount = (status: string) => {
    return issues.filter(issue => 
      status === 'all' ? true : issue.status === status
    ).length;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Issues</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your reported issues
          </p>
        </div>
        
        <Button
          onClick={() => setIsReportingIssue(true)}
          className="shrink-0"
          disabled={isReportingIssue}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Report New Issue
        </Button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isReportingIssue ? 1 : 0,
          height: isReportingIssue ? 'auto' : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {isReportingIssue && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Report New Issue</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReportingIssue(false)}
              >
                Cancel
              </Button>
            </div>
            <IssueForm onSuccess={handleNewIssueSuccess} />
          </div>
        )}
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <GlassmorphicCard className="p-4 text-center">
          <h3 className="text-muted-foreground text-sm mb-1">All Issues</h3>
          <p className="text-3xl font-semibold">{getStatusCount('all')}</p>
        </GlassmorphicCard>
        
        <GlassmorphicCard className="p-4 text-center">
          <h3 className="text-muted-foreground text-sm mb-1">Pending</h3>
          <p className="text-3xl font-semibold">{getStatusCount('pending')}</p>
        </GlassmorphicCard>
        
        <GlassmorphicCard className="p-4 text-center">
          <h3 className="text-muted-foreground text-sm mb-1">In Progress</h3>
          <p className="text-3xl font-semibold">{getStatusCount('in-progress')}</p>
        </GlassmorphicCard>
        
        <GlassmorphicCard className="p-4 text-center">
          <h3 className="text-muted-foreground text-sm mb-1">Resolved</h3>
          <p className="text-3xl font-semibold">{getStatusCount('resolved')}</p>
        </GlassmorphicCard>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Issues</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredIssues().length > 0 ? (
              getFilteredIssues().map(issue => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  onUpdate={fetchIssues}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  No issues found in this category.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsReportingIssue(true)}
                  className="mt-4"
                >
                  Report Your First Issue
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IssuerDashboard;
