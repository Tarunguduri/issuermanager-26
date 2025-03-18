
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllIssues, Issue } from '@/utils/issues-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IssueList from './IssueList';
import GlassmorphicCard from '../ui/GlassmorphicCard';

const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  
  useEffect(() => {
    refreshIssues();
  }, []);
  
  const refreshIssues = () => {
    const allIssues = getAllIssues();
    setIssues(allIssues);
  };
  
  const getStatusCount = (status: string) => {
    return issues.filter(issue => 
      status === 'all' ? true : issue.status === status
    ).length;
  };
  
  const getAssignedToMeCount = () => {
    return issues.filter(issue => issue.assignedTo === user?.id).length;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Officer Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage and resolve reported issues
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
        
        <GlassmorphicCard className="p-4 text-center">
          <h3 className="text-muted-foreground text-sm mb-1">Assigned to Me</h3>
          <p className="text-3xl font-semibold">{getAssignedToMeCount()}</p>
        </GlassmorphicCard>
      </div>
      
      <div>
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Issues</TabsTrigger>
            <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
            <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <IssueList issues={issues} onUpdate={refreshIssues} />
          </TabsContent>
          
          <TabsContent value="assigned" className="mt-0">
            <IssueList 
              issues={issues.filter(issue => issue.assignedTo === user?.id)} 
              onUpdate={refreshIssues} 
            />
          </TabsContent>
          
          <TabsContent value="unassigned" className="mt-0">
            <IssueList 
              issues={issues.filter(issue => !issue.assignedTo)} 
              onUpdate={refreshIssues} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OfficerDashboard;
