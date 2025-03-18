
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: 'light' | 'medium' | 'strong';
  children: React.ReactNode;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ 
  intensity = 'medium', 
  className, 
  children, 
  ...props 
}) => {
  const intensityClasses = {
    light: 'bg-background/40 backdrop-blur-sm border-border/30',
    medium: 'bg-background/60 backdrop-blur-md border-border/40',
    strong: 'bg-background/80 backdrop-blur-lg border-border/50'
  };

  return (
    <div 
      className={cn(
        'rounded-lg border shadow-sm transition-all duration-300',
        intensityClasses[intensity],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;
