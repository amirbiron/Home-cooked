import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Search, Store, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HeroSection({ onSearch }) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-white" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-300 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-200 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Store className="w-4 h-4" />
            <span>מוצרים ביתיים, ישירות מהמוכר</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            גלו מוצרים ביתיים
            <span className="block bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              ישירות מהמוכרים
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            מאות מוכרים ביתיים מוכשרים מחכים לכם עם מוצרים מיוחדים,
            מוכנים באהבה ובתשומת לב
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="חפשו לפי עיר, סגנון או שם מוכר..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pr-12 pl-32 text-lg rounded-2xl border-2 border-orange-200 focus:border-orange-400 bg-white shadow-lg"
              />
              <Button 
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 rounded-xl px-6"
              >
                חיפוש
              </Button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600">150+</div>
              <div className="text-gray-600">מוכרים פעילים</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-600">2,500+</div>
              <div className="text-gray-600">מוצרים לבחירה</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-3xl md:text-4xl font-bold text-orange-600">
                4.8 <Star className="w-6 h-6 fill-orange-400 text-orange-400" />
              </div>
              <div className="text-gray-600">דירוג ממוצע</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}