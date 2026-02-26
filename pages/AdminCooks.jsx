import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Store, Search, Shield, ShieldOff, MapPin, Star, Power
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminCooks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

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

  const { data: cooks, isLoading } = useQuery({
    queryKey: ['adminCooks'],
    queryFn: () => base44.entities.Cook.list(),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ cookId, isActive }) => {
      await base44.entities.Cook.update(cookId, { is_active: isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCooks']);
    }
  });

  const filteredCooks = cooks?.filter(cook => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cook.display_name?.toLowerCase().includes(query) ||
      cook.city?.toLowerCase().includes(query) ||
      cook.user_email?.toLowerCase().includes(query)
    );
  }) || [];

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
          <Store className="w-6 h-6" />
          ניהול מוכרים
        </h1>
        <div className="relative w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="חיפוש לפי שם או עיר..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>מוכר</TableHead>
                <TableHead>עיר</TableHead>
                <TableHead>דירוג</TableHead>
                <TableHead>הזמנות</TableHead>
                <TableHead>זמינות</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCooks.map((cook) => (
                <TableRow key={cook.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden">
                        <img
                          src={cook.profile_image || `https://ui-avatars.com/api/?name=${cook.display_name}&background=F97316&color=fff`}
                          alt={cook.display_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{cook.display_name}</p>
                        <p className="text-xs text-gray-500">{cook.user_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {cook.city}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {cook.avg_rating?.toFixed(1) || '5.0'}
                    </span>
                  </TableCell>
                  <TableCell>{cook.total_orders || 0}</TableCell>
                  <TableCell>
                    {cook.is_open ? (
                      <Badge className="bg-green-100 text-green-700 gap-1">
                        <Power className="w-3 h-3" />
                        פתוח
                      </Badge>
                    ) : (
                      <Badge variant="secondary">סגור</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {cook.is_active ? (
                      <Badge className="bg-green-100 text-green-700">פעיל</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">מושעה</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActiveMutation.mutate({ 
                        cookId: cook.id, 
                        isActive: !cook.is_active 
                      })}
                    >
                      {cook.is_active ? (
                        <>
                          <ShieldOff className="w-4 h-4 ml-1 text-red-500" />
                          השעה
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 ml-1 text-green-500" />
                          הפעל
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}