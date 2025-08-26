import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Brain, 
  Eye, 
  Baby, 
  Stethoscope, 
  Activity, 
  MapPin, 
  Phone, 
  Clock 
} from "lucide-react";

const departments = [
  {
    name: "Emergency Department",
    description: "24/7 emergency medical care",
    floor: "Ground Floor",
    phone: "(555) 123-4567",
    hours: "24/7",
    icon: Activity,
    status: "Open"
  },
  {
    name: "Cardiology",
    description: "Heart and cardiovascular care",
    floor: "2nd Floor",
    phone: "(555) 123-4568",
    hours: "8:00 AM - 6:00 PM",
    icon: Heart,
    status: "Open"
  },
  {
    name: "Neurology",
    description: "Brain and nervous system care",
    floor: "3rd Floor",
    phone: "(555) 123-4569",
    hours: "9:00 AM - 5:00 PM",
    icon: Brain,
    status: "Open"
  },
  {
    name: "Ophthalmology",
    description: "Eye care and vision services",
    floor: "2nd Floor",
    phone: "(555) 123-4570",
    hours: "8:30 AM - 5:30 PM",
    icon: Eye,
    status: "Open"
  },
  {
    name: "Pediatrics",
    description: "Children's healthcare services",
    floor: "1st Floor",
    phone: "(555) 123-4571",
    hours: "7:00 AM - 7:00 PM",
    icon: Baby,
    status: "Open"
  },
  {
    name: "Internal Medicine",
    description: "General adult healthcare",
    floor: "2nd Floor",
    phone: "(555) 123-4572",
    hours: "8:00 AM - 6:00 PM",
    icon: Stethoscope,
    status: "Closed"
  }
];

const Departments = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Hospital Departments</h1>
        <p className="text-muted-foreground">Find information about our medical departments and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <Card key={dept.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <dept.icon className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                    <Badge variant={dept.status === "Open" ? "default" : "secondary"}>
                      {dept.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription>{dept.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{dept.floor}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{dept.phone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{dept.hours}</span>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  Directions
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Departments;