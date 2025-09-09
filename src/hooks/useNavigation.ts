import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  floor_id: string;
  room: string | null;
  type: string | null;
}

export interface Floor {
  id: string;
  name: string;
}

export interface Route {
  id: string;
  from_location_id: string;
  to_location_id: string;
  distance: number;
  estimated_time: string;
  accessibility: string;
  steps: string[];
}

export interface RouteResult extends Route {
  from_location: Location;
  to_location: Location;
}

export const useNavigation = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [floorsResponse, locationsResponse] = await Promise.all([
        supabase.from('floors').select('*').order('id'),
        supabase.from('locations').select('*').order('name')
      ]);

      if (floorsResponse.error) throw floorsResponse.error;
      if (locationsResponse.error) throw locationsResponse.error;

      setFloors(floorsResponse.data || []);
      setLocations(locationsResponse.data || []);
    } catch (error) {
      console.error('Error fetching navigation data:', error);
      toast({
        title: "Error",
        description: "Failed to load navigation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const findRoute = async (fromId: string, toId: string): Promise<RouteResult | null> => {
    try {
      // First, check if there's a predefined route
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .select(`
          *,
          from_location:locations!routes_from_location_id_fkey(*),
          to_location:locations!routes_to_location_id_fkey(*)
        `)
        .eq('from_location_id', fromId)
        .eq('to_location_id', toId)
        .maybeSingle();

      if (routeError) throw routeError;

      if (routeData) {
        return {
          ...routeData,
          from_location: routeData.from_location,
          to_location: routeData.to_location,
        };
      }

      // If no predefined route exists, create a route using A* pathfinding
      const path = await findPathAStar(fromId, toId);
      if (path.length > 0) {
        const fromLocation = locations.find(l => l.id === fromId);
        const toLocation = locations.find(l => l.id === toId);
        
        if (fromLocation && toLocation) {
          const totalDistance = calculatePathDistance(path);
          return {
            id: 'generated',
            from_location_id: fromId,
            to_location_id: toId,
            distance: Math.round(totalDistance),
            estimated_time: `${Math.ceil(totalDistance / 80)}-${Math.ceil(totalDistance / 60)} minutes`,
            accessibility: 'Check individual locations',
            steps: generateStepsFromPath(path.map(p => p.id)),
            from_location: fromLocation,
            to_location: toLocation,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding route:', error);
      toast({
        title: "Error",
        description: "Failed to find route",
        variant: "destructive",
      });
      return null;
    }
  };

  const findPathAStar = async (fromId: string, toId: string): Promise<Location[]> => {
    try {
      // Use cached connections from sample data if offline, otherwise fetch from DB
      let connections: any[] = [];
      
      try {
        const { data, error } = await supabase
          .from('location_connections')
          .select('from_location_id, to_location_id');
        
        if (error) throw error;
        connections = data || [];
      } catch (error) {
        console.warn('Failed to fetch connections, using sample data');
        // Use sample connections from the map data
        connections = [
          { from_location_id: 'main-entrance', to_location_id: 'reception' },
          { from_location_id: 'reception', to_location_id: 'emergency' },
          { from_location_id: 'reception', to_location_id: 'pharmacy' },
          { from_location_id: 'reception', to_location_id: 'elevator-gf' },
          { from_location_id: 'elevator-gf', to_location_id: 'stairs-gf' },
          { from_location_id: 'pharmacy', to_location_id: 'cafeteria' },
          { from_location_id: 'elevator-gf', to_location_id: 'elevator-1f' },
          { from_location_id: 'stairs-gf', to_location_id: 'stairs-1f' },
          { from_location_id: 'elevator-1f', to_location_id: 'neurology' },
          { from_location_id: 'elevator-1f', to_location_id: 'cardiology' },
          { from_location_id: 'neurology', to_location_id: 'room-101' },
          { from_location_id: 'cardiology', to_location_id: 'room-102' },
        ];
      }

      // Build graph for A* algorithm
      const graph = new Map<string, { id: string; cost: number }[]>();
      
      locations.forEach(loc => {
        graph.set(loc.id, []);
      });

      connections.forEach(conn => {
        const fromLoc = locations.find(l => l.id === conn.from_location_id);
        const toLoc = locations.find(l => l.id === conn.to_location_id);
        
        if (fromLoc && toLoc) {
          const distance = Math.sqrt(
            Math.pow(toLoc.x - fromLoc.x, 2) + Math.pow(toLoc.y - fromLoc.y, 2)
          );
          
          graph.get(conn.from_location_id)?.push({ id: conn.to_location_id, cost: distance });
          graph.get(conn.to_location_id)?.push({ id: conn.from_location_id, cost: distance });
        }
      });

      // A* implementation
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
      
      fScore.set(fromId, heuristic(startLoc, endLoc));

      while (openSet.size > 0) {
        // Get node with lowest fScore
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
          // Reconstruct path
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

      return []; // No path found
    } catch (error) {
      console.error('Error in A* pathfinding:', error);
      return [];
    }
  };

  const heuristic = (loc1: Location, loc2: Location): number => {
    // Manhattan distance for indoor navigation
    return Math.abs(loc2.x - loc1.x) + Math.abs(loc2.y - loc1.y);
  };

  const calculatePathDistance = (path: Location[]): number => {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      distance += Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
    }
    return distance;
  };

  const generateStepsFromPath = (path: string[]): string[] => {
    const steps: string[] = [];
    
    for (let i = 0; i < path.length; i++) {
      const location = locations.find(l => l.id === path[i]);
      if (location) {
        if (i === 0) {
          steps.push(`Start at ${location.name}`);
        } else if (i === path.length - 1) {
          steps.push(`Arrive at ${location.name} (${location.room || 'Room not specified'})`);
        } else {
          steps.push(`Continue to ${location.name}`);
        }
      }
    }

    return steps;
  };

  return {
    locations,
    floors,
    loading,
    findRoute,
    refreshData: fetchData,
  };
};