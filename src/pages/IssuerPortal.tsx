
import React from 'react';
import { motion } from 'framer-motion';
import { useProtectedRoute } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import IssuerDashboard from '@/components/issuer/IssuerDashboard';
import PageTransition from '@/components/layout/PageTransition';

const IssuerPortal = () => {
  const { isLoading } = useProtectedRoute({ 
    requiredRole: 'issuer', 
    redirectTo: '/login' 
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <PageTransition className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <IssuerDashboard />
        </div>
      </PageTransition>
      
      <Footer />
    </div>
  );
};

export default IssuerPortal;
