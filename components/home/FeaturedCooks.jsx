import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Star, Clock, MapPin, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedCooks({ cooks, isLoading }) {
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">מוכרים מובילים</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">מוכרים מובילים</h2>
        <Link 
          to={createPageUrl('Search')}
          className="text-orange-600 hover:text-orange-700 font-medium"
        >
          הצג הכל ←
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cooks.map((cook) => (
          <Link key={cook.id} to={createPageUrl(`CookProfile?id=${cook.id}`)}>
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={cook.cover_image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'}
                  alt={cook.display_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {cook.is_open ? (
                  <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                    פתוח עכשיו
                  </Badge>
                ) : (
                  <Badge className="absolute top-4 right-4 bg-gray-500 text-white">
                    סגור
                  </Badge>
                )}

                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full border-3 border-white overflow-hidden bg-white">
                    <img
                      src={cook.profile_image || `https://ui-avatars.com/api/?name=${cook.display_name}&background=F97316&color=fff`}
                      alt={cook.display_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold text-lg">{cook.display_name}</h3>
                    <div className="flex items-center gap-1 text-sm opacity-90">
                      <MapPin className="w-3 h-3" />
                      <span>{cook.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">{cook.bio}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{cook.avg_rating?.toFixed(1) || '5.0'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{cook.estimated_prep_time || 30} דק'</span>
                    </div>
                  </div>

                  {cook.tags?.length > 0 && (
                    <div className="flex gap-1">
                      {cook.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}