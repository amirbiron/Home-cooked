import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Sparkles, Star, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DailySpecials({ dishes, cooks, isLoading }) {
  if (isLoading) {
    return (
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">מנות היום</h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="flex-shrink-0 w-72 h-80 rounded-2xl bg-white/20" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!dishes || dishes.length === 0) return null;

  const getCookName = (cookId) => {
    const cook = cooks?.find(c => c.id === cookId);
    return cook?.display_name || 'מבשל';
  };

  return (
    <section className="bg-gradient-to-r from-orange-500 to-amber-500 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-8 h-8 text-white" />
          <h2 className="text-2xl md:text-3xl font-bold text-white">מנות היום</h2>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {dishes.map((dish) => (
            <Link 
              key={dish.id} 
              to={createPageUrl(`CookProfile?id=${dish.cook_id}`)}
              className="flex-shrink-0 w-72"
            >
              <Card className="overflow-hidden bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 group">
                <div className="relative h-44">
                  <img
                    src={dish.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                    alt={dish.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className="absolute top-3 right-3 bg-amber-500 text-white gap-1">
                    <Sparkles className="w-3 h-3" />
                    מנת היום
                  </Badge>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{dish.title}</h3>
                  <p className="text-gray-500 text-sm mb-3">{getCookName(dish.cook_id)}</p>
                  
                  {dish.daily_special_note && (
                    <p className="text-orange-600 text-sm italic mb-3">"{dish.daily_special_note}"</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-600">₪{dish.price}</span>
                    <span className="text-orange-500 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      הזמנה <ArrowLeft className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}