"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef } from "@/components/ui/map";
import { Map as MapView } from "@/components/ui/map";
import { cn } from "@/core/lib/utils";

const cdnLocations: [number, number][] = [
  [-122.42, 37.77], // San Francisco
  [-73.94, 40.67], // New York
  [-99.13, 19.43], // Mexico City
  [-46.63, -23.55], // São Paulo
  [-0.13, 51.51], // London
  [18.07, 59.33], // Stockholm
  [28.98, 41.01], // Istanbul
  [55.27, 25.2], // Dubai
  [36.82, -1.29], // Nairobi
  [77.21, 28.61], // Delhi
  [103.82, 1.35], // Singapore
  [139.69, 35.68], // Tokyo
  [151.21, -33.87], // Sydney
  [172.64, -43.53], // Christchurch
];

// Connection pairs between CDN nodes (indices into cdnLocations)
const connections: [number, number][] = [
  [0, 1], // SF → New York
  [1, 4], // New York → London
  [0, 2], // SF → Mexico City
  [2, 3], // Mexico City → São Paulo
  [4, 5], // London → Stockholm
  [4, 6], // London → Istanbul
  [6, 7], // Istanbul → Dubai
  [7, 8], // Dubai → Nairobi
  [7, 9], // Dubai → Delhi
  [9, 10], // Delhi → Singapore
  [10, 11], // Singapore → Tokyo
  [11, 12], // Tokyo → Sydney
  [10, 12], // Singapore → Sydney
  [3, 8], // São Paulo → Nairobi
  [12, 13], // Sydney → Christchurch
];

// Generate arc points along a great circle between two coordinates
function generateArc(
  start: [number, number],
  end: [number, number],
  steps = 40
): [number, number][] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const [lng1, lat1] = start;
  const [lng2, lat2] = end;
  const φ1 = toRad(lat1);
  const λ1 = toRad(lng1);
  const φ2 = toRad(lat2);
  const λ2 = toRad(lng2);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((φ2 - φ1) / 2) ** 2 +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
      )
    );

  if (d < 1e-10) {
    return [start, end];
  }

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const a = Math.sin((1 - f) * d) / Math.sin(d);
    const b = Math.sin(f * d) / Math.sin(d);
    const x = a * Math.cos(φ1) * Math.cos(λ1) + b * Math.cos(φ2) * Math.cos(λ2);
    const y = a * Math.cos(φ1) * Math.sin(λ1) + b * Math.cos(φ2) * Math.sin(λ2);
    const z = a * Math.sin(φ1) + b * Math.sin(φ2);
    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lng = toDeg(Math.atan2(y, x));
    points.push([lng, lat]);
  }
  return points;
}

// Pre-generate all arc geometries
const arcFeatures = connections.map(([fromIdx, toIdx], i) => ({
  type: "Feature" as const,
  geometry: {
    type: "LineString" as const,
    coordinates: generateArc(cdnLocations[fromIdx], cdnLocations[toIdx]),
  },
  properties: { id: i },
}));

