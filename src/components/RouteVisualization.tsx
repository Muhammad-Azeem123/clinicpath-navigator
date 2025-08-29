import { useEffect, useRef } from "react";
import { MapPin, Navigation, Clock, Route as RouteIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RouteStep {
  location: string;
  instruction: string;
  distance: string;
  duration: string;
  type: 'start' | 'turn' | 'straight' | 'stairs' | 'elevator' | 'destination';
  coordinates?: { x: number; y: number };
}

interface RouteVisualizationProps {
  route: {
    from_location: { name: string; x: number; y: number };
    to_location: { name: string; x: number; y: number };
    steps: string[];
    distance: number;
    estimated_time: string;
  };
  onStepClick?: (stepIndex: number) => void;
}

export const RouteVisualization = ({ route, onStepClick }: RouteVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const parseSteps = (steps: string[]): RouteStep[] => {
    return steps.map((step, index) => {
      const lowerStep = step.toLowerCase();
      
      let type: RouteStep['type'] = 'straight';
      let distance = '30m';
      let duration = '30s';
      
      if (lowerStep.includes('start')) {
        type = 'start';
        distance = '0m';
        duration = '0s';
      } else if (lowerStep.includes('arrive') || lowerStep.includes('destination')) {
        type = 'destination';
        distance = '0m';
        duration = 'Arrived';
      } else if (lowerStep.includes('left') || lowerStep.includes('right')) {
        type = 'turn';
        distance = 'Turn';
        duration = '10s';
      } else if (lowerStep.includes('stairs')) {
        type = 'stairs';
        distance = '1 flight';
        duration = '2min';
      } else if (lowerStep.includes('elevator')) {
        type = 'elevator';
        distance = '1 floor';
        duration = '3min';
      } else {
        type = 'straight';
        distance = `${Math.floor(Math.random() * 50) + 20}m`;
        duration = `${Math.floor(Math.random() * 60) + 30}s`;
      }

      return {
        location: step.split(' ').slice(-2).join(' '),
        instruction: step,
        distance,
        duration,
        type,
        coordinates: {
          x: route.from_location.x + (route.to_location.x - route.from_location.x) * (index / (steps.length - 1)),
          y: route.from_location.y + (route.to_location.y - route.from_location.y) * (index / (steps.length - 1))
        }
      };
    });
  };

  const routeSteps = parseSteps(route.steps);

  useEffect(() => {
    drawRoute();
  }, [route]);

  const drawRoute = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Google Maps-style background
    const mapGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    mapGradient.addColorStop(0, '#f8fafc');
    mapGradient.addColorStop(0.5, '#e2e8f0');
    mapGradient.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = mapGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw streets grid (Google Maps style)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    
    // Horizontal streets
    for (let i = 0; i < 6; i++) {
      const y = (i + 1) * (canvas.height / 7);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Vertical streets
    for (let i = 0; i < 8; i++) {
      const x = (i + 1) * (canvas.width / 9);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw buildings/blocks
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    
    // Hospital building
    const hospitalX = canvas.width * 0.4;
    const hospitalY = canvas.height * 0.4;
    const hospitalW = canvas.width * 0.2;
    const hospitalH = canvas.height * 0.2;
    
    ctx.fillRect(hospitalX, hospitalY, hospitalW, hospitalH);
    ctx.strokeRect(hospitalX, hospitalY, hospitalW, hospitalH);
    
    // Hospital label
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Hospital', hospitalX + hospitalW/2, hospitalY + hospitalH/2);

    // Draw other buildings
    const buildings = [
      { x: 50, y: 50, w: 80, h: 60, label: 'Parking' },
      { x: 350, y: 80, w: 90, h: 50, label: 'Mall' },
      { x: 80, y: 280, w: 70, h: 80, label: 'Park' },
      { x: 350, y: 300, w: 100, h: 70, label: 'Offices' }
    ];
    
    ctx.fillStyle = '#f1f5f9';
    buildings.forEach(building => {
      ctx.fillRect(building.x, building.y, building.w, building.h);
      ctx.strokeRect(building.x, building.y, building.w, building.h);
      
      ctx.fillStyle = '#475569';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(building.label, building.x + building.w/2, building.y + building.h/2);
      ctx.fillStyle = '#f1f5f9';
    });

    // Draw the route path with Google Maps style
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Add shadow to route
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    routeSteps.forEach((step, index) => {
      if (!step.coordinates) return;
      
      const x = (step.coordinates.x * 0.7 + 0.15) * canvas.width;
      const y = (step.coordinates.y * 0.7 + 0.15) * canvas.height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw waypoints with Google Maps style
    routeSteps.forEach((step, index) => {
      if (!step.coordinates) return;
      
      const x = (step.coordinates.x * 0.7 + 0.15) * canvas.width;
      const y = (step.coordinates.y * 0.7 + 0.15) * canvas.height;

      // Outer circle (white border)
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      
      if (step.type === 'start') {
        ctx.fillStyle = '#10b981';
      } else if (step.type === 'destination') {
        ctx.fillStyle = '#ef4444';
      } else {
        ctx.fillStyle = '#3b82f6';
      }
      ctx.fill();

      // Step label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      
      if (step.type === 'start') {
        ctx.fillText('A', x, y + 3);
      } else if (step.type === 'destination') {
        ctx.fillText('B', x, y + 3);
      } else {
        ctx.fillText((index + 1).toString(), x, y + 3);
      }
    });

    // Add compass rose
    const compassX = canvas.width - 40;
    const compassY = 40;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(compassX, compassY, 20, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // North arrow
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 12);
    ctx.lineTo(compassX - 4, compassY - 4);
    ctx.lineTo(compassX + 4, compassY - 4);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('N', compassX, compassY + 15);
  };

  const getStepIcon = (type: RouteStep['type']) => {
    switch (type) {
      case 'start': return <MapPin className="h-4 w-4 text-success" />;
      case 'destination': return <MapPin className="h-4 w-4 text-destructive" />;
      case 'turn': return <Navigation className="h-4 w-4 text-primary" />;
      case 'stairs': return <RouteIcon className="h-4 w-4 text-warning" />;
      case 'elevator': return <RouteIcon className="h-4 w-4 text-info" />;
      default: return <Navigation className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Visual Route Map */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <RouteIcon className="h-5 w-5 text-primary" />
            Route Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-map-bg rounded-lg p-4 shadow-map">
            <canvas
              ref={canvasRef}
              className="w-full h-auto border border-border rounded-md"
              style={{ maxHeight: '300px' }}
            />
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{route.estimated_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4" />
              <span>{route.distance}m total</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className="h-5 w-5 text-primary" />
            Detailed Directions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {routeSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:bg-accent/5 transition-colors cursor-pointer"
                onClick={() => onStepClick?.(index)}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {getStepIcon(step.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">Step {index + 1}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{step.distance}</span>
                      <span>{step.duration}</span>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{step.instruction}</p>
                  {step.type === 'turn' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Look for signs or landmarks at the intersection
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};