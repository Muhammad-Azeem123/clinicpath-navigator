import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Graph } from 'graphlib';
import { MapData, MapFloor, MapLocation } from '@/hooks/useMapData';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface LeafletMapProps {
  mapData: MapData | null;
  selectedFloor?: string;
  onFloorChange?: (floorId: string) => void;
  onLocationSelect?: (location: MapLocation) => void;
}

export const LeafletMap = ({ 
  mapData, 
  selectedFloor, 
  onFloorChange, 
  onLocationSelect 
}: LeafletMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const pathRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const [currentFloor, setCurrentFloor] = useState<MapFloor | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Create map with custom CRS for indoor mapping
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 3,
      zoomControl: false,
    });

    // Set initial view
    const bounds = L.latLngBounds([0, 0], [600, 800]);
    map.fitBounds(bounds);
    map.setMaxBounds(bounds);

    // Add tile layer (simple grid for indoor maps)
    L.tileLayer('data:image/svg+xml;base64,' + btoa(`
      <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="hsl(var(--muted-foreground))" stroke-width="0.5" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="hsl(var(--background))"/>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
    `), {
      attribution: 'Indoor Map'
    }).addTo(map);

    leafletMapRef.current = map;
    markersRef.current.addTo(map);
    pathRef.current.addTo(map);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update map when data or floor changes
  useEffect(() => {
    if (!mapData || !leafletMapRef.current) return;

    const floorId = selectedFloor || mapData.floors[0]?.id;
    const floor = mapData.floors.find(f => f.id === floorId);
    
    if (!floor) return;

    setCurrentFloor(floor);
    renderFloor(floor);
  }, [mapData, selectedFloor]);

  const renderFloor = (floor: MapFloor) => {
    if (!leafletMapRef.current) return;

    // Clear existing markers and paths
    markersRef.current.clearLayers();
    pathRef.current.clearLayers();

    // Add location markers
    floor.locations.forEach(location => {
      const marker = createLocationMarker(location);
      markersRef.current.addLayer(marker);
    });

    // Add connections as lines
    floor.connections.forEach(connection => {
      const fromLoc = floor.locations.find(l => l.id === connection.from);
      const toLoc = floor.locations.find(l => l.id === connection.to);
      
      if (fromLoc && toLoc) {
        const polyline = L.polyline([
          [fromLoc.y, fromLoc.x],
          [toLoc.y, toLoc.x]
        ], {
          color: 'hsl(var(--primary))',
          weight: 2,
          opacity: 0.6,
          dashArray: '5, 5'
        });
        pathRef.current.addLayer(polyline);
      }
    });
  };

  const createLocationMarker = (location: MapLocation) => {
    const icon = getLocationIcon(location.type);
    
    const marker = L.marker([location.y, location.x], { icon })
      .bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold">${location.name}</h3>
          ${location.room ? `<p class="text-sm text-muted-foreground">Room: ${location.room}</p>` : ''}
          <p class="text-sm text-muted-foreground">Type: ${location.type || 'General'}</p>
        </div>
      `)
      .on('click', () => {
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

    const emoji = iconMap[type || 'room'] || '📍';
    
    return L.divIcon({
      html: `<div style="
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
      ">${emoji}</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const findPath = (fromId: string, toId: string): MapLocation[] => {
    if (!currentFloor) return [];

    // Create graph using graphlib
    const graph = new Graph({ directed: false });
    
    // Add nodes
    currentFloor.locations.forEach(loc => {
      graph.setNode(loc.id, loc);
    });
    
    // Add edges
    currentFloor.connections.forEach(conn => {
      graph.setEdge(conn.from, conn.to, conn.distance || 1);
    });

    // Simple pathfinding (in a real implementation, you'd use A* or Dijkstra)
    // This is a basic BFS for demonstration
    const queue = [[fromId]];
    const visited = new Set([fromId]);
    
    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      
      if (current === toId) {
        return path.map(id => currentFloor.locations.find(l => l.id === id)!).filter(Boolean);
      }
      
      const neighbors = graph.neighbors(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    
    return [];
  };

  const showPath = (fromId: string, toId: string) => {
    const path = findPath(fromId, toId);
    if (path.length < 2) return;

    // Clear existing paths
    pathRef.current.clearLayers();
    
    // Draw path
    const pathCoords = path.map(loc => [loc.y, loc.x] as L.LatLngTuple);
    const polyline = L.polyline(pathCoords, {
      color: 'hsl(var(--destructive))',
      weight: 4,
      opacity: 0.8
    });
    pathRef.current.addLayer(polyline);

    // Add markers for start and end
    if (path[0]) {
      const startMarker = L.marker([path[0].y, path[0].x], {
        icon: L.divIcon({
          html: '<div style="background: green; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold;">S</div>',
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
      });
      pathRef.current.addLayer(startMarker);
    }

    if (path[path.length - 1]) {
      const endMarker = L.marker([path[path.length - 1].y, path[path.length - 1].x], {
        icon: L.divIcon({
          html: '<div style="background: red; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold;">E</div>',
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
      });
      pathRef.current.addLayer(endMarker);
    }
  };

  const zoomIn = () => leafletMapRef.current?.zoomIn();
  const zoomOut = () => leafletMapRef.current?.zoomOut();
  const resetView = () => {
    if (leafletMapRef.current) {
      const bounds = L.latLngBounds([0, 0], [600, 800]);
      leafletMapRef.current.fitBounds(bounds);
    }
  };

  return (
    <div className="relative w-full h-96 border rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      
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
};