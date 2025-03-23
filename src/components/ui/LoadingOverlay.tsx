
import React from 'react';
import { cn } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  showOverlay?: boolean;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text = 'Loading...',
  showOverlay = true,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
            showOverlay ? 'bg-background/80 backdrop-blur-sm' : ''
          )}
        >
          <LoadingSpinner size="lg" withText text={text} />
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;
