import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Navigation as NavigationIcon, Clock, Accessibility, Loader2, Search, Users } from "lucide-react";
import { useNavigation, RouteResult } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/use-toast";
import { StepVisualization } from "@/components/StepVisualization";

const Navigation = () => {
  const { locations, floors, loading, findRoute } = useNavigation();
  const [fromLocation, setFromLocation] = useState<string>("");
  const [toLocation, setToLocation] = useState<string>("");
  const [currentRoute, setCurrentRoute] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();

  // Check for stored route from other pages
  useEffect(() => {
    const storedRoute = sessionStorage.getItem('currentRoute');
    if (storedRoute) {
      try {
        const route = JSON.parse(storedRoute);
        setCurrentRoute(route);
        sessionStorage.removeItem('currentRoute'); // Clean up
      } catch (error) {
        console.error('Failed to parse stored route:', error);
      }
    }
  }, []);

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

  // Get filtered locations for display
  const filteredLocations = locations.filter(location => {
    const matchesFloor = !selectedFloor || selectedFloor === "all" || location.floor_id === selectedFloor;
    const matchesSearch = !searchQuery || 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.room && location.room.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFloor && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <MapPin className="h-8 w-8 text-primary" />
          Clinic Path Navigator
        </h1>
        <p className="text-muted-foreground">Find your way around the hospital</p>
      </div>

      {/* Floor and Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Floor</label>
          <Select value={selectedFloor} onValueChange={setSelectedFloor}>
            <SelectTrigger>
              <SelectValue placeholder="Select floor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              {floors.map((floor) => (
                <SelectItem key={floor.id} value={floor.id}>
                  {floor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Locations</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Layout with Route Planning and Available Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Planning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NavigationIcon className="h-5 w-5 text-primary" />
              Route Planning
            </CardTitle>
            <CardDescription>
              Select your starting point and destination to get directions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="from" className="text-sm font-medium">From</label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select starting location" />
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

        {/* Available Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Available Locations
            </CardTitle>
            <CardDescription>
              Browse locations {selectedFloor && `on ${floors.find(f => f.id === selectedFloor)?.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {filteredLocations.map((location) => (
                  <div 
                    key={location.id} 
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => setToLocation(location.id)}
                  >
                    <div className="font-medium">{location.name}</div>
                    {location.room && (
                      <div className="text-sm text-muted-foreground">Room: {location.room}</div>
                    )}
                  </div>
                ))}
                {filteredLocations.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No locations found matching your criteria
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

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

          {/* Enhanced Step-by-Step Directions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NavigationIcon className="h-5 w-5 text-primary" />
                Step-by-Step Directions
              </CardTitle>
              <CardDescription>
                Detailed route from {(currentRoute as any).fromLocationName || currentRoute.from_location.name} to {(currentRoute as any).toLocationName || currentRoute.to_location.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {currentRoute.steps.map((step, index) => (
                  <StepVisualization 
                    key={index}
                    step={step}
                    index={index}
                    isLast={index === currentRoute.steps.length - 1}
                  />
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