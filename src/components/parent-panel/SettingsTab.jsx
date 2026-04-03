import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Heart, Star, ThumbsUp, Smile, Trophy, Users, Settings as SettingsIcon, Share2, MessageCircle, Flame, Lock, AlertTriangle, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ICON_OPTIONS = [
  { value: 'heart', label: 'iconHeart', icon: Heart },
  { value: 'star', label: 'iconStar', icon: Star },
  { value: 'thumbsup', label: 'iconThumbsUp', icon: ThumbsUp },
  { value: 'smile', label: 'iconSmile', icon: Smile },
  { value: 'trophy', label: 'iconTrophy', icon: Trophy }
];

export default function SettingsTab({ childProfiles = [], onProfileUpdated, user, onNavigateToChildren, familyData, onFamilyUpdated }) {
  const { t, isRTL } = useLanguage();
  const [selectedChildId, setSelectedChildId] = useState(childProfiles[0]?.id || '');
  const [message, setMessage] = useState('');
  const [icon, setIcon] = useState('heart');
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFinalDeleteDialog, setShowFinalDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const selectedChild = childProfiles.find(c => c.id === selectedChildId);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [coParents, setCoParents] = useState(familyData?.parent_emails || []);

  useEffect(() => {
    setCoParents(familyData?.parent_emails || []);
  }, [familyData]);

  const handleInviteParent = async () => {
    if (!inviteEmail.trim() || !familyData) return;
    setInviting(true);
    try {
      const updated = [...(familyData.parent_emails || [])];
      if (!updated.includes(inviteEmail.trim())) {
        updated.push(inviteEmail.trim());
        await base44.entities.Family.update(familyData.id, { parent_emails: updated });
        setCoParents(updated);
        await base44.integrations.Core.SendEmail({
          to: inviteEmail.trim(),
          subject: isRTL ? 'הוזמנת לכוכב המשימות' : 'You were invited to Task Star',
          body: isRTL
            ? `שלום! הוזמנת לנהל את המשפחה בכוכב המשימות. היכנסו לאפליקציה והשתמשו בקוד משפחה: ${familyData.family_code}`
            : `Hello! You were invited to manage the family on Task Star. Open the app and use family code: ${familyData.family_code}`
        });
        toast.success(isRTL ? 'הזמנה נשלחה!' : 'Invitation sent!');
        setInviteEmail('');
      } else {
        toast.info(isRTL ? 'כבר מוזמן' : 'Already invited');
      }
    } catch (e) {
      toast.error(isRTL ? 'שגיאה' : 'Error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveParent = async (email) => {
    if (!familyData) return;
    const updated = (familyData.parent_emails || []).filter(e => e !== email);
    await base44.entities.Family.update(familyData.id, { parent_emails: updated });
    setCoParents(updated);
  };

  const handleSave = async () => {
    if (!selectedChildId || !message.trim()) {
      alert(t('fillAllFields'));
      return;
    }

    setIsSaving(true);
    try {
      await base44.entities.ChildProfile.update(selectedChildId, {
        parent_message: message.trim(),
        parent_message_icon: icon
      });

      await onProfileUpdated();
      setMessage('');
      alert(t('settingsSaved'));
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t('errorSavingSettings'));
    } finally {
      setIsSaving(false);
    }
  };

  const SelectedIconComponent = ICON_OPTIONS.find(opt => opt.value === icon)?.icon || Heart;

  const handlePasswordSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert(isRTL ? 'הסיסמאות לא תואמות' : 'Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      await base44.entities.Family.update(familyData.id, {
        parent_panel_password: newPassword || null
      });
      
      // Clear session when password is changed or removed
      sessionStorage.removeItem('parentPanelUnlocked');
      
      setNewPassword('');
      setConfirmPassword('');
      await onFamilyUpdated();
      alert(t('settingsSaved'));
    } catch (error) {
      console.error('Error saving password:', error);
      alert(t('errorSavingSettings'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error(isRTL ? 'יש להקליד DELETE' : 'Please type DELETE');
      return;
    }

    try {
      // Delete all data associated with the user's family
      const familyId = user.family_id;
      
      if (familyId) {
        // Delete all entities
        await Promise.all([
          base44.entities.ChildProfile.filter({ family_id: familyId }).then(items => 
            Promise.all(items.map(item => base44.entities.ChildProfile.delete(item.id)))
          ),
          base44.entities.Task.filter({ family_id: familyId }).then(items => 
            Promise.all(items.map(item => base44.entities.Task.delete(item.id)))
          ),
          base44.entities.Reward.filter({ family_id: familyId }).then(items => 
            Promise.all(items.map(item => base44.entities.Reward.delete(item.id)))
          ),
          base44.entities.TaskCompletion.filter({ family_id: familyId }).then(items => 
            Promise.all(items.map(item => base44.entities.TaskCompletion.delete(item.id)))
          ),
          base44.entities.WishlistItem.filter({ family_id: familyId }).then(items => 
            Promise.all(items.map(item => base44.entities.WishlistItem.delete(item.id)))
          ),
          base44.entities.BonusActivity.filter({ family_id: familyId }).then(items => 
            Promise.all(items.map(item => base44.entities.BonusActivity.delete(item.id)))
          ),
          base44.entities.Family.delete(familyId)
        ]);
      }
      
      // Clear user data
      await base44.auth.updateMe({ family_id: null });
      
      toast.success(isRTL ? 'החשבון נמחק בהצלחה' : 'Account deleted successfully');
      
      // Logout and redirect
      setTimeout(() => {
        base44.auth.logout();
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(isRTL ? 'שגיאה במחיקת החשבון' : 'Error deleting account');
    }
  };

  return (
    <div className="space-y-6 dark:text-white">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{t('settings')}</h2>
        <p className="text-gray-600">{t('manageFamilySettings')}</p>
      </div>

      {/* Pricing / Upgrade Card */}
      <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            {isRTL ? 'שדרג לפרימיום' : 'Upgrade to Premium'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'ילדים ללא הגבלה, כל המשחקים, דוחות ועוד' : 'Unlimited children, all games, reports and more'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to={createPageUrl('Pricing')}>
            <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              <Crown className="w-5 h-5 mr-2" />
              {isRTL ? 'ראה תוכניות' : 'View Plans'}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Family Sharing Card */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            {t('familySharingTitle')}
          </CardTitle>
          <CardDescription>
            {t('familySharingDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to={createPageUrl('JoinFamily')}>
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Share2 className="w-5 h-5 mr-2" />
              {t('shareOrJoinFamilyButton')}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* WhatsApp Agent Card */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" fill="white" />
            </div>
            {t('whatsappAgent')}
          </CardTitle>
          <CardDescription>
            {t('whatsappAgentDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a 
            href={base44.agents.getWhatsAppConnectURL('task_reminder')} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center mr-2">
                <MessageCircle className="w-4 h-4 text-green-600" fill="currentColor" />
              </div>
              {t('connectWhatsApp')}
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Child Management Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            {t('editChildDetails')}
          </CardTitle>
          <CardDescription>
            {t('editChildDetailsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onNavigateToChildren}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          >
            <Users className="w-5 h-5 mr-2" />
            {t('goToChildrenPage')}
          </Button>
        </CardContent>
      </Card>

      {/* Streak Bonus Settings Card */}
      {childProfiles.length > 0 && (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-600" />
              הגדרות בונוס רצף
            </CardTitle>
            <CardDescription>
              הגדר אם ומתי ילדים מקבלים בונוס רצף
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('selectChildProfile')}</label>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {childProfiles.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedChild && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">הפעל בונוס רצף</p>
                    <p className="text-sm text-gray-600">האם לתת בונוס על רצף של 7 ימים</p>
                  </div>
                  <Button
                    variant={selectedChild.streak_bonus_enabled !== false ? "default" : "outline"}
                    onClick={async () => {
                      try {
                        await base44.entities.ChildProfile.update(selectedChild.id, {
                          streak_bonus_enabled: !(selectedChild.streak_bonus_enabled !== false)
                        });
                        await onProfileUpdated();
                      } catch (error) {
                        alert(t('errorSavingSettings'));
                      }
                    }}
                  >
                    {selectedChild.streak_bonus_enabled !== false ? '✓ פעיל' : 'כבוי'}
                  </Button>
                </div>

                {selectedChild.streak_bonus_enabled !== false && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      כמה אסימונים נוספים לכל משימה ברצף של 7+ ימים?
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={selectedChild.streak_bonus_tokens || 1}
                      onChange={async (e) => {
                        const value = parseInt(e.target.value) || 1;
                        try {
                          await base44.entities.ChildProfile.update(selectedChild.id, {
                            streak_bonus_tokens: value
                          });
                          await onProfileUpdated();
                        } catch (error) {
                          alert(t('errorSavingSettings'));
                        }
                      }}
                      className="text-lg h-12"
                    />
                    <p className="text-xs text-gray-500">
                      כרגע: +{selectedChild.streak_bonus_tokens || 1} אסימונים לכל משימה כשיש רצף של 7+ ימים
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parent Panel Password Protection Card */}
      {familyData && (
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-600" />
              {isRTL ? 'הגנת סיסמה לפאנל הורים' : 'Parent Panel Password Protection'}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? 'הגדר סיסמה אופציונלית להגנה על פאנל ההורים מפני גישה של ילדים' 
                : 'Set an optional password to protect the parent panel from child access'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="text-blue-800">
                {isRTL 
                  ? '💡 במקרה של שכחת סיסמה: הורה אחר במשפחה יוכל לשנות אותה, או שתוכלי לאפס אותה דרך לוח הבקרה של Base44'
                  : '💡 If you forget the password: Another parent in the family can change it, or you can reset it through the Base44 dashboard'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {familyData.parent_panel_password 
                  ? (isRTL ? 'שנה סיסמה או הסר אותה (השאר ריק להסרה)' : 'Change password or remove it (leave empty to remove)')
                  : (isRTL ? 'הגדר סיסמה חדשה (אופציונלי)' : 'Set new password (optional)')
                }
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isRTL ? 'סיסמה חדשה' : 'New password'}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isRTL ? 'אשר סיסמה' : 'Confirm password'}
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isRTL ? 'הזן סיסמה שוב' : 'Enter password again'}
                className="h-12"
              />
            </div>

            {familyData.parent_panel_password && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✓ {isRTL ? 'סיסמה מוגדרת כרגע' : 'Password currently set'}
                </p>
              </div>
            )}

            <Button
              onClick={handlePasswordSave}
              disabled={isSaving || (newPassword && newPassword !== confirmPassword)}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600"
            >
              {isSaving ? t('saving') : (newPassword ? t('save') : (isRTL ? 'הסר סיסמה' : 'Remove password'))}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Send Message to Child Card */}
      {childProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              {t('sendMessageToChild')}
            </CardTitle>
            <CardDescription>
              {t('sendMessageToChildDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Child Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('selectChildProfile')}</label>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {childProfiles.map(child => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('messageContent')}</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('messagePlaceholder')}
                rows={4}
              />
            </div>

            {/* Icon Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('messageIcon')}</label>
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map(({ value, label, icon: IconComponent }) => (
                  <motion.button
                    key={value}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIcon(value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      icon === value
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-6 h-6 mx-auto" />
                    <p className="text-xs mt-1">{t(label)}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {message && selectedChild && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-200"
              >
                <p className="text-sm text-gray-600 mb-2">{t('preview')}</p>
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg">
                  <SelectedIconComponent className="w-8 h-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-800">{t('messageFromParent')}</p>
                    <p className="text-gray-700">{message}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving || !message.trim() || !selectedChildId}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
            >
              {isSaving ? t('saving') : t('saveSettings')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Co-parents management */}
      {familyData && (
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              {isRTL ? 'ריבוי הורים' : 'Multiple Parents'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'הזמן הורה נוסף לנהל יחד' : 'Invite another parent to manage together'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={isRTL ? 'מייל ההורה השני' : "Co-parent's email"}
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleInviteParent} disabled={inviting || !inviteEmail.trim()} className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap">
                {inviting ? '...' : (isRTL ? 'הזמן' : 'Invite')}
              </Button>
            </div>
            {coParents.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">{isRTL ? 'הורים מורשים:' : 'Authorized parents:'}</p>
                {coParents.map(email => (
                  <div key={email} className="flex items-center justify-between bg-white p-2 rounded-lg border">
                    <span className="text-sm text-gray-700">{email}</span>
                    <button onClick={() => handleRemoveParent(email)} className="text-red-500 hover:text-red-700 text-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Account */}
      <Card className="border-red-200 dark:border-red-900 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {isRTL ? 'מחיקת חשבון' : 'Delete Account'}
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            {isRTL ? 'מחק את החשבון שלך ואת כל הנתונים לצמיתות' : 'Permanently delete your account and all data'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="w-full"
          >
            {isRTL ? 'מחק חשבון' : 'Delete Account'}
          </Button>
        </CardContent>
      </Card>

      {/* First Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              {isRTL ? 'האם אתה בטוח?' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              {isRTL 
                ? 'פעולה זו תמחק את כל הנתונים: ילדים, משימות, תגמולים, משאלות ועוד. פעולה זו אינה ניתנת לביטול.'
                : 'This will delete all data: children, tasks, rewards, wishlist items, and more. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
              {isRTL ? 'ביטול' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false);
                setShowFinalDeleteDialog(true);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRTL ? 'המשך למחיקה' : 'Continue to Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final Confirmation Dialog */}
      <AlertDialog open={showFinalDeleteDialog} onOpenChange={setShowFinalDeleteDialog}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">
              {isRTL ? 'אישור סופי - מחיקת חשבון' : 'Final Confirmation - Delete Account'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 dark:text-gray-400">
              <p>
                {isRTL 
                  ? 'זוהי ההזדמנות האחרונה שלך לבטל. כל הנתונים ימחקו לצמיתות.'
                  : 'This is your last chance to cancel. All data will be permanently deleted.'}
              </p>
              <div>
                <Label className="dark:text-white">
                  {isRTL ? 'הקלד DELETE לאישור:' : 'Type DELETE to confirm:'}
                </Label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12 text-base"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteConfirmText('');
                setShowFinalDeleteDialog(false);
              }}
              className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              {isRTL ? 'ביטול' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isRTL ? 'מחק את החשבון שלי לצמיתות' : 'Delete My Account Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}