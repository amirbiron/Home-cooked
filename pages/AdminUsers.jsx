import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, Search, Shield, ShieldOff, Mail, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function AdminUsers() {
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

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => base44.entities.User.list(),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }) => {
      await base44.entities.User.update(userId, { is_active: isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminUsers']);
    }
  });

  const filteredUsers = users?.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  }) || [];

  const getUserTypeBadge = (userType) => {
    switch (userType) {
      case 'cook':
        return <Badge className="bg-orange-100 text-orange-700">מוכר</Badge>;
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-700">מנהל</Badge>;
      default:
        return <Badge variant="secondary">לקוח</Badge>;
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
          <Users className="w-6 h-6" />
          ניהול משתמשים
        </h1>
        <div className="relative w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="חיפוש לפי שם או אימייל..."
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
                <TableHead>משתמש</TableHead>
                <TableHead>סוג</TableHead>
                <TableHead>תאריך הצטרפות</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                  <TableCell>
                    {new Date(user.created_date).toLocaleDateString('he-IL')}
                  </TableCell>
                  <TableCell>
                    {user.is_active !== false ? (
                      <Badge className="bg-green-100 text-green-700">פעיל</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">מושעה</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.role !== 'admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActiveMutation.mutate({ 
                          userId: user.id, 
                          isActive: user.is_active === false 
                        })}
                      >
                        {user.is_active !== false ? (
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
                    )}
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