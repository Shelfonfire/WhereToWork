'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import PlaceMap from '@/components/PlaceMap';
import FilterBar from '@/components/FilterBar';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, boolean>>({});

  return (
    <div className="relative bg-bg-cream min-h-screen flex flex-col">
      <Header onSearch={setSearchQuery} />
      <FilterBar filters={filters} onFilterChange={setFilters} />
      <main className="flex-1 relative">
        <PlaceMap searchQuery={searchQuery} filters={filters} />
      </main>
    </div>
  );
}
