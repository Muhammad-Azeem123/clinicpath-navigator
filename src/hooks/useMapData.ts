import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  type?: string;
  room?: string;
}

export interface MapConnection {
  from: string;
  to: string;
  distance?: number;
}

export interface MapFloor {
  id: string;
  name: string;
  locations: MapLocation[];
  connections: MapConnection[];
}

export interface MapData {
  name: string;
  floors: MapFloor[];
}

export const useMapData = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMapData = async () => {
    try {
      setLoading(true);
      
      // Check if we have cached data
      const cachedData = localStorage.getItem('hospital-map-data');
      const cachedTimestamp = localStorage.getItem('hospital-map-timestamp');
      
      if (cachedData && cachedTimestamp) {
        const cached = JSON.parse(cachedData);
        setMapData(cached);
        setLastUpdated(cachedTimestamp);
      }

      // Fetch current map from API
      const { data, error } = await supabase.functions.invoke('maps-current');
      
      if (error) {
        console.error('Error fetching map data:', error);
        if (!cachedData) {
          toast({
            title: "Error",
            description: "Failed to load map data. Using sample data.",
            variant: "destructive",
          });
          setMapData(getSampleMapData());
        }
        return;
      }

      if (data.map) {
        const newMapData = data.map.data as MapData;
        const newTimestamp = data.lastUpdated;
        
        // Update if this is newer than cached data
        if (!cachedTimestamp || new Date(newTimestamp) > new Date(cachedTimestamp)) {
          setMapData(newMapData);
          setLastUpdated(newTimestamp);
          
          // Cache the data
          localStorage.setItem('hospital-map-data', JSON.stringify(newMapData));
          localStorage.setItem('hospital-map-timestamp', newTimestamp);
          
          if (cachedData) {
            toast({
              title: "Map Updated",
              description: "New map data has been loaded.",
            });
          }
        }
      } else if (!cachedData) {
        // No map data available, use sample data
        const sampleData = getSampleMapData();
        setMapData(sampleData);
        localStorage.setItem('hospital-map-data', JSON.stringify(sampleData));
        localStorage.setItem('hospital-map-timestamp', new Date().toISOString());
      }
      
    } catch (error) {
      console.error('Error in fetchMapData:', error);
      if (!mapData) {
        setMapData(getSampleMapData());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  return {
    mapData,
    loading,
    lastUpdated,
    refreshMapData: fetchMapData,
  };
};

const getSampleMapData = (): MapData => ({
  name: "General Hospital",
  floors: [
    {
      id: "ground-floor",
      name: "Ground Floor",
      locations: [
        { id: "main-entrance", name: "Main Entrance", x: 100, y: 300, type: "entrance" },
        { id: "reception", name: "Reception", x: 200, y: 300, type: "reception" },
        { id: "emergency", name: "Emergency Room", x: 350, y: 200, type: "emergency", room: "ER-001" },
        { id: "pharmacy", name: "Pharmacy", x: 150, y: 450, type: "pharmacy", room: "PH-001" },
        { id: "cafeteria", name: "Cafeteria", x: 400, y: 400, type: "cafeteria" },
        { id: "elevator-gf", name: "Elevator", x: 300, y: 350, type: "elevator" },
        { id: "stairs-gf", name: "Stairs", x: 350, y: 350, type: "stairs" }
      ],
      connections: [
        { from: "main-entrance", to: "reception", distance: 25 },
        { from: "reception", to: "emergency", distance: 40 },
        { from: "reception", to: "pharmacy", distance: 30 },
        { from: "reception", to: "elevator-gf", distance: 20 },
        { from: "elevator-gf", to: "stairs-gf", distance: 10 },
        { from: "pharmacy", to: "cafeteria", distance: 35 }
      ]
    },
    {
      id: "first-floor",
      name: "First Floor",
      locations: [
        { id: "elevator-1f", name: "Elevator", x: 300, y: 350, type: "elevator" },
        { id: "stairs-1f", name: "Stairs", x: 350, y: 350, type: "stairs" },
        { id: "neurology", name: "Neurology Department", x: 150, y: 200, type: "department", room: "N-101" },
        { id: "cardiology", name: "Cardiology Department", x: 450, y: 200, type: "department", room: "C-101" },
        { id: "room-101", name: "Patient Room 101", x: 200, y: 450, type: "room", room: "101" },
        { id: "room-102", name: "Patient Room 102", x: 300, y: 450, type: "room", room: "102" }
      ],
      connections: [
        { from: "elevator-1f", to: "stairs-1f", distance: 10 },
        { from: "elevator-1f", to: "neurology", distance: 30 },
        { from: "elevator-1f", to: "cardiology", distance: 30 },
        { from: "neurology", to: "room-101", distance: 25 },
        { from: "cardiology", to: "room-102", distance: 25 }
      ]
    }
  ]
});