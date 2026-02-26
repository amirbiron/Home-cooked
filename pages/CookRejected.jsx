import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { XCircle, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CookRejected() {
  const navigate = useNavigate();
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadRejectionReason();
  }, []);

  const loadRejectionReason = async () => {
    try {
      const user = await base44.auth.me();
      const cooks = await base44.entities.Cook.filter({ user_email: user.email });
      if (cooks.length > 0 && cooks[0].rejection_reason) {
        setRejectionReason(cooks[0].rejection_reason);
      }
    } catch (e) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">הבקשה נדחתה</h1>
          
          <p className="text-gray-600 mb-6">
            לצערנו, הבקשה להצטרפות כמבשל לא אושרה.
          </p>

          {rejectionReason && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-right">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-900">
                  <p className="font-medium mb-2">סיבת הדחייה:</p>
                  <p className="whitespace-pre-wrap">{rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              אתם מוזמנים לתקן את הבעיות ולהגיש בקשה מחדש במועד מאוחר יותר.
            </p>
            
            <Button
              onClick={() => navigate(createPageUrl('Home'))}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              <Home className="w-4 h-4 ml-2" />
              חזרה לעמוד הבית
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}