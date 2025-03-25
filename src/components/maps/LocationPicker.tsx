
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { LocationData, LocationCoordinates } from './map-types';
import { useGoogleMaps } from './useGoogleMaps';
import MapError from './MapError';
import SelectedLocationDisplay from './SelectedLocationDisplay';

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationCoordinates;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialLocation 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const { 
    mapError, 
    selectedLocation, 
    getCurrentLocation,
    retryInitMap
  } = useGoogleMaps({
    containerRef: mapContainer,
    initialLocation,
    onLocationSelect
  });

  const handleGetCurrentLocation = async () => {
    setIsLocating(true);
    try {
      await getCurrentLocation();
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        ref={mapContainer}
        className={`w-full h-[400px] rounded-md border border-input overflow-hidden relative ${mapError.hasError ? 'bg-muted' : ''}`}
        aria-label="Map for location selection"
      >
        <MapError error={mapError} onRetry={retryInitMap} />
      </div>
      
      <div className="flex items-center justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting location...
            </>
          ) : (
            <>
              <Navigation className="mr-2 h-4 w-4" />
              Use my current location
            </>
          )}
        </Button>
        
        {selectedLocation && (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              Location selected
            </span>
          </div>
        )}
      </div>
      
      {selectedLocation && <SelectedLocationDisplay location={selectedLocation} />}
    </div>
  );
};

export default LocationPicker;
