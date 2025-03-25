
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { MapErrorState } from './map-types';

interface MapErrorProps {
  error: MapErrorState;
  onRetry: () => void;
}

const MapError: React.FC<MapErrorProps> = ({ error, onRetry }) => {
  if (!error.hasError) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-muted/80 backdrop-blur-sm">
      <MapPin className="w-8 h-8 text-destructive mb-2" />
      <p className="text-destructive font-medium">{error.message}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={onRetry}
      >
        Retry Loading Map
      </Button>
    </div>
  );
};

export default MapError;
