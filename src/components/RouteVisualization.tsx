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

    canvas.width = 400;
    canvas.height = 300;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'hsl(210, 16%, 98%)');
    gradient.addColorStop(1, 'hsl(214, 32%, 97%)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw route path
    ctx.strokeStyle = 'hsl(214, 84%, 46%)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    routeSteps.forEach((step, index) => {
      if (!step.coordinates) return;
      
      const x = (step.coordinates.x * 0.8 + 0.1) * canvas.width;
      const y = (step.coordinates.y * 0.8 + 0.1) * canvas.height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw waypoints
    routeSteps.forEach((step, index) => {
      if (!step.coordinates) return;
      
      const x = (step.coordinates.x * 0.8 + 0.1) * canvas.width;
      const y = (step.coordinates.y * 0.8 + 0.1) * canvas.height;

      // Waypoint circle
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      
      if (step.type === 'start') {
        ctx.fillStyle = 'hsl(142, 71%, 45%)';
      } else if (step.type === 'destination') {
        ctx.fillStyle = 'hsl(0, 84%, 60%)';
      } else {
        ctx.fillStyle = 'hsl(214, 84%, 46%)';
      }
      ctx.fill();

      // White border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Step number
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), x, y + 3);
    });
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