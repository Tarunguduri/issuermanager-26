
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import AuthForm from '@/components/auth/AuthForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import ResponsiveContainer from '@/components/layout/ResponsiveContainer';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const Register = () => {
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
      
      <main className="flex-1 pt-16 md:pt-24 pb-12">
        <ErrorBoundary>
          <PageTransition>
            <ResponsiveContainer>
              <div className="max-w-lg mx-auto">
                <div className="mb-8">
                  <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => navigate('/')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                  
                  <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                  <p className="text-muted-foreground">
                    Sign up to {selectedRole === 'issuer' ? 'report issues' : 'manage and resolve issues'}
                  </p>
                </div>
                
                <AuthForm initialMode="register" role={selectedRole} />
              </div>
            </ResponsiveContainer>
          </PageTransition>
        </ErrorBoundary>
      </main>
    </div>
  );
};

export default Register;
