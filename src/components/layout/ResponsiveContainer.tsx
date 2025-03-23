
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
  as?: React.ElementType;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  fluid = false,
  as: Component = 'div',
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Component
      className={cn(
        'mx-auto w-full px-4',
        fluid ? 'max-w-full' : 'max-w-7xl',
        isMobile ? 'px-4 py-4' : 'px-6 py-6',
        className
      )}
    >
      {children}
    </Component>
  );
};

export default ResponsiveContainer;
