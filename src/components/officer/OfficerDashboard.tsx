
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IssueList from './IssueList';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import { getOfficerIssues, getIssueStats } from '@/services/supabase-service';

const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    assignedToMe: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadIssues = async () => {
      if (user && user.category) {
        try {
          setIsLoading(true);
          const issuesData = await getOfficerIssues(user.category);
          
          // Ensure we have valid dates for each issue - using the correct property names
          const validatedIssues = issuesData.map(issue => ({
            ...issue,
            created_at: issue.created_at || new Date().toISOString(),
            updated_at: issue.updated_at || issue.created_at || new Date().toISOString()
          }));
          
          setIssues(validatedIssues);
          
          if (user.id) {
            const statsData = await getIssueStats(user.id, 'officer');
            setStats({
              total: statsData.total,
              pending: statsData.pending,
              inProgress: statsData.inProgress,
              resolved: statsData.resolved,
              assignedToMe: statsData.assignedToMe || 0
            });
          }
        } catch (error) {
          console.error("Error loading officer issues:", error);
          // Set empty issues array to prevent null issues
          setIssues([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadIssues();
  }, [user]);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Officer Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {user?.category ? `Manage and resolve reported ${user.category} issues` : 'Manage and resolve reported issues'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <GlassmorphicCard className="p-4 text-center">
          <h3 className="text-muted-foreground text-sm mb-1">All Issues</h3>
          <p className="text-3xl font-semibold">{stats.total}</p>
        </GlassmorphicCard>
        
        <GlassmorphicCard className="p-4 text-center">
          <h3 className="text-muted-foreground text-sm mb-1">Pending</h3>
          <p className="text-3xl font-semibold">{stats.pending}</p>
        </GlassmorphicCard>
        
        <GlassmorphicCard className="p-4 text-center">
          <h3 className="text-muted-foreground text-sm mb-1">In Progress</h3>
          <p className="text-3xl font-semibold">{stats.inProgress}</p>
        </GlassmorphicCard>
        
        <GlassmorphicCard className="p-4 text-center">
          <h3 className="text-muted-foreground text-sm mb-1">Resolved</h3>
          <p className="text-3xl font-semibold">{stats.resolved}</p>
        </GlassmorphicCard>
        
        <GlassmorphicCard className="p-4 text-center">
          <h3 className="text-muted-foreground text-sm mb-1">Assigned to Me</h3>
          <p className="text-3xl font-semibold">{stats.assignedToMe}</p>
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
            <IssueList 
              issues={issues} 
              onUpdate={() => {}} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="assigned" className="mt-0">
            <IssueList 
              issues={issues.filter(issue => issue.assigned_to === user?.id)} 
              onUpdate={() => {}} 
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="unassigned" className="mt-0">
            <IssueList 
              issues={issues.filter(issue => !issue.assigned_to)} 
              onUpdate={() => {}} 
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OfficerDashboard;
