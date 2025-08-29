import { useState } from "react";
import { Search, MapPin, Users, Building, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchDirectionDialog } from "@/components/SearchDirectionDialog";
import { useNavigation, Location } from "@/hooks/useNavigation";

interface SearchResult {
  id: string;
  name: string;
  type: 'location' | 'department' | 'staff';
  subtitle?: string;
  floor?: string;
  room?: string;
  location?: Location;
}

interface UniversalSearchProps {
  onLocationSelect?: (location: Location) => void;
  placeholder?: string;
  showCategories?: boolean;
}

export const UniversalSearch = ({ 
  onLocationSelect, 
  placeholder = "Search locations, departments, or staff...",
  showCategories = true 
}: UniversalSearchProps) => {
  const [query, setQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { locations, floors } = useNavigation();

  // Sample department and staff data
  const departments = [
    { id: "cardiology", name: "Cardiology", floor: "2nd Floor", room: "Room 201-210" },
    { id: "neurology", name: "Neurology", floor: "3rd Floor", room: "Room 301-310" },
    { id: "pediatrics", name: "Pediatrics", floor: "1st Floor", room: "Room 101-110" },
    { id: "emergency", name: "Emergency Department", floor: "Ground Floor", room: "ER Wing" },
    { id: "radiology", name: "Radiology", floor: "Basement", room: "B01-B10" },
    { id: "laboratory", name: "Laboratory", floor: "Basement", room: "B11-B20" },
  ];

  const staff = [
    { id: "dr_johnson", name: "Dr. Sarah Johnson", specialty: "Cardiologist", room: "Room 205" },
    { id: "dr_smith", name: "Dr. Michael Smith", specialty: "Neurologist", room: "Room 305" },
    { id: "dr_brown", name: "Dr. Emily Brown", specialty: "Pediatrician", room: "Room 105" },
    { id: "dr_davis", name: "Dr. James Davis", specialty: "Emergency Physician", room: "ER-01" },
  ];

  const searchResults: SearchResult[] = [
    // Search locations
    ...locations
      .filter(loc => 
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        (loc.room && loc.room.toLowerCase().includes(query.toLowerCase()))
      )
      .map(loc => ({
        id: loc.id,
        name: loc.name,
        type: 'location' as const,
        subtitle: loc.room || undefined,
        floor: floors.find(f => f.id === loc.floor_id)?.name,
        room: loc.room || undefined,
        location: loc
      })),
    
    // Search departments
    ...departments
      .filter(dept => 
        dept.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(dept => ({
        id: dept.id,
        name: dept.name,
        type: 'department' as const,
        subtitle: `${dept.floor} • ${dept.room}`,
        floor: dept.floor,
        room: dept.room
      })),
    
    // Search staff
    ...staff
      .filter(person => 
        person.name.toLowerCase().includes(query.toLowerCase()) ||
        person.specialty.toLowerCase().includes(query.toLowerCase())
      )
      .map(person => ({
        id: person.id,
        name: person.name,
        type: 'staff' as const,
        subtitle: `${person.specialty} • ${person.room}`,
        room: person.room
      }))
  ].slice(0, 10); // Limit to 10 results

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'location' && result.location && onLocationSelect) {
      onLocationSelect(result.location);
    } else {
      setSelectedResult(result);
      setIsDialogOpen(true);
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'location': return <MapPin className="h-4 w-4 text-primary" />;
      case 'department': return <Building className="h-4 w-4 text-secondary" />;
      case 'staff': return <Users className="h-4 w-4 text-accent" />;
    }
  };

  const getDestinationLocation = (result: SearchResult): string => {
    if (result.type === 'location' && result.location) {
      return result.location.id;
    }
    
    // For departments and staff, find a matching location
    const matchingLocation = locations.find(loc => 
      loc.name.toLowerCase().includes(result.name.toLowerCase()) ||
      (result.room && loc.room === result.room)
    );
    
    return matchingLocation?.id || locations[0]?.id || "";
  };

  return (
    <>
      <div className="relative w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results Dropdown */}
        {query && searchResults.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
            <CardContent className="p-0">
              <ScrollArea className="max-h-64">
                <div className="p-2">
                  {showCategories && (
                    <div className="mb-2">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Search Results ({searchResults.length})
                      </div>
                    </div>
                  )}
                  
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex-shrink-0">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{result.name}</div>
                        {result.subtitle && (
                          <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        <Navigation className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {query && searchResults.length === 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </CardContent>
          </Card>
        )}
      </div>

      {/* Direction Dialog */}
      {selectedResult && (
        <SearchDirectionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          destinationName={selectedResult.name}
          destinationLocation={getDestinationLocation(selectedResult)}
        />
      )}
    </>
  );
};