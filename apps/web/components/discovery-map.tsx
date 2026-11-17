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
      attributionControl: {},
      pitch: compact ? 20 : 0
    });

    map.on("load", () => {
      const features = markers
        .filter((m) => m.latitude != null && m.longitude != null)
        .map((m) => ({
          type: "Feature" as const,
          properties: { id: m.id, title: m.title, category: m.category },
          geometry: { type: "Point" as const, coordinates: [m.longitude, m.latitude] }
        }));

      map.addSource("discoveries", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "discoveries",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "#b8ff65", 10, "#f59e0b", 30, "#ef4444"],
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 30, 32]
        }
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "discoveries",
        filter: ["has", "point_count"],
        layout: { "text-field": "{point_count_abbreviated}", "text-size": 12 }
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "discoveries",
        filter: ["!", ["has", "point_count"]],
        paint: { "circle-color": "#b8ff65", "circle-radius": 8, "circle-stroke-width": 2, "circle-stroke-color": "#09090b" }
      });

      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource("discoveries") as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({ center: (features[0].geometry as { coordinates: [number, number] }).coordinates, zoom });
        }).catch(() => {});
      });

      map.on("click", "unclustered-point", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        new maplibregl.Popup().setLngLat((f.geometry as { coordinates: [number, number] }).coordinates).setHTML(`<strong>${f.properties?.title ?? ""}</strong>`).addTo(map);
      });

      map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "unclustered-point", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "unclustered-point", () => { map.getCanvas().style.cursor = ""; });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [markers, compact]);

  return <div ref={container} className={`w-full overflow-hidden rounded-2xl bg-[#18181b] ${compact ? "h-[310px]" : "h-[520px]"}`} />;
}