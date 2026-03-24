"use client";

import {
  Map as MapComponent,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";

interface MapPanelProps {
  latitude: number;
  longitude: number;
  markerLabel?: string | null;
  zoom?: number;
}

export function MapPanel({
  latitude,
  longitude,
  zoom = 14,
  markerLabel,
}: MapPanelProps) {
  return (
    <div className="min-h-[400px] overflow-hidden rounded-lg border border-border/50">
      <MapComponent
        className="h-full min-h-[400px] w-full"
        viewport={{ center: [longitude, latitude], zoom }}
      >
        <MapMarker latitude={latitude} longitude={longitude}>
          <MarkerContent />
          {markerLabel && <MarkerPopup>{markerLabel}</MarkerPopup>}
        </MapMarker>
      </MapComponent>
    </div>
  );
}
