import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation as NavigationIcon, Loader2 } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface SearchDirectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destinationName: string;
  destinationLocation: string;
}

export const SearchDirectionDialog = ({ 
  open, 
  onOpenChange, 
  destinationName, 
  destinationLocation 
}: SearchDirectionDialogProps) => {
  const [fromLocation, setFromLocation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { locations, findRoute } = useNavigation();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter locations for starting points
  const startingPoints = locations.filter(loc => 
    loc.type === 'start' || 
    ['loc_reception', 'loc_cafeteria', 'loc_entrance_main'].includes(loc.id)
  );

  const handleGetDirections = async () => {
    if (!fromLocation) {
      toast({
        title: "Missing Information",
        description: "Please select your starting point",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Try to find location by destination location ID or name
      let targetLocationId = destinationLocation;
      
      if (!targetLocationId || !locations.find(l => l.id === targetLocationId)) {
        // Try to find location by name
        const foundLocation = locations.find(loc => 
          loc.name.toLowerCase().includes(destinationName.toLowerCase())
        );
        targetLocationId = foundLocation?.id || locations[0]?.id || "";
      }

      if (!targetLocationId) {
        toast({
          title: "Destination Not Found",
          description: "Could not find the destination in our system",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const route = await findRoute(fromLocation, targetLocationId);
      if (route) {
        // Store route in sessionStorage and navigate to Navigation page
        sessionStorage.setItem('currentRoute', JSON.stringify({
          ...route,
          fromLocationName: locations.find(l => l.id === fromLocation)?.name,
          toLocationName: destinationName
        }));
        
        onOpenChange(false);
        navigate('/navigation');
        
        toast({
          title: "Route Found",
          description: `Navigate to ${destinationName} from your selected starting point`,
        });
      } else {
        toast({
          title: "No Route Found",
          description: "Unable to find a route to this destination",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while finding the route",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <NavigationIcon className="h-5 w-5 text-primary" />
            Get Directions to {destinationName}
          </DialogTitle>
          <DialogDescription>
            Select your starting point to get step-by-step directions
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Starting Point</label>
            <Select value={fromLocation} onValueChange={setFromLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Where are you now?" />
              </SelectTrigger>
              <SelectContent>
                {startingPoints.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {location.name} {location.room && `(${location.room})`}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-4 bg-accent/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">Destination:</span>
            </div>
            <p className="text-sm mt-1">{destinationName}</p>
          </div>
          
          <Button 
            onClick={handleGetDirections}
            disabled={loading || !fromLocation}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <NavigationIcon className="mr-2 h-4 w-4" />
            )}
            Get Directions
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};