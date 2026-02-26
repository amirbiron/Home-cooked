import React from 'react';
import {
  Clock, ChefHat, Package, CheckCircle2, XCircle,
  Phone, User, FileText, Banknote, Smartphone,
  MapPin, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusConfig = {
  received: { 
    label: 'התקבלה', 
    color: 'bg-blue-100 text-blue-700 border-blue-200', 
    icon: Clock,
    nextStatus: 'preparing',
    nextLabel: '📦 התחל טיפול'
  },
  preparing: {
    label: 'בטיפול',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: ChefHat,
    nextStatus: 'ready',
    nextLabel: '🚚 נשלחה'
  },
  ready: {
    label: 'נשלחה',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: Package,
    nextStatus: 'delivered',
    nextLabel: '✅ נמסרה ללקוח'
  },
  delivered: { 
    label: 'נמסרה', 
    color: 'bg-green-100 text-green-700 border-green-200', 
    icon: CheckCircle2,
    nextStatus: null,
    nextLabel: null
  },
  canceled: { 
    label: 'בוטלה', 
    color: 'bg-red-100 text-red-700 border-red-200', 
    icon: XCircle,
    nextStatus: null,
    nextLabel: null
  },
};

export default function OrderCard({ order, onStatusChange, onPaymentChange, expanded = false }) {
  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const handleNextStatus = () => {
    if (status.nextStatus) {
      onStatusChange(order.id, status.nextStatus);
    }
  };

  return (
    <Card className={`overflow-hidden transition-all ${
      order.status === 'received' ? 'border-2 border-blue-300 shadow-lg' : ''
    }`}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={`${status.color} border gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
            <span className="text-sm text-gray-500">#{order.order_number}</span>
          </div>
          <span className="text-sm text-gray-500">
            {new Date(order.created_date).toLocaleTimeString('he-IL', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        {/* Customer Info */}
        <div className="flex items-center gap-4 mb-3 pb-3 border-b">
          <div className="flex items-center gap-2 flex-1">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1 text-blue-600">
            <Phone className="w-4 h-4" />
            <span className="text-sm">{order.customer_phone}</span>
          </a>
        </div>

        {/* כתובת משלוח */}
        {order.shipping_address && (order.shipping_address.street || order.shipping_address.city) && (
          <div className="flex items-start gap-2 mb-3 pb-3 border-b bg-orange-50 rounded-lg p-3 text-sm">
            <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-orange-900">כתובת למשלוח:</p>
              <p>
                {order.shipping_address.street}
                {order.shipping_address.city && `, ${order.shipping_address.city}`}
              </p>
              {(order.shipping_address.floor || order.shipping_address.apartment) && (
                <p className="text-gray-600">
                  {order.shipping_address.floor && `קומה ${order.shipping_address.floor}`}
                  {order.shipping_address.floor && order.shipping_address.apartment && ' · '}
                  {order.shipping_address.apartment && `דירה ${order.shipping_address.apartment}`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* פריטי הזמנה */}
        <div className="space-y-1 mb-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>
                <span className="font-medium">{item.quantity}x</span> {item.title}
              </span>
              <span>₪{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {(order.customer_note || order.pickup_note) && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
            {order.customer_note && (
              <div className="flex items-start gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>{order.customer_note}</span>
              </div>
            )}
            {order.pickup_note && (
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                <span>{order.pickup_note}</span>
              </div>
            )}
          </div>
        )}

        {/* Total & Payment */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            {order.payment_method === 'bit' ? (
              <Smartphone className="w-4 h-4 text-purple-600" />
            ) : order.payment_method === 'credit' ? (
              <Banknote className="w-4 h-4 text-blue-600" />
            ) : order.payment_method === 'apple_pay' ? (
              <Smartphone className="w-4 h-4 text-gray-800" />
            ) : (
              <Banknote className="w-4 h-4 text-green-600" />
            )}
            <span className="text-sm">
              {order.payment_method === 'bit' ? 'ביט' : 
               order.payment_method === 'credit' ? 'אשראי' : 
               order.payment_method === 'apple_pay' ? 'Apple Pay' : 'מזומן'}
            </span>
            <Badge 
              variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
              className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onPaymentChange(order.id, order.payment_status === 'paid' ? 'unpaid' : 'paid')}
            >
              {order.payment_status === 'paid' ? '✓ שולם' : 'לא שולם'}
            </Badge>
          </div>
          <div className="text-left">
            <span className="text-xl font-bold text-orange-600">₪{order.total_amount}</span>
            {order.commission_amount != null && (
              <p className="text-xs text-gray-400">
                נטו: ₪{(order.total_amount - order.commission_amount).toFixed(0)}
              </p>
            )}
          </div>
        </div>

        {/* Status Quick Actions */}
        {order.status !== 'delivered' && order.status !== 'canceled' && (
          <div className="space-y-2">
            {/* Main Action */}
            <Button
              onClick={handleNextStatus}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-md"
              size="lg"
            >
              {status.nextLabel}
            </Button>
            
            {/* Quick Status Updates */}
            <div className="grid grid-cols-2 gap-2">
              {order.status === 'received' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(order.id, 'ready')}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Truck className="w-4 h-4 ml-1" />
                    ישר לנשלח
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(order.id, 'canceled')}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 ml-1" />
                    ביטול
                  </Button>
                </>
              )}
              {order.status !== 'received' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(order.id, 'canceled')}
                  className="col-span-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 ml-1" />
                  ביטול הזמנה
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}