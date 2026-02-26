import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import CookCard from '../components/search/CookCard';
import SearchFilters from '../components/search/SearchFilters';
import { Skeleton } from '@/components/ui/skeleton';

export default function Search() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialQuery = urlParams.get('q') || '';

  const [filters, setFilters] = useState({
    query: initialQuery,
    isOpen: false,
    city: '',
    tags: [],
  });

  const { data: cooks, isLoading } = useQuery({
    queryKey: ['cooks', 'search'],
    queryFn: () => base44.entities.Cook.filter({ is_active: true, approval_status: 'approved' }),
  });

  const { data: dailySpecials } = useQuery({
    queryKey: ['dailySpecials'],
    queryFn: () => base44.entities.Dish.filter({ is_daily_special: true }),
  });

  const getDailySpecialForCook = (cookId) => {
    return dailySpecials?.find(d => d.cook_id === cookId);
  };

  const filteredCooks = cooks?.filter((cook) => {
    // Search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const matchesName = cook.display_name?.toLowerCase().includes(query);
      const matchesCity = cook.city?.toLowerCase().includes(query);
      const matchesBio = cook.bio?.toLowerCase().includes(query);
      const matchesTags = cook.tags?.some(tag => tag.toLowerCase().includes(query));
      if (!matchesName && !matchesCity && !matchesBio && !matchesTags) return false;
    }

    // Open now filter
    if (filters.isOpen && !cook.is_open) return false;

    // City filter
    if (filters.city && cook.city !== filters.city) return false;

    // Tags filter
    if (filters.tags?.length > 0) {
      const hasAllTags = filters.tags.every(tag => cook.tags?.includes(tag));
      if (!hasAllTags) return false;
    }

    return true;
  }) || [];

  const activeFiltersCount = [
    filters.isOpen,
    filters.city,
    ...(filters.tags || []),
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">חיפוש מוכרים</h1>
        <div className="relative max-w-xl">
          <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="חפשו לפי שם, עיר או סגנון..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full h-12 pr-12 rounded-xl border-2 border-gray-200 focus:border-orange-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <SearchFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        {/* Results */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              {isLoading ? 'טוען...' : `נמצאו ${filteredCooks.length} מוכרים`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : filteredCooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCooks.map((cook) => (
                <CookCard 
                  key={cook.id} 
                  cook={cook} 
                  dailySpecial={getDailySpecialForCook(cook.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">לא נמצאו מוכרים</h3>
              <p className="text-gray-500">נסו לשנות את הסינון או לחפש משהו אחר</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}