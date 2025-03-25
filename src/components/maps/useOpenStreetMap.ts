
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LocationCoordinates, LocationData, MapErrorState } from './map-types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface UseOpenStreetMapProps {
  containerRef: React.RefObject<HTMLDivElement>;
  initialLocation?: LocationCoordinates;
  onLocationSelect?: (location: LocationData) => void;
}

export const useOpenStreetMap = ({ 
  containerRef, 
  initialLocation, 
  onLocationSelect 
}: UseOpenStreetMapProps) => {
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<MapErrorState>({ 
    hasError: false, 
    message: null 
  });
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  
  const { toast } = useToast();

  // Initialize map when component mounts
  useEffect(() => {
    // Fix Leaflet icon issue
    const fixLeafletIcon = () => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });
    };

    fixLeafletIcon();
    
    // Only initialize if not already loaded
    if (!mapLoaded) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Initialize map with error handling
  const initializeMap = () => {
    if (!containerRef.current) {
      console.log("Map container not available yet");
      return;
    }
    
    try {
      console.log("Initializing OpenStreetMap");
      
      // Ensure Leaflet is available
      if (!L || !L.map) {
        throw new Error("Leaflet library not available");
      }
      
      const initialCoordinates = initialLocation 
        ? [initialLocation.lat, initialLocation.lng] 
        : [20.5937, 78.9629]; // Default to center of India
      
      // Create map instance
      map.current = L.map(containerRef.current).setView(
        initialCoordinates as [number, number], 
        initialLocation ? 14 : 5
      );
      
      // Add OSM tile layer with error handling
      try {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map.current);
      } catch (tileError) {
        console.error("Error adding tile layer:", tileError);
        throw new Error("Failed to load map tiles");
      }
      
      // Add initial marker if location is provided
      if (initialLocation) {
        try {
          marker.current = L.marker([initialLocation.lat, initialLocation.lng], {
            draggable: true
          }).addTo(map.current);
          
          // Get address for the initial location
          reverseGeocode(initialLocation.lat, initialLocation.lng);
          
          // Set up marker drag event
          marker.current.on('dragend', function() {
            if (marker.current) {
              const position = marker.current.getLatLng();
              reverseGeocode(position.lat, position.lng);
            }
          });
        } catch (markerError) {
          console.error("Error adding marker:", markerError);
          // Continue without marker rather than failing completely
        }
      }
      
      // Add click event to map with error handling
      try {
        map.current.on('click', function(event) {
          const { lat, lng } = event.latlng;
          console.log("Map clicked at:", lat, lng);
          
          // Update or create marker
          if (!marker.current && map.current) {
            marker.current = L.marker([lat, lng], {
              draggable: true
            }).addTo(map.current);
            
            // Set up marker drag event
            marker.current.on('dragend', function() {
              if (marker.current) {
                const position = marker.current.getLatLng();
                reverseGeocode(position.lat, position.lng);
              }
            });
          } else if (marker.current) {
            marker.current.setLatLng([lat, lng]);
          }
          
          reverseGeocode(lat, lng);
        });
      } catch (eventError) {
        console.error("Error setting up map events:", eventError);
        // Continue with limited functionality
      }
      
      setMapLoaded(true);
      setMapError({ hasError: false, message: null });
      
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError({
        hasError: true,
        message: "Failed to initialize the map. Please reload the page or try again later."
      });
      toast({
        title: 'Map Error',
        description: 'Could not initialize the map. Please check your connection.',
        variant: 'destructive'
      });
    }
  };

  // Function to get address from coordinates (using Nominatim) with better error handling
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setMapError({ hasError: false, message: null });
      
      // Rate-limiting protection (Nominatim has a 1 request per second limit)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { 
          headers: { 'Accept-Language': 'en' },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        const address = data.display_name;
        
        const locationData = {
          lat,
          lng,
          address
        };
        
        setSelectedLocation(locationData);
        
        if (onLocationSelect) {
          onLocationSelect(locationData);
        }
      } else {
        console.error("No address found");
        
        // Don't show error toast, just use coordinates
        const locationData = {
          lat,
          lng,
          address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };
        
        setSelectedLocation(locationData);
        
        if (onLocationSelect) {
          onLocationSelect(locationData);
        }
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      
      // Only show toast for non-abort errors
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        toast({
          title: 'Geocoding Error',
          description: 'Could not retrieve address for the selected location',
          variant: 'destructive'
        });
      }
      
      // Still set location with coordinates only
      const locationData = {
        lat,
        lng,
        address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
      
      setSelectedLocation(locationData);
      
      if (onLocationSelect) {
        onLocationSelect(locationData);
      }
    }
  };

  const getCurrentLocation = () => {
    setMapError({ hasError: false, message: null });
    
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive'
      });
      return Promise.resolve(false);
    }
    
    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          console.log("Got current location:", lat, lng);
          
          // Update map view
          if (map.current) {
            try {
              map.current.setView([lat, lng], 15);
            
              // Update or create marker
              if (!marker.current) {
                marker.current = L.marker([lat, lng], {
                  draggable: true
                }).addTo(map.current);
                
                // Set up marker drag event
                marker.current.on('dragend', function() {
                  if (marker.current) {
                    const position = marker.current.getLatLng();
                    reverseGeocode(position.lat, position.lng);
                  }
                });
              } else {
                marker.current.setLatLng([lat, lng]);
              }
              
              reverseGeocode(lat, lng);
              resolve(true);
            } catch (error) {
              console.error("Error updating map with current location:", error);
              
              // Try to still get the address even if map update fails
              reverseGeocode(lat, lng);
              resolve(false);
            }
          } else {
            // If map isn't initialized, still try to get address
            reverseGeocode(lat, lng);
            resolve(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          
          let errorMessage = 'Could not determine your location';
          if (error.code === 1) {
            errorMessage = 'Location access was denied. Please enable location services.';
          } else if (error.code === 2) {
            errorMessage = 'Location information is unavailable.';
          } else if (error.code === 3) {
            errorMessage = 'The request to get location timed out.';
          }
          
          toast({
            title: 'Location Error',
            description: errorMessage,
            variant: 'destructive'
          });
          
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const retryInitMap = () => {
    setMapError({ hasError: false, message: null });
    setMapLoaded(false);
    initializeMap();
  };

  return {
    mapLoaded,
    mapError,
    selectedLocation,
    getCurrentLocation,
    retryInitMap
  };
};
