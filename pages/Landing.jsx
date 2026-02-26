import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  ChefHat, Star, Users, TrendingUp, ArrowLeft, 
  Check, Play, Sparkles, Phone, ShoppingCart,
  Clock, MapPin, Heart, Shield, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function Landing() {
  const navigate = useNavigate();
  const [phoneStep, setPhoneStep] = useState(0);

  // Simulate order flow in phone
  useEffect(() => {
    const interval = setInterval(() => {
      setPhoneStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const phoneSteps = [
    { 
      title: 'בחירת מבשל',
      icon: ChefHat,
      bg: 'from-orange-400 to-orange-600',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'
    },
    { 
      title: 'בחירת מנות',
      icon: ShoppingCart,
      bg: 'from-green-400 to-green-600',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    },
    { 
      title: 'אישור הזמנה',
      icon: Check,
      bg: 'from-blue-400 to-blue-600',
      image: 'https://images.unsplash.com/photo-1556909114-44e3e7c4e255?w=400'
    },
    { 
      title: 'מעקב חי',
      icon: Clock,
      bg: 'from-purple-400 to-purple-600',
      image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden" dir="rtl">
      {/* Hero Section with Phone Simulator */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 right-20 w-96 h-96 bg-orange-300 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-amber-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-orange-500 text-white mb-4 text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 ml-2" />
              המהפכה באוכל ביתי
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-gray-900">אוכל ביתי</span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                ישירות אליכם
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              גלו מאות מבשלים ביתיים מוכשרים באזורכם. 
              מתכונים משפחתיים, אוכל טרי שמכינים באהבה, 
              והכל במרחק הקלקה.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button 
                size="lg"
                onClick={() => navigate(createPageUrl('Search'))}
                className="bg-orange-500 hover:bg-orange-600 h-14 px-8 text-lg"
              >
                התחילו להזמין
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate(createPageUrl('BecomeACook'))}
                className="h-14 px-8 text-lg border-2"
              >
                <ChefHat className="w-5 h-5 ml-2" />
                הצטרפו כמבשלים
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold text-orange-600">150+</div>
                <div className="text-gray-600 text-sm">מבשלים</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">2,500+</div>
                <div className="text-gray-600 text-sm">מנות</div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <div className="text-3xl font-bold text-orange-600">4.8</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Phone Simulator */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center"
          >
            {/* Phone Frame */}
            <div className="relative w-80 h-[650px]">
              {/* Phone Shadow */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] shadow-2xl transform rotate-2" />
              
              {/* Phone Body */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-[3rem] shadow-2xl p-3">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-20" />
                
                {/* Screen */}
                <div className="relative h-full bg-white rounded-[2.5rem] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={phoneStep}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5 }}
                      className="h-full flex flex-col"
                    >
                      {/* Status Bar */}
                      <div className="flex justify-between items-center px-6 pt-8 pb-3">
                        <span className="text-xs font-semibold">9:41</span>
                        <div className="flex gap-1">
                          <div className="w-1 h-3 bg-gray-800 rounded" />
                          <div className="w-1 h-3 bg-gray-800 rounded" />
                          <div className="w-1 h-3 bg-gray-800 rounded" />
                        </div>
                      </div>

                      {/* App Header */}
                      <div className="px-6 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                            <ChefHat className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-bold">מבשלים ביתיים</span>
                        </div>
                        <h3 className="text-lg font-bold">{phoneSteps[phoneStep].title}</h3>
                      </div>

                      {/* Content */}
                      <div className="flex-1 px-6 pb-6 overflow-hidden">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className={`h-48 rounded-2xl bg-gradient-to-br ${phoneSteps[phoneStep].bg} p-4 flex flex-col justify-between shadow-lg mb-4`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                              {React.createElement(phoneSteps[phoneStep].icon, { className: "w-7 h-7 text-white" })}
                            </div>
                            <Badge className="bg-white/20 text-white backdrop-blur">
                              שלב {phoneStep + 1}/4
                            </Badge>
                          </div>
                          <div>
                            <div className="w-3/4 h-2 bg-white/20 rounded-full mb-2" />
                            <div className="w-1/2 h-2 bg-white/20 rounded-full" />
                          </div>
                        </motion.div>

                        {/* Mini Cards */}
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                            >
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg" />
                              <div className="flex-1">
                                <div className="w-24 h-2 bg-gray-200 rounded-full mb-2" />
                                <div className="w-16 h-2 bg-gray-200 rounded-full" />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Button */}
                      <div className="px-6 pb-8">
                        <div className={`h-12 rounded-full bg-gradient-to-r ${phoneSteps[phoneStep].bg} flex items-center justify-center text-white font-bold shadow-lg`}>
                          {phoneStep === 3 ? 'הזמנה הושלמה!' : 'המשך'}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -right-4 top-20 w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute -left-4 bottom-32 w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400"
        >
          <span className="text-sm">גלו עוד</span>
          <ArrowLeft className="w-5 h-5 rotate-90" />
        </motion.div>
      </section>

      {/* How It Works - Interactive Screens */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="bg-orange-500 text-white mb-4">
              איך זה עובד?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              4 צעדים פשוטים להזמנה
            </h2>
            <p className="text-xl text-gray-400">
              מחיפוש ועד האוכל בצלחת - הכל במרחק קליק
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                step: '1',
                title: 'חפשו מבשל באזורכם',
                desc: 'סננו לפי עיר, סגנון אוכל והעדפות תזונתיות',
                image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600',
                icon: MapPin,
                color: 'from-blue-500 to-blue-600'
              },
              {
                step: '2',
                title: 'בחרו מנות מהתפריט',
                desc: 'כל מבשל עם תפריט ייחודי ומנת היום מיוחדת',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
                icon: ShoppingCart,
                color: 'from-green-500 to-green-600'
              },
              {
                step: '3',
                title: 'אשרו והזמינו',
                desc: 'תשלום מזומן או ביט, ללא עמלות נסתרות',
                image: 'https://images.unsplash.com/photo-1556909114-44e3e7c4e255?w=600',
                icon: Check,
                color: 'from-orange-500 to-orange-600'
              },
              {
                step: '4',
                title: 'עקבו בזמן אמת',
                desc: 'התקבלה → בהכנה → מוכנה → איסוף',
                image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600',
                icon: Clock,
                color: 'from-purple-500 to-purple-600'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-80 group-hover:opacity-90 transition-opacity`} />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    {/* Step Number */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center font-bold text-2xl">
                        {item.step}
                      </div>
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                        <item.icon className="w-6 h-6" />
                      </div>
                    </div>
                    
                    {/* Text */}
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                      <p className="text-white/90">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Demo Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl('Search'))}
              className="bg-orange-500 hover:bg-orange-600 h-14 px-8 text-lg"
            >
              נסו עכשיו בחינם
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              למה לבחור בנו?
            </h2>
            <p className="text-xl text-gray-600">
              החוויה המושלמת של אוכל ביתי
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'מבשלים מאומתים',
                desc: 'כל מבשל עובר אימות וביקורת איכות לפני ההצטרפות',
                color: 'from-blue-400 to-blue-600'
              },
              {
                icon: Zap,
                title: 'הזמנה מהירה',
                desc: 'תהליך הזמנה פשוט ומהיר תוך דקות ספורות',
                color: 'from-orange-400 to-orange-600'
              },
              {
                icon: Heart,
                title: 'אוכל באהבה',
                desc: 'כל מנה מוכנת עם אהבה ותשומת לב אישית',
                color: 'from-pink-400 to-pink-600'
              },
              {
                icon: MapPin,
                title: 'מקומי ותומך',
                desc: 'תמכו במבשלים מקומיים באזורכם',
                color: 'from-green-400 to-green-600'
              },
              {
                icon: Star,
                title: 'דירוגים אמיתיים',
                desc: 'מערכת דירוגים שקופה וביקורות אמיתיות',
                color: 'from-amber-400 to-amber-600'
              },
              {
                icon: Clock,
                title: 'מעקב בזמן אמת',
                desc: 'עקבו אחר ההזמנה שלכם בכל שלב',
                color: 'from-purple-400 to-purple-600'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group border-0 bg-gradient-to-br from-white to-gray-50">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              מה אומרים עלינו?
            </h2>
            <p className="text-xl text-gray-600">
              אלפי לקוחות מרוצים
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'דני כהן',
                role: 'לקוח מרוצה',
                text: 'הקוסקוס של שרה הוא הכי טוב שאכלתי! בדיוק כמו של סבתא. המערכת קלה ונוחה והאוכל תמיד חם וטרי.',
                rating: 5,
                image: 'https://ui-avatars.com/api/?name=Danny+Cohen&background=F97316&color=fff'
              },
              {
                name: 'מיכל לוי',
                role: 'מבשלת ביתית',
                text: 'הצטרפתי לפני 3 חודשים וזה שינה לי את החיים! קיבלתי כבר מעל 50 הזמנות ואני אוהבת כל רגע.',
                rating: 5,
                image: 'https://ui-avatars.com/api/?name=Michal+Levi&background=F97316&color=fff'
              },
              {
                name: 'יוסי אברהם',
                role: 'לקוח קבוע',
                text: 'אני מזמין כל שבוע ממבשלים שונים. האיכות מדהימה והמחירים הוגנים. ממש כמו לאכול אצל אמא.',
                rating: 5,
                image: 'https://ui-avatars.com/api/?name=Yossi+Abraham&background=F97316&color=fff'
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-bold">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-500 to-amber-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              מוכנים להתחיל?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              הצטרפו לאלפי לקוחות מרוצים שכבר נהנים מאוכל ביתי איכותי
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate(createPageUrl('Search'))}
                className="bg-white text-orange-600 hover:bg-gray-100 h-14 px-8 text-lg"
              >
                התחילו להזמין עכשיו
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate(createPageUrl('BecomeACook'))}
                className="border-2 border-white text-white hover:bg-white/10 h-14 px-8 text-lg"
              >
                <ChefHat className="w-5 h-5 ml-2" />
                הצטרפו כמבשלים
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">מבשלים ביתיים</span>
          </div>
          <p className="text-gray-400 mb-6">
            המקום שבו אוכל ביתי אמיתי פוגש טכנולוגיה מתקדמת
          </p>
          <div className="text-sm text-gray-500">
            © 2024 מבשלים ביתיים. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  );
}