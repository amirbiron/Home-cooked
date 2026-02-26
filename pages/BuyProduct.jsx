import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart, MapPin, Phone, User,
  Instagram, ArrowLeft, Loader2, Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

// חילוץ מזהה פוסט מקישור אינסטגרם
function extractInstagramPostId(url) {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

export default function BuyProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // טופס הזמנה
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    shipping_street: '',
    shipping_city: '',
    shipping_floor: '',
    shipping_apartment: ''
  });

  // טעינת המוצר לפי מזהה
  const { data: dish, isLoading: dishLoading } = useQuery({
    queryKey: ['dish', productId],
    queryFn: async () => {
      const dishes = await base44.entities.Dish.filter({ id: productId });
      return dishes[0] || null;
    },
    enabled: !!productId,
  });

  // טעינת המוכר לפי מזהה המוכר של המוצר
  const { data: cook, isLoading: cookLoading } = useQuery({
    queryKey: ['cook', dish?.cook_id],
    queryFn: async () => {
      const cooks = await base44.entities.Cook.filter({ id: dish.cook_id });
      return cooks[0] || null;
    },
    enabled: !!dish?.cook_id,
  });

  // עלות משלוח קבועה
  const SHIPPING_COST = 25;

  // שליחת הזמנה
  const handleSubmit = async () => {
    if (!formData.customer_name || !formData.customer_phone || !formData.shipping_street || !formData.shipping_city) {
      toast({
        title: 'שדות חובה חסרים',
        description: 'יש למלא שם, טלפון, רחוב ועיר',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        cook_id: cook.id,
        cook_name: cook.display_name,
        items: [{
          dish_id: dish.id,
          title: dish.title,
          price: dish.price,
          quantity: 1,
          photo_url: dish.photo_url
        }],
        total_amount: dish.price + SHIPPING_COST,
        products_total: dish.price,
        shipping_cost: SHIPPING_COST,
        commission_amount: dish.price * 0.05,
        shipping_address: {
          street: formData.shipping_street,
          city: formData.shipping_city,
          floor: formData.shipping_floor,
          apartment: formData.shipping_apartment
        },
        status: 'received',
        payment_method: 'bit',
        payment_status: 'unpaid',
        status_history: [{
          status: 'received',
          timestamp: new Date().toISOString(),
          note: 'הזמנה התקבלה'
        }]
      };

      // ניסיון לקבל מייל משתמש מחובר
      try {
        const user = await base44.auth.me();
        if (user?.email) {
          orderData.customer_email = user.email;
        }
      } catch (e) {
        // משתמש לא מחובר - ממשיכים בלי מייל
      }

      const order = await base44.entities.Order.create(orderData);

      // עדכון מספר הזמנות של המוכר
      await base44.entities.Cook.update(cook.id, {
        total_orders: (cook.total_orders || 0) + 1
      });

      toast({
        title: 'ההזמנה נשלחה בהצלחה!',
        description: 'המוכר יצור איתך קשר בקרוב'
      });

      navigate(createPageUrl(`OrderTracking?id=${order.id}`));
    } catch (e) {
      console.error(e);
      toast({
        title: 'שגיאה בשליחת ההזמנה',
        description: 'אנא נסו שנית',
        variant: 'destructive'
      });
    }
    setIsSubmitting(false);
  };

  // מצב טעינה
  if (dishLoading || cookLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8" dir="rtl">
        <Skeleton className="h-64 w-full rounded-2xl mb-6" />
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  // מוצר לא נמצא
  if (!dish) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center" dir="rtl">
        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">מוצר לא נמצא</h2>
        <p className="text-gray-500 mb-6">המוצר שחיפשת לא קיים או שהוסר</p>
        <Button
          onClick={() => navigate(createPageUrl('Home'))}
          className="bg-orange-500 hover:bg-orange-600"
        >
          לדף הבית
        </Button>
      </div>
    );
  }

  const instagramPostId = extractInstagramPostId(dish.instagram_url);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-32" dir="rtl">
      {/* תמונת המוצר */}
      <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg">
        <img
          src={dish.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
          alt={dish.title}
          className="w-full h-64 md:h-80 object-cover"
        />
        {!dish.is_available && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-bold text-xl">מוצר לא זמין כרגע</span>
          </div>
        )}
      </div>

      {/* פרטי המוצר */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl md:text-3xl font-bold">{dish.title}</h1>
          <span className="text-2xl font-bold text-orange-500">₪{dish.price}</span>
        </div>
        {dish.description && (
          <p className="text-gray-600 text-lg leading-relaxed mb-4">{dish.description}</p>
        )}
        {dish.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {dish.tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
        {dish.allergens?.length > 0 && (
          <p className="text-sm text-amber-600 mb-4">
            אלרגנים: {dish.allergens.join(', ')}
          </p>
        )}
      </div>

      {/* פרטי המוכר */}
      {cook && (
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={cook.profile_image || `https://ui-avatars.com/api/?name=${cook.display_name}&background=F97316&color=fff&size=100`}
                alt={cook.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{cook.display_name}</h3>
              {cook.city && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin className="w-3 h-3" />
                  <span>{cook.city}</span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(createPageUrl(`CookProfile?id=${cook.id}`))}
            >
              לחנות
              <ArrowLeft className="w-4 h-4 mr-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* הטמעת אינסטגרם */}
      {instagramPostId && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Instagram className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-lg">הצצה לאינסטגרם</h3>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-200">
            <iframe
              src={`https://www.instagram.com/p/${instagramPostId}/embed`}
              width="100%"
              height="480"
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

      {/* טופס הזמנה */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">פרטי הזמנה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* שם */}
          <div>
            <Label htmlFor="name" className="text-base font-bold block mb-2">
              <User className="w-4 h-4 inline ml-1" />
              שם מלא
            </Label>
            <Input
              id="name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              placeholder="הכנס את שמך המלא"
              className="h-12 text-base border-2 rounded-xl"
            />
          </div>

          {/* טלפון */}
          <div>
            <Label htmlFor="phone" className="text-base font-bold block mb-2">
              <Phone className="w-4 h-4 inline ml-1" />
              טלפון
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              placeholder="050-0000000"
              dir="ltr"
              className="h-12 text-base border-2 rounded-xl text-right"
            />
          </div>

          {/* כתובת למשלוח */}
          <div>
            <Label className="text-base font-bold block mb-2">
              <MapPin className="w-4 h-4 inline ml-1" />
              כתובת למשלוח
            </Label>
            <div className="space-y-3">
              <Input
                value={formData.shipping_street}
                onChange={(e) => setFormData({ ...formData, shipping_street: e.target.value })}
                placeholder="רחוב ומספר בית"
                className="h-12 text-base border-2 rounded-xl"
              />
              <Input
                value={formData.shipping_city}
                onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                placeholder="עיר"
                className="h-12 text-base border-2 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={formData.shipping_floor}
                  onChange={(e) => setFormData({ ...formData, shipping_floor: e.target.value })}
                  placeholder="קומה"
                  className="h-12 text-base border-2 rounded-xl"
                />
                <Input
                  value={formData.shipping_apartment}
                  onChange={(e) => setFormData({ ...formData, shipping_apartment: e.target.value })}
                  placeholder="דירה"
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* סיכום הזמנה */}
      <Card className="mb-6 border-2 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-xl">סיכום הזמנה</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{dish.title} x 1</span>
              <span className="font-bold">₪{dish.price}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">משלוח</span>
              <span className="font-bold">₪{SHIPPING_COST}</span>
            </div>
            <div className="border-t border-orange-200 pt-3 flex justify-between items-center">
              <span className="text-lg font-bold">סה"כ לתשלום</span>
              <span className="text-xl font-bold text-orange-600">₪{dish.price + SHIPPING_COST}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* כפתור שליחת הזמנה */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !dish.is_available}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-2xl shadow-xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                שולח הזמנה...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 ml-2" />
                שליחת הזמנה - ₪{dish.price + SHIPPING_COST}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
