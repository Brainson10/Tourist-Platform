"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Builds popup content with DOM APIs (never HTML strings), so place names can't inject markup. */
function popupContent(marker) {
  const wrapper = document.createElement("div");
  wrapper.className = "map-popup";
  const title = document.createElement(marker.href ? "a" : "strong");
  title.textContent = marker.label;
  if (marker.href) {
    title.href = marker.href;
    if (/^https?:/.test(marker.href)) {
      title.target = "_blank";
      title.rel = "noopener noreferrer";
    }
  }
  wrapper.append(title);
  if (marker.detail) {
    const detail = document.createElement("span");
    detail.textContent = marker.detail;
    wrapper.append(detail);
  }
  return wrapper;
}

function pinIcon(L, marker) {
  const pin = document.createElement("span");
  pin.className = `map-pin map-pin--${marker.kind ?? "destination"}`;
  if (marker.number !== undefined) {
    const label = document.createElement("span");
    label.className = "map-pin__label";
    label.textContent = String(marker.number);
    pin.append(label);
  }
  return L.divIcon({ html: pin, className: "", iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -26] });
}

/**
 * markers: [{ id, lat, lng, label, detail?, href?, kind?, number? }]
 * Fits the view to all markers; falls back to `center`/`zoom` when there are none.
 */
export default function MapView({ markers = [], center, zoom = 12, className = "h-80", label = "Map", activeId }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const leafletRef = useRef(null);
  const markerRefs = useRef(new Map());

  // Create the map once.
  useEffect(() => {
    let cancelled = false;

    import("leaflet").then(({ default: L }) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, { scrollWheelZoom: false, attributionControl: true });
      L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 18 }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      map.setView(center ? [center.lat, center.lng] : [26.2, 92.9], center ? zoom : 6);
      containerRef.current.dispatchEvent(new CustomEvent("map-ready"));
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Center/zoom only seed the first view; marker changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers whenever they change (and once the map is ready).
  useEffect(() => {
    const container = containerRef.current;

    function render() {
      const L = leafletRef.current;
      const map = mapRef.current;
      if (!L || !map) return;

      layerRef.current.clearLayers();
      markerRefs.current.clear();
      const points = markers.filter((marker) => Number.isFinite(marker.lat) && Number.isFinite(marker.lng));

      for (const marker of points) {
        const leafletMarker = L.marker([marker.lat, marker.lng], { icon: pinIcon(L, marker), title: marker.label, keyboard: true });
        leafletMarker.bindPopup(popupContent(marker));
        leafletMarker.addTo(layerRef.current);
        markerRefs.current.set(marker.id, leafletMarker);
      }

      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points.map((marker) => [marker.lat, marker.lng])), { padding: [36, 36], maxZoom: 14 });
      } else if (points.length === 1) {
        map.setView([points[0].lat, points[0].lng], center ? zoom : 11);
      }
    }

    render();
    container?.addEventListener("map-ready", render);
    return () => container?.removeEventListener("map-ready", render);
  }, [markers, center, zoom]);

  // Open the popup of the marker a list item points at.
  useEffect(() => {
    if (activeId) markerRefs.current.get(activeId)?.openPopup();
  }, [activeId]);

  return <div ref={containerRef} role="region" aria-label={label} className={`relative z-0 w-full overflow-hidden rounded-2xl border border-line ${className}`} />;
}
