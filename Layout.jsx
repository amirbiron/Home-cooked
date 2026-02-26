import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
        Home, Search, ShoppingCart, User, Store,
        LayoutDashboard, Package, Settings,
        LogOut, Menu, X, Bell, ClipboardList, Users, MessageSquare
      } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('customer');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    loadUser();
    
    // Reload user data periodically to catch user_type changes
    const interval = setInterval(() => {
      loadUser();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setUserType(currentUser.user_type || 'customer');
    } catch (e) {
      setUser(null);
    }
  };

  const { data: carts = [] } = useQuery({
    queryKey: ['cart', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const activeCarts = await base44.entities.Cart.filter({ 
        customer_email: user.email, 
        status: 'active' 
      });
      return activeCarts.filter(cart => cart.items?.length > 0);
    },
    enabled: !!user,
    refetchInterval: 3000,
  });

  const { data: activeOrders = [] } = useQuery({
    queryKey: ['activeOrders', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const orders = await base44.entities.Order.filter({ 
        customer_email: user.email
      });
      // Show only orders from last 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      return orders.filter(order => 
        ['received', 'preparing', 'ready'].includes(order.status) &&
        new Date(order.created_date) > tenMinutesAgo
      );
    },
    enabled: !!user && userType === 'customer',
    refetchInterval: 5000,
  });

  const cartItemsCount = carts.reduce((total, cart) => {
    return total + (cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
  }, 0);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const customerLinks = [
      { name: 'Home', icon: Home, page: 'Home' },
      { name: 'חיפוש', icon: Search, page: 'Search' },
      { name: 'עגלה', icon: ShoppingCart, page: 'Cart', badge: cartItemsCount },
      { name: 'ההזמנות שלי', icon: ClipboardList, page: 'MyOrders' },
      { name: 'תמיכה', icon: MessageSquare, page: 'Support' },
    ];

  const cookLinks = [
    { name: 'דשבורד', icon: LayoutDashboard, page: 'CookDashboard' },
    { name: 'הזמנות', icon: ClipboardList, page: 'CookOrders' },
    { name: 'קטלוג', icon: Package, page: 'CookMenu' },
    { name: 'הגדרות', icon: Settings, page: 'CookSettings' },
  ];

  const adminLinks = [
    { name: 'דשבורד', icon: LayoutDashboard, page: 'AdminDashboard' },
        { name: 'אישורים', icon: Bell, page: 'AdminApprovals' },
        { name: 'משתמשים', icon: Users, page: 'AdminUsers' },
        { name: 'מוכרים', icon: Store, page: 'AdminCooks' },
        { name: 'הזמנות', icon: ClipboardList, page: 'AdminOrders' },
        { name: 'תמיכה', icon: MessageSquare, page: 'AdminSupport' },
  ];

  const links = userType === 'admin' ? adminLinks : userType === 'cook' ? cookLinks : customerLinks;

  const NavLink = ({ link }) => {
    const isActive = currentPageName === link.page;
    return (
      <Link
        to={createPageUrl(link.page)}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive 
            ? 'bg-orange-100 text-orange-600 font-medium' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <link.icon className="w-5 h-5" />
        <span>{link.name}</span>
        {link.badge > 0 && (
          <Badge className="bg-orange-500 text-white ml-auto">{link.badge}</Badge>
        )}
      </Link>
    );
  };

  // Public pages without full navigation
  const publicPages = ['Home', 'Search', 'CookProfile'];
  const isPublicPage = publicPages.includes(currentPageName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50" dir="rtl">
      <style>{`
        :root {
          --primary: #F97316;
          --primary-hover: #EA580C;
          --secondary: #22C55E;
          --background: #FDF6E3;
        }
      `}</style>

      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              מוכרים ביתיים
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to={createPageUrl('Landing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentPageName === 'Landing'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm font-medium">מי אנחנו</span>
            </Link>
            {links.map((link) => (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentPageName === link.page
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{link.name}</span>
                {link.badge > 0 && (
                  <Badge className="bg-orange-500 text-white text-xs">{link.badge}</Badge>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user.full_name}</span>
                  {userType !== 'customer' && (
                    <Badge variant="outline" className="text-xs">
                      {userType === 'cook' ? 'מוכר' : 'מנהל'}
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => base44.auth.redirectToLogin()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                התחברות
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white">
                <div className="flex flex-col gap-2 mt-8">
                  <Link
                    to={createPageUrl('Landing')}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      currentPageName === 'Landing'
                        ? 'bg-orange-100 text-orange-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>מי אנחנו</span>
                  </Link>
                  {links.map((link) => (
                    <NavLink key={link.page} link={link} />
                  ))}
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 mt-4"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>התנתקות</span>
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
        <div className="flex justify-around">
          {links.slice(0, 4).map((link) => {
            const isActive = currentPageName === link.page;
            return (
              <Link
                key={link.page}
                to={createPageUrl(link.page)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all ${
                  isActive ? 'text-orange-600' : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <link.icon className="w-5 h-5" />
                  {link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Active Order Indicator - Bottom Right - All screens */}
      {userType === 'customer' && activeOrders.length > 0 && (
        <Link
          to={createPageUrl('MyOrders')}
          className="fixed bottom-20 md:bottom-6 left-4 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-2xl p-4 hover:scale-110 transition-transform animate-pulse"
        >
          <div className="relative">
            <ClipboardList className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {activeOrders.length}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}