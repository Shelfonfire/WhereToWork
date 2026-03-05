'use client';

import { useState } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-border/60 px-5 py-3.5 flex items-center gap-5 z-50 relative shadow-[0_1px_3px_rgba(180,120,60,0.06)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 20h16c1.1 0 2-.9 2-2v-1H2v1c0 1.1.9 2 2 2zM2 7v9h20V7c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2z" />
          </svg>
        </div>
        <h1 className="font-heading font-bold text-[19px] text-text-primary hidden sm:block tracking-tight">
          WhereToWork
        </h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-xl">
        <div className="relative group">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search cafes, coworking spaces, libraries..."
            className="w-full pl-11 pr-4 py-2.5 bg-bg-cream/60 border border-border-light rounded-xl text-sm text-text-primary placeholder:text-text-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white transition-all duration-200"
          />
        </div>
      </form>

      {/* Google Maps List Link */}
      <a
        href="#"
        className="shrink-0 text-xs font-medium text-text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-amber-50"
        title="View on Google Maps"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span className="hidden md:inline">Google Maps</span>
      </a>
    </header>
  );
}
