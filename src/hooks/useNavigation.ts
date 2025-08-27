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

      // If no predefined route exists, create a basic route using BFS pathfinding
      const path = await findPathBFS(fromId, toId);
      if (path) {
        const fromLocation = locations.find(l => l.id === fromId);
        const toLocation = locations.find(l => l.id === toId);
        
        if (fromLocation && toLocation) {
          return {
            id: 'generated',
            from_location_id: fromId,
            to_location_id: toId,
            distance: path.length * 20, // Estimate 20m per step
            estimated_time: `${Math.ceil(path.length * 0.5)}-${Math.ceil(path.length * 0.8)} minutes`,
            accessibility: 'Check individual locations',
            steps: generateStepsFromPath(path),
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

  const findPathBFS = async (fromId: string, toId: string): Promise<string[] | null> => {
    try {
      // Fetch all connections
      const { data: connections, error } = await supabase
        .from('location_connections')
        .select('from_location_id, to_location_id');

      if (error) throw error;

      // Build adjacency list
      const graph: Record<string, string[]> = {};
      connections?.forEach(conn => {
        if (!graph[conn.from_location_id]) graph[conn.from_location_id] = [];
        if (!graph[conn.to_location_id]) graph[conn.to_location_id] = [];
        graph[conn.from_location_id].push(conn.to_location_id);
        graph[conn.to_location_id].push(conn.from_location_id); // Bidirectional
      });

      // BFS to find shortest path
      const queue = [[fromId]];
      const visited = new Set([fromId]);

      while (queue.length > 0) {
        const path = queue.shift()!;
        const current = path[path.length - 1];

        if (current === toId) {
          return path;
        }

        if (graph[current]) {
          for (const neighbor of graph[current]) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push([...path, neighbor]);
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error in pathfinding:', error);
      return null;
    }
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