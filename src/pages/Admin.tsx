import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Settings, MapPin, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMapData } from '@/hooks/useMapData';

export default function Admin() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mapName, setMapName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const { mapData, loading, refreshMapData } = useMapData();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast({
          title: "Invalid file type",
          description: "Please select a valid JSON file.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setUploadStatus('idle');
      
      // Auto-generate map name from filename
      const fileName = file.name.replace('.json', '');
      setMapName(fileName);
    }
  };

  const validateMapStructure = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    if (!data.name || typeof data.name !== 'string') return false;
    if (!Array.isArray(data.floors)) return false;

    return data.floors.every((floor: any) => {
      if (!floor.id || !floor.name) return false;
      if (!Array.isArray(floor.locations)) return false;
      if (!Array.isArray(floor.connections)) return false;

      const validLocations = floor.locations.every((loc: any) => 
        loc.id && loc.name && typeof loc.x === 'number' && typeof loc.y === 'number'
      );

      const validConnections = floor.connections.every((conn: any) => 
        conn.from && conn.to
      );

      return validLocations && validConnections;
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !mapName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a map name.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      // Read and parse the JSON file
      const fileContent = await selectedFile.text();
      const mapData = JSON.parse(fileContent);

      // Validate the structure
      if (!validateMapStructure(mapData)) {
        throw new Error('Invalid map data structure');
      }

      // Call the upload edge function
      const { data, error } = await supabase.functions.invoke('maps-upload', {
        body: {
          name: mapName.trim(),
          mapData: mapData
        }
      });

      if (error) {
        throw error;
      }

      setUploadStatus('success');
      toast({
        title: "Success",
        description: "Map uploaded and set as current successfully!",
      });

      // Reset form
      setSelectedFile(null);
      setMapName('');
      
      // Refresh map data
      refreshMapData();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload map. Please check the file format.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const loadSampleData = () => {
    const sampleMapData = {
      name: "Sample Hospital Map",
      floors: [
        {
          id: "ground-floor",
          name: "Ground Floor",
          locations: [
            { id: "main-entrance", name: "Main Entrance", x: 100, y: 300, type: "entrance" },
            { id: "reception", name: "Reception", x: 200, y: 300, type: "reception" },
            { id: "emergency", name: "Emergency Room", x: 350, y: 200, type: "emergency", room: "ER-001" },
            { id: "pharmacy", name: "Pharmacy", x: 150, y: 450, type: "pharmacy", room: "PH-001" },
            { id: "cafeteria", name: "Cafeteria", x: 400, y: 400, type: "cafeteria" },
            { id: "elevator-gf", name: "Elevator", x: 300, y: 350, type: "elevator" },
            { id: "stairs-gf", name: "Stairs", x: 350, y: 350, type: "stairs" }
          ],
          connections: [
            { from: "main-entrance", to: "reception", distance: 25 },
            { from: "reception", to: "emergency", distance: 40 },
            { from: "reception", to: "pharmacy", distance: 30 },
            { from: "reception", to: "elevator-gf", distance: 20 },
            { from: "elevator-gf", to: "stairs-gf", distance: 10 },
            { from: "pharmacy", to: "cafeteria", distance: 35 }
          ]
        },
        {
          id: "first-floor",
          name: "First Floor",
          locations: [
            { id: "elevator-1f", name: "Elevator", x: 300, y: 350, type: "elevator" },
            { id: "stairs-1f", name: "Stairs", x: 350, y: 350, type: "stairs" },
            { id: "neurology", name: "Neurology Department", x: 150, y: 200, type: "department", room: "N-101" },
            { id: "cardiology", name: "Cardiology Department", x: 450, y: 200, type: "department", room: "C-101" },
            { id: "room-101", name: "Patient Room 101", x: 200, y: 450, type: "room", room: "101" },
            { id: "room-102", name: "Patient Room 102", x: 300, y: 450, type: "room", room: "102" }
          ],
          connections: [
            { from: "elevator-1f", to: "stairs-1f", distance: 10 },
            { from: "elevator-1f", to: "neurology", distance: 30 },
            { from: "elevator-1f", to: "cardiology", distance: 30 },
            { from: "neurology", to: "room-101", distance: 25 },
            { from: "cardiology", to: "room-102", distance: 25 }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleMapData, null, 2)], { type: 'application/json' });
    const file = new File([blob], 'sample-hospital-map.json', { type: 'application/json' });
    setSelectedFile(file);
    setMapName('Sample Hospital Map');
    setUploadStatus('idle');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage indoor map configurations for the navigation system
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Map Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Current Map Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading current map...</span>
              </div>
            ) : mapData ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Active</Badge>
                  <span className="font-medium">{mapData.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Floors: {mapData.floors.length} • 
                  Total Locations: {mapData.floors.reduce((acc, floor) => acc + floor.locations.length, 0)}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">No map currently active</span>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshMapData}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Map Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="map-name">Map Name</Label>
              <Input
                id="map-name"
                placeholder="Enter descriptive map name..."
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">JSON Map File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || !mapName.trim() || isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Deploy Map
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={loadSampleData}
                disabled={isUploading}
              >
                <Download className="h-4 w-4 mr-2" />
                Load Sample
              </Button>
            </div>

            {/* Status Messages */}
            {uploadStatus === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Map uploaded successfully and deployed to all users!</span>
              </div>
            )}
            
            {uploadStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Failed to upload map. Please check the file format.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Endpoints Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              API Endpoints & JSON Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Available API Endpoints:</h4>
                <div className="space-y-1 text-sm font-mono bg-muted p-3 rounded">
                  <div><Badge variant="outline">POST</Badge> /api/maps/upload - Upload map configuration</div>
                  <div><Badge variant="outline">GET</Badge> /api/maps/current - Get current active map</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">JSON Structure Reference:</h4>
                <Textarea
                  readOnly
                  className="font-mono text-xs"
                  rows={20}
                  value={`{
  "name": "Hospital Name",
  "floors": [
    {
      "id": "ground-floor",
      "name": "Ground Floor",
      "locations": [
        {
          "id": "main-entrance",
          "name": "Main Entrance", 
          "x": 100,
          "y": 300,
          "type": "entrance",
          "room": "optional room number"
        }
      ],
      "connections": [
        {
          "from": "location-id-1",
          "to": "location-id-2", 
          "distance": 25
        }
      ]
    }
  ]
}

// Location Types:
// - entrance, reception, emergency
// - pharmacy, cafeteria, elevator, stairs
// - department, room, general`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}