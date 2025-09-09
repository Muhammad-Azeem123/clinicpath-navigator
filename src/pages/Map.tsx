import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Zap, Navigation } from "lucide-react";
import { HospitalMap } from "@/components/HospitalMap";
import { UniversalSearch } from "@/components/UniversalSearch";

const Map = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Interactive Hospital Map</h1>
        <p className="text-muted-foreground">Navigate through our facility with ease</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HospitalMap />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UniversalSearch 
                placeholder="Search departments, rooms, staff..."
                showCategories={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Navigation className="h-4 w-4 mr-2" />
                Emergency Room
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Navigation className="h-4 w-4 mr-2" />
                Main Reception
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Navigation className="h-4 w-4 mr-2" />
                Cafeteria
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Navigation className="h-4 w-4 mr-2" />
                Pharmacy
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Map;