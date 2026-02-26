import React from 'react';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const CITIES = ['תל אביב', 'חיפה', 'ירושלים', 'באר שבע', 'ראשון לציון', 'פתח תקווה'];
const TAGS = ['כשר', 'טבעוני', 'צמחוני', 'ללא גלוטן', 'ביתי', 'אסייתי', 'איטלקי', 'מרוקאי'];

export default function SearchFilters({ filters, onFiltersChange, activeFiltersCount }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggleTag = (tag) => {
    const newTags = filters.tags?.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...(filters.tags || []), tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleToggleCity = (city) => {
    const newCity = filters.city === city ? '' : city;
    onFiltersChange({ ...filters, city: newCity });
  };

  const clearFilters = () => {
    onFiltersChange({ query: filters.query, isOpen: false, city: '', tags: [] });
  };

  const MobileFiltersContent = () => (
    <div className="space-y-6">
      {/* Open Now */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="mobile-open-now" className="text-base font-semibold text-gray-900">
            פתוח עכשיו בלבד
          </Label>
          <Switch
            id="mobile-open-now"
            checked={filters.isOpen || false}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, isOpen: checked })}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <Label className="mb-3 block text-base font-semibold text-gray-900">בחר עיר</Label>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleToggleCity(city)}
              className={`px-4 py-2 rounded-xl font-medium transition-all active:scale-95 ${
                filters.city === city
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label className="mb-3 block text-base font-semibold text-gray-900">סגנון מטבח</Label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleToggleTag(tag)}
              className={`px-4 py-2 rounded-xl font-medium transition-all active:scale-95 ${
                filters.tags?.includes(tag)
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  );

  const DesktopFiltersContent = () => (
    <div className="space-y-6">
      {/* Open Now */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="desktop-open-now" className="font-semibold text-gray-900">
            פתוח עכשיו
          </Label>
          <Switch
            id="desktop-open-now"
            checked={filters.isOpen || false}
            onCheckedChange={(checked) => onFiltersChange({ ...filters, isOpen: checked })}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <Label className="font-semibold mb-3 block text-gray-900">עיר</Label>
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => handleToggleCity(city)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-sm ${
                filters.city === city
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label className="font-semibold mb-3 block text-gray-900">סגנון מטבח</Label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleToggleTag(tag)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-sm ${
                filters.tags?.includes(tag)
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full hover:bg-gray-50 border-2">
          <X className="w-4 h-4 ml-2" />
          נקה סינון ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full h-12 gap-2 text-base font-medium border-2">
              <SlidersHorizontal className="w-5 h-5" />
              סינון מסעדות
              {activeFiltersCount > 0 && (
                <Badge className="bg-orange-500 text-white">{activeFiltersCount}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl border-0 p-0 bg-white" dir="rtl">
            {/* iOS-style handle */}
            <div className="flex justify-center pt-3 pb-2 bg-white sticky top-0 z-10">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="sticky top-9 bg-white border-b border-gray-100 px-5 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">סינון תוצאות</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(85vh-120px)] px-5 py-5">
              <MobileFiltersContent />
            </div>

            {/* Fixed Bottom Button */}
            {activeFiltersCount > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full h-14 text-base font-bold rounded-2xl border-2 hover:bg-gray-50"
                >
                  <X className="w-5 h-5 ml-2" />
                  נקה את כל הסינון ({activeFiltersCount})
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
          <SlidersHorizontal className="w-5 h-5" />
          סינון תוצאות
        </h3>
        <DesktopFiltersContent />
      </div>
    </>
  );
}