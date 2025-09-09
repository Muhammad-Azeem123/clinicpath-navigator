import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Map as MapIcon, Globe } from 'lucide-react';
import { MapData } from '@/hooks/useMapData';
import { LeafletMap, LeafletMapRef } from '@/components/LeafletMap';
import { MapboxMap, MapboxMapRef } from '@/components/MapboxMap';
import { PathfindingControls } from '@/components/PathfindingControls';
import { UniversalSearch } from '@/components/UniversalSearch';
import { useSharedNavigation } from '@/hooks/useSharedNavigation';

interface MapRendererProps {
  mapData: MapData | null;
  loading: boolean;
}

type MapEngine = 'leaflet' | 'mapbox';

export const MapRenderer = ({ mapData, loading }: MapRendererProps) => {
  const [selectedFloor, setSelectedFloor] = useState<string>("ground-floor");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [mapEngine, setMapEngine] = useState<MapEngine>('leaflet');
  const leafletMapRef = useRef<LeafletMapRef>(null);
  const mapboxMapRef = useRef<MapboxMapRef>(null);
  const { fromLocation, toLocation, activeRoute } = useSharedNavigation();

  // Sync with shared navigation state - show path when locations are set
  useEffect(() => {
    if (fromLocation && toLocation && fromLocation !== toLocation) {
      handleShowPath(fromLocation, toLocation);
    }
  }, [fromLocation, toLocation]);

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
    // Find which floor this location belongs to
    if (mapData) {
      const floor = mapData.floors.find(f => 
        f.locations.some(l => l.id === location.id)
      );
      if (floor) {
        setSelectedFloor(floor.id);
      }
    }
  };

  const handleShowPath = (fromId: string, toId: string) => {
    if (mapEngine === 'leaflet') {
      leafletMapRef.current?.showPath(fromId, toId);
    } else {
      mapboxMapRef.current?.showPath(fromId, toId);
    }
  };

  const handleClearPath = () => {
    if (mapEngine === 'leaflet') {
      leafletMapRef.current?.clearPath();
    } else {
      mapboxMapRef.current?.clearPath();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p>Loading map data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Hospital Floor Plan
          </CardTitle>
          
          {/* Map Engine Selector */}
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant={mapEngine === 'leaflet' ? 'default' : 'outline'}
              onClick={() => setMapEngine('leaflet')}
            >
              <MapIcon className="h-4 w-4 mr-1" />
              Leaflet
            </Button>
            <Button 
              size="sm" 
              variant={mapEngine === 'mapbox' ? 'default' : 'outline'}
              onClick={() => setMapEngine('mapbox')}
            >
              <Globe className="h-4 w-4 mr-1" />
              Mapbox
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Controls */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Location</label>
          <UniversalSearch 
            onLocationSelect={handleLocationSelect}
            placeholder="Search rooms, departments..."
            showCategories={false}
          />
        </div>

        {/* Pathfinding Controls */}
        <PathfindingControls
          mapData={mapData}
          selectedFloor={selectedFloor}
          onShowPath={handleShowPath}
          onClearPath={handleClearPath}
        />

        {/* Map Renderer */}
        {mapEngine === 'leaflet' ? (
          <LeafletMap 
            ref={leafletMapRef}
            mapData={mapData}
            selectedFloor={selectedFloor}
            onFloorChange={setSelectedFloor}
            onLocationSelect={setSelectedLocation}
          />
        ) : (
          <MapboxMap 
            ref={mapboxMapRef}
            mapData={mapData}
            selectedFloor={selectedFloor}
            onFloorChange={setSelectedFloor}
            onLocationSelect={setSelectedLocation}
          />
        )}

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 border border-green-500 rounded"></div>
            <span>Entry Points</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border border-blue-500 rounded"></div>
            <span>Departments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 border border-red-500 rounded"></div>
            <span>Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-500 rounded"></div>
            <span>General Areas</span>
          </div>
        </div>

        {/* Selected location info */}
        {selectedLocation && (
          <div className="p-3 bg-muted/50 border rounded-lg">
            <div>
              <h4 className="font-medium">{selectedLocation.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedLocation.room && `${selectedLocation.room} • `}
                {selectedLocation.type && `Type: ${selectedLocation.type}`}
              </p>
              <Button size="sm" className="mt-2" onClick={() => handleShowPath('main-entrance', selectedLocation.id)}>
                <MapIcon className="h-3 w-3 mr-1" />
                Route from Main Entrance
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};