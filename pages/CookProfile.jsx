import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star, Clock, MapPin, Phone, Store,
  ShoppingCart, Sparkles, ArrowLeft, Instagram,
  Share2, Check, Copy
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import DishCard from '../components/cook/DishCard';

// חילוץ מזהה פוסט מקישור אינסטגרם
function extractInstagramPostId(url) {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

export default function CookProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(location.search);
  const cookId = urlParams.get('id');

  const [cart, setCart] = useState({ items: [] });
  const [user, setUser] = useState(null);
  // מצב לכפתור שיתוף לינק חנות
  const [storeLinkCopied, setStoreLinkCopied] = useState(false);

  // העתקת לינק החנות ללוח
  const copyStoreLink = () => {
    const link = `${window.location.origin}/store/${cookId}`;
    navigator.clipboard.writeText(link).then(() => {
      setStoreLinkCopied(true);
      setTimeout(() => setStoreLinkCopied(false), 2000);
    });
  };

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      loadCart(currentUser.email);
    } catch (e) {}
  };

  const loadCart = async (email) => {
    try {
      const carts = await base44.entities.Cart.filter({ 
        customer_email: email, 
        cook_id: cookId,
        status: 'active' 
      });
      if (carts.length > 0) {
        setCart(carts[0]);
      }
    } catch (e) {}
  };

  const { data: cook, isLoading: cookLoading } = useQuery({
    queryKey: ['cook', cookId],
    queryFn: async () => {
      const cooks = await base44.entities.Cook.filter({ id: cookId });
      return cooks[0];
    },
    enabled: !!cookId,
  });

  const { data: dishes, isLoading: dishesLoading } = useQuery({
    queryKey: ['dishes', cookId],
    queryFn: () => base44.entities.Dish.filter({ cook_id: cookId }, 'sort_order'),
    enabled: !!cookId,
  });

  const dailySpecial = dishes?.find(d => d.is_daily_special && d.is_available);

  const categories = ['main', 'appetizer', 'side', 'dessert', 'drink', 'other'];
  const categoryLabels = {
    main: 'מוצרים עיקריים',
    appetizer: 'ראשונות',
    side: 'תוספות',
    dessert: 'קינוחים',
    drink: 'שתייה',
    other: 'אחר'
  };

  const getCartQuantity = (dishId) => {
    return cart.items?.find(item => item.dish_id === dishId)?.quantity || 0;
  };

  const updateCart = async (newItems) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    // Close previous active carts from other cooks
    const allActiveCarts = await base44.entities.Cart.filter({ 
      customer_email: user.email, 
      status: 'active' 
    });
    
    for (const activeCart of allActiveCarts) {
      if (activeCart.cook_id !== cookId) {
        await base44.entities.Cart.update(activeCart.id, { status: 'abandoned' });
      }
    }

    const cartData = {
      customer_email: user.email,
      cook_id: cookId,
      items: newItems,
      status: 'active'
    };

    try {
      if (cart.id && cart.cook_id === cookId) {
        await base44.entities.Cart.update(cart.id, cartData);
        setCart({ ...cart, items: newItems });
      } else {
        const newCart = await base44.entities.Cart.create(cartData);
        setCart(newCart);
      }
      queryClient.invalidateQueries(['cart']);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = (dish, quantity = 1, customizations = null) => {
    let newItems = [...(cart.items || [])];
    
    if (customizations) {
      // Add as new item with customizations
      const extraPrice = customizations.extra.reduce((sum, item) => sum + (item.price * item.count), 0);
      newItems.push({
        dish_id: dish.id,
        title: dish.title,
        price: dish.price + extraPrice,
        base_price: dish.price,
        quantity: quantity,
        photo_url: dish.photo_url,
        customizations: customizations
      });
    } else {
      // Simple add without customization
      const existingItem = cart.items?.find(item => 
        item.dish_id === dish.id && !item.customizations
      );
      
      if (existingItem) {
        newItems = cart.items.map(item => 
          item.dish_id === dish.id && !item.customizations
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems.push({
          dish_id: dish.id,
          title: dish.title,
          price: dish.price,
          quantity: 1,
          photo_url: dish.photo_url
        });
      }
    }
    
    updateCart(newItems);
  };

  const handleRemoveFromCart = (dish) => {
    const existingItem = cart.items?.find(item => item.dish_id === dish.id);
    if (!existingItem) return;

    let newItems;
    if (existingItem.quantity === 1) {
      newItems = cart.items.filter(item => item.dish_id !== dish.id);
    } else {
      newItems = cart.items.map(item => 
        item.dish_id === dish.id 
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    }
    
    updateCart(newItems);
  };

  const cartTotal = cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const cartItemsCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (cookLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!cook) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">מוכר לא נמצא</h2>
        <Button onClick={() => navigate(createPageUrl('Search'))}>
          חזרה לחיפוש
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-32">
      {/* Cover & Profile */}
      <div className="relative h-56 md:h-72">
        <img
          src={cook.cover_image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200'}
          alt={cook.display_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute bottom-0 right-0 left-0 p-6">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-lg">
              <img
                src={cook.profile_image || `https://ui-avatars.com/api/?name=${cook.display_name}&background=F97316&color=fff&size=200`}
                alt={cook.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-white pb-2">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{cook.display_name}</h1>
                {cook.is_open ? (
                  <Badge className="bg-green-500">פתוח</Badge>
                ) : (
                  <Badge className="bg-gray-500">סגור</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{cook.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{cook.avg_rating?.toFixed(1) || '5.0'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{cook.estimated_prep_time || 30} דק' הכנה</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-6">
        <p className="text-gray-600 mb-4">{cook.bio}</p>
        
        {cook.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {cook.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}

        {cook.min_order_amount > 0 && (
          <p className="text-sm text-gray-500 mb-4">
            מינימום הזמנה: ₪{cook.min_order_amount}
          </p>
        )}

        {/* כפתור שיתוף לינק החנות */}
        <Button
          variant="outline"
          size="sm"
          onClick={copyStoreLink}
          className="mb-4"
        >
          {storeLinkCopied ? (
            <>
              <Check className="w-4 h-4 ml-2 text-green-500" />
              הלינק הועתק!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 ml-2" />
              שיתוף לינק חנות
            </>
          )}
        </Button>

        {/* הטמעת אינסטגרם של המוכר */}
        {cook.instagram_url && extractInstagramPostId(cook.instagram_url) && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Instagram className="w-5 h-5 text-pink-500" />
              <h3 className="font-bold text-lg">אינסטגרם</h3>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <iframe
                src={`https://www.instagram.com/p/${extractInstagramPostId(cook.instagram_url)}/embed`}
                width="100%"
                height="500"
                frameBorder="0"
                scrolling="no"
                allowTransparency="true"
                allow="encrypted-media"
                title="פוסט אינסטגרם"
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Daily Special */}
        {dailySpecial && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-6 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-lg">מוצר היום</h3>
            </div>
            <DishCard 
              dish={dailySpecial}
              cartQuantity={getCartQuantity(dailySpecial.id)}
              onAdd={handleAddToCart}
              onRemove={handleRemoveFromCart}
              isOpen={cook.is_open}
            />
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4">הקטלוג</h2>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full flex overflow-x-auto mb-6 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="all" className="flex-1 rounded-lg">הכל</TabsTrigger>
            {categories.map((cat) => {
              const count = dishes?.filter(d => d.category === cat).length || 0;
              if (count === 0) return null;
              return (
                <TabsTrigger key={cat} value={cat} className="flex-1 rounded-lg whitespace-nowrap">
                  {categoryLabels[cat]}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all" className="grid grid-cols-2 gap-4">
            {dishes?.filter(d => !d.is_daily_special).map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                cartQuantity={getCartQuantity(dish.id)}
                onAdd={handleAddToCart}
                onRemove={handleRemoveFromCart}
                isOpen={cook.is_open}
              />
            ))}
          </TabsContent>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="grid grid-cols-2 gap-4">
              {dishes?.filter(d => d.category === cat && !d.is_daily_special).map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  cartQuantity={getCartQuantity(dish.id)}
                  onAdd={handleAddToCart}
                  onRemove={handleRemoveFromCart}
                  isOpen={cook.is_open}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Floating Cart Button */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-4 right-4 max-w-lg mx-auto z-40">
          <Button
            onClick={() => navigate(createPageUrl('Cart'))}
            className="w-full h-14 bg-orange-500 hover:bg-orange-600 rounded-2xl shadow-xl flex items-center justify-between px-6"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold">{cartItemsCount} פריטים</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">₪{cartTotal}</span>
              <ArrowLeft className="w-5 h-5" />
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}