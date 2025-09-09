import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation, MapPin, Route } from 'lucide-react';
import { MapData, MapLocation } from '@/hooks/useMapData';
import { useSharedNavigation } from '@/hooks/useSharedNavigation';

interface PathfindingControlsProps {
  mapData: MapData | null;
  selectedFloor: string;
  onShowPath: (fromId: string, toId: string) => void;
  onClearPath: () => void;
}

export const PathfindingControls = ({ 
  mapData, 
  selectedFloor, 
  onShowPath, 
  onClearPath 
}: PathfindingControlsProps) => {
  const { 
    fromLocation, 
    toLocation, 
    setFromLocation, 
    setToLocation,
    clearNavigation
  } = useSharedNavigation();

  const currentFloor = mapData?.floors.find(f => f.id === selectedFloor);
  const allLocations = currentFloor?.locations || [];
  
  // Apply same filtering logic as Navigation page
  const startingPoints = allLocations.filter(loc => 
    loc.type === 'start' || 
    ['loc_reception', 'loc_cafeteria'].includes(loc.id)
  );
  
  // All locations can be destinations (same as Navigation page)
  const destinations = allLocations;

  // Sync with shared state
  useEffect(() => {
    if (fromLocation && toLocation && fromLocation !== toLocation) {
      onShowPath(fromLocation, toLocation);
    }
  }, [fromLocation, toLocation, onShowPath]);

  const handleFindPath = () => {
    if (fromLocation && toLocation && fromLocation !== toLocation) {
      onShowPath(fromLocation, toLocation);
    }
  };

  const handleClearPath = () => {
    clearNavigation();
    onClearPath();
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-r from-muted/50 to-accent/20 rounded-lg border border-primary/20">
      <div className="flex items-center gap-2">
        <Route className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Route Planning</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Starting Point</label>
          <Select value={fromLocation} onValueChange={setFromLocation}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Choose starting location">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="truncate">
                    {fromLocation ? allLocations.find(l => l.id === fromLocation)?.name : "Choose starting location"}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {startingPoints.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span>{location.name}</span>
                    {location.room && (
                      <span className="text-xs text-muted-foreground">({location.room})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Destination</label>
          <Select value={toLocation} onValueChange={setToLocation}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Choose destination">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="truncate">
                    {toLocation ? allLocations.find(l => l.id === toLocation)?.name : "Choose destination"}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {destinations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span>{location.name}</span>
                    {location.room && (
                      <span className="text-xs text-muted-foreground">({location.room})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleFindPath}
          disabled={!fromLocation || !toLocation || fromLocation === toLocation}
          className="flex-1 hover:scale-105 transition-transform"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Find Optimal Route
        </Button>
        <Button 
          variant="outline" 
          onClick={handleClearPath}
          className="hover:scale-105 transition-transform"
        >
          Clear
        </Button>
      </div>

      {fromLocation && toLocation && fromLocation !== toLocation && (
        <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary font-medium">Route:</span>
            <span>{allLocations.find(l => l.id === fromLocation)?.name}</span>
            <span className="text-muted-foreground">→</span>
            <span>{allLocations.find(l => l.id === toLocation)?.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};