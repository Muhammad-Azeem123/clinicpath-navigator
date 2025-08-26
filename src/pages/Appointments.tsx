import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const appointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Johnson",
    department: "Cardiology",
    date: "Today",
    time: "2:30 PM",
    room: "Room 205",
    status: "Confirmed",
    type: "Follow-up"
  },
  {
    id: 2,
    doctor: "Dr. Michael Chen",
    department: "Neurology",
    date: "Tomorrow",
    time: "10:00 AM",
    room: "Room 301",
    status: "Confirmed",
    type: "Consultation"
  },
  {
    id: 3,
    doctor: "Dr. Emily Davis",
    department: "Ophthalmology",
    date: "Dec 28",
    time: "3:00 PM",
    room: "Room 210",
    status: "Pending",
    type: "Checkup"
  }
];

const Appointments = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">Manage your upcoming medical appointments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule New
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {appointment.doctor}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      {appointment.department} • {appointment.type}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={appointment.status === "Confirmed" ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {appointment.status === "Confirmed" ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {appointment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{appointment.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{appointment.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{appointment.room}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    Directions
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Reschedule
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week:</span>
                <span className="font-medium">2 appointments</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Month:</span>
                <span className="font-medium">5 appointments</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Available:</span>
                <span className="font-medium text-green-600">Dec 30, 9:00 AM</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Appointment Confirmed</p>
                <p className="text-muted-foreground">Dr. Johnson - Today 2:30 PM</p>
              </div>
              
              <div className="text-sm">
                <p className="font-medium">Reminder Sent</p>
                <p className="text-muted-foreground">Tomorrow's neurology appointment</p>
              </div>
              
              <div className="text-sm">
                <p className="font-medium">New Appointment</p>
                <p className="text-muted-foreground">Scheduled with Dr. Davis</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Appointments;