export function GlobeCard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const dotColor = isDark ? "#ffffff" : "#1a1a1a";
  const dotDim = isDark ? "#cccccc" : "#444444";
  const mapTheme = isDark ? "dark" : "light";

  // Use key to force full remount on theme change (globe styles are baked in)
  const [mapKey, setMapKey] = useState(0);
  const mapRef = useRef<MapRef>(null);
  const [ready, setReady] = useState(false);
  const lngRef = useRef(0);
  const latRef = useRef(20);
  const prevThemeRef = useRef(mapTheme);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useRef(true);

  useEffect(() => {
    if (prevThemeRef.current !== mapTheme) {
      prevThemeRef.current = mapTheme;
      setReady(false);
      setMapKey((k) => k + 1);
    }
  }, [mapTheme]);

  // Pause animation when card is scrolled offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        isVisible.current = e.isIntersecting;
      },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleMapRef = useCallback((node: MapRef | null) => {
    if (node) {
      (mapRef as React.MutableRefObject<MapRef | null>).current = node;
      node.once("load", () => setReady(true));
      if (node.loaded()) {
        setReady(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!(ready && mapRef.current)) {
      return;
    }

    const map = mapRef.current;

    // Hide all text/symbol layers (continent labels, city names, etc.)
    const style = map.getStyle();
    if (!style?.layers) {
      return;
    }
    for (const layer of style.layers) {
      if (layer.type === "symbol") {
        map.setLayoutProperty(layer.id, "visibility", "none");
      }
    }

    if (!map.getSource("cdn-points")) {
      // CDN point markers
      map.addSource("cdn-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: cdnLocations.map(([lng, lat]) => ({
            type: "Feature" as const,
            geometry: { type: "Point" as const, coordinates: [lng, lat] },
            properties: {},
          })),
        },
      });

      // Arc connections
      map.addSource("cdn-arcs", {
        type: "geojson",
        data: { type: "FeatureCollection", features: arcFeatures },
      });

      // Arc glow (wider, dimmer line underneath)
      map.addLayer({
        id: "arc-glow",
        type: "line",
        source: "cdn-arcs",
        paint: {
          "line-color": dotColor,
          "line-width": 4,
          "line-opacity": 0.12,
          "line-blur": 4,
        },
      });

      // Arc lines
      map.addLayer({
        id: "arc-lines",
        type: "line",
        source: "cdn-arcs",
        paint: {
          "line-color": dotColor,
          "line-width": 1.5,
          "line-opacity": 0.5,
        },
      });

      // Outer pulse ring
      map.addLayer({
        id: "cdn-pulse",
        type: "circle",
        source: "cdn-points",
        paint: {
          "circle-radius": 10,
          "circle-color": dotColor,
          "circle-opacity": 0.15,
          "circle-blur": 1,
        },
      });

      // Glow circle
      map.addLayer({
        id: "cdn-glow",
        type: "circle",
        source: "cdn-points",
        paint: {
          "circle-radius": 6,
          "circle-color": dotColor,
          "circle-opacity": 0.3,
          "circle-blur": 0.8,
        },
      });

      // Solid dot
      map.addLayer({
        id: "cdn-dots",
        type: "circle",
        source: "cdn-points",
        paint: {
          "circle-radius": 3,
          "circle-color": dotColor,
          "circle-opacity": 1,
        },
      });
    }

    // Update colors when theme changes
    if (map.getLayer("cdn-dots")) {
      map.setPaintProperty("arc-glow", "line-color", dotColor);
      map.setPaintProperty("arc-lines", "line-color", dotColor);
      map.setPaintProperty("cdn-pulse", "circle-color", dotColor);
      map.setPaintProperty("cdn-glow", "circle-color", dotColor);
      map.setPaintProperty("cdn-dots", "circle-color", dotColor);
    }

    // Active arcs: draw in → hold → erase from tail → remove
    // phase 0→1 = drawing head, 1→2 = hold, 2→3 = erasing tail
    interface ActiveArc {
      arcIdx: number;
      coords: [number, number][];
      phase: number;
    }
    const SPEED = 0.02;
    const SPAWN_INTERVAL = 30;
    const MAX_ACTIVE = 4;

    const active: ActiveArc[] = [];
    let nextArc = 0;
    let spawnCounter = 0;
    let arcsDirty = false;
    const lastVisiblePts: number[] = []; // track visible point count per active arc

    let frame: number;
    let t = 0;
    let lastTime = 0;
    let userInteracting = false;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;

    // Pause auto-rotate during any user interaction + cooldown after
    const onInteractionStart = () => {
      userInteracting = true;
      if (resumeTimer) {
        clearTimeout(resumeTimer);
      }
    };
    const onInteractionEnd = () => {
      resumeTimer = setTimeout(() => {
        // Sync position from wherever the user left the globe
        const center = map.getCenter();
        lngRef.current = center.lng;
        latRef.current = center.lat;
        userInteracting = false;
      }, 2000);
    };

    map.on("mousedown", onInteractionStart);
    map.on("touchstart", onInteractionStart);
    map.on("mouseup", onInteractionEnd);
    map.on("touchend", onInteractionEnd);

    // Disable zoom interactions
    map.scrollZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disableRotation();

    const setArcData = () => {
      const src = map.getSource("cdn-arcs");
      if (!(src && "setData" in src)) {
        return;
      }

      const features = active.map((a) => {
        const totalPts = a.coords.length;

        if (a.phase <= 1) {
          // Drawing in: reveal from start
          const headPts = Math.max(
            2,
            Math.ceil(Math.min(a.phase, 1) * totalPts)
          );
          return {
            type: "Feature" as const,
            geometry: {
              type: "LineString" as const,
              coordinates: a.coords.slice(0, headPts),
            },
            properties: { id: a.arcIdx },
          };
        }

        if (a.phase <= 2) {
          // Hold: show full arc
          return {
            type: "Feature" as const,
            geometry: {
              type: "LineString" as const,
              coordinates: a.coords,
            },
            properties: { id: a.arcIdx },
          };
        }

        // Erasing from tail: shrink from start toward end
        const eraseProgress = a.phase - 2; // 0→1
        const tailStart = Math.floor(eraseProgress * totalPts);
        const remaining = a.coords.slice(tailStart);
        if (remaining.length < 2) {
          return null;
        }
        return {
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: remaining,
          },
          properties: { id: a.arcIdx },
        };
      });

      (src as { setData: (d: unknown) => void }).setData({
        type: "FeatureCollection",
        features: features.filter(Boolean),
      });
    };

    const DEFAULT_LAT = 20;

    const updateRotation = (dt: number) => {
      lngRef.current += 0.05 * dt;
      latRef.current += (DEFAULT_LAT - latRef.current) * (1 - 0.99 ** dt);
      map.setCenter([lngRef.current, latRef.current]);
    };

    const updatePulse = (tick: number) => {
      const pulse = 0.5 + 0.5 * Math.sin(tick * 0.04);
      const pulseSlow = 0.5 + 0.5 * Math.sin(tick * 0.02);
      map.setPaintProperty("cdn-pulse", "circle-radius", 8 + 6 * pulse);
      map.setPaintProperty("cdn-pulse", "circle-opacity", 0.25 * (1 - pulse));
      map.setPaintProperty("cdn-glow", "circle-opacity", 0.2 + 0.2 * pulseSlow);
      map.setPaintProperty(
        "cdn-dots",
        "circle-color",
        pulse > 0.5 ? dotColor : dotDim
      );
    };

    const spawnArc = () => {
      const arc = arcFeatures[nextArc];
      active.push({
        arcIdx: nextArc,
        coords: arc.geometry.coordinates as [number, number][],
        phase: 0,
      });
      lastVisiblePts.push(-1);
      nextArc = (nextArc + 1) % arcFeatures.length;
      arcsDirty = true;
    };

    const getVisiblePoints = (a: ActiveArc): number => {
      const totalPts = a.coords.length;
      if (a.phase <= 1) {
        return Math.max(2, Math.ceil(Math.min(a.phase, 1) * totalPts));
      }
      if (a.phase <= 2) {
        return totalPts;
      }
      return totalPts - Math.floor((a.phase - 2) * totalPts);
    };

    const advanceArcs = (dt: number) => {
      for (let i = active.length - 1; i >= 0; i--) {
        active[i].phase += SPEED * dt;
        if (active[i].phase > 3) {
          active.splice(i, 1);
          lastVisiblePts.splice(i, 1);
          arcsDirty = true;
        } else {
          const visPts = getVisiblePoints(active[i]);
          if (visPts !== lastVisiblePts[i]) {
            lastVisiblePts[i] = visPts;
            arcsDirty = true;
          }
        }
      }
    };

    const tickArcs = (dt: number) => {
      spawnCounter += dt;
      if (spawnCounter >= SPAWN_INTERVAL && active.length < MAX_ACTIVE) {
        spawnCounter = 0;
        spawnArc();
      }
      advanceArcs(dt);
      if (arcsDirty) {
        setArcData();
        arcsDirty = false;
      }
    };

    const animate = (now: number) => {
      if (!isVisible.current) {
        lastTime = 0;
        frame = requestAnimationFrame(animate);
        return;
      }
      const dt = lastTime ? (now - lastTime) / 16.67 : 1;
      lastTime = now;
      t += dt;

      if (!userInteracting) {
        updateRotation(dt);
      }

      if (map.getLayer("cdn-pulse")) {
        if (Math.floor(t) % 4 === 0) {
          updatePulse(t);
        }
        tickArcs(dt);
      }

      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      if (resumeTimer) {
        clearTimeout(resumeTimer);
      }
      map.off("mousedown", onInteractionStart);
      map.off("touchstart", onInteractionStart);
      map.off("mouseup", onInteractionEnd);
      map.off("touchend", onInteractionEnd);
    };
  }, [ready, dotColor, dotDim]);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-background shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
      ref={containerRef}
    >
      <span className="absolute top-4 left-4 z-10 text-[11px] text-muted-foreground uppercase tracking-wider">
        Global CDN
      </span>
      <div
        className={cn(
          "absolute inset-[-120%] transition-transform duration-700 ease-out [&_.maplibregl-ctrl-bottom-left]:hidden [&_.maplibregl-ctrl-bottom-right]:hidden",
          ready ? "translate-y-0 scale-100" : "translate-y-[40%] scale-50"
        )}
      >
        <MapView
          className="h-full w-full"
          interactive
          key={mapKey}
          projection={{ type: "globe" }}
          ref={handleMapRef}
          theme={mapTheme}
          viewport={{
            center: [0, 20],
            zoom: 0.7,
            bearing: 0,
            pitch: 15,
          }}
        />
      </div>
    </div>
  );
}
