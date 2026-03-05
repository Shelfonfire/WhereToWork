'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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

function SidebarPlaceItem({ place, isSelected, onClick }: { place: Place; isSelected: boolean; onClick: () => void }) {
  const ws = place.workspace;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3.5 transition-all duration-200 border-b border-border-light/60 hover:bg-amber-50/40 ${isSelected ? 'bg-amber-50/70 border-l-[3px] border-l-primary' : 'border-l-[3px] border-l-transparent'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-heading font-semibold text-[14px] text-text-primary leading-tight">{place.name}</h4>
        {ws?.laptopFriendlyScore && (
          <span className="shrink-0 text-[11px] font-bold text-primary bg-amber-50 px-1.5 py-0.5 rounded">
            {ws.laptopFriendlyScore}/5
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 mb-1.5">
        {place.category && (
          <span className="text-[11px] text-text-muted">{place.category}</span>
        )}
        {place.area && (
          <span className="text-[11px] text-text-muted flex items-center gap-0.5">
            <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            {place.area}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {ws?.hasWifi && <span className="sidebar-mini-badge bg-emerald-50 text-emerald-700">WiFi</span>}
        {ws?.hasPlugs && <span className="sidebar-mini-badge bg-blue-50 text-blue-700">Plugs</span>}
        {ws?.noiseLevel === 'quiet' && <span className="sidebar-mini-badge bg-purple-50 text-purple-700">Quiet</span>}
        {ws?.hasFood && <span className="sidebar-mini-badge bg-orange-50 text-orange-700">Food</span>}
      </div>
    </button>
  );
}

export default function PlaceMap({ searchQuery, filters }: PlaceMapProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load Leaflet and create icon client-side only
  useEffect(() => {
    import('leaflet').then((L) => {
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

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
  };

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
        <div className="text-center p-6 bg-white rounded-xl shadow-warm">
          <p className="text-accent-red mb-3 text-sm">Error: {error}</p>
          <button
            onClick={fetchPlaces}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-all duration-200"
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
      {/* Sidebar list - visible on wider screens */}
      <div className="hidden lg:flex flex-col w-[340px] bg-white border-r border-border shrink-0">
        <div className="px-4 py-3 border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-sm text-text-primary">
              Places
            </h2>
            <span className="text-[11px] font-medium text-text-muted bg-border-light px-2 py-0.5 rounded-full">
              {filteredPlaces.length}
            </span>
          </div>
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {filteredPlaces.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-text-muted">No places match your filters</p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <SidebarPlaceItem
                key={place.id}
                place={place}
                isSelected={selectedPlace?.id === place.id}
                onClick={() => handleSelectPlace(place)}
              />
            ))
          )}
        </div>
      </div>

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
                click: () => handleSelectPlace(place),
              }}
            >
              <Popup maxWidth={340} minWidth={280}>
                <PlaceCard place={place} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Place count badge - only on smaller screens without sidebar */}
        <div className="absolute bottom-4 left-4 z-[1000] lg:hidden bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-warm text-xs text-text-secondary font-medium">
          {filteredPlaces.length} place{filteredPlaces.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Side panel - selected place detail */}
      {selectedPlace && (
        <div className="w-[380px] bg-white border-l border-border overflow-y-auto hidden md:block shadow-warm-lg animate-slide-in">
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border p-3.5 flex justify-between items-center z-10">
            <h2 className="font-heading font-bold text-sm text-text-primary truncate">
              {selectedPlace.name}
            </h2>
            <button
              onClick={() => setSelectedPlace(null)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-border-light text-text-muted hover:text-text-primary transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
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
