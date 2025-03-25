
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Google Maps API key - replace with your actual key
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialLocation 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  
  const { toast } = useToast();

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      // API already loaded
      initializeMap();
      return;
    }

    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    
    googleMapsScript.onload = () => {
      console.log("Google Maps API loaded");
      initializeMap();
    };
    
    googleMapsScript.onerror = () => {
      console.error("Google Maps API failed to load");
      setMapError("Failed to load Google Maps. Please check your connection or try again later.");
      toast({
        title: 'Map Error',
        description: 'There was an issue loading the map. Please try again later.',
        variant: 'destructive'
      });
    };
    
    document.head.appendChild(googleMapsScript);
    
    return () => {
      // Cleanup if component unmounts before script loads
      googleMapsScript.onload = null;
      googleMapsScript.onerror = null;
    };
  }, []);
  
  // Initialize map once Google Maps API is loaded
  const initializeMap = () => {
    if (!mapContainer.current || !window.google || !window.google.maps) return;
    
    try {
      console.log("Initializing Google Map");
      
      const initialCoordinates = initialLocation 
        ? { lat: initialLocation.lat, lng: initialLocation.lng } 
        : { lat: 20.5937, lng: 78.9629 }; // Default to center of India
      
      // Create map instance
      map.current = new google.maps.Map(mapContainer.current, {
        center: initialCoordinates,
        zoom: initialLocation ? 14 : 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
        restriction: {
          latLngBounds: {
            north: 35.5,
            south: 6.5,
            west: 68.1,
            east: 97.4,
          },
          strictBounds: true,
        }
      });
      
      // Create geocoder instance
      geocoder.current = new google.maps.Geocoder();
      
      // Add initial marker if location is provided
      if (initialLocation) {
        marker.current = new google.maps.Marker({
          position: { lat: initialLocation.lat, lng: initialLocation.lng },
          map: map.current,
          draggable: true,
          animation: google.maps.Animation.DROP
        });
        
        // Get address for the initial location
        reverseGeocode(initialLocation.lat, initialLocation.lng);
        
        // Set up marker drag event
        google.maps.event.addListener(marker.current, 'dragend', function() {
          if (marker.current) {
            const position = marker.current.getPosition();
            if (position) {
              reverseGeocode(position.lat(), position.lng());
            }
          }
        });
      }
      
      // Add click event to map
      google.maps.event.addListener(map.current, 'click', function(event) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        console.log("Map clicked at:", lat, lng);
        
        // Update or create marker
        if (!marker.current) {
          marker.current = new google.maps.Marker({
            position: { lat, lng },
            map: map.current,
            draggable: true,
            animation: google.maps.Animation.DROP
          });
          
          // Set up marker drag event
          google.maps.event.addListener(marker.current, 'dragend', function() {
            if (marker.current) {
              const position = marker.current.getPosition();
              if (position) {
                reverseGeocode(position.lat(), position.lng());
              }
            }
          });
        } else {
          marker.current.setPosition({ lat, lng });
        }
        
        reverseGeocode(lat, lng);
      });
      
      setMapLoaded(true);
      setMapError(null);
      
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize the map. Please reload the page or try again later.");
      toast({
        title: 'Map Error',
        description: 'Could not initialize the map. Please check your connection.',
        variant: 'destructive'
      });
    }
  };

  // Function to get address from coordinates with better error handling
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoder.current) {
      console.error("Geocoder not initialized");
      return;
    }
    
    try {
      setMapError(null);
      
      geocoder.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          
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
          console.error("Geocoding failed:", status);
          
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
      });
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
          map.current.setCenter({ lat, lng });
          map.current.setZoom(15);
        
          // Update or create marker
          if (!marker.current) {
            marker.current = new google.maps.Marker({
              position: { lat, lng },
              map: map.current,
              draggable: true,
              animation: google.maps.Animation.DROP
            });
            
            // Set up marker drag event
            google.maps.event.addListener(marker.current, 'dragend', function() {
              if (marker.current) {
                const position = marker.current.getPosition();
                if (position) {
                  reverseGeocode(position.lat(), position.lng());
                }
              }
            });
          } else {
            marker.current.setPosition({ lat, lng });
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
                setMapError(null);
                initializeMap();
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
