import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, ChefHat, ShoppingBag, TrendingUp, 
  ArrowLeft, Bell, MessageCircle, UserCheck, UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user.role !== 'admin' && user.user_type !== 'admin') navigate(createPageUrl('Home'));
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: users = [] } = useQuery({ queryKey: ['adminUsers'], queryFn: () => base44.entities.User.list() });
  const { data: cooks = [] } = useQuery({ queryKey: ['adminCooks'], queryFn: () => base44.entities.Cook.list() });
  const { data: pendingCooks = [] } = useQuery({ queryKey: ['pendingCooks'], queryFn: () => base44.entities.Cook.filter({ approval_status: 'pending' }) });
  const { data: orders = [] } = useQuery({ queryKey: ['adminOrders'], queryFn: () => base44.entities.Order.list('-created_date', 100) });
  const { data: tickets = [] } = useQuery({ queryKey: ['adminTickets'], queryFn: () => base44.entities.SupportTicket.list('-created_date', 50) });

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.created_date).toDateString() === today);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const cookUsers = users.filter(u => u.user_type === 'cook');
  const regularUsers = users.filter(u => !u.user_type || u.user_type === 'customer');
  const approvedCooks = cooks.filter(c => c.approval_status === 'approved');
  const openCooks = cooks.filter(c => c.is_open && c.is_active);
  const openTickets = tickets.filter(t => t.status === 'open');

  const stats = [
    { title: 'סה״כ משתמשים', value: users.length, sub: `${regularUsers.length} לקוחות · ${cookUsers.length} מבשלים`, icon: Users, color: 'bg-blue-100 text-blue-600', link: 'AdminUsers' },
    { title: 'מסעדות', value: cooks.length, sub: `${approvedCooks.length} מאושרות · ${openCooks.length} פתוחות`, icon: ChefHat, color: 'bg-orange-100 text-orange-600', link: 'AdminCooks' },
    { title: 'הזמנות היום', value: todayOrders.length, sub: `₪${todayRevenue} הכנסות`, icon: ShoppingBag, color: 'bg-green-100 text-green-600', link: 'AdminOrders' },
    { title: 'פניות תמיכה', value: tickets.length, sub: `${openTickets.length} פתוחות`, icon: MessageCircle, color: openTickets.length > 0 ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600', link: 'AdminSupport' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">פאנל ניהול</h1>

      {/* Alerts */}
      <div className="space-y-3 mb-6">
        {pendingCooks.length > 0 && (
          <div className="flex items-center justify-between bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-orange-900">{pendingCooks.length} מבשלים ממתינים לאישור</p>
                <p className="text-sm text-orange-700">יש לאשר או לדחות את הבקשות</p>
              </div>
            </div>
            <Link to={createPageUrl('AdminApprovals')}>
              <Button className="bg-orange-500 hover:bg-orange-600 rounded-xl">אישורים</Button>
            </Link>
          </div>
        )}
        {openTickets.length > 0 && (
          <div className="flex items-center justify-between bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-red-900">{openTickets.length} פניות שירות לקוחות פתוחות</p>
                <p className="text-sm text-red-700">ממתינות לטיפול</p>
              </div>
            </div>
            <Link to={createPageUrl('AdminSupport')}>
              <Button className="bg-red-500 hover:bg-red-600 rounded-xl">טפל</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} to={createPageUrl(stat.link)}>
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className="text-xs text-gray-400">{stat.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Users Breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> פירוט משתמשים</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">לקוחות</span>
              </div>
              <Badge className="bg-blue-500 text-white">{regularUsers.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-900">מבשלים</span>
              </div>
              <Badge className="bg-orange-500 text-white">{cookUsers.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">מבשלים מאושרים</span>
              </div>
              <Badge className="bg-green-500 text-white">{approvedCooks.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-900">ממתינים לאישור</span>
              </div>
              <Badge className={pendingCooks.length > 0 ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"}>{pendingCooks.length}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> פניות אחרונות</span>
              <Link to={createPageUrl('AdminSupport')}>
                <Button variant="ghost" size="sm">הכל <ArrowLeft className="w-3 h-3 mr-1" /></Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">אין פניות עדיין</p>
            ) : (
              <div className="space-y-2">
                {tickets.slice(0, 4).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2">
                    <div>
                      <p className="font-medium text-sm">{t.subject}</p>
                      <p className="text-xs text-gray-400">{t.customer_name}</p>
                    </div>
                    <Badge className={t.status === 'open' ? 'bg-red-100 text-red-700' : t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {t.status === 'open' ? 'פתוח' : t.status === 'resolved' ? 'נסגר' : 'בטיפול'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>הזמנות אחרונות</span>
            <Link to={createPageUrl('AdminOrders')}>
              <Button variant="ghost" size="sm">הכל <ArrowLeft className="w-3 h-3 mr-1" /></Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">{order.cook_name} · #{order.order_number}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold">₪{order.total_amount}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_date).toLocaleString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}