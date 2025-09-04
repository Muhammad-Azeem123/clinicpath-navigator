import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapData, MapFloor, MapLocation } from '@/hooks/useMapData';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MapboxMapProps {
  mapData: MapData | null;
  selectedFloor?: string;
  onFloorChange?: (floorId: string) => void;
  onLocationSelect?: (location: MapLocation) => void;
}

export interface MapboxMapRef {
  showPath: (fromId: string, toId: string) => void;
  clearPath: () => void;
}

export const MapboxMap = forwardRef<MapboxMapRef, MapboxMapProps>(({ 
  mapData, 
  selectedFloor, 
  onFloorChange, 
  onLocationSelect 
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [currentFloor, setCurrentFloor] = useState<MapFloor | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  // Get Mapbox token from Edge Function
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };
    
    getMapboxToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 0],
      zoom: 15,
      pitch: 0,
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapboxToken]);

  // Update map when data or floor changes
  useEffect(() => {
    if (!mapData || !mapRef.current) return;

    const floorId = selectedFloor || mapData.floors[0]?.id;
    const floor = mapData.floors.find(f => f.id === floorId);
    
    if (!floor) return;

    setCurrentFloor(floor);
    renderFloor(floor);
  }, [mapData, selectedFloor]);

  const renderFloor = (floor: MapFloor) => {
    if (!mapRef.current) return;

    // Clear existing markers
    clearMarkers();

    // Add location markers
    floor.locations.forEach(location => {
      const marker = createLocationMarker(location);
      markersRef.current.push(marker);
    });

    // Add connections as lines (GeoJSON)
    const connectionFeatures = floor.connections.map(connection => {
      const fromLoc = floor.locations.find(l => l.id === connection.from);
      const toLoc = floor.locations.find(l => l.id === connection.to);
      
      if (fromLoc && toLoc) {
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [fromLoc.x / 1000, fromLoc.y / 1000], // Convert to approximate lat/lng
              [toLoc.x / 1000, toLoc.y / 1000]
            ]
          },
          properties: {
            id: `${connection.from}-${connection.to}`
          }
        };
      }
      return null;
    }).filter(Boolean);

    // Add connections source and layer
    if (mapRef.current.getSource('connections')) {
      mapRef.current.removeLayer('connections');
      mapRef.current.removeSource('connections');
    }

    mapRef.current.addSource('connections', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: connectionFeatures
      }
    });

    mapRef.current.addLayer({
      id: 'connections',
      type: 'line',
      source: 'connections',
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-opacity': 0.6,
        'line-dasharray': [2, 2]
      }
    });

    // Fit map to locations
    if (floor.locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      floor.locations.forEach(loc => {
        bounds.extend([loc.x / 1000, loc.y / 1000]);
      });
      mapRef.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const createLocationMarker = (location: MapLocation) => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerHTML = `
      <div style="
        background: hsl(var(--primary));
        color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        cursor: pointer;
      ">${getLocationIcon(location.type)}</div>
    `;

    const marker = new mapboxgl.Marker(el)
      .setLngLat([location.x / 1000, location.y / 1000])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${location.name}</h3>
          ${location.room ? `<p class="text-sm text-muted-foreground">Room: ${location.room}</p>` : ''}
          <p class="text-sm text-muted-foreground">Type: ${location.type || 'General'}</p>
        </div>
      `))
      .addTo(mapRef.current!);

    el.addEventListener('click', () => {
      onLocationSelect?.(location);
    });

    return marker;
  };

  const getLocationIcon = (type?: string) => {
    const iconMap: Record<string, string> = {
      entrance: '🚪',
      reception: '🏥',
      emergency: '🚑',
      pharmacy: '💊',
      cafeteria: '🍽️',
      elevator: '🛗',
      stairs: '🪜',
      department: '🏢',
      room: '🛏️'
    };
    return iconMap[type || 'room'] || '📍';
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const showPath = (fromId: string, toId: string) => {
    if (!currentFloor || !mapRef.current) return;

    const fromLoc = currentFloor.locations.find(l => l.id === fromId);
    const toLoc = currentFloor.locations.find(l => l.id === toId);
    
    if (!fromLoc || !toLoc) return;

    // Simple direct path for demo (in real implementation, use pathfinding algorithm)
    const pathFeature = {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [
          [fromLoc.x / 1000, fromLoc.y / 1000],
          [toLoc.x / 1000, toLoc.y / 1000]
        ]
      },
      properties: { id: 'route-path' }
    };

    // Remove existing path
    if (mapRef.current.getSource('route-path')) {
      mapRef.current.removeLayer('route-path');
      mapRef.current.removeSource('route-path');
    }

    // Add new path
    mapRef.current.addSource('route-path', {
      type: 'geojson',
      data: pathFeature
    });

    mapRef.current.addLayer({
      id: 'route-path',
      type: 'line',
      source: 'route-path',
      paint: {
        'line-color': '#ef4444',
        'line-width': 4,
        'line-opacity': 0.9
      }
    });

    // Add start and end markers
    const startMarker = new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([fromLoc.x / 1000, fromLoc.y / 1000])
      .addTo(mapRef.current);
    
    const endMarker = new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([toLoc.x / 1000, toLoc.y / 1000])
      .addTo(mapRef.current);

    markersRef.current.push(startMarker, endMarker);
  };

  const clearPath = () => {
    if (!mapRef.current) return;
    
    // Remove path layer
    if (mapRef.current.getSource('route-path')) {
      mapRef.current.removeLayer('route-path');
      mapRef.current.removeSource('route-path');
    }
    
    // Re-render current floor
    if (currentFloor) {
      renderFloor(currentFloor);
    }
  };

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    showPath,
    clearPath
  }));

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const resetView = () => {
    if (currentFloor && mapRef.current) {
      renderFloor(currentFloor);
    }
  };

  if (!mapboxToken) {
    return (
      <div className="relative w-full h-96 border rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading Mapbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 border rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <Button size="sm" variant="outline" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={resetView}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Floor Selector */}
      {mapData && mapData.floors.length > 1 && (
        <div className="absolute bottom-2 left-2 flex gap-1">
          {mapData.floors.map(floor => (
            <Button
              key={floor.id}
              size="sm"
              variant={selectedFloor === floor.id ? "default" : "outline"}
              onClick={() => onFloorChange?.(floor.id)}
            >
              {floor.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
});