import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileJson, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const [mapName, setMapName] = useState("");
  const [mapData, setMapData] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          setMapData(JSON.stringify(parsed, null, 2));
          setMapName(file.name.replace('.json', ''));
          toast({
            title: "File loaded successfully",
            description: "JSON file has been parsed and loaded.",
          });
        } catch (error) {
          toast({
            title: "Invalid JSON file",
            description: "Please select a valid JSON file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUpload = async () => {
    if (!mapName.trim() || !mapData.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both map name and data.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus('idle');

      // Parse the JSON to validate it
      const parsedData = JSON.parse(mapData);

      // Call the upload API
      const { data, error } = await supabase.functions.invoke('maps-upload', {
        body: {
          name: mapName,
          mapData: parsedData
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadStatus('success');
      toast({
        title: "Map uploaded successfully",
        description: "The map has been saved and set as current.",
      });

      // Clear form
      setMapName("");
      setMapData("");
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload map. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const sampleMapData = {
    name: "Sample Hospital Map",
    floors: [
      {
        id: "floor-1",
        name: "Ground Floor",
        locations: [
          { id: "entrance", name: "Main Entrance", x: 100, y: 100, type: "entrance" },
          { id: "reception", name: "Reception", x: 200, y: 150, type: "reception" },
          { id: "emergency", name: "Emergency Room", x: 300, y: 100, type: "emergency", room: "ER-001" },
          { id: "pharmacy", name: "Pharmacy", x: 400, y: 200, type: "pharmacy", room: "PH-001" }
        ],
        connections: [
          { from: "entrance", to: "reception", distance: 20 },
          { from: "reception", to: "emergency", distance: 30 },
          { from: "reception", to: "pharmacy", distance: 25 }
        ]
      }
    ]
  };

  const loadSampleData = () => {
    setMapData(JSON.stringify(sampleMapData, null, 2));
    setMapName("Sample Hospital Map");
    toast({
      title: "Sample data loaded",
      description: "You can modify this data or upload your own JSON file.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Admin Portal</h1>
        <p className="text-muted-foreground">Upload and manage indoor map configurations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Map Configuration
          </CardTitle>
          <CardDescription>
            Upload a JSON file containing the hospital floor plan and location data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="mapName">Map Name</Label>
              <Input
                id="mapName"
                value={mapName}
                onChange={(e) => setMapName(e.target.value)}
                placeholder="Enter map name..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="fileUpload">Upload JSON File</Label>
              <Input
                id="fileUpload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={loadSampleData}
                className="flex items-center gap-2"
              >
                <FileJson className="h-4 w-4" />
                Load Sample Data
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="mapData">Map Data (JSON)</Label>
            <Textarea
              id="mapData"
              value={mapData}
              onChange={(e) => setMapData(e.target.value)}
              placeholder="Paste or edit your JSON map data here..."
              className="mt-1 font-mono text-sm min-h-[300px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {uploadStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Upload successful</span>
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Upload failed</span>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleUpload}
              disabled={isUploading || !mapName.trim() || !mapData.trim()}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Map
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JSON Structure Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>The JSON file should contain the following structure:</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "name": "Hospital Name",
  "floors": [
    {
      "id": "floor-1",
      "name": "Ground Floor",
      "locations": [
        {
          "id": "location-id",
          "name": "Location Name",
          "x": 100,
          "y": 100,
          "type": "entrance|reception|emergency|pharmacy|room",
          "room": "Room Number (optional)"
        }
      ],
      "connections": [
        {
          "from": "location-id-1",
          "to": "location-id-2",
          "distance": 20
        }
      ]
    }
  ]
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;