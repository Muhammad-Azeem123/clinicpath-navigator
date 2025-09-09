import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapData, MapFloor, MapLocation } from '@/hooks/useMapData';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Navigation } from 'lucide-react';

interface LeafletMapProps {
  mapData: MapData | null;
  selectedFloor?: string;
  onFloorChange?: (floorId: string) => void;
  onLocationSelect?: (location: MapLocation) => void;
}

export interface LeafletMapRef {
  showPath: (fromId: string, toId: string) => void;
  clearPath: () => void;
}

export const LeafletMap = forwardRef<LeafletMapRef, LeafletMapProps>(({ 
  mapData, 
  selectedFloor, 
  onFloorChange, 
  onLocationSelect 
}, ref) => {
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
      minZoom: -1,
      maxZoom: 4,
      zoomControl: false,
    });

    // Set initial view
    const bounds = L.latLngBounds([0, 0], [600, 800]);
    map.fitBounds(bounds);
    map.setMaxBounds(bounds.pad(0.1));

    // Add enhanced tile layer with better styling
    L.tileLayer('data:image/svg+xml;base64,' + btoa(`
      <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220 13% 91%)" stroke-width="0.5" opacity="0.3"/>
          </pattern>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="hsl(220 13% 69%)" flood-opacity="0.2"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="hsl(0 0% 98%)"/>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>
    `), {
      attribution: '🏥 Interactive Hospital Map'
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

    // Add location markers with enhanced styling
    floor.locations.forEach(location => {
      const marker = createLocationMarker(location);
      markersRef.current.addLayer(marker);
    });

    // Add connections as enhanced lines
    floor.connections.forEach(connection => {
      const fromLoc = floor.locations.find(l => l.id === connection.from);
      const toLoc = floor.locations.find(l => l.id === connection.to);
      
      if (fromLoc && toLoc) {
        const polyline = L.polyline([
          [fromLoc.y, fromLoc.x],
          [toLoc.y, toLoc.x]
        ], {
          color: '#64748b',
          weight: 4,
          opacity: 0.6,
          dashArray: '8, 6',
          className: 'connection-line'
        });
        pathRef.current.addLayer(polyline);
      }
    });
  };

  const createLocationMarker = (location: MapLocation) => {
    const iconEmoji = getLocationIcon(location.type);
    const isImportant = ['entrance', 'reception', 'emergency', 'elevator'].includes(location.type || '');
    
    const icon = L.divIcon({
      html: `<div style="
        background: ${isImportant ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'};
        color: white;
        border-radius: 50%;
        width: ${isImportant ? '44px' : '36px'};
        height: ${isImportant ? '44px' : '36px'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isImportant ? '20px' : '16px'};
        border: 3px solid white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      " 
      onmouseover="this.style.transform='scale(1.15)'; this.style.zIndex='1000';"
      onmouseout="this.style.transform='scale(1)'; this.style.zIndex='auto';"
      >${iconEmoji}</div>`,
      className: '',
      iconSize: [isImportant ? 44 : 36, isImportant ? 44 : 36],
      iconAnchor: [isImportant ? 22 : 18, isImportant ? 22 : 18],
    });
    
    const marker = L.marker([location.y, location.x], { icon })
      .bindPopup(`
        <div class="p-4 min-w-[240px]">
          <h3 class="font-bold text-lg mb-2 text-foreground">${location.name}</h3>
          ${location.room ? `<p class="text-sm text-muted-foreground mb-1">Room: <span class="font-medium text-foreground">${location.room}</span></p>` : ''}
          <p class="text-sm text-muted-foreground mb-3">Type: <span class="font-medium text-foreground capitalize">${location.type || 'General'}</span></p>
          <div class="flex gap-2">
            <button onclick="navigator.clipboard.writeText('${location.name}')" 
              class="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:bg-primary/90 transition-colors font-medium">
              📋 Copy Name
            </button>
            <button onclick="this.closest('.leaflet-popup').style.display='none'" 
              class="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/90 transition-colors">
              Close
            </button>
          </div>
        </div>
      `, {
        maxWidth: 300,
        className: 'custom-popup'
      })
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

    return iconMap[type || 'room'] || '📍';
  };

  const calculateDistance = (loc1: MapLocation, loc2: MapLocation): number => {
    return Math.sqrt(Math.pow(loc2.x - loc1.x, 2) + Math.pow(loc2.y - loc1.y, 2));
  };

  const findPath = (fromId: string, toId: string): MapLocation[] => {
    if (!currentFloor) return [];

    // Use A* pathfinding for optimal path finding
    const mapConnections = currentFloor.connections.map(conn => ({
      from: conn.from,
      to: conn.to,
      distance: conn.distance
    }));

    const pathfinder = new (class {
      findPath(locations: MapLocation[], connections: any[], startId: string, endId: string): MapLocation[] {
        const graph = new Map<string, { id: string; cost: number }[]>();
        
        locations.forEach(loc => {
          graph.set(loc.id, []);
        });

        connections.forEach(conn => {
          const fromLoc = locations.find(l => l.id === conn.from);
          const toLoc = locations.find(l => l.id === conn.to);
          
          if (fromLoc && toLoc) {
            const distance = conn.distance || calculateDistance(fromLoc, toLoc);
            
            graph.get(conn.from)?.push({ id: conn.to, cost: distance });
            graph.get(conn.to)?.push({ id: conn.from, cost: distance });
          }
        });

        return this.aStar(locations, graph, startId, endId);
      }

      private aStar(locations: MapLocation[], graph: Map<string, { id: string; cost: number }[]>, startId: string, endId: string): MapLocation[] {
        const openSet = new Set<string>([startId]);
        const cameFrom = new Map<string, string>();
        const gScore = new Map<string, number>();
        const fScore = new Map<string, number>();

        locations.forEach(loc => {
          gScore.set(loc.id, Infinity);
          fScore.set(loc.id, Infinity);
        });

        gScore.set(startId, 0);
        const startLoc = locations.find(l => l.id === startId);
        const endLoc = locations.find(l => l.id === endId);
        
        if (!startLoc || !endLoc) return [];
        
        fScore.set(startId, this.heuristic(startLoc, endLoc));

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

          if (current === endId) {
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
                fScore.set(neighbor.id, tentativeGScore + this.heuristic(neighborLoc, endLoc));
              }
              
              if (!openSet.has(neighbor.id)) {
                openSet.add(neighbor.id);
              }
            }
          });
        }

        return [];
      }

      private heuristic(loc1: MapLocation, loc2: MapLocation): number {
        return Math.abs(loc2.x - loc1.x) + Math.abs(loc2.y - loc1.y);
      }
    })();

    return pathfinder.findPath(currentFloor.locations, mapConnections, fromId, toId);
  };

  const showPath = (fromId: string, toId: string) => {
    const path = findPath(fromId, toId);
    if (path.length < 2) return;

    // Clear existing paths
    pathRef.current.clearLayers();
    
    // Re-add connections first
    if (currentFloor) {
      currentFloor.connections.forEach(connection => {
        const fromLoc = currentFloor.locations.find(l => l.id === connection.from);
        const toLoc = currentFloor.locations.find(l => l.id === connection.to);
        
        if (fromLoc && toLoc) {
          const polyline = L.polyline([
            [fromLoc.y, fromLoc.x],
            [toLoc.y, toLoc.x]
          ], {
            color: '#64748b',
            weight: 4,
            opacity: 0.4,
            dashArray: '8, 6'
          });
          pathRef.current.addLayer(polyline);
        }
      });
    }
    
    // Draw enhanced path
    const pathCoords = path.map(loc => [loc.y, loc.x] as L.LatLngTuple);
    
    // Main path line
    const mainPath = L.polyline(pathCoords, {
      color: '#ef4444',
      weight: 8,
      opacity: 0.9,
      className: 'main-path'
    });
    pathRef.current.addLayer(mainPath);

    // Animated overlay path
    const animatedPath = L.polyline(pathCoords, {
      color: '#ffffff',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10',
      className: 'animated-path'
    });
    pathRef.current.addLayer(animatedPath);

    // Add enhanced start marker
    if (path[0]) {
      const startMarker = L.marker([path[0].y, path[0].x], {
        icon: L.divIcon({
          html: `<div style="
            background: linear-gradient(135deg, #22c55e, #16a34a); 
            color: white; 
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold;
            font-size: 16px;
            border: 4px solid white;
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
            animation: pulse 2s infinite;
            position: relative;
            z-index: 1000;
          ">🚀</div>`,
          className: 'start-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })
      }).bindPopup(`
        <div class="text-center p-2">
          <div class="text-lg font-bold text-green-600">🚀 Start Point</div>
          <div class="text-sm font-medium">${path[0].name}</div>
        </div>
      `);
      pathRef.current.addLayer(startMarker);
    }

    // Add enhanced end marker
    if (path[path.length - 1]) {
      const endMarker = L.marker([path[path.length - 1].y, path[path.length - 1].x], {
        icon: L.divIcon({
          html: `<div style="
            background: linear-gradient(135deg, #ef4444, #dc2626); 
            color: white; 
            border-radius: 50%; 
            width: 40px; 
            height: 40px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold;
            font-size: 16px;
            border: 4px solid white;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
            animation: pulse 2s infinite;
            position: relative;
            z-index: 1000;
          ">🎯</div>`,
          className: 'end-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        })
      }).bindPopup(`
        <div class="text-center p-2">
          <div class="text-lg font-bold text-red-600">🎯 Destination</div>
          <div class="text-sm font-medium">${path[path.length - 1].name}</div>
        </div>
      `);
      pathRef.current.addLayer(endMarker);
    }

    // Add waypoint markers for intermediate locations
    path.slice(1, -1).forEach((loc, index) => {
      const waypoint = L.marker([loc.y, loc.x], {
        icon: L.divIcon({
          html: `<div style="
            background: #3b82f6; 
            color: white; 
            border-radius: 50%; 
            width: 24px; 
            height: 24px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          ">${index + 1}</div>`,
          className: 'waypoint-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
      }).bindPopup(`
        <div class="text-center p-2">
          <div class="text-sm font-bold text-blue-600">Waypoint ${index + 1}</div>
          <div class="text-xs">${loc.name}</div>
        </div>
      `);
      pathRef.current.addLayer(waypoint);
    });

    // Fit map to path bounds with better padding
    if (pathCoords.length > 0) {
      const bounds = L.latLngBounds(pathCoords);
      leafletMapRef.current?.fitBounds(bounds, { 
        padding: [40, 40],
        maxZoom: 2
      });
    }
  };

  const clearPath = () => {
    pathRef.current.clearLayers();
    // Re-render the current floor connections
    if (currentFloor) {
      currentFloor.connections.forEach(connection => {
        const fromLoc = currentFloor.locations.find(l => l.id === connection.from);
        const toLoc = currentFloor.locations.find(l => l.id === connection.to);
        
        if (fromLoc && toLoc) {
          const polyline = L.polyline([
            [fromLoc.y, fromLoc.x],
            [toLoc.y, toLoc.x]
          ], {
            color: '#64748b',
            weight: 4,
            opacity: 0.6,
            dashArray: '8, 6'
          });
          pathRef.current.addLayer(polyline);
        }
      });
    }
  };

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    showPath,
    clearPath
  }));

  const zoomIn = () => leafletMapRef.current?.zoomIn();
  const zoomOut = () => leafletMapRef.current?.zoomOut();
  const resetView = () => {
    if (leafletMapRef.current) {
      const bounds = L.latLngBounds([0, 0], [600, 800]);
      leafletMapRef.current.fitBounds(bounds);
    }
  };

  return (
    <div className="relative w-full h-96 border rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Enhanced Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-background/90 backdrop-blur-sm p-2 rounded-lg border shadow-lg">
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
        <div className="absolute bottom-4 left-4 flex gap-2 bg-background/90 backdrop-blur-sm p-2 rounded-lg border shadow-lg">
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
      <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg border shadow-lg max-w-xs">
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
        <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-1 bg-red-500 rounded"></div>
            <span>Active Route</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-1 bg-gray-400 border-dashed border border-gray-400"></div>
            <span>Connections</span>
          </div>
        </div>
      </div>
    </div>
  );
});