import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Power, Clock, Package, TrendingUp, Star,
  Bell, Settings, UtensilsCrossed, ArrowLeft, AlertCircle,
  DollarSign, Calendar, Users, Eye, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function CookDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [cook, setCook] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      if (currentUser.user_type !== 'cook') {
        navigate(createPageUrl('Home'));
        return;
      }

      const cooks = await base44.entities.Cook.filter({ user_email: currentUser.email });
      if (cooks.length > 0) {
        const cookData = cooks[0];
        
        // Check approval status
        if (cookData.approval_status === 'pending') {
          navigate(createPageUrl('CookPending'));
          return;
        } else if (cookData.approval_status === 'rejected') {
          navigate(createPageUrl('CookRejected'));
          return;
        }
        
        setCook(cookData);
      } else {
        navigate(createPageUrl('BecomeACook'));
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['cookOrders', cook?.id],
    queryFn: () => base44.entities.Order.filter({ cook_id: cook.id }, '-created_date', 100),
    enabled: !!cook?.id,
    refetchInterval: 10000,
  });

  const { data: dishes } = useQuery({
    queryKey: ['cookDishes', cook?.id],
    queryFn: () => base44.entities.Dish.filter({ cook_id: cook.id }),
    enabled: !!cook?.id,
  });

  const { data: dailySpecial } = useQuery({
    queryKey: ['dailySpecial', cook?.id],
    queryFn: async () => {
      const dishes = await base44.entities.Dish.filter({ cook_id: cook.id, is_daily_special: true });
      return dishes[0];
    },
    enabled: !!cook?.id,
  });

  const toggleOpenMutation = useMutation({
    mutationFn: async (isOpen) => {
      await base44.entities.Cook.update(cook.id, { is_open: isOpen });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cook']);
      setCook(prev => ({ ...prev, is_open: !prev.is_open }));
    }
  });

  const newOrders = orders?.filter(o => o.status === 'received') || [];
  const preparingOrders = orders?.filter(o => o.status === 'preparing') || [];
  const readyOrders = orders?.filter(o => o.status === 'ready') || [];
  
  const todayOrders = orders?.filter(o => {
    const orderDate = new Date(o.created_date).toDateString();
    return orderDate === new Date().toDateString();
  }) || [];
  
  const weekOrders = orders?.filter(o => {
    const orderDate = new Date(o.created_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return orderDate >= weekAgo;
  }) || [];
  
  const monthOrders = orders?.filter(o => {
    const orderDate = new Date(o.created_date);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return orderDate >= monthAgo;
  }) || [];
  
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  
  const avgOrderValue = orders?.length > 0 
    ? Math.round(orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length) 
    : 0;

  // Last 7 days revenue chart data
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayOrders = orders?.filter(o => {
      const orderDate = new Date(o.created_date).toDateString();
      return orderDate === date.toDateString();
    }) || [];
    const revenue = dayOrders.reduce((sum, o) => sum + o.total_amount, 0);
    return {
      day: date.toLocaleDateString('he-IL', { weekday: 'short' }),
      revenue,
      orders: dayOrders.length
    };
  });

  if (!cook) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ברוך הבא, {cook.display_name}</h1>
        <p className="text-gray-500">סקירת ביצועים והזמנות</p>
      </div>

      {/* Status Toggle Card */}
      <Card className={`mb-6 border-0 shadow-lg ${cook.is_open ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Power className="w-7 h-7 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">
                  {cook.is_open ? 'פתוח להזמנות ✓' : 'סגור להזמנות'}
                </h2>
                <p className="text-white/80 text-sm">
                  {cook.is_open 
                    ? 'לקוחות יכולים להזמין ממך עכשיו' 
                    : 'הפעל כדי לקבל הזמנות חדשות'}
                </p>
              </div>
            </div>
            <Switch
              checked={cook.is_open}
              onCheckedChange={(checked) => toggleOpenMutation.mutate(checked)}
              className="scale-150 data-[state=checked]:bg-white data-[state=unchecked]:bg-gray-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              {newOrders.length > 0 && (
                <Badge className="bg-red-500 text-white animate-pulse">חדש!</Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-1">{newOrders.length}</p>
            <p className="text-sm text-blue-700 font-medium">הזמנות חדשות</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-orange-600 mb-1">{preparingOrders.length}</p>
            <p className="text-sm text-orange-700 font-medium">בטיפול כרגע</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">{readyOrders.length}</p>
            <p className="text-sm text-green-700 font-medium">נשלחו</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-purple-600 mb-1">₪{todayRevenue}</p>
            <p className="text-sm text-purple-700 font-medium">הכנסות היום</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-500">שבוע אחרון</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₪{weekRevenue}</p>
            <p className="text-xs text-gray-500 mt-1">{weekOrders.length} הזמנות</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-500">30 יום אחרונים</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₪{monthRevenue}</p>
            <p className="text-xs text-gray-500 mt-1">{monthOrders.length} הזמנות</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-500">ממוצע הזמנה</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₪{avgOrderValue}</p>
            <p className="text-xs text-gray-500 mt-1">כל ההזמנות</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              הכנסות 7 ימים אחרונים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7DaysData}>
                <XAxis dataKey="day" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  formatter={(value) => [`₪${value}`, 'הכנסות']}
                />
                <Bar dataKey="revenue" fill="#F97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              מספר הזמנות יומי
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={last7DaysData}>
                <XAxis dataKey="day" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  formatter={(value) => [`${value} הזמנות`, 'סה"כ']}
                />
                <Line type="monotone" dataKey="orders" stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4 text-center">
            <UtensilsCrossed className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{dishes?.length || 0}</p>
            <p className="text-sm text-gray-500">מוצרים בקטלוג</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{cook.avg_rating?.toFixed(1) || '5.0'}</p>
            <p className="text-sm text-gray-500">דירוג ממוצע</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{cook.total_orders || 0}</p>
            <p className="text-sm text-gray-500">סה"כ הזמנות</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{cook.is_open ? 'מקבל' : 'לא מקבל'}</p>
            <p className="text-sm text-gray-500">סטטוס</p>
          </CardContent>
        </Card>
      </div>

      {/* New Orders Alert */}
      {newOrders.length > 0 && (
        <Card className="mb-6 border-2 border-blue-300 bg-blue-50 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-bold text-blue-800">
                    {newOrders.length} הזמנות חדשות!
                  </p>
                  <p className="text-sm text-blue-600">לחצו לצפייה ואישור</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate(createPageUrl('CookOrders'))}
                className="bg-blue-600 hover:bg-blue-700"
              >
                צפייה בהזמנות
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link to={createPageUrl('CookOrders')}>
          <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer h-full group bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">ניהול הזמנות</h3>
                <p className="text-sm text-gray-600">צפייה ועדכון סטטוס</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('CookMenu')}>
          <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer h-full group bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">ניהול קטלוג</h3>
                <p className="text-sm text-gray-600">עריכת מוצרים ומחירים</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-green-500 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('CookSettings')}>
          <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer h-full group bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">הגדרות</h3>
                <p className="text-sm text-gray-600">פרופיל ושעות פעילות</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Daily Special */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>מוצר היום</span>
            <Link to={createPageUrl('CookMenu')}>
              <Button variant="ghost" size="sm">
                ערוך <ArrowLeft className="w-4 h-4 mr-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailySpecial ? (
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden">
                <img
                  src={dailySpecial.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                  alt={dailySpecial.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">{dailySpecial.title}</h4>
                <p className="text-gray-500">{dailySpecial.description}</p>
                {dailySpecial.daily_special_note && (
                  <p className="text-orange-600 text-sm italic mt-1">
                    "{dailySpecial.daily_special_note}"
                  </p>
                )}
              </div>
              <span className="text-xl font-bold text-orange-600">
                ₪{dailySpecial.price}
              </span>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">לא הוגדרה מוצר היום</p>
              <Button 
                onClick={() => navigate(createPageUrl('CookMenu'))}
                variant="outline"
              >
                הגדר מוצר היום
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}