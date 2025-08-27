import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Brain, 
  Baby, 
  Eye, 
  Stethoscope, 
  Pill,
  Phone,
  Clock,
  MapPin,
  Users,
  Loader2
} from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";

const Departments = () => {
  const { locations, floors, loading } = useNavigation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Map department locations to display data
  const getDepartmentIcon = (name: string) => {
    const iconMap: Record<string, any> = {
      'Cardiology': Heart,
      'Neurology': Brain,
      'Pediatrics': Baby,
      'Ophthalmology': Eye,
      'Internal Medicine': Stethoscope,
      'Pharmacy': Pill,
    };
    return iconMap[name] || Stethoscope;
  };

  const getDepartmentInfo = (location: any) => {
    const infoMap: Record<string, any> = {
      'loc_cardiology': {
        hours: '24/7',
        phone: '(555) 123-4567',
        staff: 12,
        specialties: ['Cardiac Surgery', 'Interventional Cardiology', 'Heart Failure']
      },
      'loc_neurology': {
        hours: '8:00 AM - 6:00 PM',
        phone: '(555) 234-5678', 
        staff: 8,
        specialties: ['Stroke Care', 'Epilepsy', 'Movement Disorders']
      },
      'loc_pediatrics': {
        hours: '7:00 AM - 8:00 PM',
        phone: '(555) 345-6789',
        staff: 15,
        specialties: ['General Pediatrics', 'Pediatric Surgery', 'Neonatology']
      },
      'loc_ophthalmology': {
        hours: '9:00 AM - 5:00 PM',
        phone: '(555) 456-7890',
        staff: 6,
        specialties: ['Cataract Surgery', 'Retinal Care', 'Glaucoma Treatment']
      },
      'loc_internal': {
        hours: '8:00 AM - 6:00 PM',
        phone: '(555) 567-8901',
        staff: 20,
        specialties: ['Primary Care', 'Chronic Disease Management', 'Preventive Medicine']
      },
      'loc_pharmacy': {
        hours: '6:00 AM - 10:00 PM',
        phone: '(555) 678-9012',
        staff: 5,
        specialties: ['Prescription Filling', 'Medication Counseling', 'Clinical Pharmacy']
      }
    };
    return infoMap[location.id] || {
      hours: '8:00 AM - 5:00 PM',
      phone: '(555) 000-0000',
      staff: 5,
      specialties: ['General Services']
    };
  };

  // Filter locations that are medical departments (exclude entrances, elevators, etc.)
  const departments = locations.filter(location => 
    !['start', 'elevator', 'stairs'].includes(location.type || '') &&
    !location.name.toLowerCase().includes('entrance') &&
    !location.name.toLowerCase().includes('elevator') &&
    !location.name.toLowerCase().includes('stairs') &&
    !location.name.toLowerCase().includes('parking') &&
    !location.name.toLowerCase().includes('reception')
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Departments</h1>
        <p className="text-muted-foreground">Explore our medical departments and services</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => {
          const IconComponent = getDepartmentIcon(dept.name);
          const floor = floors.find(f => f.id === dept.floor_id);
          const info = getDepartmentInfo(dept);
          
          return (
            <Card key={dept.id} className="hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{dept.name}</CardTitle>
                      <CardDescription>{dept.room || 'Medical Department'}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="default">Open</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{floor?.name || 'Unknown Floor'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{info.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{info.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{info.staff} staff members</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {info.specialties.map((specialty: string) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">Get Directions</Button>
                  <Button size="sm" variant="outline" className="flex-1">Contact</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Departments;