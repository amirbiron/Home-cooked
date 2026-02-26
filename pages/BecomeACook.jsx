import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { 
  ChefHat, Star, Users, TrendingUp, ArrowLeft,
  CheckCircle2, Phone, MapPin, User, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function BecomeACook() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('info'); // info, form, success
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    city: '',
    bio: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setFormData(prev => ({
        ...prev,
        display_name: currentUser.full_name || '',
        phone: currentUser.phone || ''
      }));

      // Check if already a cook
      if (currentUser.user_type === 'cook') {
        const cooks = await base44.entities.Cook.filter({ user_email: currentUser.email });
        if (cooks.length > 0) {
          navigate(createPageUrl('CookDashboard'));
        }
      }
    } catch (e) {
      // Not logged in
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    setIsSubmitting(true);
    try {
      // Create cook profile with pending status
      await base44.entities.Cook.create({
        user_email: user.email,
        display_name: formData.display_name,
        phone: formData.phone,
        city: formData.city,
        bio: formData.bio,
        is_open: false,
        is_active: false,
        approval_status: 'pending',
        avg_rating: 5,
        total_orders: 0
      });

      // Don't update user type yet - wait for admin approval

      setStep('success');
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Clock className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">הבקשה נשלחה!</h1>
          <p className="text-gray-600 mb-4">
            הפרופיל שלכם נוצר ונשלח לאישור צוות האתר.
          </p>
          <p className="text-gray-600 mb-8">
            תקבלו התראה לאימייל כשהפרופיל יאושר ותוכלו להתחיל לקבל הזמנות. 
            זה בדרך כלל לוקח עד 24 שעות.
          </p>
          <Button
            onClick={() => navigate(createPageUrl('Home'))}
            className="bg-orange-500 hover:bg-orange-600 w-full h-12"
          >
            חזרה לעמוד הבית
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold">הרשמה כמבשל/ת</h1>
          <p className="text-gray-600">מלאו את הפרטים כדי להתחיל</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="name">
                <User className="w-4 h-4 inline ml-1" />
                שם שיוצג ללקוחות
              </Label>
              <Input
                id="name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="השם שלכם"
              />
            </div>

            <div>
              <Label htmlFor="phone">
                <Phone className="w-4 h-4 inline ml-1" />
                טלפון
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="050-0000000"
              />
            </div>

            <div>
              <Label htmlFor="city">
                <MapPin className="w-4 h-4 inline ml-1" />
                עיר
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="העיר שלכם"
              />
            </div>

            <div>
              <Label htmlFor="bio">קצת עליכם ועל הבישול</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="ספרו על סגנון הבישול שלכם, התמחות מיוחדת..."
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!formData.display_name || !formData.city || isSubmitting}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 mt-4"
            >
              {isSubmitting ? 'יוצר פרופיל...' : 'צור פרופיל מבשל'}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setStep('info')}
              className="w-full"
            >
              חזרה
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Info page
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-amber-500 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <ChefHat className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            הפכו את התשוקה שלכם לעסק
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            הצטרפו לקהילת המבשלים הביתיים שלנו ומכרו את המנות שלכם לאלפי לקוחות
          </p>
          <Button
            onClick={() => user ? setStep('form') : base44.auth.redirectToLogin()}
            size="lg"
            className="bg-white text-orange-600 hover:bg-gray-100 h-14 px-8 text-lg"
          >
            התחילו עכשיו
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">למה להצטרף אלינו?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">הכנסה נוספת</h3>
                <p className="text-gray-600">
                  הפכו את הבישול שלכם למקור הכנסה, בזמנים שנוחים לכם
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">קהילה תומכת</h3>
                <p className="text-gray-600">
                  הצטרפו לקהילת מבשלים מוכשרים עם תמיכה ועזרה הדדית
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Star className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="font-bold text-xl mb-2">חשיפה ללקוחות</h3>
                <p className="text-gray-600">
                  הגיעו לאלפי לקוחות חדשים שמחפשים אוכל ביתי אמיתי
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד?</h2>
          <div className="space-y-6">
            {[
              { num: 1, title: 'הירשמו בחינם', desc: 'צרו פרופיל מבשל תוך דקות ספורות' },
              { num: 2, title: 'בנו את התפריט', desc: 'הוסיפו את המנות שלכם עם תמונות ותיאורים' },
              { num: 3, title: 'קבלו הזמנות', desc: 'התחילו לקבל הזמנות מלקוחות באזורכם' },
              { num: 4, title: 'הכינו ומסרו', desc: 'בשלו את המנות והרוויחו מכל הזמנה' },
            ].map((step) => (
              <div key={step.num} className="flex items-center gap-6 bg-white p-6 rounded-2xl">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">מוכנים להתחיל?</h2>
          <p className="text-gray-600 mb-8">
            ההרשמה חינמית ותוכלו להתחיל לקבל הזמנות כבר היום
          </p>
          <Button
            onClick={() => user ? setStep('form') : base44.auth.redirectToLogin()}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 h-14 px-8 text-lg"
          >
            {user ? 'צרו פרופיל מבשל' : 'התחברו והתחילו'}
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}