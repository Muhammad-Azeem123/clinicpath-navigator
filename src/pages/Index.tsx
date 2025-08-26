import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Navigation, Users, Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to ClinicPath</h1>
        <p className="text-muted-foreground">Navigate your healthcare facility with ease</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-primary" />
              Interactive Map
            </CardTitle>
            <CardDescription>
              Explore the hospital layout and find your destination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Open Map</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              Get Directions
            </CardTitle>
            <CardDescription>
              Get step-by-step navigation to any department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Find Route</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Appointments
            </CardTitle>
            <CardDescription>
              View and manage your upcoming appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">View Schedule</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Staff Directory
            </CardTitle>
            <CardDescription>
              Find contact information for hospital staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Browse Directory</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
