import { useMapData } from "@/hooks/useMapData";
import { MapRenderer } from "@/components/MapRenderer";
import { OfflineMapNotice } from "@/components/OfflineMapNotice";

export const HospitalMap = () => {
  const { mapData, loading } = useMapData();

  return (
    <>
      <OfflineMapNotice />
      <MapRenderer mapData={mapData} loading={loading} />
    </>
  );
};