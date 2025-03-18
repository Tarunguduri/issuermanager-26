
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        {theme === 'light' ? (
          <Moon className="absolute inset-0 h-full w-full transition-all" />
        ) : (
          <Sun className="absolute inset-0 h-full w-full transition-all" />
        )}
      </div>
      <motion.div
        className="absolute inset-0 rounded-full bg-secondary"
        initial={false}
        animate={{ scale: theme === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{ originX: 0.5, originY: 0.5 }}
      />
    </Button>
  );
};

export default ThemeToggle;
