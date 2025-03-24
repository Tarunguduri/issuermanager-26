import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';

// Replace with a valid Mapbox public token 
// This is a valid public token that should work for basic map display
const MAPBOX_TOKEN = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw";

mapboxgl.accessToken = MAPBOX_TOKEN;

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialLocation 
}) => {
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  
  const { toast } = useToast();

  // Initialize map with improved error handling
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      console.log("Initializing map with token:", MAPBOX_TOKEN);
      
      const initialCoordinates = initialLocation 
        ? [initialLocation.lng, initialLocation.lat] 
        : [78.9629, 20.5937]; // Default to center of India
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Updated to a more recent style version
        center: initialCoordinates as [number, number],
        zoom: initialLocation ? 14 : 5,
        attributionControl: true,
        maxBounds: [
          [68.1, 6.5], // Southwest coordinates
          [97.4, 35.5]  // Northeast coordinates
        ]
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      // Add initial marker if location is provided
      if (initialLocation) {
        marker.current = new mapboxgl.Marker({ draggable: true, color: "#1E40AF" })
          .setLngLat([initialLocation.lng, initialLocation.lat])
          .addTo(map.current);
          
        // Get address for the initial location
        reverseGeocode(initialLocation.lat, initialLocation.lng);
      }

      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        setMapError(null);
      });

      map.current.on('error', (e) => {
        console.error("Map error:", e);
        setMapError("Failed to load map resources. Please check your connection or try again later.");
        toast({
          title: 'Map Error',
          description: 'There was an issue loading the map. Please try again later.',
          variant: 'destructive'
        });
      });

      
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        console.log("Map clicked at:", lat, lng);
        
        // Update or create marker
        if (!marker.current) {
          marker.current = new mapboxgl.Marker({ draggable: true, color: "#1E40AF" })
            .setLngLat([lng, lat])
            .addTo(map.current!);
          
          // Add dragend event only once when marker is created
          marker.current.on('dragend', () => {
            const position = marker.current!.getLngLat();
            reverseGeocode(position.lat, position.lng);
          });
        } else {
          marker.current.setLngLat([lng, lat]);
        }
        
        reverseGeocode(lat, lng);
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize the map. Please reload the page or try again later.");
      toast({
        title: 'Map Error',
        description: 'Could not initialize the map. Please check your connection.',
        variant: 'destructive'
      });
    }
  }, [initialLocation]);

  // Function to get address from coordinates with better error handling
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setMapError(null);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Geocoding response:", data);
      
      if (data && data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        
        setSelectedLocation({
          lat,
          lng,
          address
        });
        
        onLocationSelect({
          lat,
          lng,
          address
        });
      } else {
        toast({
          title: 'Address Not Found',
          description: 'Could not find address information for this location.',
          variant: 'default'
        });
        
        setSelectedLocation({
          lat,
          lng,
          address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
        
        onLocationSelect({
          lat,
          lng,
          address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      toast({
        title: 'Geocoding Error',
        description: 'Could not retrieve address for the selected location',
        variant: 'destructive'
      });
      
      // Still set location with coordinates only
      setSelectedLocation({
        lat,
        lng,
        address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });
      
      onLocationSelect({
        lat,
        lng,
        address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });
    }
  };

  
  const getCurrentLocation = () => {
    setIsLocating(true);
    setMapError(null);
    
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive'
      });
      setIsLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        console.log("Got current location:", lat, lng);
        
        // Update map view
        if (map.current) {
          map.current.flyTo({
            center: [lng, lat],
            zoom: 15
          });
        
          // Update or create marker
          if (!marker.current) {
            marker.current = new mapboxgl.Marker({ draggable: true, color: "#1E40AF" })
              .setLngLat([lng, lat])
              .addTo(map.current);
            
            // Add dragend event only once when marker is created
            marker.current.on('dragend', () => {
              const position = marker.current!.getLngLat();
              reverseGeocode(position.lat, position.lng);
            });
          } else {
            marker.current.setLngLat([lng, lat]);
          }
          
          reverseGeocode(lat, lng);
        }
        
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
        
        let errorMessage = 'Could not determine your location';
        if (error.code === 1) {
          errorMessage = 'Location access was denied. Please enable location services.';
        }
        
        toast({
          title: 'Location Error',
          description: errorMessage,
          variant: 'destructive'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-4">
      <div
        ref={mapContainer}
        className={`w-full h-[400px] rounded-md border border-input overflow-hidden relative ${mapError ? 'bg-muted' : ''}`}
        aria-label="Map for location selection"
      >
        {mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-muted/80 backdrop-blur-sm">
            <MapPin className="w-8 h-8 text-destructive mb-2" />
            <p className="text-destructive font-medium">{mapError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                if (map.current) {
                  map.current.remove();
                  map.current = null;
                }
                setMapError(null);
                
                // Re-trigger the useEffect to reinitialize the map
                const container = mapContainer.current;
                if (container) {
                  // Force re-render of the container
                  const parent = container.parentNode;
                  if (parent) {
                    parent.removeChild(container);
                    setTimeout(() => {
                      if (parent) parent.appendChild(container);
                    }, 100);
                  }
                }
              }}
            >
              Retry Loading Map
            </Button>
          </div>
        )}
      </div>
      
      
      <div className="flex items-center justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={getCurrentLocation}
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
      
      {selectedLocation && (
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm font-medium">Selected Location:</p>
          <p className="text-sm text-muted-foreground mt-1">{selectedLocation.address}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
