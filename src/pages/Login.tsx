
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import AuthForm from '@/components/auth/AuthForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';

const Login = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'issuer' | 'officer' | null>(null);
  
  useEffect(() => {
    // Check if there's a stored role from the landing page
    const storedRole = localStorage.getItem('selectedRole') as 'issuer' | 'officer' | null;
    if (storedRole) {
      setSelectedRole(storedRole);
      localStorage.removeItem('selectedRole');
    }
  }, []);
  
  // If user is already authenticated, redirect to their dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const redirectPath = user.role === 'issuer' ? '/issuer' : '/officer';
      console.log('Redirecting authenticated user to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-12">
        <PageTransition className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto"
          >
            <div className="mb-8">
              <Button
                variant="ghost"
                className="mb-6"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>
            
            <AuthForm initialMode="login" role={selectedRole} />
          </motion.div>
        </PageTransition>
      </main>
    </div>
  );
};

export default Login;
