import React, { useState } from 'react';
import { Sparkles, Plus, Minus, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DishCustomizationModal from './DishCustomizationModal';

export default function DishCard({ dish, cartQuantity = 0, onAdd, onRemove, isOpen }) {
  const [showCustomization, setShowCustomization] = useState(false);
  const hasCustomization = dish.customization_options?.removable_items?.length > 0 || 
                          dish.customization_options?.extra_toppings?.length > 0;

  const handleAddClick = () => {
    if (hasCustomization) {
      setShowCustomization(true);
    } else {
      onAdd(dish);
    }
  };

  const handleCustomizedAdd = (dish, quantity, customizations) => {
    onAdd(dish, quantity, customizations);
  };

  return (
    <>
      <div className={`relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
        !dish.is_available ? 'opacity-60' : 'hover:scale-[1.02] hover:shadow-2xl'
      }`}>
        {/* Add Button - Top Left */}
        {dish.is_available && isOpen && cartQuantity === 0 && (
          <button
            onClick={handleAddClick}
            className="absolute top-3 left-3 z-10 w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Quantity Controls - Top Left */}
        {cartQuantity > 0 && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-blue-500 rounded-full px-1 py-1 shadow-lg">
            <button
              onClick={() => onRemove(dish)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all active:scale-95"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="font-bold text-white min-w-[1.5rem] text-center text-sm">
              {cartQuantity}
            </span>
            <button
              onClick={handleAddClick}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Discount/Special Badge - Top Right */}
        {dish.is_daily_special && (
          <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            מוצר היום
          </div>
        )}

        {/* Image */}
        <div className="relative w-full aspect-square bg-white">
          <img
            src={dish.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
            alt={dish.title}
            className="w-full h-full object-cover"
          />
          {!dish.is_available && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-white font-bold text-lg">אזל מהמלאי</span>
            </div>
          )}
        </div>

        {/* Content - Dark Background */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-bold text-white text-base mb-2 line-clamp-2 min-h-[2.5rem]">
            {dish.title}
          </h3>

          {/* Tags */}
          {dish.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {dish.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Special Note */}
          {dish.daily_special_note && dish.is_daily_special && (
            <p className="text-orange-400 text-xs italic mb-2 line-clamp-1">
              "{dish.daily_special_note}"
            </p>
          )}

          {/* Allergens Warning */}
          {dish.allergens?.length > 0 && (
            <div className="flex items-center gap-1 mb-3">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-xs text-amber-400">
                {dish.allergens.join(', ')}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-400">₪{dish.price}</span>
          </div>

          {/* Closed Status */}
          {!isOpen && dish.is_available && (
            <p className="text-red-400 text-xs mt-2 font-medium">המוכר סגור כרגע</p>
          )}
        </div>
      </div>

      {hasCustomization && (
        <DishCustomizationModal
          dish={dish}
          isOpen={showCustomization}
          onClose={() => setShowCustomization(false)}
          onAddToCart={handleCustomizedAdd}
        />
      )}
    </>
  );
}