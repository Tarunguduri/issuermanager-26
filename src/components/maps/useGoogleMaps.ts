
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LocationCoordinates, LocationData, MapErrorState } from './map-types';

// Google Maps API key - replace with your actual key
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

interface UseGoogleMapsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  initialLocation?: LocationCoordinates;
  onLocationSelect?: (location: LocationData) => void;
}

export const useGoogleMaps = ({ 
  containerRef, 
  initialLocation, 
  onLocationSelect 
}: UseGoogleMapsProps) => {
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<MapErrorState>({ 
    hasError: false, 
    message: null 
  });
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  
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
      setMapError({
        hasError: true,
        message: "Failed to load Google Maps. Please check your connection or try again later."
      });
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
  }, [toast]);
  
  // Initialize map once Google Maps API is loaded
  const initializeMap = () => {
    if (!containerRef.current || !window.google || !window.google.maps) return;
    
    try {
      console.log("Initializing Google Map");
      
      const initialCoordinates = initialLocation 
        ? { lat: initialLocation.lat, lng: initialLocation.lng } 
        : { lat: 20.5937, lng: 78.9629 }; // Default to center of India
      
      // Create map instance
      map.current = new window.google.maps.Map(containerRef.current, {
        center: initialCoordinates,
        zoom: initialLocation ? 14 : 5,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
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
      geocoder.current = new window.google.maps.Geocoder();
      
      // Add initial marker if location is provided
      if (initialLocation) {
        marker.current = new window.google.maps.Marker({
          position: { lat: initialLocation.lat, lng: initialLocation.lng },
          map: map.current,
          draggable: true,
          animation: window.google.maps.Animation.DROP
        });
        
        // Get address for the initial location
        reverseGeocode(initialLocation.lat, initialLocation.lng);
        
        // Set up marker drag event
        window.google.maps.event.addListener(marker.current, 'dragend', function() {
          if (marker.current) {
            const position = marker.current.getPosition();
            if (position) {
              reverseGeocode(position.lat(), position.lng());
            }
          }
        });
      }
      
      // Add click event to map
      window.google.maps.event.addListener(map.current, 'click', function(event) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        console.log("Map clicked at:", lat, lng);
        
        // Update or create marker
        if (!marker.current) {
          marker.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: map.current,
            draggable: true,
            animation: window.google.maps.Animation.DROP
          });
          
          // Set up marker drag event
          window.google.maps.event.addListener(marker.current, 'dragend', function() {
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

  // Function to get address from coordinates with better error handling
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoder.current) {
      console.error("Geocoder not initialized");
      return;
    }
    
    try {
      setMapError({ hasError: false, message: null });
      
      geocoder.current.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          
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
          console.error("Geocoding failed:", status);
          
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
      });
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
      return false;
    }
    
    return new Promise<boolean>((resolve) => {
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
              marker.current = new window.google.maps.Marker({
                position: { lat, lng },
                map: map.current,
                draggable: true,
                animation: window.google.maps.Animation.DROP
              });
              
              // Set up marker drag event
              window.google.maps.event.addListener(marker.current, 'dragend', function() {
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
