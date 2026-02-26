import React, { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, X, ChevronDown } from 'lucide-react';

export default function DishCustomizationModal({ dish, isOpen, onClose, onAddToCart }) {
  const [removedItems, setRemovedItems] = useState([]);
  const [extraToppings, setExtraToppings] = useState({});
  const [quantity, setQuantity] = useState(1);

  const removableItems = dish.customization_options?.removable_items || [];
  const availableToppings = dish.customization_options?.extra_toppings || [];

  const toggleRemovedItem = (item) => {
    if (removedItems.includes(item)) {
      setRemovedItems(removedItems.filter(i => i !== item));
    } else {
      setRemovedItems([...removedItems, item]);
    }
  };

  const updateTopping = (topping, change) => {
    const current = extraToppings[topping.name] || 0;
    const newValue = Math.max(0, current + change);
    if (newValue === 0) {
      const newToppings = { ...extraToppings };
      delete newToppings[topping.name];
      setExtraToppings(newToppings);
    } else {
      setExtraToppings({ ...extraToppings, [topping.name]: newValue });
    }
  };

  const calculateTotal = () => {
    let total = dish.price;
    availableToppings.forEach(topping => {
      const count = extraToppings[topping.name] || 0;
      total += topping.price * count;
    });
    return total * quantity;
  };

  const handleAdd = () => {
    const customizations = {
      removed: removedItems,
      extra: Object.entries(extraToppings).map(([name, count]) => ({
        name,
        count,
        price: availableToppings.find(t => t.name === name).price
      }))
    };
    
    onAddToCart(dish, quantity, customizations);
    onClose();
    
    // Reset state
    setRemovedItems([]);
    setExtraToppings({});
    setQuantity(1);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-0 p-0 bg-white shadow-2xl" dir="rtl">
        {/* iOS-style handle */}
        <div className="flex justify-center pt-3 pb-2 bg-white">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">התאמה אישית</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(90vh-140px)] px-5">
          <div className="space-y-4 py-5">
          {/* Dish Preview Card */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={dish.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                alt={dish.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 text-gray-900">{dish.title}</h3>
              <p className="text-gray-500 text-sm mb-2 line-clamp-2">{dish.description}</p>
              <span className="text-lg font-bold text-orange-600">₪{dish.price}</span>
            </div>
          </div>

          {/* Remove Items */}
          {removableItems.length > 0 && (
            <div>
              <h4 className="font-semibold text-base text-gray-900 mb-3">מה להוריד מהמוצר?</h4>
              <div className="space-y-2">
                {removableItems.map((item) => (
                  <label 
                    key={item}
                    htmlFor={`remove-${item}`}
                    className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${
                      removedItems.includes(item) 
                        ? 'bg-red-50' 
                        : 'bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    <Checkbox
                      id={`remove-${item}`}
                      checked={removedItems.includes(item)}
                      onCheckedChange={() => toggleRemovedItem(item)}
                      className="rounded-full data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                    />
                    <span className="flex-1 font-medium text-gray-900">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Extra Toppings */}
          {availableToppings.length > 0 && (
            <div>
              <h4 className="font-semibold text-base text-gray-900 mb-3">תוספות לבחירה</h4>
              <div className="space-y-2">
                {availableToppings.map((topping) => (
                  <div 
                    key={topping.name} 
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      extraToppings[topping.name] 
                        ? 'bg-orange-50' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{topping.name}</p>
                      <p className="text-sm text-orange-600 font-semibold">+₪{topping.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className="w-9 h-9 rounded-full bg-white active:bg-gray-100 flex items-center justify-center shadow-sm border border-gray-200 disabled:opacity-40 transition-all active:scale-95"
                        onClick={() => updateTopping(topping, -1)}
                        disabled={!extraToppings[topping.name]}
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="font-bold text-lg min-w-[2rem] text-center text-gray-900">
                        {extraToppings[topping.name] || 0}
                      </span>
                      <button
                        className="w-9 h-9 rounded-full bg-orange-500 active:bg-orange-600 flex items-center justify-center shadow-sm transition-all active:scale-95"
                        onClick={() => updateTopping(topping, 1)}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h4 className="font-semibold text-base text-gray-900 mb-3">כמות</h4>
            <div className="flex items-center justify-center gap-4 bg-gray-50 p-4 rounded-xl">
              <button
                className="w-11 h-11 rounded-full bg-white active:bg-gray-100 flex items-center justify-center shadow-sm border border-gray-200 transition-all active:scale-95"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-5 h-5 text-gray-700" />
              </button>
              <span className="font-bold text-3xl min-w-[3rem] text-center text-gray-900">
                {quantity}
              </span>
              <button
                className="w-11 h-11 rounded-full bg-orange-500 active:bg-orange-600 flex items-center justify-center shadow-sm transition-all active:scale-95"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="h-20"></div>
        </div>
        </div> {/* End of overflow-y-auto content div */}

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5 safe-area-bottom">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 font-medium">סה"כ לתשלום</span>
            <span className="text-2xl font-bold text-orange-600">₪{calculateTotal()}</span>
          </div>
          <button
            onClick={handleAdd}
            className="w-full h-14 bg-orange-500 active:bg-orange-600 text-white text-lg font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]"
          >
            הוסף לעגלה
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}