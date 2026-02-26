import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag, Search, Filter, Calendar, Clock,
  ChefHat, Package, CheckCircle2, XCircle, Truck,
  MapPin, Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusConfig = {
  received: { label: 'התקבלה', color: 'bg-blue-100 text-blue-700', icon: Clock },
  preparing: { label: 'בהכנה', color: 'bg-orange-100 text-orange-700', icon: ChefHat },
  ready: { label: 'נשלחה', color: 'bg-green-100 text-green-700', icon: Truck },
  delivered: { label: 'נמסרה', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  canceled: { label: 'בוטלה', color: 'bg-red-100 text-red-700', icon: XCircle },
};

// אחוז עמלת פלטפורמה
const COMMISSION_RATE = 0.05;

export default function AdminOrders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const user = await base44.auth.me();
      if (user.role !== 'admin' && user.user_type !== 'admin') {
        navigate(createPageUrl('Home'));
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => base44.entities.Order.list('-created_date', 100),
  });

  const filteredOrders = orders?.filter(order => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesCustomer = order.customer_name?.toLowerCase().includes(query);
      const matchesCook = order.cook_name?.toLowerCase().includes(query);
      const matchesOrderNumber = order.order_number?.toLowerCase().includes(query);
      if (!matchesCustomer && !matchesCook && !matchesOrderNumber) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;

    // Date filter
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.created_date);
      const today = new Date();
      
      if (dateFilter === 'today') {
        if (orderDate.toDateString() !== today.toDateString()) return false;
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (orderDate < weekAgo) return false;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (orderDate < monthAgo) return false;
      }
    }

    return true;
  }) || [];

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

  // חישוב סה"כ עמלות מההזמנות המסוננות
  const totalCommissions = filteredOrders.reduce((sum, o) => {
    const commission = o.commission_amount != null
      ? o.commission_amount
      : Math.round((o.total_amount || 0) * COMMISSION_RATE * 100) / 100;
    return sum + commission;
  }, 0);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6" />
          ניהול הזמנות
        </h1>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{filteredOrders.length}</p>
            <p className="text-sm text-gray-500">הזמנות</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">₪{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">סה"כ הכנסות</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">₪{avgOrderValue.toFixed(0)}</p>
            <p className="text-sm text-gray-500">ממוצע להזמנה</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Percent className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">₪{totalCommissions.toFixed(0)}</p>
            <p className="text-sm text-gray-500">עמלות (5%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="חיפוש לפי שם, מוכר או מספר הזמנה..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="received">התקבלה</SelectItem>
            <SelectItem value="preparing">בהכנה</SelectItem>
            <SelectItem value="ready">נשלחה</SelectItem>
            <SelectItem value="delivered">נמסרה</SelectItem>
            <SelectItem value="canceled">בוטלה</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="תאריך" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הזמנים</SelectItem>
            <SelectItem value="today">היום</SelectItem>
            <SelectItem value="week">השבוע</SelectItem>
            <SelectItem value="month">החודש</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>מספר</TableHead>
                <TableHead>לקוח</TableHead>
                <TableHead>מוכר</TableHead>
                <TableHead>כתובת משלוח</TableHead>
                <TableHead>סכום</TableHead>
                <TableHead>עמלה</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>תשלום</TableHead>
                <TableHead>תאריך</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status];
                const StatusIcon = status?.icon || Clock;
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.cook_name}</TableCell>
                    <TableCell className="text-xs text-gray-600 max-w-[150px]">
                      {order.shipping_address ? (
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                          <span>
                            {order.shipping_address.street && `${order.shipping_address.street}`}
                            {order.shipping_address.city && `, ${order.shipping_address.city}`}
                            {order.shipping_address.floor && ` קומה ${order.shipping_address.floor}`}
                            {order.shipping_address.apartment && ` דירה ${order.shipping_address.apartment}`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold">₪{order.total_amount}</TableCell>
                    <TableCell className="text-sm text-yellow-600">
                      ₪{order.commission_amount != null
                        ? order.commission_amount
                        : Math.round((order.total_amount || 0) * COMMISSION_RATE * 100) / 100}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${status?.color} gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {order.payment_status === 'paid' ? 'שולם' : 'לא שולם'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(order.created_date).toLocaleString('he-IL', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}