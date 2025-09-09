import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapData, MapFloor, MapLocation } from '@/hooks/useMapData';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Navigation } from 'lucide-react';
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
        console.log('Attempting to fetch Mapbox token...');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        console.log('Mapbox token response:', { data, error });
        if (data?.token) {
          console.log('Setting Mapbox token:', data.token.substring(0, 10) + '...');
          setMapboxToken(data.token);
        } else if (error) {
          console.error('Error in token response:', error);
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

    // Add location markers with improved styling
    floor.locations.forEach(location => {
      const marker = createLocationMarker(location);
      markersRef.current.push(marker);
    });

    // Add connections as lines (GeoJSON) with improved styling
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
        'line-color': '#64748b',
        'line-width': 3,
        'line-opacity': 0.7,
        'line-dasharray': [3, 3]
      }
    });

    // Fit map to locations with better bounds
    if (floor.locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      floor.locations.forEach(loc => {
        bounds.extend([loc.x / 1000, loc.y / 1000]);
      });
      mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 18 });
    }
  };

  const createLocationMarker = (location: MapLocation) => {
    const el = document.createElement('div');
    el.className = 'marker';
    
    const iconEmoji = getLocationIcon(location.type);
    const isImportant = ['entrance', 'reception', 'emergency', 'elevator'].includes(location.type || '');
    
    el.innerHTML = `
      <div style="
        background: ${isImportant ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'};
        color: white;
        border-radius: 50%;
        width: ${isImportant ? '40px' : '32px'};
        height: ${isImportant ? '40px' : '32px'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isImportant ? '18px' : '14px'};
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
        transition: all 0.3s ease;
      " 
      onmouseover="this.style.transform='scale(1.1)'"
      onmouseout="this.style.transform='scale(1)'"
      >${iconEmoji}</div>
    `;

    const marker = new mapboxgl.Marker(el)
      .setLngLat([location.x / 1000, location.y / 1000])
      .setPopup(new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        className: 'custom-popup'
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2 text-foreground">${location.name}</h3>
          ${location.room ? `<p class="text-sm text-muted-foreground mb-1">Room: <span class="font-medium">${location.room}</span></p>` : ''}
          <p class="text-sm text-muted-foreground mb-3">Type: <span class="font-medium capitalize">${location.type || 'General'}</span></p>
          <div class="flex gap-2">
            <button onclick="navigator.clipboard.writeText('${location.name}')" 
              class="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition-colors">
              Copy Name
            </button>
          </div>
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

  const findOptimalPath = (fromId: string, toId: string): MapLocation[] => {
    if (!currentFloor) return [];

    // A* pathfinding implementation
    const locations = currentFloor.locations;
    const connections = currentFloor.connections;
    
    const graph = new Map<string, { id: string; cost: number }[]>();
    
    locations.forEach(loc => {
      graph.set(loc.id, []);
    });

    connections.forEach(conn => {
      const fromLoc = locations.find(l => l.id === conn.from);
      const toLoc = locations.find(l => l.id === conn.to);
      
      if (fromLoc && toLoc) {
        const distance = conn.distance || Math.sqrt(
          Math.pow(toLoc.x - fromLoc.x, 2) + Math.pow(toLoc.y - fromLoc.y, 2)
        );
        
        graph.get(conn.from)?.push({ id: conn.to, cost: distance });
        graph.get(conn.to)?.push({ id: conn.from, cost: distance });
      }
    });

    // A* algorithm
    const openSet = new Set<string>([fromId]);
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    locations.forEach(loc => {
      gScore.set(loc.id, Infinity);
      fScore.set(loc.id, Infinity);
    });

    gScore.set(fromId, 0);
    const startLoc = locations.find(l => l.id === fromId);
    const endLoc = locations.find(l => l.id === toId);
    
    if (!startLoc || !endLoc) return [];
    
    const heuristic = (loc1: MapLocation, loc2: MapLocation): number => {
      return Math.abs(loc2.x - loc1.x) + Math.abs(loc2.y - loc1.y);
    };
    
    fScore.set(fromId, heuristic(startLoc, endLoc));

    while (openSet.size > 0) {
      let current = '';
      let lowestF = Infinity;
      openSet.forEach(node => {
        const f = fScore.get(node) || Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = node;
        }
      });

      if (current === toId) {
        const path = [current];
        while (cameFrom.has(current)) {
          current = cameFrom.get(current)!;
          path.unshift(current);
        }
        return path.map(id => locations.find(l => l.id === id)!).filter(Boolean);
      }

      openSet.delete(current);
      const neighbors = graph.get(current) || [];

      neighbors.forEach(neighbor => {
        const tentativeGScore = (gScore.get(current) || Infinity) + neighbor.cost;
        
        if (tentativeGScore < (gScore.get(neighbor.id) || Infinity)) {
          cameFrom.set(neighbor.id, current);
          gScore.set(neighbor.id, tentativeGScore);
          
          const neighborLoc = locations.find(l => l.id === neighbor.id);
          if (neighborLoc) {
            fScore.set(neighbor.id, tentativeGScore + heuristic(neighborLoc, endLoc));
          }
          
          if (!openSet.has(neighbor.id)) {
            openSet.add(neighbor.id);
          }
        }
      });
    }

    return [];
  };

  const showPath = (fromId: string, toId: string) => {
    if (!currentFloor || !mapRef.current) return;

    // Use A* pathfinding to find optimal route
    const path = findOptimalPath(fromId, toId);
    
    if (path.length < 2) return;

    const pathCoordinates = path.map(loc => [loc.x / 1000, loc.y / 1000]);
    
    const pathFeature = {
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: pathCoordinates
      },
      properties: { id: 'route-path' }
    };

    // Remove existing path
    if (mapRef.current.getSource('route-path')) {
      mapRef.current.removeLayer('route-path');
      mapRef.current.removeSource('route-path');
    }

    // Add new path with improved styling
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
        'line-width': 6,
        'line-opacity': 0.8,
        'line-dasharray': [0, 2, 2]
      }
    });

    // Add enhanced start and end markers
    const startLoc = path[0];
    const endLoc = path[path.length - 1];
    
    const startEl = document.createElement('div');
    startEl.innerHTML = `
      <div style="
        background: #22c55e;
        color: white;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        font-size: 14px;
        animation: pulse 2s infinite;
      ">S</div>
    `;
    
    const endEl = document.createElement('div');
    endEl.innerHTML = `
      <div style="
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        font-size: 14px;
        animation: pulse 2s infinite;
      ">E</div>
    `;

    const startMarker = new mapboxgl.Marker(startEl)
      .setLngLat([startLoc.x / 1000, startLoc.y / 1000])
      .addTo(mapRef.current);
    
    const endMarker = new mapboxgl.Marker(endEl)
      .setLngLat([endLoc.x / 1000, endLoc.y / 1000])
      .addTo(mapRef.current);

    markersRef.current.push(startMarker, endMarker);

    // Fit map to path
    const bounds = new mapboxgl.LngLatBounds();
    pathCoordinates.forEach(coord => bounds.extend(coord as [number, number]));
    mapRef.current.fitBounds(bounds, { padding: 100, maxZoom: 17 });
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
      <div className="relative w-full h-96 border rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h3 className="font-semibold text-lg">Loading Interactive Map</h3>
            <p className="text-sm text-muted-foreground">Preparing your navigation experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 border rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Enhanced Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-lg">
        <Button size="sm" variant="outline" onClick={zoomIn} className="hover:scale-105 transition-transform">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={zoomOut} className="hover:scale-105 transition-transform">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={resetView} className="hover:scale-105 transition-transform">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Enhanced Floor Selector */}
      {mapData && mapData.floors.length > 1 && (
        <div className="absolute bottom-4 left-4 flex gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-lg">
          {mapData.floors.map(floor => (
            <Button
              key={floor.id}
              size="sm"
              variant={selectedFloor === floor.id ? "default" : "outline"}
              onClick={() => onFloorChange?.(floor.id)}
              className="hover:scale-105 transition-all duration-200"
            >
              {floor.name}
            </Button>
          ))}
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg max-w-xs">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          Map Legend
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span>🚪</span><span>Entrance</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🏥</span><span>Reception</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🚑</span><span>Emergency</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🛗</span><span>Elevator</span>
          </div>
        </div>
      </div>
    </div>
  );
});