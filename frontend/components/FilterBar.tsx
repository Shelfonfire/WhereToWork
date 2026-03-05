'use client';

interface FilterBarProps {
  filters: Record<string, boolean>;
  onFilterChange: (filters: Record<string, boolean>) => void;
}

const FILTER_OPTIONS = [
  { key: 'hasWifi', label: 'WiFi', icon: '📶' },
  { key: 'hasPlugs', label: 'Power Outlets', icon: '🔌' },
  { key: 'quiet', label: 'Quiet', icon: '🤫' },
  { key: 'hasFood', label: 'Food', icon: '🍽️' },
  { key: 'hasOutdoorSeating', label: 'Outdoor', icon: '☀️' },
  { key: 'openNow', label: 'Open Now', icon: '🟢' },
];

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const toggle = (key: string) => {
    onFilterChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-border/40 px-5 py-2.5 flex gap-2 overflow-x-auto z-40 relative">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => toggle(opt.key)}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
            ${filters[opt.key]
              ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-warm'
              : 'bg-border-light/70 text-text-secondary hover:bg-amber-50 hover:text-amber-700 border border-transparent hover:border-amber-100'
            }`}
        >
          <span>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
