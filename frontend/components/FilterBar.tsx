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
    <div className="bg-white border-b border-border px-4 py-2 flex gap-2 overflow-x-auto z-40 relative">
      {FILTER_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => toggle(opt.key)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition
            ${filters[opt.key]
              ? 'bg-primary text-white shadow-sm'
              : 'bg-border-light text-text-secondary hover:bg-border'
            }`}
        >
          <span>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
