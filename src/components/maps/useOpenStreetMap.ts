
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
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Initialize map
  const initializeMap = () => {
    if (!containerRef.current) return;
    
    try {
      console.log("Initializing OpenStreetMap");
      
      const initialCoordinates = initialLocation 
        ? [initialLocation.lat, initialLocation.lng] 
        : [20.5937, 78.9629]; // Default to center of India
      
      // Create map instance
      map.current = L.map(containerRef.current).setView(
        initialCoordinates as [number, number], 
        initialLocation ? 14 : 5
      );
      
      // Add OSM tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);
      
      // Add initial marker if location is provided
      if (initialLocation) {
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
      }
      
      // Add click event to map
      map.current.on('click', function(event) {
        const { lat, lng } = event.latlng;
        console.log("Map clicked at:", lat, lng);
        
        // Update or create marker
        if (!marker.current) {
          marker.current = L.marker([lat, lng], {
            draggable: true
          }).addTo(map.current!);
          
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
      });
      
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

  // Function to get address from coordinates (using Nominatim)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setMapError({ hasError: false, message: null });
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      
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
        
        toast({
          title: 'Address Not Found',
          description: 'Could not find address information for this location.',
          variant: 'default'
        });
        
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
      
      toast({
        title: 'Geocoding Error',
        description: 'Could not retrieve address for the selected location',
        variant: 'destructive'
      });
      
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
          }
          
          resolve(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          
          let errorMessage = 'Could not determine your location';
          if (error.code === 1) {
            errorMessage = 'Location access was denied. Please enable location services.';
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
