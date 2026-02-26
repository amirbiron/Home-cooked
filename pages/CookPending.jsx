import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Clock, Mail, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CookPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Clock className="w-10 h-10 text-orange-600 animate-pulse" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">הבקשה ממתינה לאישור</h1>
          
          <p className="text-gray-600 mb-6">
            הפרופיל שלכם נמצא כעת בבדיקה של צוות האתר. 
            זה בדרך כלל לוקח עד 24 שעות.
          </p>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-right text-sm text-blue-800">
                <p className="font-medium mb-1">תקבלו הודעה לאימייל</p>
                <p>ברגע שהפרופיל יאושר, תקבלו הודעה והנכם תוכלו להתחבר למערכת ולהתחיל לקבל הזמנות.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              בינתיים, תוכלו לגלוש באתר ולראות מה מבשלים אחרים מציעים
            </p>
            
            <Button
              onClick={() => navigate(createPageUrl('Home'))}
              className="w-full bg-orange-500 hover:bg-orange-600"
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