import { MapPin, Navigation, Clock, Route as RouteIcon, ArrowRight, ArrowUp, ArrowUpDown, CheckCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      };
    });
  };

  const routeSteps = parseSteps(route.steps);

  const getStepIcon = (type: RouteStep['type']) => {
    switch (type) {
      case 'start': return <MapPin className="h-5 w-5 text-emerald-500" />;
      case 'destination': return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'turn': return <RotateCcw className="h-5 w-5 text-blue-500" />;
      case 'stairs': return <ArrowUp className="h-5 w-5 text-orange-500" />;
      case 'elevator': return <ArrowUpDown className="h-5 w-5 text-purple-500" />;
      default: return <ArrowRight className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStepColor = (type: RouteStep['type']) => {
    switch (type) {
      case 'start': return 'from-emerald-50 to-emerald-100 border-emerald-200';
      case 'destination': return 'from-emerald-50 to-emerald-100 border-emerald-200';
      case 'turn': return 'from-blue-50 to-blue-100 border-blue-200';
      case 'stairs': return 'from-orange-50 to-orange-100 border-orange-200';
      case 'elevator': return 'from-purple-50 to-purple-100 border-purple-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getStepBadgeColor = (type: RouteStep['type']) => {
    switch (type) {
      case 'start': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case 'destination': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case 'turn': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'stairs': return 'bg-orange-100 text-orange-700 hover:bg-orange-200';
      case 'elevator': return 'bg-purple-100 text-purple-700 hover:bg-purple-200';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-full bg-primary/10">
            <Navigation className="h-6 w-6 text-primary" />
          </div>
          Your Route to {route.to_location.name}
        </CardTitle>
        <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{route.estimated_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <RouteIcon className="h-4 w-4" />
            <span className="font-medium">{route.distance}m total</span>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {routeSteps.length} steps
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-blue-400 to-emerald-500"></div>
          
          <div className="space-y-0">
            {routeSteps.map((step, index) => (
              <div
                key={index}
                className={`relative p-6 transition-all duration-300 hover:bg-gradient-to-r ${getStepColor(step.type)} cursor-pointer group animate-fade-in border-l-4 border-transparent hover:border-l-primary/20`}
                onClick={() => onStepClick?.(index)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step Number Circle */}
                <div className="absolute left-5 transform -translate-x-1/2">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    {index === 0 ? (
                      <span className="text-xs font-bold text-emerald-600">A</span>
                    ) : index === routeSteps.length - 1 ? (
                      <span className="text-xs font-bold text-emerald-600">B</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                    )}
                  </div>
                </div>

                {/* Step Content */}
                <div className="ml-8 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-white/50 group-hover:bg-white/80 transition-colors">
                        {getStepIcon(step.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-gray-800">
                            {step.type === 'start' ? 'Start your journey' : 
                             step.type === 'destination' ? 'You have arrived!' : 
                             `Step ${index + 1}`}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStepBadgeColor(step.type)}`}
                          >
                            {step.type}
                          </Badge>
                        </div>
                        <p className="text-gray-700 font-medium mb-1 group-hover:text-gray-800">
                          {step.instruction}
                        </p>
                        
                        {/* Step-specific hints */}
                        {step.type === 'turn' && (
                          <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block">
                            💡 Look for directional signs or landmarks
                          </p>
                        )}
                        {step.type === 'stairs' && (
                          <p className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1 inline-block">
                            🚶 Take your time and use handrails
                          </p>
                        )}
                        {step.type === 'elevator' && (
                          <p className="text-xs text-purple-600 bg-purple-50 rounded px-2 py-1 inline-block">
                            🛗 Check floor indicators before entering
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Distance & Time */}
                  <div className="flex flex-col items-end text-right ml-4">
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      {step.distance}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.duration}
                    </div>
                  </div>
                </div>

                {/* Connecting Arrow */}
                {index < routeSteps.length - 1 && (
                  <div className="absolute left-8 bottom-0 transform -translate-x-1/2 translate-y-2">
                    <ArrowRight className="h-4 w-4 text-gray-400 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};