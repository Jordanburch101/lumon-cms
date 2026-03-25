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

/** Small static map thumbnail for the popup card. */
function PopupMapPreview({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  return (
    <div className="h-28 w-full overflow-hidden rounded-t-md border-b border-border/30">
      <MapComponent
        className="h-full w-full pointer-events-none"
        viewport={{ center: [longitude, latitude], zoom: 12 }}
      />
    </div>
  );
}

/** Rich location card shown when the marker is clicked. */
function LocationCard({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label: string;
}) {
  // Split "Lumon Industries — Queenstown Office" into eyebrow + heading
  const parts = label.split(/\s*[—–]\s*/);
  const eyebrow = parts.length > 1 ? parts[0] : "Location";
  const heading = parts.length > 1 ? parts.slice(1).join(" — ") : label;

  const latLabel = `${Math.abs(latitude).toFixed(2)}° ${latitude >= 0 ? "N" : "S"}`;
  const lngLabel = `${Math.abs(longitude).toFixed(2)}° ${longitude >= 0 ? "E" : "W"}`;

  return (
    <div className="w-56 -m-3 overflow-hidden">
      <PopupMapPreview latitude={latitude} longitude={longitude} />
      <div className="p-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
        <p className="mt-0.5 text-sm font-bold leading-tight">{heading}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {latLabel} · {lngLabel}
        </p>
      </div>
    </div>
  );
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
          <MarkerContent>
            <div className="relative h-4 w-4 rounded-full border-2 border-white bg-primary shadow-lg" />
          </MarkerContent>
          {markerLabel && (
            <MarkerPopup className="!p-0" offset={20}>
              <LocationCard
                label={markerLabel}
                latitude={latitude}
                longitude={longitude}
              />
            </MarkerPopup>
          )}
        </MapMarker>
      </MapComponent>
    </div>
  );
}
