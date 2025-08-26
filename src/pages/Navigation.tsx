import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Navigation as NavigationIcon, 
  MapPin, 
  Route, 
  Clock, 
  ArrowRight,
  Compass
} from "lucide-react";

const Navigation = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Get Directions</h1>
        <p className="text-muted-foreground">Find the fastest route to your destination</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Plan Your Route
              </CardTitle>
              <CardDescription>Enter your starting point and destination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="from">From</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select starting location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main-entrance">Main Entrance</SelectItem>
                    <SelectItem value="parking-a">Parking Area A</SelectItem>
                    <SelectItem value="parking-b">Parking Area B</SelectItem>
                    <SelectItem value="reception">Main Reception</SelectItem>
                    <SelectItem value="emergency">Emergency Entrance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="to">To</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency Department</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="cafeteria">Cafeteria</SelectItem>
                    <SelectItem value="lab">Laboratory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">
                <NavigationIcon className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Time:</span>
                <span className="font-medium">3-5 minutes</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Distance:</span>
                <span className="font-medium">150 meters</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Accessibility:</span>
                <span className="font-medium text-green-600">Wheelchair Accessible</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Step-by-Step Directions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Start at Main Entrance</p>
                    <p className="text-sm text-muted-foreground">Enter through the main doors</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Head to Reception Desk</p>
                    <p className="text-sm text-muted-foreground">Walk straight for 20 meters</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Turn Right</p>
                    <p className="text-sm text-muted-foreground">Follow the corridor towards elevators</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Take Elevator to 2nd Floor</p>
                    <p className="text-sm text-muted-foreground">Exit and turn left</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Arrive at Cardiology</p>
                    <p className="text-sm text-muted-foreground">Room 201-205</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Navigation;