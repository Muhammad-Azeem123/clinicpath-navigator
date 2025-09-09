import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, MapPin } from "lucide-react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export const OfflineMapNotice = () => {
  const { isOnline } = useOfflineStatus();

  if (isOnline) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-orange-600" />
        <MapPin className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Offline Mode:</strong> Navigation is using cached map data. 
          Some features may be limited until you reconnect to the internet.
        </AlertDescription>
      </div>
    </Alert>
  );
};