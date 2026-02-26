import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, CheckCircle2, XCircle, Store, MapPin, 
  Phone, Mail, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function AdminApprovals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCook, setSelectedCook] = useState(null);
  const [rejectDialog, setRejectDialog] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

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

  const { data: pendingCooks, isLoading } = useQuery({
    queryKey: ['pendingCooks'],
    queryFn: () => base44.entities.Cook.filter({ approval_status: 'pending' }, '-created_date'),
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const approveMutation = useMutation({
    mutationFn: async (cook) => {
      // Approve cook
      await base44.entities.Cook.update(cook.id, { 
        approval_status: 'approved',
        approval_date: new Date().toISOString(),
        is_active: true,
        is_open: true // Make the cook's restaurant open by default
      });
      
      // Update user entity with user_type
      const users = await base44.entities.User.filter({ email: cook.user_email });
      if (users.length > 0) {
        await base44.entities.User.update(users[0].id, { user_type: 'cook' });
      }
      
      return cook.user_email;
    },
    onSuccess: (userEmail) => {
      queryClient.invalidateQueries(['pendingCooks']);
      queryClient.invalidateQueries(['adminCooks']);
      setSelectedCook(null);
      
      // Send notification (placeholder - could add email integration)
      console.log(`Cook ${userEmail} approved successfully`);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ cookId, reason }) => {
      await base44.entities.Cook.update(cookId, { 
        approval_status: 'rejected',
        approval_date: new Date().toISOString(),
        rejection_reason: reason,
        is_active: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingCooks']);
      setRejectDialog(null);
      setRejectionReason('');
    }
  });

  const handleReject = () => {
    if (rejectDialog) {
      rejectMutation.mutate({ 
        cookId: rejectDialog.id, 
        reason: rejectionReason 
      });
    }
  };

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
          <Clock className="w-6 h-6" />
          אישור מוכרים חדשים
        </h1>
        {pendingCooks?.length > 0 && (
          <Badge className="bg-orange-500 text-white text-lg px-4 py-2">
            {pendingCooks.length} ממתינים
          </Badge>
        )}
      </div>

      {!pendingCooks || pendingCooks.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">אין בקשות ממתינות</h3>
            <p className="text-gray-500">כל המוכרים אושרו</p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {pendingCooks.map((cook) => (
            <Card key={cook.id} className="border-2 border-orange-200 hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden">
                      {cook.profile_image ? (
                        <img
                          src={cook.profile_image}
                          alt={cook.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-100 flex items-center justify-center">
                          <Store className="w-6 h-6 text-orange-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{cook.display_name}</h3>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 ml-1" />
                        ממתין לאישור
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{cook.user_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{cook.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{cook.city}</span>
                  </div>
                </div>

                {cook.bio && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{cook.bio}</p>
                  </div>
                )}

                {cook.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {cook.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  נרשם ב-{new Date(cook.created_date).toLocaleDateString('he-IL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedCook(cook)}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    disabled={approveMutation.isLoading}
                  >
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                    אשר
                  </Button>
                  <Button
                    onClick={() => setRejectDialog(cook)}
                    variant="outline"
                    className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                    disabled={rejectMutation.isLoading}
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    דחה
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Confirmation Sheet */}
      <Sheet open={!!selectedCook} onOpenChange={() => setSelectedCook(null)}>
        <SheetContent side="bottom" className="h-auto rounded-t-3xl border-0 bg-white" dir="rtl">
          {/* iOS Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <SheetHeader className="px-5 py-4">
            <SheetTitle className="text-2xl font-bold text-gray-900 text-right">
              אישור מוכר חדש
            </SheetTitle>
          </SheetHeader>

          <div className="px-5 py-6 space-y-4">
            <div className="bg-green-50 border-2 border-green-200 p-5 rounded-2xl">
              <p className="text-gray-700 text-base leading-relaxed">
                האם לאשר את <span className="font-bold text-gray-900">{selectedCook?.display_name}</span> כמוכר במערכת?
              </p>
              <p className="text-gray-600 text-sm mt-3">
                לאחר האישור, המוכר יוכל להתחבר למערכת, להוסיף מוצרים ולקבל הזמנות.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                variant="outline"
                onClick={() => setSelectedCook(null)}
                className="h-14 bg-white hover:bg-gray-100 border-2 font-bold text-base rounded-2xl"
              >
                ביטול
              </Button>
              <Button
                onClick={() => selectedCook && approveMutation.mutate(selectedCook)}
                className="h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold shadow-lg text-base rounded-2xl"
              >
                <CheckCircle2 className="w-5 h-5 ml-2" />
                אשר ושלח
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Rejection Sheet */}
      <Sheet open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl border-0 bg-white" dir="rtl">
          {/* iOS Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <SheetHeader className="px-5 py-4 border-b border-gray-100">
            <SheetTitle className="text-2xl font-bold text-gray-900 text-right">
              דחיית בקשה
            </SheetTitle>
          </SheetHeader>
          
          <div className="px-5 py-6 space-y-6">
            <div className="bg-amber-100 border-2 border-amber-200 p-5 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-bold mb-2 text-base">שימו לב:</p>
                <p className="leading-relaxed">הסיבה לדחייה תישלח למוכר באימייל. נסחו בצורה ברורה ומכבדת.</p>
              </div>
            </div>

            <div>
              <Label htmlFor="reason" className="text-base font-bold text-gray-900 mb-3 block">
                סיבת הדחייה
              </Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="לדוגמה: חסרים פרטים בפרופיל, תמונות לא מתאימות, וכו'"
                rows={6}
                className="border-2 focus:border-orange-500 bg-white rounded-xl text-base"
              />
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                onClick={() => setRejectDialog(null)}
                className="h-14 bg-white hover:bg-gray-100 border-2 font-bold text-base rounded-2xl"
              >
                ביטול
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || rejectMutation.isLoading}
                className="h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg text-base rounded-2xl disabled:opacity-50"
              >
                <XCircle className="w-5 h-5 ml-2" />
                דחה בקשה
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}