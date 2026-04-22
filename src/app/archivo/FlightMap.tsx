'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export interface FlightLocation {
  name: string;
  /** Detailed sub-location (city or state area) */
  detail?: string;
  count: number;
  lat: number;
  lng: number;
  /** CSS variable name for the dot color (matches the legend) */
  color: 'signal' | 'green' | 'scan';
}

interface FlightMapProps {
  locations: FlightLocation[];
}

/**
 * FlightMap — real country-level map for /archivo using Leaflet.
 *
 * Loads Leaflet lazily on the client (it reads `window`, so SSR would break),
 * mounts on a dark CARTO tile layer, and drops a custom HTML divIcon pin for
 * each photo location. The map is non-interactive-feeling (scrollWheelZoom off
 * by default, subtle dragging) so it stays in flow with the page's cinematic
 * scroll rather than hijacking it.
 */
export function FlightMap({ locations }: FlightMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    // Guard against React Strict Mode double-mount: if Leaflet has already
    // tagged this container with a _leaflet_id, bail out — otherwise Leaflet
    // throws "Map container is already initialized" on the second run.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((mapRef.current as any)._leaflet_id) return;

    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return;

      map = L.map(mapRef.current, {
        center: [23.5, -102],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
        minZoom: 4,
        maxZoom: 12,
      });

      L.tileLayer(
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        {
          subdomains: 'abcd',
          maxZoom: 19,
        },
      ).addTo(map);

      locations.forEach((loc) => {
        const html = `
          <div class="fm-pin-inner" style="--c: var(--${loc.color});">
            <span class="fm-pin-dot"></span>
            <span class="fm-pin-pulse"></span>
            <span class="fm-pin-label">
              <span class="fm-pin-city">${loc.name}</span>
              <span class="fm-pin-count">${loc.count}</span>
            </span>
          </div>
        `;

        const icon = L.divIcon({
          className: 'fm-pin',
          html,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
        if (loc.detail) {
          marker.bindTooltip(
            `${loc.name}${loc.detail ? ` · ${loc.detail}` : ''} · ${loc.count} ${
              loc.count === 1 ? 'pieza' : 'piezas'
            }`,
            { direction: 'top', offset: [0, -8], className: 'fm-tip' },
          );
        }
      });

      // Fit bounds so all pins are visible, padded on the edges
      if (locations.length > 0) {
        const bounds = L.latLngBounds(
          locations.map((l) => [l.lat, l.lng]) as [number, number][],
        );
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6 });
      }

      // If the container was measured late (e.g. fonts loading, aspect-ratio
      // not yet computed on first paint), Leaflet can cache 0x0 and draw
      // nothing. invalidateSize forces it to re-measure once the layout
      // settles. A rAF + small timeout covers both fast and slow cases.
      requestAnimationFrame(() => map && map.invalidateSize());
      setTimeout(() => map && map.invalidateSize(), 300);
    });

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [locations]);

  return <div className="flight-map" ref={mapRef} aria-label="Mapa de vuelos" />;
}
