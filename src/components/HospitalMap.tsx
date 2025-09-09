import { useMapData } from "@/hooks/useMapData";
import { MapRenderer } from "@/components/MapRenderer";

export const HospitalMap = () => {
  const { mapData, loading } = useMapData();

  return <MapRenderer mapData={mapData} loading={loading} />;
};