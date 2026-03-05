'use client';

import { useState } from 'react';
import { Place } from '@/types/place';

interface PlaceCardProps {
  place: Place;
  variant?: 'compact' | 'full';
}

export default function PlaceCard({ place, variant = 'compact' }: PlaceCardProps) {
  const [showHours, setShowHours] = useState(false);
  const ws = place.workspace;

  return (
    <div className="font-body">
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold text-base text-text-primary leading-tight">
            {place.name}
          </h3>
          {place.isVerified && (
            <span className="shrink-0 text-accent text-xs font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
              Verified
            </span>
          )}
        </div>
        {place.category && (
          <span className="text-xs text-text-muted">{place.category}</span>
        )}
        {place.area && (
          <span className="text-xs text-text-muted ml-2">{place.area}</span>
        )}
      </div>

      {/* Review summary */}
      {place.reviewSummary && place.reviewSummary.reviewCount > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-primary text-sm">{'★'.repeat(Math.round(place.reviewSummary.averageScore || 0))}</span>
          <span className="text-xs text-text-secondary">
            {place.reviewSummary.averageScore} ({place.reviewSummary.reviewCount})
          </span>
        </div>
      )}

      {/* Laptop friendly score */}
      {ws?.laptopFriendlyScore && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-medium text-tag-text bg-tag-bg px-2 py-0.5 rounded-full">
            💻 {ws.laptopFriendlyScore}/5 laptop friendly
          </span>
        </div>
      )}

      {/* Feature badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ws?.hasWifi && (
          <span className="feature-badge feature-badge-wifi">
            📶 WiFi{ws.wifiSpeedMbps ? ` ${ws.wifiSpeedMbps}Mbps` : ''}
          </span>
        )}
        {ws?.hasPlugs && (
          <span className="feature-badge feature-badge-plugs">
            🔌 Plugs{ws.plugQuantity ? ` (${ws.plugQuantity})` : ''}
          </span>
        )}
        {ws?.noiseLevel && (
          <span className="feature-badge feature-badge-quiet">
            {ws.noiseLevel === 'quiet' ? '🤫' : ws.noiseLevel === 'moderate' ? '🔉' : '🔊'} {ws.noiseLevel}
          </span>
        )}
        {ws?.hasFood && (
          <span className="feature-badge feature-badge-food">🍽️ Food</span>
        )}
        {ws?.hasOutdoorSeating && (
          <span className="feature-badge bg-sky-50 text-sky-700">☀️ Outdoor</span>
        )}
        {ws?.hasMeetingRooms && (
          <span className="feature-badge bg-indigo-50 text-indigo-700">🚪 Meeting rooms</span>
        )}
      </div>

      {/* Pricing info */}
      {(ws?.coffeePriceGbp || ws?.minSpendGbp) && (
        <div className="text-xs text-text-secondary mb-2 flex gap-3">
          {ws?.coffeePriceGbp && <span>☕ £{ws.coffeePriceGbp.toFixed(2)}</span>}
          {ws?.minSpendGbp && <span>Min spend: £{ws.minSpendGbp.toFixed(2)}</span>}
        </div>
      )}

      {/* Stay duration */}
      {ws?.typicalStayMins && (
        <div className="text-xs text-text-secondary mb-2">
          ⏱️ Typical stay: {ws.typicalStayMins >= 60
            ? `${Math.floor(ws.typicalStayMins / 60)}h${ws.typicalStayMins % 60 ? ` ${ws.typicalStayMins % 60}m` : ''}`
            : `${ws.typicalStayMins}m`}
          {ws.maxStayMins && ` (max ${ws.maxStayMins >= 60
            ? `${Math.floor(ws.maxStayMins / 60)}h`
            : `${ws.maxStayMins}m`})`}
        </div>
      )}

      {/* Seating */}
      {ws?.seatingSize && (
        <div className="text-xs text-text-secondary mb-2">
          🪑 Seating: {ws.seatingSize}
        </div>
      )}

      {/* Description */}
      {place.description && variant === 'full' && (
        <p className="text-xs text-text-secondary mb-3 leading-relaxed">
          {place.description}
        </p>
      )}

      {/* Busyness */}
      {variant === 'full' && ws?.busynessNotes && (
        <div className="text-xs text-text-secondary mb-2">
          <span className="font-medium">Busyness:</span> {ws.busynessNotes}
        </div>
      )}
      {variant === 'full' && ws?.bestTimes && (
        <div className="text-xs text-text-secondary mb-2">
          <span className="font-medium">Best times:</span> {ws.bestTimes}
        </div>
      )}

      {/* Notes */}
      {variant === 'full' && ws?.notes && (
        <div className="text-xs text-text-secondary mb-3 italic">
          {ws.notes}
        </div>
      )}

      {/* Opening Hours */}
      {place.openingHours && place.openingHours.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowHours(!showHours)}
            className="text-xs text-primary hover:text-primary-dark font-medium transition"
          >
            {showHours ? 'Hide hours' : 'Opening hours'}
          </button>
          {showHours && (
            <table className="mt-1 text-xs text-text-secondary w-full">
              <tbody>
                {place.openingHours.map((h, i) => (
                  <tr key={i} className="border-b border-border-light last:border-0">
                    <td className="py-0.5 font-medium w-10">{h.day}</td>
                    <td className="py-0.5">
                      {h.start === '00:00' && h.end === '00:00'
                        ? <span className="text-accent-red font-medium">Closed</span>
                        : `${h.start} - ${h.end}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Links row */}
      <div className="flex items-center gap-2 pt-2 border-t border-border-light">
        {place.googleMapsUrl && (
          <a
            href={place.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary-dark font-medium transition flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Google Maps
          </a>
        )}
        {place.socialLinks?.website && (
          <a
            href={place.socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-secondary hover:text-text-primary transition"
          >
            🌐 Website
          </a>
        )}
        {place.socialLinks?.instagram && (
          <a
            href={place.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-secondary hover:text-text-primary transition"
          >
            📷 Instagram
          </a>
        )}
      </div>
    </div>
  );
}
