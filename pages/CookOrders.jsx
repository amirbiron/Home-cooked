import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, Bell, ChefHat, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import OrderCard from '../components/cook/OrderCard';

export default function CookOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cook, setCook] = useState(null);

  useEffect(() => {
    loadCook();
  }, []);

  const loadCook = async () => {
    try {
      const user = await base44.auth.me();
      if (user.user_type !== 'cook') {
        navigate(createPageUrl('Home'));
        return;
      }
      const cooks = await base44.entities.Cook.filter({ user_email: user.email });
      if (cooks.length > 0) {
        setCook(cooks[0]);
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['cookOrders', cook?.id],
    queryFn: () => base44.entities.Order.filter({ cook_id: cook.id }, '-created_date'),
    enabled: !!cook?.id,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const order = orders.find(o => o.id === orderId);
      const newHistory = [...(order.status_history || []), {
        status: newStatus,
        timestamp: new Date().toISOString(),
        note: ''
      }];
      await base44.entities.Order.update(orderId, { 
        status: newStatus,
        status_history: newHistory
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cookOrders']);
    }
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ orderId, paymentStatus }) => {
      await base44.entities.Order.update(orderId, { payment_status: paymentStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cookOrders']);
    }
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  const handlePaymentChange = (orderId, paymentStatus) => {
    updatePaymentMutation.mutate({ orderId, paymentStatus });
  };

  const receivedOrders = orders?.filter(o => o.status === 'received') || [];
  const preparingOrders = orders?.filter(o => o.status === 'preparing') || [];
  const readyOrders = orders?.filter(o => o.status === 'ready') || [];
  const completedOrders = orders?.filter(o => ['delivered', 'canceled'].includes(o.status)) || [];

  if (isLoading || !cook) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-12 w-full mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול הזמנות</h1>
        {orders && orders.length > 0 && (
          <Badge variant="outline" className="text-lg px-3 py-1">
            {orders.length} הזמנות
          </Badge>
        )}
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-6 bg-gray-100 p-1 rounded-xl h-auto">
          <TabsTrigger value="received" className="rounded-lg gap-2 py-3 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">חדשות</span>
            {receivedOrders.length > 0 && (
              <Badge className="bg-white text-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                {receivedOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preparing" className="rounded-lg gap-2 py-3 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <ChefHat className="w-4 h-4" />
            <span className="hidden sm:inline">בהכנה</span>
            {preparingOrders.length > 0 && (
              <Badge className="bg-white text-orange-600 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                {preparingOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ready" className="rounded-lg gap-2 py-3 data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">מוכנות</span>
            {readyOrders.length > 0 && (
              <Badge className="bg-white text-green-600 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                {readyOrders.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg gap-2 py-3">
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">סיום</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedOrders.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">אין הזמנות חדשות</p>
            </div>
          ) : (
            receivedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="preparing" className="space-y-4">
          {preparingOrders.length === 0 ? (
            <div className="text-center py-16">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">אין הזמנות בהכנה</p>
            </div>
          ) : (
            preparingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
          {readyOrders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">אין הזמנות מוכנות</p>
            </div>
          ) : (
            readyOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">אין הזמנות קודמות</p>
            </div>
          ) : (
            completedOrders.slice(0, 20).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}