
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <GlassmorphicCard 
          className="h-full flex flex-col items-center justify-center p-8 cursor-pointer border-blue-500/20" 
          onClick={() => onSelectRole('issuer')}
          withHover
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center mb-6"
          >
            <User className="w-10 h-10 text-blue-500" />
          </motion.div>
          <h3 className="text-xl font-medium mb-3">I am a Citizen</h3>
          <p className="text-muted-foreground text-center mb-6">
            Report issues in your area, track progress, and receive updates on resolutions
          </p>
          <Button
            className="mt-auto w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => onSelectRole('issuer')}
          >
            Continue as Citizen
          </Button>
        </GlassmorphicCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <GlassmorphicCard 
          className="h-full flex flex-col items-center justify-center p-8 cursor-pointer border-green-500/20" 
          onClick={() => onSelectRole('officer')}
          withHover
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-green-600/10 flex items-center justify-center mb-6"
          >
            <Shield className="w-10 h-10 text-green-500" />
          </motion.div>
          <h3 className="text-xl font-medium mb-3">I am an Officer</h3>
          <p className="text-muted-foreground text-center mb-6">
            Manage reported issues, assign tasks, and track resolution progress in your zone
          </p>
          <Button
            className="mt-auto w-full bg-green-600 hover:bg-green-700"
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
