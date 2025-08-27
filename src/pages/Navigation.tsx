import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation as NavigationIcon, Clock, Accessibility, Loader2 } from "lucide-react";
import { useNavigation, RouteResult } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const { locations, loading, findRoute } = useNavigation();
  const [fromLocation, setFromLocation] = useState<string>("");
  const [toLocation, setToLocation] = useState<string>("");
  const [currentRoute, setCurrentRoute] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const { toast } = useToast();

  const handleFindRoute = async () => {
    if (!fromLocation || !toLocation) {
      toast({
        title: "Missing Information",
        description: "Please select both starting point and destination",
        variant: "destructive",
      });
      return;
    }

    if (fromLocation === toLocation) {
      toast({
        title: "Same Location",
        description: "Please select different starting and destination points",
        variant: "destructive",
      });
      return;
    }

    setRouteLoading(true);
    try {
      const route = await findRoute(fromLocation, toLocation);
      if (route) {
        setCurrentRoute(route);
        toast({
          title: "Route Found",
          description: `Found route from ${route.from_location.name} to ${route.to_location.name}`,
        });
      } else {
        toast({
          title: "No Route Found",
          description: "Unable to find a route between these locations",
          variant: "destructive",
        });
      }
    } finally {
      setRouteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Filter locations for starting points (those with type 'start' or commonly used ones)
  const startingPoints = locations.filter(loc => 
    loc.type === 'start' || 
    ['loc_reception', 'loc_cafeteria'].includes(loc.id)
  );

  // All locations can be destinations
  const destinations = locations;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Navigation</h1>
        <p className="text-muted-foreground">Find your way around the hospital</p>
      </div>

      {/* Route Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Plan Your Route
          </CardTitle>
          <CardDescription>
            Select your starting point and destination to get directions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="from" className="text-sm font-medium">From</label>
              <Select value={fromLocation} onValueChange={setFromLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select starting point" />
                </SelectTrigger>
                <SelectContent>
                  {startingPoints.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} {location.room && `(${location.room})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="to" className="text-sm font-medium">To</label>
              <Select value={toLocation} onValueChange={setToLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} {location.room && `(${location.room})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={handleFindRoute}
            disabled={routeLoading || !fromLocation || !toLocation}
          >
            {routeLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <NavigationIcon className="mr-2 h-4 w-4" />
            )}
            Find Route
          </Button>
        </CardContent>
      </Card>

      {/* Route Information */}
      {currentRoute && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-4 w-4 text-primary" />
                  Travel Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{currentRoute.estimated_time}</p>
                <p className="text-sm text-muted-foreground">Estimated walking time</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-4 w-4 text-primary" />
                  Distance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{currentRoute.distance}m</p>
                <p className="text-sm text-muted-foreground">Total walking distance</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Accessibility className="h-4 w-4 text-primary" />
                  Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {currentRoute.accessibility.toLowerCase().includes('wheelchair') ? '✓' : '?'}
                </p>
                <p className="text-sm text-muted-foreground">{currentRoute.accessibility}</p>
              </CardContent>
            </Card>
          </div>

          {/* Step-by-Step Directions */}
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Directions</CardTitle>
              <CardDescription>
                Route from {currentRoute.from_location.name} to {currentRoute.to_location.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentRoute.steps.map((step, index) => (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Navigation;