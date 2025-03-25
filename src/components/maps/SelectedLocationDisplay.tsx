
import React from 'react';
import { MapPin } from 'lucide-react';
import { LocationData } from './map-types';

interface SelectedLocationDisplayProps {
  location: LocationData | null;
}

const SelectedLocationDisplay: React.FC<SelectedLocationDisplayProps> = ({ location }) => {
  if (!location) return null;
  
  return (
    <div className="p-4 bg-muted rounded-md">
      <p className="text-sm font-medium">Selected Location:</p>
      <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
      <p className="text-xs text-muted-foreground mt-1">
        Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
      </p>
    </div>
  );
};

export default SelectedLocationDisplay;
