import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Star, Clock, MapPin, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function CookCard({ cook, dailySpecial }) {
  return (
    <Link to={createPageUrl(`CookProfile?id=${cook.id}`)}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white h-full">
        <div className="relative h-40 overflow-hidden">
          <img
            src={cook.cover_image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'}
            alt={cook.display_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute top-3 right-3 flex gap-2">
            {cook.is_open ? (
              <Badge className="bg-green-500 text-white text-xs">פתוח</Badge>
            ) : (
              <Badge className="bg-gray-500 text-white text-xs">סגור</Badge>
            )}
            {dailySpecial && (
              <Badge className="bg-amber-500 text-white text-xs gap-1">
                <Sparkles className="w-3 h-3" />
                מנת היום
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white">
              <img
                src={cook.profile_image || `https://ui-avatars.com/api/?name=${cook.display_name}&background=F97316&color=fff`}
                alt={cook.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white">
              <h3 className="font-bold">{cook.display_name}</h3>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <MapPin className="w-4 h-4" />
            <span>{cook.city}</span>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{cook.bio}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-sm">{cook.avg_rating?.toFixed(1) || '5.0'}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Clock className="w-4 h-4" />
                <span>{cook.estimated_prep_time || 30} דק'</span>
              </div>
            </div>

            {cook.min_order_amount > 0 && (
              <span className="text-xs text-gray-500">
                מינימום ₪{cook.min_order_amount}
              </span>
            )}
          </div>

          {cook.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {cook.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}