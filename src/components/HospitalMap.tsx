import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";

export const HospitalMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { locations, floors } = useNavigation();
  const [selectedFloor, setSelectedFloor] = useState<string>("floor_1");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    drawMap();
  }, [locations, floors, selectedFloor, zoom, pan]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Apply zoom and pan
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw floor outline
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, 700, 500);

    // Filter locations by selected floor
    const floorLocations = locations.filter(loc => loc.floor_id === selectedFloor);

    // Draw rooms and departments
    floorLocations.forEach((location) => {
      const x = location.x * 600 + 100; // Scale to canvas
      const y = location.y * 400 + 100;
      const width = 80;
      const height = 60;

      // Different colors for different types
      let fillColor = '#f1f5f9';
      let strokeColor = '#64748b';
      
      if (location.type === 'start') {
        fillColor = '#dcfce7';
        strokeColor = '#16a34a';
      } else if (location.name.toLowerCase().includes('emergency')) {
        fillColor = '#fee2e2';
        strokeColor = '#dc2626';
      } else if (location.name.toLowerCase().includes('cardiology') || 
                 location.name.toLowerCase().includes('neurology') ||
                 location.name.toLowerCase().includes('pediatrics')) {
        fillColor = '#dbeafe';
        strokeColor = '#2563eb';
      }

      // Highlight selected location
      if (selectedLocation === location.id) {
        fillColor = '#fef3c7';
        strokeColor = '#d97706';
        ctx.lineWidth = 3;
      } else {
        ctx.lineWidth = 1;
      }

      // Draw room rectangle
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.fillRect(x - width/2, y - height/2, width, height);
      ctx.strokeRect(x - width/2, y - height/2, width, height);

      // Draw room label
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      // Room name (truncated if too long)
      const roomName = location.name.length > 12 ? 
        location.name.substring(0, 10) + '...' : location.name;
      ctx.fillText(roomName, x, y - 5);
      
      // Room number if available
      if (location.room) {
        ctx.font = '8px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(location.room, x, y + 8);
      }

      // Draw location pin
      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(x, y - height/2 - 8, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw corridors/paths (simplified)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Draw some example corridors
    ctx.beginPath();
    ctx.moveTo(100, 300);
    ctx.lineTo(700, 300);
    ctx.moveTo(400, 100);
    ctx.lineTo(400, 550);
    ctx.stroke();
    ctx.setLineDash([]);

    // Add floor plan elements
    drawFloorElements(ctx);

    ctx.restore();
  };

  const drawFloorElements = (ctx: CanvasRenderingContext2D) => {
    // Draw elevators
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(180, 280, 40, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ELV', 200, 305);

    // Draw stairs
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(580, 280, 40, 40);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('STAIR', 600, 305);

    // Draw entrance
    ctx.fillStyle = '#10b981';
    ctx.fillRect(380, 530, 40, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.fillText('ENTRANCE', 400, 543);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom - pan.x;
    const y = (event.clientY - rect.top) / zoom - pan.y;

    // Find clicked location
    const floorLocations = locations.filter(loc => loc.floor_id === selectedFloor);
    const clickedLocation = floorLocations.find(loc => {
      const locX = loc.x * 600 + 100;
      const locY = loc.y * 400 + 100;
      return Math.abs(x - locX) < 40 && Math.abs(y - locY) < 30;
    });

    setSelectedLocation(clickedLocation?.id || null);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Hospital Floor Plan
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom(-0.2)}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-mono">{Math.round(zoom * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom(0.2)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Floor selector */}
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          <span className="text-sm font-medium">Floor:</span>
          {floors.map((floor) => (
            <Button
              key={floor.id}
              variant={selectedFloor === floor.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFloor(floor.id)}
            >
              {floor.name}
            </Button>
          ))}
        </div>

        {/* Interactive canvas */}
        <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="cursor-pointer"
            onClick={handleCanvasClick}
          />
        </div>

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
            {(() => {
              const location = locations.find(l => l.id === selectedLocation);
              const floor = floors.find(f => f.id === location?.floor_id);
              return location ? (
                <div>
                  <h4 className="font-medium">{location.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {location.room && `${location.room} • `}{floor?.name}
                  </p>
                  <Button size="sm" className="mt-2">
                    <Navigation className="h-3 w-3 mr-1" />
                    Get Directions
                  </Button>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};