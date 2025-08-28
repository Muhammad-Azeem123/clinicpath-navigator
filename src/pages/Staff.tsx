import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  User,
  Stethoscope,
  UserCog
} from "lucide-react";
import { DirectionDialog } from "@/components/DirectionDialog";

const staff = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    role: "Cardiologist",
    department: "Cardiology",
    phone: "(555) 123-4568",
    email: "s.johnson@hospital.com",
    location: "Room 205, 2nd Floor",
    status: "Available",
    specialties: ["Heart Surgery", "Preventive Cardiology"]
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    role: "Neurologist",
    department: "Neurology",
    phone: "(555) 123-4569",
    email: "m.chen@hospital.com",
    location: "Room 301, 3rd Floor",
    status: "In Surgery",
    specialties: ["Brain Disorders", "Epilepsy"]
  },
  {
    id: 3,
    name: "Dr. Emily Davis",
    role: "Ophthalmologist",
    department: "Ophthalmology",
    phone: "(555) 123-4570",
    email: "e.davis@hospital.com",
    location: "Room 210, 2nd Floor",
    status: "Available",
    specialties: ["Retinal Disorders", "Cataract Surgery"]
  },
  {
    id: 4,
    name: "Nurse Jennifer Brown",
    role: "Head Nurse",
    department: "Emergency",
    phone: "(555) 123-4571",
    email: "j.brown@hospital.com",
    location: "Emergency Department",
    status: "On Duty",
    specialties: ["Emergency Care", "Trauma"]
  },
  {
    id: 5,
    name: "Dr. Robert Wilson",
    role: "Pediatrician",
    department: "Pediatrics",
    phone: "(555) 123-4572",
    email: "r.wilson@hospital.com",
    location: "Room 105, 1st Floor",
    status: "With Patient",
    specialties: ["Child Development", "Immunizations"]
  },
  {
    id: 6,
    name: "Maria Rodriguez",
    role: "Administrative Coordinator",
    department: "Administration",
    phone: "(555) 123-4573",
    email: "m.rodriguez@hospital.com",
    location: "Main Reception",
    status: "Available",
    specialties: ["Patient Scheduling", "Insurance"]
  }
];

const Staff = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Hospital Staff Directory</h1>
        <p className="text-muted-foreground">Find contact information for our healthcare professionals</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, department, or specialty..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          Filter by Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    {member.role.includes('Dr.') ? (
                      <Stethoscope className="h-4 w-4" />
                    ) : member.role.includes('Nurse') ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <UserCog className="h-4 w-4" />
                    )}
                    {member.role}
                  </CardDescription>
                  <Badge 
                    variant={member.status === "Available" ? "default" : 
                            member.status === "On Duty" ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {member.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-sm mb-2">Department: {member.department}</p>
                <div className="flex flex-wrap gap-1">
                  {member.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{member.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{member.location}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <DirectionDialog 
                  destinationName={member.name}
                  destinationLocation={member.location}
                >
                  <Button size="sm" variant="outline" className="flex-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    Locate
                  </Button>
                </DirectionDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Staff;