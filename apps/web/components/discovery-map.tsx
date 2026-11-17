"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";

type Marker = { id: string; title: string; latitude: number; longitude: number; category: string };

export function DiscoveryMap({ markers, compact = false }: { markers: Marker[]; compact?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json",
      center: [-80.19, 25.77],
      zoom: compact ? 8.2 : 7.1,
      attributionControl: true,
      pitch: compact ? 20 : 0
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      markers.forEach((marker) => {
        const el = document.createElement("button");
        el.className = "va-marker";
        el.setAttribute("aria-label", marker.title);
        el.title = marker.title;
        el.style.cssText = "width:13px;height:13px;border:2px solid #09090b;border-radius:50%;background:#b8ff65;box-shadow:0 0 0 5px #b8ff6533;cursor:pointer";
        new maplibregl.Marker({ element: el }).setLngLat([marker.longitude, marker.latitude]).setPopup(new maplibregl.Popup({ offset: 18 }).setText(marker.title)).addTo(map);
      });
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [markers, compact]);

  return <div ref={container} className={`w-full overflow-hidden rounded-2xl bg-[#18181b] ${compact ? "h-[310px]" : "h-[520px]"}`} />;
}
