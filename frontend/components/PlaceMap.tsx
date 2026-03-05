'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Place } from '@/types/place';
import { fetchAPI } from '@/utils/api';
import PlaceCard from './PlaceCard';

// Dynamically import map to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

interface PlaceMapProps {
  searchQuery: string;
  filters: Record<string, boolean>;
}

// London center
const LONDON_CENTER: [number, number] = [51.515, -0.09];
const DEFAULT_ZOOM = 13;

export default function PlaceMap({ searchQuery, filters }: PlaceMapProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);

  // Load Leaflet CSS and create icon client-side only
  useEffect(() => {
    import('leaflet').then((L) => {
      // Fix default marker icon issue with webpack
      import('leaflet/dist/leaflet.css');
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      setCustomIcon(icon);
      setLeafletReady(true);
    });
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAPI('/places');
      setPlaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch places');
    } finally {
      setLoading(false);
    }
  };

  // Filter places
  const filteredPlaces = useMemo(() => {
    let result = places;

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.area?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q)
      );
    }

    // Attribute filters
    if (filters.hasWifi) result = result.filter(p => p.workspace?.hasWifi);
    if (filters.hasPlugs) result = result.filter(p => p.workspace?.hasPlugs);
    if (filters.quiet) result = result.filter(p => p.workspace?.noiseLevel === 'quiet');
    if (filters.hasFood) result = result.filter(p => p.workspace?.hasFood);
    if (filters.hasOutdoorSeating) result = result.filter(p => p.workspace?.hasOutdoorSeating);

    return result;
  }, [places, searchQuery, filters]);

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-100px)] flex items-center justify-center bg-bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-text-secondary text-sm">Loading places...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[calc(100vh-100px)] flex items-center justify-center bg-bg-cream">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm">
          <p className="text-accent-red mb-3 text-sm">Error: {error}</p>
          <button
            onClick={fetchPlaces}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!leafletReady || !customIcon) {
    return (
      <div className="w-full h-[calc(100vh-100px)] flex items-center justify-center bg-bg-cream">
        <p className="text-text-secondary text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-100px)] relative flex">
      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={LONDON_CENTER}
          zoom={DEFAULT_ZOOM}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {filteredPlaces.map((place) => (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={customIcon}
              eventHandlers={{
                click: () => setSelectedPlace(place),
              }}
            >
              <Popup maxWidth={340} minWidth={280}>
                <PlaceCard place={place} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Place count badge */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs text-text-secondary">
          {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Side panel - selected place detail */}
      {selectedPlace && (
        <div className="w-[380px] bg-white border-l border-border overflow-y-auto hidden lg:block">
          <div className="sticky top-0 bg-white border-b border-border p-3 flex justify-between items-center">
            <h2 className="font-heading font-semibold text-sm text-text-primary truncate">
              {selectedPlace.name}
            </h2>
            <button
              onClick={() => setSelectedPlace(null)}
              className="text-text-muted hover:text-text-primary transition text-lg leading-none"
            >
              &times;
            </button>
          </div>
          <div className="p-4">
            <PlaceCard place={selectedPlace} variant="full" />
          </div>
        </div>
      )}
    </div>
  );
}
