import { ArrowRight, ArrowUp, ArrowDown, ArrowLeft, Navigation, Footprints, MapPin, Clock } from "lucide-react";

interface StepVisualizationProps {
  step: string;
  index: number;
  isLast?: boolean;
}

export const StepVisualization = ({ step, index, isLast = false }: StepVisualizationProps) => {
  const getStepIcon = (stepText: string) => {
    const lowerStep = stepText.toLowerCase();
    
    if (lowerStep.includes('straight') || lowerStep.includes('forward')) {
      return <ArrowUp className="h-5 w-5 text-primary" />;
    }
    if (lowerStep.includes('right')) {
      return <ArrowRight className="h-5 w-5 text-primary" />;
    }
    if (lowerStep.includes('left')) {
      return <ArrowLeft className="h-5 w-5 text-primary" />;
    }
    if (lowerStep.includes('stairs') || lowerStep.includes('up')) {
      return <ArrowUp className="h-5 w-5 text-orange-500" />;
    }
    if (lowerStep.includes('down')) {
      return <ArrowDown className="h-5 w-5 text-orange-500" />;
    }
    if (lowerStep.includes('elevator')) {
      return <ArrowUp className="h-5 w-5 text-blue-500" />;
    }
    if (lowerStep.includes('arrived') || lowerStep.includes('destination')) {
      return <MapPin className="h-5 w-5 text-green-600" />;
    }
    
    return <Footprints className="h-5 w-5 text-primary" />;
  };

  const getStepColor = (stepText: string) => {
    const lowerStep = stepText.toLowerCase();
    
    if (lowerStep.includes('arrived') || lowerStep.includes('destination')) {
      return 'bg-green-100 border-green-300 text-green-800';
    }
    if (lowerStep.includes('stairs')) {
      return 'bg-orange-100 border-orange-300 text-orange-800';
    }
    if (lowerStep.includes('elevator')) {
      return 'bg-blue-100 border-blue-300 text-blue-800';
    }
    
    return 'bg-primary/5 border-primary/20 text-primary';
  };

  const getDetailedDirection = (stepText: string): { main: string; detail?: string; distance?: string; time?: string } => {
    const lowerStep = stepText.toLowerCase();
    
    // Enhanced step descriptions with distances and times
    if (lowerStep.includes('straight') || lowerStep.includes('forward')) {
      return {
        main: stepText,
        detail: "Continue in the same direction",
        distance: "50m",
        time: "1 min"
      };
    }
    if (lowerStep.includes('right')) {
      return {
        main: stepText,
        detail: "Turn 90° to your right",
        distance: "Turn at corner",
        time: "< 1 min"
      };
    }
    if (lowerStep.includes('left')) {
      return {
        main: stepText,
        detail: "Turn 90° to your left", 
        distance: "Turn at corner",
        time: "< 1 min"
      };
    }
    if (lowerStep.includes('stairs')) {
      return {
        main: stepText,
        detail: lowerStep.includes('up') ? "Take stairs to upper level" : "Take stairs to lower level",
        distance: "1 flight",
        time: "2 min"
      };
    }
    if (lowerStep.includes('elevator')) {
      return {
        main: stepText,
        detail: "Press button and wait for elevator",
        distance: "1 floor",
        time: "3 min"
      };
    }
    if (lowerStep.includes('arrived') || lowerStep.includes('destination')) {
      return {
        main: stepText,
        detail: "You have reached your destination!",
        distance: "0m",
        time: "Arrived"
      };
    }
    
    return {
      main: stepText,
      detail: "Follow the designated path",
      distance: "30m",
      time: "30 sec"
    };
  };

  const directionInfo = getDetailedDirection(step);

  return (
    <div className="flex gap-4">
      {/* Step number and icon */}
      <div className="flex flex-col items-center">
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2
          ${getStepColor(step)}
        `}>
          {getStepIcon(step)}
        </div>
        {!isLast && (
          <div className="w-0.5 h-8 bg-border my-2"></div>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 pb-6">
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-lg">Step {index + 1}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {directionInfo.time}
            </div>
          </div>
          
          <p className="text-base mb-2">{directionInfo.main}</p>
          
          {directionInfo.detail && (
            <p className="text-sm text-muted-foreground mb-3">{directionInfo.detail}</p>
          )}
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Footprints className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{directionInfo.distance}</span>
            </div>
            {!isLast && (
              <div className="flex items-center gap-1">
                <Navigation className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Continue to next step</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};