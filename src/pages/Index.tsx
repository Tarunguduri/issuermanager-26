
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import RoleSelection from '@/components/auth/RoleSelection';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';
import { ClipboardList, BarChart4, Shield, User, CheckCircle, Lightbulb } from 'lucide-react';

const Index = () => {
  const { user, isAuthenticated, setUserRole } = useAuth();
  const navigate = useNavigate();
  
  const handleRoleSelection = (role: 'issuer' | 'officer') => {
    if (isAuthenticated) {
      setUserRole(role);
      navigate(role === 'issuer' ? '/issuer' : '/officer');
    } else {
      // Store selected role and navigate to login
      localStorage.setItem('selectedRole', role);
      navigate('/login');
    }
  };
  
  // If user is already authenticated, redirect to their dashboard
  React.useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(user.role === 'issuer' ? '/issuer' : '/officer');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12 bg-gradient-to-b from-background to-background/50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gradient-blue-green">
                JAGRUTHI
              </h1>
              <p className="text-xl md:text-2xl font-medium mb-2 text-primary/90">
                Smart Citizen Issue Management System
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                A unified platform for reporting and resolving community issues efficiently
              </p>
            </motion.div>
            
            <div className="my-12">
              <h2 className="text-2xl font-semibold mb-6">Select Your Role</h2>
              <RoleSelection onSelectRole={handleRoleSelection} />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-center mb-8">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <GlassmorphicCard className="p-6 flex flex-col items-center text-center" withHover>
                <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center mb-4">
                  <ClipboardList className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-medium text-lg mb-2">Issue Tracking</h3>
                <p className="text-muted-foreground">
                  Submit and track issues through their entire lifecycle
                </p>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-6 flex flex-col items-center text-center" withHover>
                <div className="h-12 w-12 rounded-full bg-green-600/10 flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-medium text-lg mb-2">AI-Powered Verification</h3>
                <p className="text-muted-foreground">
                  Smart image analysis ensures accurate issue reporting and resolution
                </p>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-6 flex flex-col items-center text-center" withHover>
                <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-medium text-lg mb-2">Role-Based Access</h3>
                <p className="text-muted-foreground">
                  Separate portals for citizens and municipal officers
                </p>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-6 flex flex-col items-center text-center" withHover>
                <div className="h-12 w-12 rounded-full bg-green-600/10 flex items-center justify-center mb-4">
                  <BarChart4 className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-medium text-lg mb-2">Status Updates</h3>
                <p className="text-muted-foreground">
                  Real-time updates on issue status and resolution
                </p>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-6 flex flex-col items-center text-center" withHover>
                <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-medium text-lg mb-2">Specialized Assignment</h3>
                <p className="text-muted-foreground">
                  Issues are assigned based on category and location matching
                </p>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-6 flex flex-col items-center text-center" withHover>
                <div className="h-12 w-12 rounded-full bg-green-600/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-medium text-lg mb-2">Verified Resolution</h3>
                <p className="text-muted-foreground">
                  AI confirms issue resolution through before/after image comparison
                </p>
              </GlassmorphicCard>
            </div>
          </motion.div>
        </div>
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} JAGRUTHI - Smart Citizen Issue Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
