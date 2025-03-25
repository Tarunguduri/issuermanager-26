
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  // Use electric blue color for dark mode
  const darkModeActiveColor = "#1EAEDB"; // Electric blue

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className={`relative w-10 h-10 rounded-full ${
        theme === 'dark' ? 'hover:bg-blue-900/20' : ''
      }`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        color: theme === 'dark' ? darkModeActiveColor : undefined
      }}
    >
      <div className="relative w-6 h-6">
        {theme === 'light' ? (
          <Moon className="absolute inset-0 h-full w-full transition-all" />
        ) : (
          <Sun 
            className="absolute inset-0 h-full w-full transition-all" 
            style={{ color: darkModeActiveColor }} // Electric blue in dark mode
          />
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
