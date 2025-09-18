import React, { useRef, useEffect, useState } from 'react';

interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color?: string;
}

interface MapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  mapHeight?: string;
  style?: React.CSSProperties;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = { lat: 3.1390, lng: 101.6869 }, // Default to Kuala Lumpur
  zoom = 12,
  markers = [],
  onMapClick,
  onMarkerClick,
  mapHeight = '400px',
  style = {}
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const markerInstances = useRef<google.maps.Marker[]>([]);

  // Load Google Maps script dynamically
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        setIsGoogleLoaded(true);
        return;
      }

      // Check if script is already being loaded
      if (isLoadingScript) return;
      
      // Check if script already exists
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Script exists but not loaded yet, wait for it
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            setIsGoogleLoaded(true);
            clearInterval(checkInterval);
          }
        }, 100);
        return;
      }

      setIsLoadingScript(true);
      setScriptError(null);

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        setScriptError('Google Maps API key not configured');
        setIsLoadingScript(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsGoogleLoaded(true);
        setIsLoadingScript(false);
      };
      
      script.onerror = () => {
        setScriptError('Failed to load Google Maps API');
        setIsLoadingScript(false);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  // Initialize map when Google is loaded and ref is available
  useEffect(() => {
    if (mapRef.current && !map && isGoogleLoaded) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      
      setMap(googleMap);

      // Add map click listener
      if (onMapClick) {
        googleMap.addListener('click', (mapsMouseEvent: google.maps.MapMouseEvent) => {
          if (mapsMouseEvent.latLng) {
            onMapClick(mapsMouseEvent.latLng.lat(), mapsMouseEvent.latLng.lng());
          }
        });
      }
    }
  }, [mapRef, map, isGoogleLoaded, center, zoom, onMapClick]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (map && isGoogleLoaded) {
      // Clear existing markers
      markerInstances.current.forEach(marker => marker.setMap(null));
      markerInstances.current = [];

      // Add new markers
      markers.forEach(markerData => {
        const marker = new window.google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map,
          title: markerData.name,
          icon: markerData.color ? {
            url: `data:image/svg+xml,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${markerData.color}" width="24" height="24">
                <path d="M12 0c-6.627 0-12 5.373-12 12 0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12z"/>
              </svg>
            `)}`,
            scaledSize: new window.google.maps.Size(20, 20)
          } : undefined
        });

        // Add info window for marker details
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold; color: #1f2937;">${markerData.name}</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">Click marker to edit location</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          // Close other info windows
          // Open this info window
          infoWindow.open(map, marker);
          
          if (onMarkerClick) {
            onMarkerClick(markerData);
          }
        });
        
        markerInstances.current.push(marker);
      });

      // Auto-fit map to show all markers
      if (markers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach(marker => {
          bounds.extend({ lat: marker.lat, lng: marker.lng });
        });
        map.fitBounds(bounds);
        
        // Ensure minimum zoom level
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom()! > 15) map.setZoom(15);
          window.google.maps.event.removeListener(listener);
        });
      }
    }
  }, [map, markers, onMarkerClick, isGoogleLoaded]);

  if (scriptError) {
    return (
      <div 
        className="bg-red-50 border border-red-200 rounded-lg flex items-center justify-center border"
        style={{ height: mapHeight, ...style }}
      >
        <div className="text-center p-4">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-red-800 text-sm font-medium mb-1">Google Maps Error</p>
          <p className="text-red-700 text-xs">{scriptError}</p>
          <p className="text-red-600 text-xs mt-2">
            Please configure VITE_GOOGLE_MAPS_API_KEY in your .env file
          </p>
        </div>
      </div>
    );
  }

  if (!isGoogleLoaded || isLoadingScript) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center border"
        style={{ height: mapHeight, ...style }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">
            {isLoadingScript ? 'Loading Google Maps...' : 'Initializing map...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{ height: mapHeight, width: '100%', ...style }} 
      className="rounded-lg border border-gray-300"
    />
  );
};

export default MapComponent;