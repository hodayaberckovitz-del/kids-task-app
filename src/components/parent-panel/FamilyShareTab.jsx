import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, Key, Check, Copy, Share2, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FamilyShareTab({ user }) {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [myFamilyCode, setMyFamilyCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadFamilyCode();
    }
  }, [user]);

  const generateFamilyCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const loadFamilyCode = async () => {
    setLoading(true);
    setError('');
    try {
      // First try to get by family_id if exists
      if (user.family_id) {
        const families = await base44.entities.Family.filter({
          id: user.family_id
        });
        if (families.length > 0) {
          setMyFamilyCode(families[0].family_code);
          return;
        }
      }

      // If no family_id or not found, check by email
      const families = await base44.entities.Family.filter({
        primary_parent_email: user.email
      });

      if (families.length > 0) {
        setMyFamilyCode(families[0].family_code);
        // Update user with family_id
        await base44.auth.updateMe({ family_id: families[0].id });
      } else {
        // Create new family
        const newFamilyCode = generateFamilyCode();
        const newFamily = await base44.entities.Family.create({
          family_name: `${user.full_name}'s Family`,
          family_code: newFamilyCode,
          primary_parent_email: user.email
        });
        setMyFamilyCode(newFamilyCode);
        await base44.auth.updateMe({ family_id: newFamily.id });
      }
    } catch (err) {
      console.error('Error loading family code:', err);
      setError(t('errorLoadingFamilyCode') || 'שגיאה בטעינת קוד המשפחה');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (myFamilyCode) {
      navigator.clipboard.writeText(myFamilyCode);
      setCopied(true);
      toast.success(t('codeCopied') || 'הקוד הועתק!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (myFamilyCode) {
      const shareText = t('shareTextMessage', { familyCode: myFamilyCode });

      if (navigator.share) {
        try {
          await navigator.share({
            title: t('familyCode'),
            text: shareText
          });
        } catch (err) {
          console.log('Share cancelled or failed:', err);
          handleCopyCode();
        }
      } else {
        handleCopyCode();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50 text-red-700">
        <CardContent className="p-6">
          <p className="font-bold mb-2">{error}</p>
          <Button onClick={loadFamilyCode} className="bg-red-600 hover:bg-red-700">{t('retry')}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Family Code Display */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <p className="text-lg text-gray-700 font-semibold">
              {t('familyCode')}
            </p>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl font-black text-purple-600 tracking-widest"
            >
              {myFamilyCode}
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleCopyCode}
          className="flex-1 h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              {t('copied')}
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" />
              {t('copyCode')}
            </>
          )}
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex-1 h-14 text-lg border-2"
        >
          <Share2 className="w-5 h-5 mr-2" />
          {t('share')}
        </Button>
      </div>

      {/* Join Another Family Button */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <UserPlus className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-green-900 text-lg mb-1">
                  {isRTL ? 'רוצה להצטרף למשפחה אחרת?' : 'Want to join another family?'}
                </h4>
                <p className="text-sm text-green-700">
                  {isRTL 
                    ? 'קיבלת קוד משפחה מהורה אחר? לחץ כאן להצטרפות'
                    : 'Got a family code from another parent? Click here to join'
                  }
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(createPageUrl('JoinFamily'))}
              className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {isRTL ? 'הצטרף למשפחה' : 'Join Family'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          {t('howToUse')}
        </h4>
        <ol className={`text-sm text-blue-800 space-y-2 ${isRTL ? 'pr-4' : 'pl-4'}`}>
          <li className="list-decimal">
            {t('step1SendCode')}
          </li>
          <li className="list-decimal">
            {t('step2SignUp')}
          </li>
          <li className="list-decimal">
            {t('step3EnterCode')}
          </li>
          <li className="list-decimal">
            {t('step4ShareData')}
          </li>
        </ol>
      </div>
    </div>
  );
}