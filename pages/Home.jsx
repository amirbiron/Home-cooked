import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '../components/home/HeroSection';
import FeaturedCooks from '../components/home/FeaturedCooks';
import DailySpecials from '../components/home/DailySpecials';
import { Store, Users, Utensils, Heart, Clock, Loader2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (e) {
      setUser(null);
    }
  };

  const { data: allCooks, isLoading: cooksLoading } = useQuery({
    queryKey: ['cooks'],
    queryFn: () => base44.entities.Cook.filter({ is_active: true, approval_status: 'approved' }, '-avg_rating', 50),
  });

  const { data: dailySpecials, isLoading: specialsLoading } = useQuery({
    queryKey: ['dailySpecials'],
    queryFn: () => base44.entities.Dish.filter({ is_daily_special: true, is_available: true }),
  });

  const { data: activeOrders = [] } = useQuery({
    queryKey: ['activeOrdersHome', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const orders = await base44.entities.Order.filter({ 
        customer_email: user.email
      });
      // Show only active orders (not canceled/delivered) from last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return orders.filter(order => 
        ['received', 'preparing', 'ready'].includes(order.status) &&
        new Date(order.created_date) > oneHourAgo
      );
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  const handleSearch = (query) => {
    navigate(createPageUrl(`Search?q=${encodeURIComponent(query)}`));
  };

  // Categories based on tags
  const categories = [
    { id: 'all', name: 'הכל', icon: '🍽️' },
    { id: 'כשר', name: 'כשר', icon: '✡️' },
    { id: 'טבעוני', name: 'טבעוני', icon: '🌱' },
    { id: 'מזרחי', name: 'מזרחי', icon: '🌶️' },
    { id: 'איטלקי', name: 'איטלקי', icon: '🍝' },
    { id: 'אסייתי', name: 'אסייתי', icon: '🍜' },
    { id: 'ביתי', name: 'ביתי', icon: '🏠' },
    { id: 'בריאות', name: 'בריאות', icon: '🥗' },
  ];

  const getCooksByCategory = (category) => {
    if (!allCooks) return [];
    if (category === 'all') return allCooks;
    return allCooks.filter(cook => 
      cook.tags?.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
    );
  };

  const filteredCooks = getCooksByCategory(selectedCategory);

  return (
    <div className="min-h-screen">
      <HeroSection onSearch={handleSearch} />

      {/* Active Orders Banner */}
      {activeOrders.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pt-6">
          <div 
            onClick={() => navigate(createPageUrl('MyOrders'))}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02] relative overflow-hidden"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="relative flex items-center gap-4">
              {/* Spinning loader icon */}
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white font-bold text-xs text-white">
                  {activeOrders.length}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-1">
                  {activeOrders.length === 1 ? 'יש לך הזמנה פעילה!' : `יש לך ${activeOrders.length} הזמנות פעילות!`}
                </h3>
                <p className="text-white/90 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  לחץ לצפייה בסטטוס ההזמנות שלך
                </p>
              </div>

              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                  <span className="text-white font-bold text-lg">לחץ לצפייה →</span>
                </div>
              </div>
            </div>

            {/* Pulse animation overlay */}
            <div className="absolute inset-0 rounded-3xl animate-pulse bg-white/5"></div>
          </div>
        </section>
      )}
      
      <DailySpecials 
        dishes={dailySpecials} 
        cooks={allCooks}
        isLoading={specialsLoading} 
      />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">מוכרים לפי סגנון</h2>
        
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-orange-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span>{cat.name}</span>
              {cat.id === 'all' && allCooks && (
                <span className="text-sm opacity-80">({allCooks.length})</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Cooks Grid by Category */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">
            {selectedCategory === 'all' ? 'כל המוכרים' : categories.find(c => c.id === selectedCategory)?.name}
          </h3>
          <span className="text-gray-500">
            {filteredCooks.length} מוכרים
          </span>
        </div>

        {cooksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredCooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCooks.map((cook) => (
              <div
                key={cook.id}
                onClick={() => navigate(createPageUrl(`CookProfile?id=${cook.id}`))}
                className="group cursor-pointer"
              >
                <div className="relative h-48 rounded-2xl overflow-hidden mb-3">
                  <img
                    src={cook.cover_image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'}
                    alt={cook.display_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {cook.is_open ? (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      פתוח
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                      סגור
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 w-12 h-12 rounded-xl border-2 border-white overflow-hidden">
                    <img
                      src={cook.profile_image || `https://ui-avatars.com/api/?name=${cook.display_name}&background=F97316&color=fff`}
                      alt={cook.display_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1 group-hover:text-orange-600 transition-colors">
                  {cook.display_name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <span>{cook.city}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span>⭐</span>
                    <span>{cook.avg_rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
                {cook.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {cook.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-orange-50 text-orange-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">לא נמצאו מוכרים בקטגוריה זו</h3>
            <p className="text-gray-500">נסו לבחור קטגוריה אחרת</p>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">איך זה עובד?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Users, title: 'בחרו מוכר', desc: 'גלשו בין המוכרים הביתיים באזורכם' },
            { icon: Utensils, title: 'בחרו מוצרים', desc: 'עיינו בקטלוג ובמוצר המיוחד של היום' },
            { icon: Store, title: 'המוכר מטפל', desc: 'המוכר מקבל את ההזמנה ומתחיל לטפל בה' },
            { icon: Heart, title: 'תהנו!', desc: 'קבלו את המוצרים ותהנו!' },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            אתם מוכרים מוכשרים?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            הצטרפו לקהילת המוכרים הביתיים שלנו והתחילו למכור את המוצרים שלכם
          </p>
          <button 
            onClick={() => navigate(createPageUrl('BecomeACook'))}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
          >
            הצטרפו כמוכרים
          </button>
        </div>
      </section>
    </div>
  );
}