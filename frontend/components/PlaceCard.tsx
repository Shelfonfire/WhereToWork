'use client';

import { useState } from 'react';
import { Place } from '@/types/place';

interface PlaceCardProps {
  place: Place;
  variant?: 'compact' | 'full';
}

function LaptopScore({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= score ? 'text-primary' : 'text-gray-200'}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 20h16c1.1 0 2-.9 2-2v-1H2v1c0 1.1.9 2 2 2zM2 7v9h20V7c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2z" />
        </svg>
      ))}
    </div>
  );
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(score) ? 'text-amber-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function PlaceCard({ place, variant = 'compact' }: PlaceCardProps) {
  const [showHours, setShowHours] = useState(false);
  const ws = place.workspace;

  return (
    <div className="place-card font-body">
      {/* Header section */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-heading font-bold text-[17px] text-text-primary leading-snug">
            {place.name}
          </h3>
          {place.isVerified && (
            <span className="shrink-0 inline-flex items-center gap-1 text-accent text-[11px] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Verified
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {place.category && (
            <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{place.category}</span>
          )}
          {place.area && (
            <span className="text-[11px] text-text-muted flex items-center gap-0.5">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              {place.area}
            </span>
          )}
        </div>
      </div>

      {/* Rating + laptop score row */}
      <div className="flex items-center gap-3 mb-3">
        {place.reviewSummary && place.reviewSummary.reviewCount > 0 && (
          <div className="flex items-center gap-1.5">
            <StarRating score={place.reviewSummary.averageScore || 0} />
            <span className="text-[11px] text-text-secondary font-medium">
              {place.reviewSummary.averageScore} ({place.reviewSummary.reviewCount})
            </span>
          </div>
        )}
        {ws?.laptopFriendlyScore && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-border-light">
            <LaptopScore score={ws.laptopFriendlyScore} />
            <span className="text-[11px] text-text-secondary font-medium">laptop friendly</span>
          </div>
        )}
      </div>

      {/* Feature badges - prominent */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ws?.hasWifi && (
          <span className="feature-badge feature-badge-wifi">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" strokeLinecap="round" strokeLinejoin="round"/></svg>
            WiFi{ws.wifiSpeedMbps ? ` ${ws.wifiSpeedMbps}Mbps` : ''}
          </span>
        )}
        {ws?.hasPlugs && (
          <span className="feature-badge feature-badge-plugs">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Plugs{ws.plugQuantity ? ` (${ws.plugQuantity})` : ''}
          </span>
        )}
        {ws?.noiseLevel && (
          <span className={`feature-badge ${ws.noiseLevel === 'quiet' ? 'feature-badge-quiet' : ws.noiseLevel === 'moderate' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {ws.noiseLevel === 'quiet'
                ? <><path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round"/></>
                : ws.noiseLevel === 'moderate'
                ? <><path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.54 8.46a5 5 0 010 7.07" strokeLinecap="round" strokeLinejoin="round"/></>
                : <><path d="M11 5L6 9H2v6h4l5 4V5z" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" strokeLinecap="round" strokeLinejoin="round"/></>
              }
            </svg>
            {ws.noiseLevel}
          </span>
        )}
        {ws?.hasFood && (
          <span className="feature-badge feature-badge-food">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 1v3M10 1v3M14 1v3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Food
          </span>
        )}
        {ws?.hasOutdoorSeating && (
          <span className="feature-badge bg-sky-50 text-sky-700 border-sky-100">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Outdoor
          </span>
        )}
        {ws?.hasMeetingRooms && (
          <span className="feature-badge bg-indigo-50 text-indigo-700 border-indigo-100">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Meeting rooms
          </span>
        )}
      </div>

      {/* Workspace details grid */}
      {ws && (ws.coffeePriceGbp || ws.seatingSize || ws.typicalStayMins) && (
        <div className="workspace-details-grid mb-3">
          {ws.coffeePriceGbp && (
            <div className="workspace-stat">
              <span className="workspace-stat-label">Coffee</span>
              <span className="workspace-stat-value">&pound;{ws.coffeePriceGbp.toFixed(2)}</span>
            </div>
          )}
          {ws.seatingSize && (
            <div className="workspace-stat">
              <span className="workspace-stat-label">Space</span>
              <span className="workspace-stat-value capitalize">{ws.seatingSize}</span>
            </div>
          )}
          {ws.typicalStayMins && (
            <div className="workspace-stat">
              <span className="workspace-stat-label">Typical stay</span>
              <span className="workspace-stat-value">
                {ws.typicalStayMins >= 60
                  ? `${Math.floor(ws.typicalStayMins / 60)}h${ws.typicalStayMins % 60 ? ` ${ws.typicalStayMins % 60}m` : ''}`
                  : `${ws.typicalStayMins}m`}
              </span>
            </div>
          )}
          {ws.minSpendGbp && (
            <div className="workspace-stat">
              <span className="workspace-stat-label">Min spend</span>
              <span className="workspace-stat-value">&pound;{ws.minSpendGbp.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {place.description && variant === 'full' && (
        <p className="text-[13px] text-text-secondary mb-3 leading-relaxed">
          {place.description}
        </p>
      )}

      {/* Full variant extras */}
      {variant === 'full' && (ws?.busynessNotes || ws?.bestTimes) && (
        <div className="bg-amber-50/60 rounded-lg p-2.5 mb-3 space-y-1">
          {ws?.busynessNotes && (
            <div className="text-[12px] text-text-secondary">
              <span className="font-semibold text-amber-800">Busyness:</span> {ws.busynessNotes}
            </div>
          )}
          {ws?.bestTimes && (
            <div className="text-[12px] text-text-secondary">
              <span className="font-semibold text-amber-800">Best times:</span> {ws.bestTimes}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {variant === 'full' && ws?.notes && (
        <div className="text-[12px] text-text-muted mb-3 italic border-l-2 border-primary/30 pl-2.5">
          {ws.notes}
        </div>
      )}

      {/* Opening Hours */}
      {place.openingHours && place.openingHours.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowHours(!showHours)}
            className="text-[12px] text-primary hover:text-primary-dark font-semibold transition flex items-center gap-1"
          >
            <svg className={`w-3 h-3 transition-transform ${showHours ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {showHours ? 'Hide hours' : 'Opening hours'}
          </button>
          {showHours && (
            <table className="mt-1.5 text-[11px] text-text-secondary w-full">
              <tbody>
                {place.openingHours.map((h, i) => (
                  <tr key={i} className="border-b border-border-light/50 last:border-0">
                    <td className="py-1 font-semibold w-10 text-text-primary">{h.day}</td>
                    <td className="py-1">
                      {h.start === '00:00' && h.end === '00:00'
                        ? <span className="text-accent-red font-semibold">Closed</span>
                        : `${h.start} - ${h.end}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Address */}
      {place.address && variant === 'full' && (
        <div className="text-[12px] text-text-muted mb-3 flex items-start gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
          {place.address}{place.postcode ? `, ${place.postcode}` : ''}
        </div>
      )}

      {/* Links row */}
      <div className="flex items-center gap-2 pt-2.5 border-t border-border-light">
        {place.googleMapsUrl && (
          <a
            href={place.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="place-card-gmaps-link"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Directions
          </a>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {place.socialLinks?.website && (
            <a
              href={place.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="place-card-social-link"
              title="Website"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          )}
          {place.socialLinks?.instagram && (
            <a
              href={place.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="place-card-social-link"
              title="Instagram"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
