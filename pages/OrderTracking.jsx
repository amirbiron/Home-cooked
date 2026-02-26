import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle2, Clock, ChefHat, Package, 
  XCircle, Phone, MapPin, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import moment from 'moment';

const statusConfig = {
  received: {
    label: 'התקבלה במטבח',
    icon: CheckCircle2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    description: 'ההזמנה הגיעה למבשל ומחכה לאישור'
  },
  preparing: {
    label: 'בהכנה במטבח',
    icon: ChefHat,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    description: 'המבשל מכין את ההזמנה שלכם כרגע 👨‍🍳'
  },
  ready: {
    label: 'מוכנה לאיסוף',
    icon: Package,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    description: 'ההזמנה מוכנה ומחכה לכם! 🎉'
  },
  delivered: {
    label: 'נמסרה',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'ההזמנה נמסרה בהצלחה. בתאבון! 🍽️'
  },
  canceled: {
    label: 'בוטלה',
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    description: 'ההזמנה בוטלה'
  }
};

const statusOrder = ['received', 'preparing', 'ready', 'delivered'];

export default function OrderTracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const orderId = urlParams.get('id');
  const [timeRemaining, setTimeRemaining] = useState('');

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ id: orderId });
      return orders[0];
    },
    enabled: !!orderId,
    refetchInterval: 5000, // Poll every 5 seconds for status updates
  });

  const { data: cook } = useQuery({
    queryKey: ['cook', order?.cook_id],
    queryFn: async () => {
      const cooks = await base44.entities.Cook.filter({ id: order.cook_id });
      return cooks[0];
    },
    enabled: !!order?.cook_id,
  });

  // Calculate estimated time remaining
  useEffect(() => {
    if (!order || !cook || order.status === 'ready' || order.status === 'delivered' || order.status === 'canceled') {
      setTimeRemaining('');
      return;
    }

    const calculateTime = () => {
      const orderTime = moment(order.created_date);
      const prepTime = cook.estimated_prep_time || 30;
      const readyTime = orderTime.add(prepTime, 'minutes');
      const now = moment();
      const diff = readyTime.diff(now, 'minutes');
      
      if (diff <= 0) {
        setTimeRemaining('בקרוב!');
      } else if (diff < 60) {
        setTimeRemaining(`עוד ${diff} דקות`);
      } else {
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        setTimeRemaining(`עוד ${hours} שעה${hours > 1 ? 'ות' : ''} ו-${mins} דקות`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [order, cook]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full mb-6 rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">הזמנה לא נמצאה</h2>
        <Button onClick={() => navigate(createPageUrl('MyOrders'))}>
          להזמנות שלי
        </Button>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status];
  const StatusIcon = currentStatus.icon;
  const currentIndex = statusOrder.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className={`text-center py-8 rounded-2xl mb-6 ${currentStatus.bgColor}`}>
        <div className={`w-20 h-20 rounded-full ${currentStatus.bgColor} mx-auto mb-4 flex items-center justify-center`}>
          <StatusIcon className={`w-10 h-10 ${currentStatus.color}`} />
        </div>
        <h1 className="text-2xl font-bold mb-2">{currentStatus.label}</h1>
        <p className="text-gray-600 mb-2">{currentStatus.description}</p>
        
        {/* Time Remaining */}
        {timeRemaining && order.status !== 'ready' && order.status !== 'delivered' && (
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mt-3">
            <Timer className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-600">{timeRemaining}</span>
          </div>
        )}
        
        <Badge variant="outline" className="mt-4 text-lg px-4 py-1">
          הזמנה #{order.order_number}
        </Badge>
      </div>

      {/* Status Timeline */}
      {order.status !== 'canceled' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">מעקב סטטוס</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {statusOrder.slice(0, -1).map((status, index) => {
                const config = statusConfig[status];
                const Icon = config.icon;
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                
                return (
                  <div key={status} className="flex items-start gap-4 pb-8 last:pb-0">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive ? config.bgColor : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${isActive ? config.color : 'text-gray-400'}`} />
                      </div>
                      {index < statusOrder.length - 2 && (
                        <div className={`absolute top-10 right-1/2 w-0.5 h-8 ${
                          index < currentIndex ? 'bg-orange-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className={`font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                        {config.label}
                      </p>
                      {order.status_history?.find(h => h.status === status) && (
                        <p className="text-sm text-gray-400">
                          {new Date(order.status_history.find(h => h.status === status).timestamp).toLocaleTimeString('he-IL', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cook Info */}
      {cook && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden">
                <img
                  src={cook.profile_image || `https://ui-avatars.com/api/?name=${cook.display_name}&background=F97316&color=fff`}
                  alt={cook.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{cook.display_name}</h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{cook.city}</span>
                </div>
              </div>
              {cook.phone && (
                <a href={`tel:${cook.phone}`}>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Phone className="w-5 h-5" />
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">פרטי ההזמנה</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {order.items?.map((item, i) => (
            <div key={i} className="py-3 flex justify-between">
              <div>
                <span className="font-medium">{item.title}</span>
                <span className="text-gray-500 mr-2">x{item.quantity}</span>
              </div>
              <span>₪{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="py-3 flex justify-between font-bold text-lg">
            <span>סה"כ</span>
            <span className="text-orange-600">₪{order.total_amount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="mb-6">
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">אמצעי תשלום</p>
            <p className="font-medium">
              {order.payment_method === 'bit' ? 'ביט' : 
               order.payment_method === 'credit' ? 'כרטיס אשראי' : 
               order.payment_method === 'apple_pay' ? 'Apple Pay' : 'מזומן'}
            </p>
          </div>
          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
            {order.payment_status === 'paid' ? 'שולם' : 'תשלום למבשל'}
          </Badge>
        </CardContent>
      </Card>

      {/* Notes */}
      {(order.customer_note || order.pickup_note) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">הערות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.customer_note && (
              <div>
                <p className="text-sm text-gray-500">הערות למנות:</p>
                <p>{order.customer_note}</p>
              </div>
            )}
            {order.pickup_note && (
              <div>
                <p className="text-sm text-gray-500">הערות איסוף/משלוח:</p>
                <p>{order.pickup_note}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl('MyOrders'))}
          className="flex-1"
        >
          להזמנות שלי
        </Button>
        <Button
          onClick={() => navigate(createPageUrl('Home'))}
          className="flex-1 bg-orange-500 hover:bg-orange-600"
        >
          חזרה לבית
        </Button>
      </div>
    </div>
  );
}