
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import GlassmorphicCard from '@/components/ui/GlassmorphicCard';
import { User, Shield } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'issuer' | 'officer') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <GlassmorphicCard className="h-full flex flex-col items-center justify-center p-8 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => onSelectRole('issuer')}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <User className="w-10 h-10 text-primary" />
          </motion.div>
          <h3 className="text-xl font-medium mb-3">I am an Issuer</h3>
          <p className="text-muted-foreground text-center mb-6">
            Report issues, track progress, and receive updates on resolutions
          </p>
          <Button
            className="mt-auto w-full"
            onClick={() => onSelectRole('issuer')}
          >
            Continue as Issuer
          </Button>
        </GlassmorphicCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <GlassmorphicCard className="h-full flex flex-col items-center justify-center p-8 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => onSelectRole('officer')}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <Shield className="w-10 h-10 text-primary" />
          </motion.div>
          <h3 className="text-xl font-medium mb-3">I am an Officer</h3>
          <p className="text-muted-foreground text-center mb-6">
            Manage reported issues, assign tasks, and track resolution progress
          </p>
          <Button
            className="mt-auto w-full"
            onClick={() => onSelectRole('officer')}
          >
            Continue as Officer
          </Button>
        </GlassmorphicCard>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
