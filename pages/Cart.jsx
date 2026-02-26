import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart, Plus, Minus, Trash2, Store,
  ArrowRight, CreditCard, Banknote, Smartphone,
  MapPin, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [user, setUser] = useState(null);
  const [carts, setCarts] = useState([]);
  const [cooks, setCooks] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // עלות משלוח קבועה ואחוז עמלה
  const SHIPPING_COST = 25;
  const COMMISSION_RATE = 0.05;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_note: '',
    pickup_note: '',
    payment_method: 'bit',
    shipping_street: '',
    shipping_city: '',
    shipping_floor: '',
    shipping_apartment: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        customer_name: currentUser.full_name || '',
        customer_phone: currentUser.phone || ''
      }));

      const activeCarts = await base44.entities.Cart.filter({ 
        customer_email: currentUser.email, 
        status: 'active' 
      });
      
      const cartsWithItems = activeCarts.filter(cart => cart.items?.length > 0);
      setCarts(cartsWithItems);
      
      // Load all cooks for these carts
      const cookIds = [...new Set(cartsWithItems.map(cart => cart.cook_id))];
      const cooksData = {};
      for (const cookId of cookIds) {
        const cookList = await base44.entities.Cook.filter({ id: cookId });
        if (cookList.length > 0) {
          cooksData[cookId] = cookList[0];
        }
      }
      setCooks(cooksData);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
    setIsLoading(false);
  };

  const updateCartItem = async (cartId, itemIndex, newQuantity) => {
    const cart = carts.find(c => c.id === cartId);
    if (!cart) return;

    let newItems;
    if (newQuantity <= 0) {
      newItems = cart.items.filter((_, index) => index !== itemIndex);
    } else {
      newItems = cart.items.map((item, index) => 
        index === itemIndex
          ? { ...item, quantity: newQuantity }
          : item
      );
    }

    await base44.entities.Cart.update(cartId, { items: newItems });
    setCarts(carts.map(c => c.id === cartId ? { ...c, items: newItems } : c));
    queryClient.invalidateQueries(['cart']);
  };

  const clearCart = async (cartId) => {
    await base44.entities.Cart.update(cartId, { items: [], status: 'abandoned' });
    setCarts(carts.filter(c => c.id !== cartId));
    queryClient.invalidateQueries(['cart']);
  };

  // סכום המוצרים בלבד
  const productsTotal = carts.reduce((total, cart) =>
    total + (cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0), 0
  );

  // עמלת פלטפורמה
  const commissionAmount = Math.round(productsTotal * COMMISSION_RATE * 100) / 100;

  // סה"כ כולל משלוח
  const cartTotal = productsTotal + SHIPPING_COST;

  const handleSubmitOrder = async () => {
    if (carts.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const orders = [];
      
      // Create order for each cart
      for (const cart of carts) {
        const cook = cooks[cart.cook_id];
        if (!cook) continue;
        
        const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const orderTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // חישוב עמלה לכל הזמנה
        const orderCommission = Math.round(orderTotal * COMMISSION_RATE * 100) / 100;

        const orderData = {
          order_number: orderNumber,
          customer_email: user.email,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          cook_id: cook.id,
          cook_name: cook.display_name,
          items: cart.items,
          total_amount: orderTotal + SHIPPING_COST,
          products_total: orderTotal,
          shipping_cost: SHIPPING_COST,
          commission_amount: orderCommission,
          shipping_address: {
            street: formData.shipping_street,
            city: formData.shipping_city,
            floor: formData.shipping_floor,
            apartment: formData.shipping_apartment
          },
          status: 'received',
          payment_method: formData.payment_method,
          payment_status: 'unpaid',
          customer_note: formData.customer_note,
          pickup_note: formData.pickup_note,
          status_history: [{
            status: 'received',
            timestamp: new Date().toISOString(),
            note: 'הזמנה התקבלה'
          }]
        };

        const order = await base44.entities.Order.create(orderData);
        orders.push(order);
        
        await base44.entities.Cart.update(cart.id, { status: 'converted' });
        await base44.entities.Cook.update(cook.id, { 
          total_orders: (cook.total_orders || 0) + 1 
        });
      }
      
      // Navigate to first order or orders page
      if (orders.length === 1) {
        navigate(createPageUrl(`OrderTracking?id=${orders[0].id}`));
      } else {
        navigate(createPageUrl('MyOrders'));
      }
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (carts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">העגלה ריקה</h2>
        <p className="text-gray-500 mb-6">הוסיפו מוצרים מהמוכרים שלנו</p>
        <Button 
          onClick={() => navigate(createPageUrl('Search'))}
          className="bg-orange-500 hover:bg-orange-600"
        >
          לחיפוש מוכרים
        </Button>
      </div>
    );
  }

  const allMeetMinimum = carts.every(cart => {
    const cook = cooks[cart.cook_id];
    const cartTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return !cook?.min_order_amount || cartTotal >= cook.min_order_amount;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 md:py-8 pb-32">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
        העגלה שלי ({carts.length} {carts.length === 1 ? 'מוכר' : 'מוכרים'})
      </h1>

      {/* Cart Items per Cook */}
      {carts.map((cart) => {
        const cook = cooks[cart.cook_id];
        const cookCartTotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const meetsMinimum = !cook?.min_order_amount || cookCartTotal >= cook.min_order_amount;
        
        return (
          <div key={cart.id} className="mb-6 md:mb-8">
            {/* Cook Info */}
            {cook && (
              <Card className="mb-3 md:mb-4">
                <CardContent className="p-3 md:p-4 flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={cook.profile_image || `https://ui-avatars.com/api/?name=${cook.display_name}&background=F97316&color=fff`}
                      alt={cook.display_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg truncate">{cook.display_name}</h3>
                    <p className="text-gray-500 text-xs md:text-sm">{cook.city}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 flex-shrink-0"
                    onClick={() => clearCart(cart.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Cart Items */}
            <Card className="mb-3 md:mb-4">
              <CardContent className="divide-y p-3 md:p-4">
                {cart.items.map((item, index) => (
                  <div key={`${item.dish_id}-${index}`} className="py-3 md:py-4 first:pt-0 last:pb-0">
                    {/* Mobile Layout */}
                    <div className="flex md:hidden gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.title}</h4>
                        {item.customizations && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.customizations.removed?.length > 0 && (
                              <div className="truncate">בלי: {item.customizations.removed.join(', ')}</div>
                            )}
                            {item.customizations.extra?.length > 0 && (
                              <div className="truncate">
                                תוספות: {item.customizations.extra.map(e => `${e.name} (${e.count})`).join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-orange-600 font-bold text-sm mt-1">₪{item.price}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateCartItem(cart.id, index, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="font-bold min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 rounded-full"
                              onClick={() => updateCartItem(cart.id, index, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <span className="font-bold text-sm">
                            ₪{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        {item.customizations && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.customizations.removed?.length > 0 && (
                              <div>בלי: {item.customizations.removed.join(', ')}</div>
                            )}
                            {item.customizations.extra?.length > 0 && (
                              <div>
                                תוספות: {item.customizations.extra.map(e => `${e.name} (${e.count})`).join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-orange-600 font-bold">₪{item.price}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateCartItem(cart.id, index, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold min-w-[1.5rem] text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 rounded-full"
                          onClick={() => updateCartItem(cart.id, index, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <span className="font-bold min-w-[3rem] text-left">
                        ₪{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cart Subtotal */}
            <Card className="mb-3 md:mb-4">
              <CardContent className="p-3 md:p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm md:text-base">סה"כ מ-{cook?.display_name}</span>
                  <span className="text-orange-600 font-bold text-base md:text-lg">₪{cookCartTotal}</span>
                </div>
                {!meetsMinimum && (
                  <p className="text-red-500 text-xs md:text-sm mt-2">
                    מינימום הזמנה: ₪{cook.min_order_amount}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}

      {/* Order Details */}
      <Card className="mb-4 md:mb-6">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">פרטי ההזמנה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0 md:pt-0">
          <div>
            <Label htmlFor="name">שם מלא</Label>
            <Input
              id="name"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              placeholder="השם שלכם"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">טלפון</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
              placeholder="050-0000000"
            />
          </div>
          
          {/* כתובת למשלוח */}
          <div className="border-t pt-3 md:pt-4 mt-3 md:mt-4">
            <h3 className="font-medium text-sm md:text-base mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              כתובת למשלוח
            </h3>
            <div className="space-y-3 md:space-y-4">
              <div>
                <Label htmlFor="shipping_street">כתובת רחוב</Label>
                <Input
                  id="shipping_street"
                  value={formData.shipping_street}
                  onChange={(e) => setFormData({...formData, shipping_street: e.target.value})}
                  placeholder="שם הרחוב ומספר בית"
                />
              </div>
              <div>
                <Label htmlFor="shipping_city">עיר</Label>
                <Input
                  id="shipping_city"
                  value={formData.shipping_city}
                  onChange={(e) => setFormData({...formData, shipping_city: e.target.value})}
                  placeholder="שם העיר"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="shipping_floor">קומה</Label>
                  <Input
                    id="shipping_floor"
                    value={formData.shipping_floor}
                    onChange={(e) => setFormData({...formData, shipping_floor: e.target.value})}
                    placeholder="מספר קומה"
                  />
                </div>
                <div>
                  <Label htmlFor="shipping_apartment">דירה</Label>
                  <Input
                    id="shipping_apartment"
                    value={formData.shipping_apartment}
                    onChange={(e) => setFormData({...formData, shipping_apartment: e.target.value})}
                    placeholder="מספר דירה"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="note">הערות להזמנה</Label>
            <Textarea
              id="note"
              value={formData.customer_note}
              onChange={(e) => setFormData({...formData, customer_note: e.target.value})}
              placeholder="בקשות מיוחדות, אלרגיות..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="pickup">הערות למשלוח</Label>
            <Textarea
              id="pickup"
              value={formData.pickup_note}
              onChange={(e) => setFormData({...formData, pickup_note: e.target.value})}
              placeholder="הוראות למשלוח, שעה מועדפת..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="mb-4 md:mb-6">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">אמצעי תשלום</CardTitle>
          <p className="text-xs md:text-sm text-gray-500">תבחרו איך תשלמו למוכר</p>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
          <RadioGroup
            value={formData.payment_method}
            onValueChange={(value) => setFormData({...formData, payment_method: value})}
            className="space-y-2 md:space-y-3"
          >
            <div className="flex items-center space-x-3 space-x-reverse bg-gradient-to-r from-blue-50 to-purple-50 p-3 md:p-4 rounded-xl border-2 border-transparent hover:border-purple-300 transition-all">
              <RadioGroupItem value="bit" id="bit" />
              <Label htmlFor="bit" className="flex items-center gap-2 md:gap-3 cursor-pointer flex-1">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#7C3AED"/>
                    <path d="M15.5 9.5L10 15l-3.5-3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 text-sm md:text-base">ביט</div>
                  <div className="text-xs text-gray-500">העברה מיידית</div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-4 rounded-xl border-2 border-transparent hover:border-blue-300 transition-all">
              <RadioGroupItem value="credit" id="credit" />
              <Label htmlFor="credit" className="flex items-center gap-2 md:gap-3 cursor-pointer flex-1">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 text-sm md:text-base">כרטיס אשראי</div>
                  <div className="text-xs text-gray-500">תשלום למוכר</div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse bg-gradient-to-r from-gray-50 to-slate-50 p-3 md:p-4 rounded-xl border-2 border-transparent hover:border-gray-300 transition-all">
              <RadioGroupItem value="apple_pay" id="apple_pay" />
              <Label htmlFor="apple_pay" className="flex items-center gap-2 md:gap-3 cursor-pointer flex-1">
                <div className="w-9 h-9 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6" fill="white">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 text-sm md:text-base">Apple Pay</div>
                  <div className="text-xs text-gray-500">תשלום מהיר</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* סיכום עלויות */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-3 md:p-4 space-y-2">
          <div className="flex justify-between items-center text-sm md:text-base text-gray-600">
            <span>סה"כ מוצרים</span>
            <span>₪{productsTotal}</span>
          </div>
          <div className="flex justify-between items-center text-sm md:text-base text-gray-600">
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              משלוח
            </span>
            <span>₪{SHIPPING_COST}</span>
          </div>
          <div className="flex justify-between items-center text-xs md:text-sm text-gray-400">
            <span>עמלת פלטפורמה (5%)</span>
            <span>₪{commissionAmount}</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center text-base md:text-lg font-bold">
            <span>סה"כ לתשלום</span>
            <span className="text-orange-600">₪{cartTotal}</span>
          </div>
          {!allMeetMinimum && (
            <p className="text-red-500 text-xs md:text-sm mt-2">
              יש מוכר שלא עומד במינימום הזמנה
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmitOrder}
        disabled={!allMeetMinimum || isSubmitting || !formData.customer_name || !formData.customer_phone || !formData.shipping_street || !formData.shipping_city}
        className="w-full h-12 md:h-14 bg-orange-500 hover:bg-orange-600 text-base md:text-lg font-bold rounded-2xl"
      >
        {isSubmitting ? 'שולח הזמנות...' : `שליחת ${carts.length} ${carts.length === 1 ? 'הזמנה' : 'הזמנות'}`}
      </Button>
    </div>
  );
}