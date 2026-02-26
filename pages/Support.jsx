import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const statusConfig = {
  open: { label: 'פתוח', color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { label: 'בטיפול', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  resolved: { label: 'נסגר', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function Support() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: myTickets = [] } = useQuery({
    queryKey: ['myTickets', user?.email],
    queryFn: () => base44.entities.SupportTicket.filter({ customer_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const createTicket = useMutation({
    mutationFn: (data) => base44.entities.SupportTicket.create({
      ...data,
      customer_email: user.email,
      customer_name: user.full_name || user.email,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myTickets']);
      setForm({ subject: '', message: '' });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">שירות לקוחות</h1>
          <p className="text-gray-500 text-sm">נשמח לעזור! נחזור אליך בהקדם</p>
        </div>
      </div>

      {/* Submit Form */}
      {!user ? (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">יש להתחבר כדי לפנות לשירות לקוחות</p>
            <Button onClick={() => base44.auth.redirectToLogin()} className="bg-orange-500 hover:bg-orange-600">
              התחברות
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-bold text-lg mb-4">פנייה חדשה</h2>
            {submitted && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">הפנייה נשלחה! נחזור אליך בהקדם.</span>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label className="font-semibold mb-2 block">נושא</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="תאר בקצרה את הבעיה"
                  className="border-2 rounded-xl h-11"
                />
              </div>
              <div>
                <Label className="font-semibold mb-2 block">פרטי הפנייה</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="תאר את הבעיה בפירוט..."
                  rows={4}
                  className="border-2 rounded-xl"
                />
              </div>
              <Button
                onClick={() => createTicket.mutate(form)}
                disabled={!form.subject || !form.message || createTicket.isPending}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold"
              >
                <Send className="w-4 h-4 ml-2" />
                שליחת פנייה
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Tickets */}
      {myTickets.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-4">הפניות שלי</h2>
          <div className="space-y-3">
            {myTickets.map((ticket) => {
              const status = statusConfig[ticket.status] || statusConfig.open;
              const StatusIcon = status.icon;
              return (
                <Card key={ticket.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold">{ticket.subject}</h3>
                      <Badge className={`${status.color} border-0 flex items-center gap-1 whitespace-nowrap`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{ticket.message}</p>
                    {ticket.admin_reply && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mt-3">
                        <p className="text-xs font-bold text-orange-700 mb-1">תגובת צוות התמיכה:</p>
                        <p className="text-sm text-orange-900">{ticket.admin_reply}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(ticket.created_date).toLocaleString('he-IL')}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}