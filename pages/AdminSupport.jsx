import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, CheckCircle, Clock, AlertCircle, Send, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusConfig = {
  open: { label: 'פתוח', color: 'bg-blue-100 text-blue-700', icon: Clock },
  in_progress: { label: 'בטיפול', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  resolved: { label: 'נסגר', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function AdminSupport() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');

  const { data: tickets = [] } = useQuery({
    queryKey: ['adminTickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 100),
  });

  const updateTicket = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminTickets']);
    },
  });

  const handleReply = (ticket) => {
    if (!reply.trim()) return;
    updateTicket.mutate({
      id: ticket.id,
      data: { admin_reply: reply, status: 'resolved' }
    });
    setReply('');
    setSelectedTicket(null);
  };

  const filteredTickets = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
  const openCount = tickets.filter(t => t.status === 'open').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">שירות לקוחות</h1>
          {openCount > 0 && (
            <Badge className="bg-red-500 text-white">{openCount} פתוחות</Badge>
          )}
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 border-2 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל ({tickets.length})</SelectItem>
            <SelectItem value="open">פתוח ({tickets.filter(t => t.status === 'open').length})</SelectItem>
            <SelectItem value="in_progress">בטיפול ({tickets.filter(t => t.status === 'in_progress').length})</SelectItem>
            <SelectItem value="resolved">נסגר ({tickets.filter(t => t.status === 'resolved').length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">אין פניות</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const status = statusConfig[ticket.status] || statusConfig.open;
            const StatusIcon = status.icon;
            const isExpanded = selectedTicket?.id === ticket.id;

            return (
              <Card key={ticket.id} className={`transition-all ${isExpanded ? 'ring-2 ring-orange-300' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{ticket.subject}</h3>
                        <Badge className={`${status.color} border-0 flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{ticket.customer_name} · {ticket.customer_email}</p>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(ticket.created_date).toLocaleString('he-IL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <p className="text-gray-700 text-sm mb-3 bg-gray-50 rounded-xl p-3">{ticket.message}</p>

                  {ticket.admin_reply && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                      <p className="text-xs font-bold text-green-700 mb-1">תגובתך:</p>
                      <p className="text-sm text-green-900">{ticket.admin_reply}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {ticket.status !== 'resolved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedTicket(isExpanded ? null : ticket); setReply(''); }}
                        className="rounded-xl border-2"
                      >
                        <Send className="w-3.5 h-3.5 ml-1" />
                        {isExpanded ? 'סגור' : 'השב'}
                      </Button>
                    )}
                    {ticket.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTicket.mutate({ id: ticket.id, data: { status: 'in_progress' } })}
                        className="rounded-xl border-2 text-yellow-600 border-yellow-300"
                      >
                        סמן בטיפול
                      </Button>
                    )}
                    {ticket.status !== 'resolved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTicket.mutate({ id: ticket.id, data: { status: 'resolved' } })}
                        className="rounded-xl border-2 text-green-600 border-green-300"
                      >
                        סגור
                      </Button>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-2">
                      <Textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="כתוב תגובה ללקוח..."
                        rows={3}
                        className="border-2 rounded-xl"
                      />
                      <Button
                        onClick={() => handleReply(ticket)}
                        disabled={!reply.trim() || updateTicket.isPending}
                        className="bg-orange-500 hover:bg-orange-600 rounded-xl w-full"
                      >
                        <Send className="w-4 h-4 ml-2" />
                        שלח תגובה וסגור
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}