import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation, MapPin, Route } from 'lucide-react';
import { MapData, MapLocation } from '@/hooks/useMapData';

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
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');

  const currentFloor = mapData?.floors.find(f => f.id === selectedFloor);
  const locations = currentFloor?.locations || [];

  const handleFindPath = () => {
    if (fromLocation && toLocation && fromLocation !== toLocation) {
      onShowPath(fromLocation, toLocation);
    }
  };

  const handleClearPath = () => {
    setFromLocation('');
    setToLocation('');
    onClearPath();
  };

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Route className="h-4 w-4" />
        <h3 className="font-medium">Route Planning</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <Select value={fromLocation} onValueChange={setFromLocation}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Start location">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-green-600" />
                  <span className="truncate">
                    {fromLocation ? locations.find(l => l.id === fromLocation)?.name : "Start location"}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-green-600" />
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

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <Select value={toLocation} onValueChange={setToLocation}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Destination">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-red-600" />
                  <span className="truncate">
                    {toLocation ? locations.find(l => l.id === toLocation)?.name : "Destination"}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-red-600" />
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

      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={handleFindPath}
          disabled={!fromLocation || !toLocation || fromLocation === toLocation}
          className="flex-1"
        >
          <Navigation className="h-3 w-3 mr-1" />
          Find Route
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleClearPath}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};