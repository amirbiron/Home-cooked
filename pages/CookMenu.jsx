import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit2, Trash2, Sparkles, Eye, EyeOff,
  Image, X, Save, Star, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet as AlertSheet,
  SheetContent as AlertSheetContent,
  SheetHeader as AlertSheetHeader,
  SheetTitle as AlertSheetTitle,
} from '@/components/ui/sheet';

const CATEGORIES = [
  { value: 'main', label: 'מנה עיקרית' },
  { value: 'appetizer', label: 'ראשונה' },
  { value: 'side', label: 'תוספת' },
  { value: 'dessert', label: 'קינוח' },
  { value: 'drink', label: 'שתייה' },
  { value: 'other', label: 'אחר' },
];

const TAGS = ['טבעוני', 'צמחוני', 'ללא גלוטן', 'חריף', 'ילדים', 'פופולרי'];
const ALLERGENS = ['גלוטן', 'אגוזים', 'חלב', 'ביצים', 'סויה', 'שומשום'];

export default function CookMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cook, setCook] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'main',
    photo_url: '',
    tags: [],
    allergens: [],
    is_available: true,
    is_daily_special: false,
    daily_special_note: '',
    customization_options: {
      removable_items: [],
      extra_toppings: []
    }
  });
  const [newRemovableItem, setNewRemovableItem] = useState('');
  const [newTopping, setNewTopping] = useState({ name: '', price: '' });
  const [showCustomization, setShowCustomization] = useState(false);

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
        setCook(cooks[0]);
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: dishes, isLoading } = useQuery({
    queryKey: ['dishes', cook?.id],
    queryFn: () => base44.entities.Dish.filter({ cook_id: cook.id }, 'sort_order'),
    enabled: !!cook?.id,
  });

  const saveDishMutation = useMutation({
    mutationFn: async (dishData) => {
      // If setting as daily special, remove from other dishes first
      if (dishData.is_daily_special) {
        const currentSpecial = dishes?.find(d => d.is_daily_special && d.id !== editingDish?.id);
        if (currentSpecial) {
          await base44.entities.Dish.update(currentSpecial.id, { 
            is_daily_special: false,
            daily_special_note: ''
          });
        }
      }

      if (editingDish) {
        await base44.entities.Dish.update(editingDish.id, dishData);
      } else {
        await base44.entities.Dish.create({ ...dishData, cook_id: cook.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dishes']);
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteDishMutation = useMutation({
    mutationFn: async (dishId) => {
      await base44.entities.Dish.delete(dishId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dishes']);
      setDeleteConfirm(null);
    }
  });

  const toggleAvailableMutation = useMutation({
    mutationFn: async ({ dishId, isAvailable }) => {
      await base44.entities.Dish.update(dishId, { is_available: isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dishes']);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'main',
      photo_url: '',
      tags: [],
      allergens: [],
      is_available: true,
      is_daily_special: false,
      daily_special_note: '',
      customization_options: { removable_items: [], extra_toppings: [] }
    });
    setEditingDish(null);
    setNewRemovableItem('');
    setNewTopping({ name: '', price: '' });
    setShowCustomization(false);
  };

  const openEditDialog = (dish) => {
    setEditingDish(dish);
    setFormData({
      title: dish.title || '',
      description: dish.description || '',
      price: dish.price?.toString() || '',
      category: dish.category || 'main',
      photo_url: dish.photo_url || '',
      tags: dish.tags || [],
      allergens: dish.allergens || [],
      is_available: dish.is_available !== false,
      is_daily_special: dish.is_daily_special || false,
      daily_special_note: dish.daily_special_note || '',
      customization_options: {
        removable_items: dish.customization_options?.removable_items || [],
        extra_toppings: dish.customization_options?.extra_toppings || []
      }
    });
    setNewRemovableItem('');
    setNewTopping({ name: '', price: '' });
    setShowCustomization(false);
    setShowDialog(true);
  };

  const addRemovableItem = () => {
    const item = newRemovableItem.trim();
    if (!item) return;
    const updated = [...(formData.customization_options?.removable_items || []), item];
    setFormData({ ...formData, customization_options: { ...formData.customization_options, removable_items: updated } });
    setNewRemovableItem('');
  };

  const removeRemovableItem = (index) => {
    const updated = formData.customization_options.removable_items.filter((_, i) => i !== index);
    setFormData({ ...formData, customization_options: { ...formData.customization_options, removable_items: updated } });
  };

  const addTopping = () => {
    const name = newTopping.name.trim();
    const price = parseFloat(newTopping.price) || 0;
    if (!name) return;
    const updated = [...(formData.customization_options?.extra_toppings || []), { name, price }];
    setFormData({ ...formData, customization_options: { ...formData.customization_options, extra_toppings: updated } });
    setNewTopping({ name: '', price: '' });
  };

  const removeTopping = (index) => {
    const updated = formData.customization_options.extra_toppings.filter((_, i) => i !== index);
    setFormData({ ...formData, customization_options: { ...formData.customization_options, extra_toppings: updated } });
  };

  const handleSave = () => {
    saveDishMutation.mutate({
      ...formData,
      price: parseFloat(formData.price) || 0
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, photo_url: result.file_url });
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

  const toggleAllergen = (allergen) => {
    const newAllergens = formData.allergens.includes(allergen)
      ? formData.allergens.filter(a => a !== allergen)
      : [...formData.allergens, allergen];
    setFormData({ ...formData, allergens: newAllergens });
  };

  if (isLoading || !cook) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const dailySpecial = dishes?.find(d => d.is_daily_special);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול תפריט</h1>
        <Button 
          onClick={() => { resetForm(); setShowDialog(true); }}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 ml-2" />
          הוספת מנה
        </Button>
      </div>

      {/* Daily Special */}
      {dailySpecial && (
        <Card className="mb-6 border-2 border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              מנת היום
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden">
                <img
                  src={dailySpecial.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                  alt={dailySpecial.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold">{dailySpecial.title}</h4>
                {dailySpecial.daily_special_note && (
                  <p className="text-amber-700 text-sm italic">"{dailySpecial.daily_special_note}"</p>
                )}
              </div>
              <Button variant="outline" onClick={() => openEditDialog(dailySpecial)}>
                <Edit2 className="w-4 h-4 ml-1" />
                ערוך
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dishes List */}
      <div className="space-y-4">
        {dishes?.map((dish) => (
          <Card key={dish.id} className={`overflow-hidden ${!dish.is_available ? 'opacity-60' : ''}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={dish.photo_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                  alt={dish.title}
                  className="w-full h-full object-cover"
                />
                {dish.is_daily_special && (
                  <div className="absolute top-1 right-1">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold truncate">{dish.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {CATEGORIES.find(c => c.value === dish.category)?.label}
                  </Badge>
                </div>
                <p className="text-gray-500 text-sm truncate">{dish.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {dish.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="text-left flex-shrink-0">
                <p className="text-xl font-bold text-orange-600">₪{dish.price}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleAvailableMutation.mutate({ dishId: dish.id, isAvailable: !dish.is_available })}
                  title={dish.is_available ? 'הסתר מנה' : 'הצג מנה'}
                >
                  {dish.is_available ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(dish)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setDeleteConfirm(dish)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!dishes || dishes.length === 0) && (
          <div className="text-center py-16">
            <Plus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">התפריט ריק</h3>
            <p className="text-gray-500 mb-4">התחילו להוסיף מנות לתפריט</p>
            <Button 
              onClick={() => { resetForm(); setShowDialog(true); }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוספת מנה ראשונה
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Sheet */}
      <Sheet open={showDialog} onOpenChange={setShowDialog}>
        <SheetContent side="bottom" className="h-[95vh] rounded-t-3xl border-0 bg-white" dir="rtl">
          {/* iOS Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <SheetHeader className="px-5 py-4 border-b border-gray-100">
            <SheetTitle className="text-2xl font-bold text-gray-900 text-right">
              {editingDish ? 'עריכת מנה' : 'הוספת מנה חדשה'}
            </SheetTitle>
          </SheetHeader>

          <div className="overflow-y-auto h-[calc(95vh-180px)] px-5 py-6">
            <div className="space-y-6">
              {/* Photo */}
              <div>
                <Label className="text-base font-bold text-gray-900 block mb-3">תמונת המנה</Label>
                {formData.photo_url ? (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden">
                    <img
                      src={formData.photo_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 left-3 h-10 w-10 rounded-full shadow-lg"
                      onClick={() => setFormData({ ...formData, photo_url: '' })}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
                    <Image className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-base font-medium text-gray-600">לחץ להעלאת תמונה</span>
                    <span className="text-sm text-gray-400 mt-1">PNG, JPG עד 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-base font-bold text-gray-900 block mb-2">שם המנה</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="למשל: שניצל ביתי"
                  className="h-12 text-base border-2 rounded-xl"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-base font-bold text-gray-900 block mb-2">תיאור</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ספרו על המנה, הרכיבים והטעם"
                  rows={3}
                  className="text-base border-2 rounded-xl"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-base font-bold text-gray-900 block mb-2">מחיר (₪)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    className="h-12 text-base border-2 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-base font-bold text-gray-900 block mb-2">קטגוריה</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-12 border-2 rounded-xl text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-base font-bold text-gray-900 block mb-3">תגיות</Label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                      className={`cursor-pointer text-sm px-4 py-2 transition-all active:scale-95 ${
                        formData.tags.includes(tag) ? 'bg-orange-500 hover:bg-orange-600' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <Label className="text-base font-bold text-gray-900 block mb-3">אלרגנים</Label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map((allergen) => (
                    <Badge
                      key={allergen}
                      variant={formData.allergens.includes(allergen) ? 'default' : 'outline'}
                      className={`cursor-pointer text-sm px-4 py-2 transition-all active:scale-95 ${
                        formData.allergens.includes(allergen) ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => toggleAllergen(allergen)}
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Daily Special */}
              <div className="border-2 rounded-2xl p-5 bg-amber-50 border-amber-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                    <Label className="text-base font-bold text-gray-900">מנת היום</Label>
                  </div>
                  <Switch
                    checked={formData.is_daily_special}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_daily_special: checked })}
                  />
                </div>
                {formData.is_daily_special && (
                  <div>
                    <Label htmlFor="specialNote" className="text-sm font-semibold text-gray-700 block mb-2">הערה למנת היום</Label>
                    <Input
                      id="specialNote"
                      value={formData.daily_special_note}
                      onChange={(e) => setFormData({ ...formData, daily_special_note: e.target.value })}
                      placeholder="למשל: רק היום! או מומלץ השף"
                      className="h-11 border-2 rounded-xl bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Customization Options */}
              <div className="border-2 rounded-2xl overflow-hidden border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCustomization(!showCustomization)}
                  className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-gray-900">התאמות אישיות</span>
                    {(formData.customization_options?.removable_items?.length > 0 || formData.customization_options?.extra_toppings?.length > 0) && (
                      <Badge className="bg-orange-500 text-white text-xs">
                        {(formData.customization_options?.removable_items?.length || 0) + (formData.customization_options?.extra_toppings?.length || 0)}
                      </Badge>
                    )}
                  </div>
                  {showCustomization ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>

                {showCustomization && (
                  <div className="p-5 space-y-6">
                    {/* Removable Items */}
                    <div>
                      <Label className="text-sm font-bold text-gray-700 block mb-3">פריטים להסרה (לקוח יוכל לבקש בלי...)</Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.customization_options?.removable_items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                            <span className="text-sm text-blue-800">{item}</span>
                            <button onClick={() => removeRemovableItem(i)} className="text-blue-400 hover:text-red-500 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newRemovableItem}
                          onChange={(e) => setNewRemovableItem(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRemovableItem())}
                          placeholder="למשל: עגבנייה, בצל, חרדל..."
                          className="h-10 border-2 rounded-xl text-sm flex-1"
                        />
                        <Button type="button" onClick={addRemovableItem} size="sm" className="bg-blue-500 hover:bg-blue-600 rounded-xl h-10 px-4">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Extra Toppings */}
                    <div>
                      <Label className="text-sm font-bold text-gray-700 block mb-3">תוספות אפשריות (בתשלום)</Label>
                      <div className="space-y-2 mb-3">
                        {formData.customization_options?.extra_toppings?.map((topping, i) => (
                          <div key={i} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                            <span className="text-sm font-medium text-green-800">{topping.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-green-700">+₪{topping.price}</span>
                              <button onClick={() => removeTopping(i)} className="text-green-400 hover:text-red-500 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newTopping.name}
                          onChange={(e) => setNewTopping({ ...newTopping, name: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopping())}
                          placeholder="שם התוספת"
                          className="h-10 border-2 rounded-xl text-sm flex-1"
                        />
                        <Input
                          value={newTopping.price}
                          onChange={(e) => setNewTopping({ ...newTopping, price: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopping())}
                          type="number"
                          placeholder="₪"
                          className="h-10 border-2 rounded-xl text-sm w-20"
                        />
                        <Button type="button" onClick={addTopping} size="sm" className="bg-green-500 hover:bg-green-600 rounded-xl h-10 px-4">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Available */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <Label className="text-base font-bold text-gray-900">מנה זמינה</Label>
                <Switch
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                />
              </div>
            </div>
          </div>

          {/* Fixed Bottom Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="h-14 text-base font-bold border-2 rounded-2xl"
              >
                ביטול
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!formData.title || !formData.price || saveDishMutation.isLoading}
                className="h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-lg text-base rounded-2xl"
              >
                <Save className="w-5 h-5 ml-2" />
                שמירה
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertSheet open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertSheetContent side="bottom" className="h-auto rounded-t-3xl border-0 bg-white" dir="rtl">
          {/* iOS Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <AlertSheetHeader className="px-5 py-4">
            <AlertSheetTitle className="text-2xl font-bold text-gray-900 text-right">
              מחיקת מנה
            </AlertSheetTitle>
          </AlertSheetHeader>

          <div className="px-5 py-6">
            <div className="bg-red-50 border-2 border-red-200 p-5 rounded-2xl mb-6">
              <p className="text-gray-700 text-base leading-relaxed">
                האם למחוק את <span className="font-bold text-gray-900">"{deleteConfirm?.title}"</span>?
              </p>
              <p className="text-gray-600 text-sm mt-2">
                פעולה זו לא ניתנת לביטול.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="h-14 bg-white hover:bg-gray-100 border-2 font-bold text-base rounded-2xl"
              >
                ביטול
              </Button>
              <Button
                onClick={() => deleteDishMutation.mutate(deleteConfirm.id)}
                className="h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg text-base rounded-2xl"
              >
                <Trash2 className="w-5 h-5 ml-2" />
                מחק
              </Button>
            </div>
          </div>
        </AlertSheetContent>
      </AlertSheet>
    </div>
  );
}