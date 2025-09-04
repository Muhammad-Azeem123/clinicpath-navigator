import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { UniversalSearch } from "@/components/UniversalSearch";
import { useMapData } from "@/hooks/useMapData";
import { LeafletMap, LeafletMapRef } from "@/components/LeafletMap";
import { PathfindingControls } from "@/components/PathfindingControls";

export const HospitalMap = () => {
  const { locations, floors } = useNavigation();
  const { mapData, loading } = useMapData();
  const [selectedFloor, setSelectedFloor] = useState<string>("ground-floor");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const mapRef = useRef<LeafletMapRef>(null);

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
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Hospital Floor Plan
        </CardTitle>
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

        {/* PathfindingControls */}
        <PathfindingControls
          mapData={mapData}
          selectedFloor={selectedFloor}
          onShowPath={(fromId, toId) => mapRef.current?.showPath(fromId, toId)}
          onClearPath={() => mapRef.current?.clearPath()}
        />

        {/* Leaflet Map */}
        <LeafletMap 
          ref={mapRef}
          mapData={mapData}
          selectedFloor={selectedFloor}
          onFloorChange={setSelectedFloor}
          onLocationSelect={setSelectedLocation}
        />

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
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <h4 className="font-medium">{selectedLocation.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedLocation.room && `${selectedLocation.room} • `}
                {selectedLocation.type && `Type: ${selectedLocation.type}`}
              </p>
              <Button size="sm" className="mt-2">
                <Navigation className="h-3 w-3 mr-1" />
                Get Directions
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};