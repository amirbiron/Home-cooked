import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Package, ChefHat, Clock, CheckCircle2, XCircle, 
  ArrowLeft, ShoppingBag, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';

const statusConfig = {
  received: { label: 'התקבלה', color: 'bg-blue-100 text-blue-700', icon: Clock },
  preparing: { label: 'בהכנה', color: 'bg-orange-100 text-orange-700', icon: ChefHat },
  ready: { label: 'מוכנה', color: 'bg-green-100 text-green-700', icon: Package },
  delivered: { label: 'נמסרה', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  canceled: { label: 'בוטלה', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function MyOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['myOrders', user?.email],
    queryFn: () => base44.entities.Order.filter({ customer_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const handleReorder = async (order) => {
    try {
      // Check if cart exists for this cook
      const existingCarts = await base44.entities.Cart.filter({ 
        customer_email: user.email, 
        cook_id: order.cook_id,
        status: 'active' 
      });

      // Close other active carts from different cooks
      const allActiveCarts = await base44.entities.Cart.filter({ 
        customer_email: user.email, 
        status: 'active' 
      });
      
      for (const activeCart of allActiveCarts) {
        if (activeCart.cook_id !== order.cook_id) {
          await base44.entities.Cart.update(activeCart.id, { status: 'abandoned' });
        }
      }

      const cartData = {
        customer_email: user.email,
        cook_id: order.cook_id,
        items: order.items,
        status: 'active'
      };

      if (existingCarts.length > 0 && existingCarts[0].cook_id === order.cook_id) {
        // Update existing cart - merge items
        const existingCart = existingCarts[0];
        const mergedItems = [...existingCart.items, ...order.items];
        await base44.entities.Cart.update(existingCart.id, { items: mergedItems });
      } else {
        // Create new cart
        await base44.entities.Cart.create(cartData);
      }

      queryClient.invalidateQueries(['cart']);
      toast.success('הפריטים נוספו לעגלה!');
      navigate(createPageUrl('Cart'));
    } catch (e) {
      toast.error('שגיאה בהוספת הפריטים לעגלה');
      console.error(e);
    }
  };

  const activeOrders = orders?.filter(o => ['received', 'preparing', 'ready'].includes(o.status)) || [];
  const pastOrders = orders?.filter(o => ['delivered', 'canceled'].includes(o.status)) || [];

  const OrderCard = ({ order }) => {
    const status = statusConfig[order.status];
    const StatusIcon = status.icon;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-bold text-lg">{order.cook_name}</p>
              <p className="text-gray-500 text-sm">#{order.order_number}</p>
            </div>
            <Badge className={status.color}>
              <StatusIcon className="w-3 h-3 ml-1" />
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <span>{new Date(order.created_date).toLocaleDateString('he-IL', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
            <span className="font-bold text-gray-900">₪{order.total_amount}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <p>{order.items?.length} פריטים</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.preventDefault();
                handleReorder(order);
              }}
            >
              <RotateCcw className="w-4 h-4 ml-1" />
              הזמן שוב
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-orange-500"
              onClick={() => navigate(createPageUrl(`OrderTracking?id=${order.id}`))}
            >
              צפייה <ArrowLeft className="w-4 h-4 mr-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ההזמנות שלי</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">אין הזמנות עדיין</h2>
          <p className="text-gray-500 mb-6">הזמינו מהמבשלים המוכשרים שלנו</p>
          <Button 
            onClick={() => navigate(createPageUrl('Search'))}
            className="bg-orange-500 hover:bg-orange-600"
          >
            לחיפוש מבשלים
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full mb-6 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="active" className="flex-1 rounded-lg">
              פעילות ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 rounded-lg">
              היסטוריה ({pastOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">אין הזמנות פעילות</p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">אין הזמנות קודמות</p>
              </div>
            ) : (
              pastOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}