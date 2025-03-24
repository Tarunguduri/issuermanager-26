
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/hooks/use-toast';

// Replace with your Mapbox public token - using a valid public token
const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1lbmRwb2ludCIsImEiOiJjbHEycGI3a3YwajVwMmpxdGplaXUweWh6In0.U4Vdz_YWb8C9s_L8_5pnjw";

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
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    
    try {
      const initialCoordinates = initialLocation 
        ? [initialLocation.lng, initialLocation.lat] 
        : [78.9629, 20.5937]; // Default to center of India
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11', // Using streets style for better visibility
        center: initialCoordinates as [number, number],
        zoom: initialLocation ? 14 : 5,
        attributionControl: true // Show attribution
      });

      console.log("Map initialized with token:", MAPBOX_TOKEN);

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
      });

      map.current.on('error', (e) => {
        console.error("Map error:", e);
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
        map.current?.remove();
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: 'Map Error',
        description: 'Could not initialize the map. Please check your connection.',
        variant: 'destructive'
      });
    }
  }, [initialLocation]);

  // Function to get address from coordinates (reverse geocoding)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      
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
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      toast({
        title: 'Geocoding Error',
        description: 'Could not retrieve address for the selected location',
        variant: 'destructive'
      });
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLocating(true);
    
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
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 15
        });
        
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
        className="w-full h-[400px] rounded-md border border-input overflow-hidden"
        aria-label="Map for location selection"
      />
      
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
