
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withText?: boolean;
  text?: string;
  centered?: boolean;
}

const LoadingSpinner = ({
  size = 'md',
  className,
  withText = false,
  text = 'Loading...',
  centered = false,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const containerClasses = cn(
    'flex items-center gap-2',
    centered && 'justify-center',
    className
  );

  return (
    <div className={containerClasses}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {withText && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
