import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { 
  User, MapPin, Phone, Clock, Image, Save, Camera, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const DAYS = [
  { key: 'sunday', label: 'ראשון' },
  { key: 'monday', label: 'שני' },
  { key: 'tuesday', label: 'שלישי' },
  { key: 'wednesday', label: 'רביעי' },
  { key: 'thursday', label: 'חמישי' },
  { key: 'friday', label: 'שישי' },
  { key: 'saturday', label: 'שבת' },
];

const TAGS = ['כשר', 'טבעוני', 'צמחוני', 'ללא גלוטן', 'ביתי', 'אסייתי', 'איטלקי', 'מרוקאי', 'עיראקי', 'תימני'];

export default function CookSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cook, setCook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    phone: '',
    address: '',
    city: '',
    profile_image: '',
    cover_image: '',
    min_order_amount: 0,
    estimated_prep_time: 30,
    tags: [],
    open_hours: {}
  });

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
        const cookData = cooks[0];
        setCook(cookData);
        setFormData({
          display_name: cookData.display_name || '',
          bio: cookData.bio || '',
          phone: cookData.phone || '',
          address: cookData.address || '',
          city: cookData.city || '',
          profile_image: cookData.profile_image || '',
          cover_image: cookData.cover_image || '',
          min_order_amount: cookData.min_order_amount || 0,
          estimated_prep_time: cookData.estimated_prep_time || 30,
          tags: cookData.tags || [],
          open_hours: cookData.open_hours || {}
        });
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
    setIsLoading(false);
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // Check if restaurant should be open based on current time and open hours
      const isCurrentlyOpen = checkIfOpen(data.open_hours);
      await base44.entities.Cook.update(cook.id, { ...data, is_open: isCurrentlyOpen });
    },
    onSuccess: () => {
      toast({
        title: 'נשמר!',
        description: 'ההגדרות נשמרו בהצלחה',
      });
      loadCook(); // Reload to get updated is_open status
    }
  });

  const checkIfOpen = (openHours) => {
    if (!openHours) return false;
    
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    
    const todayHours = openHours[currentDay];
    if (!todayHours || !todayHours.is_open) return false;
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = (todayHours.open || '09:00').split(':').map(Number);
    const [closeHour, closeMin] = (todayHours.close || '21:00').split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, [field]: result.file_url });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTag = (tag) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    setFormData({ ...formData, tags: newTags });
  };

  const updateOpenHours = (day, field, value) => {
    setFormData({
      ...formData,
      open_hours: {
        ...formData.open_hours,
        [day]: {
          ...formData.open_hours[day],
          [field]: value
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold mb-6">הגדרות פרופיל</h1>

      {/* Cover & Profile Images */}
      <Card className="mb-6 overflow-hidden">
        <div className="relative h-40">
          {formData.cover_image ? (
            <>
              <img
                src={formData.cover_image}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 left-2 h-8 w-8"
                onClick={() => setFormData({ ...formData, cover_image: '' })}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <label className="flex items-center justify-center w-full h-full bg-gray-100 cursor-pointer hover:bg-gray-200">
              <div className="text-center">
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-500">תמונת רקע</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'cover_image')}
              />
            </label>
          )}

          <div className="absolute -bottom-10 right-6">
            <div className="relative">
              {formData.profile_image ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={formData.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <label className="w-20 h-20 rounded-2xl bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-200">
                  <Camera className="w-6 h-6 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'profile_image')}
                  />
                </label>
              )}
              {formData.profile_image && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -left-2 h-6 w-6"
                  onClick={() => setFormData({ ...formData, profile_image: '' })}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <CardContent className="pt-14 pb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="display_name">שם המבשל/ת</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="השם שיוצג ללקוחות"
              />
            </div>
            <div>
              <Label htmlFor="bio">אודות</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="ספרו על עצמכם ועל סגנון הבישול שלכם"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Location */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            פרטי קשר ומיקום
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">טלפון</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="050-0000000"
            />
          </div>
          <div>
            <Label htmlFor="city">עיר</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="העיר שלכם"
            />
          </div>
          <div>
            <Label htmlFor="address">כתובת</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="כתובת מלאה לאיסוף"
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">הגדרות הזמנה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_order">מינימום הזמנה (₪)</Label>
              <Input
                id="min_order"
                type="number"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({ ...formData, min_order_amount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="prep_time">זמן הכנה (דקות)</Label>
              <Input
                id="prep_time"
                type="number"
                value={formData.estimated_prep_time}
                onChange={(e) => setFormData({ ...formData, estimated_prep_time: parseInt(e.target.value) || 30 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">תגיות וסגנון</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                className={`cursor-pointer text-sm ${
                  formData.tags.includes(tag) ? 'bg-orange-500' : ''
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            שעות פעילות
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            הגדרו את שעות הפעילות שלכם. כאשר המסעדה מחוץ לשעות הפעילות, היא תהיה סגורה להזמנות באופן אוטומטי.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {DAYS.map((day) => (
            <div key={day.key} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-base">{day.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {formData.open_hours[day.key]?.is_open ? 'פעיל' : 'סגור'}
                  </span>
                  <Switch
                    checked={formData.open_hours[day.key]?.is_open || false}
                    onCheckedChange={(checked) => updateOpenHours(day.key, 'is_open', checked)}
                  />
                </div>
              </div>
              
              {formData.open_hours[day.key]?.is_open && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1 block">שעת פתיחה</Label>
                    <Input
                      type="time"
                      value={formData.open_hours[day.key]?.open || '09:00'}
                      onChange={(e) => updateOpenHours(day.key, 'open', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="hidden sm:flex items-center justify-center pt-5">
                    <span className="text-gray-400 text-lg">→</span>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-600 mb-1 block">שעת סגירה</Label>
                    <Input
                      type="time"
                      value={formData.open_hours[day.key]?.close || '21:00'}
                      onChange={(e) => updateOpenHours(day.key, 'close', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saveMutation.isLoading || !formData.display_name}
        className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-lg"
      >
        <Save className="w-5 h-5 ml-2" />
        שמירת הגדרות
      </Button>
    </div>
  );
}