"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef } from "@/components/ui/map";
import {
  Map as MapComponent,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import { cn } from "@/core/lib/utils";

interface MapPanelProps {
  latitude: number;
  longitude: number;
  markerLabel?: string | null;
  zoom?: number;
}

export function MapPanel({
  latitude,
  longitude,
  zoom = 2,
  markerLabel,
}: MapPanelProps) {
  const { resolvedTheme } = useTheme();
  const mapTheme = resolvedTheme === "dark" ? "dark" : "light";
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<MapRef>(null);
  const [ready, setReady] = useState(false);
  const prevThemeRef = useRef(mapTheme);

  // Remount on theme change (globe styles are baked in)
  useEffect(() => {
    if (prevThemeRef.current !== mapTheme) {
      prevThemeRef.current = mapTheme;
      setReady(false);
      setMapKey((k) => k + 1);
    }
  }, [mapTheme]);

  const handleMapRef = useCallback((node: MapRef | null) => {
    if (node) {
      (mapRef as React.MutableRefObject<MapRef | null>).current = node;
      node.once("load", () => setReady(true));
      if (node.loaded()) {
        setReady(true);
      }
    }
  }, []);

  // Hide symbol layers for a cleaner globe look
  useEffect(() => {
    if (!(ready && mapRef.current)) return;
    const style = mapRef.current.getStyle();
    if (!style?.layers) return;
    for (const layer of style.layers) {
      if (layer.type === "symbol") {
        mapRef.current.setLayoutProperty(layer.id, "visibility", "none");
      }
    }
  }, [ready]);

  return (
    <div
      className={cn(
        "relative h-full min-h-[400px] overflow-hidden rounded-xl border border-border/50 bg-background",
        "shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]",
        "[&_.maplibregl-ctrl-bottom-left]:hidden [&_.maplibregl-ctrl-bottom-right]:hidden"
      )}
    >
      <MapComponent
        className="h-full w-full"
        interactive
        key={mapKey}
        projection={{ type: "globe" }}
        ref={handleMapRef}
        theme={mapTheme}
        viewport={{
          center: [longitude, latitude],
          zoom,
          pitch: 20,
        }}
      >
        <MapMarker latitude={latitude} longitude={longitude}>
          <MarkerContent />
          {markerLabel && <MarkerPopup>{markerLabel}</MarkerPopup>}
        </MapMarker>
      </MapComponent>
    </div>
  );
}
