import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi } from "lucide-react";

export const OfflineIndicator = () => {
  const { isOnline, wasOffline } = useOfflineStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <Alert className={`fixed top-4 right-4 w-auto z-50 ${
      isOnline ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'
    }`}>
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-orange-600" />}
        <AlertDescription className={isOnline ? 'text-green-700' : 'text-orange-700'}>
          {isOnline ? 'Back online - syncing data...' : 'You are offline - cached data available'}
        </AlertDescription>
      </div>
    </Alert>
  );
};