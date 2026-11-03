import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ChevronLeft, ChevronRight, BookOpen, CheckCircle2, AlertCircle, Settings, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = 'webtop_credentials';

function loadCredentials() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCredentials(creds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
}

export default function WebtopSyncTab({ profile, onDataChange }) {
  const [creds, setCreds] = useState({ url: '', username: '', password: '', data: '' });
  const [weekIndex, setWeekIndex] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  useEffect(() => {
    const saved = loadCredentials();
    if (saved.url || saved.username) {
      setCreds({ url: saved.url || '', username: saved.username || '', password: saved.password || '', data: saved.data || '' });
    } else {
      setShowSettings(true);
    }
  }, []);

  const handleSaveCredentials = () => {
    saveCredentials(creds);
    setSavedSuccessfully(true);
    setTimeout(() => setSavedSuccessfully(false), 2000);
    setShowSettings(false);
  };

  const weekLabel = () => {
    if (weekIndex === 0) return 'שבוע נוכחי';
    if (weekIndex === -1) return 'שבוע שעבר';
    if (weekIndex === 1) return 'שבוע הבא';
    return weekIndex > 0 ? `${weekIndex} שבועות קדימה` : `${Math.abs(weekIndex)} שבועות אחורה`;
  };

  const handleSync = async () => {
    if (!profile) {
      setResult({ error: 'לא נבחר פרופיל ילד' });
      return;
    }
    if (!creds.url || !creds.username || !creds.password) {
      setShowSettings(true);
      setResult({ error: 'יש למלא כתובת URL, שם משתמש וסיסמה' });
      return;
    }

    setIsSyncing(true);
    setResult(null);

    try {
      const response = await base44.functions.syncWebtopHomework({
        child_profile_id: profile.id,
        webtop_url: creds.url,
        webtop_username: creds.username,
        webtop_password: creds.password,
        webtop_data: creds.data,
        week_index: weekIndex,
      });

      setResult(response);
      if (response.success && onDataChange) {
        await onDataChange();
      }
    } catch (err) {
      setResult({ error: err?.message || 'שגיאה בסנכרון' });
    } finally {
      setIsSyncing(false);
    }
  };

  const hasCredentials = creds.url && creds.username && creds.password;

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-800">סנכרון webtop</h2>
            <p className="text-xs text-gray-500">ייבוא שיעורי בית אוטומטי</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-500"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings Form */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-2 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">הגדרות webtop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">כתובת שרת webtop</Label>
                  <Input
                    placeholder="https://school.webtop.co.il"
                    value={creds.url}
                    onChange={e => setCreds(p => ({ ...p, url: e.target.value }))}
                    className="mt-1 text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">שם משתמש</Label>
                  <Input
                    placeholder="תעודת זהות / מספר הורה"
                    value={creds.username}
                    onChange={e => setCreds(p => ({ ...p, username: e.target.value }))}
                    className="mt-1"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">סיסמה</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="סיסמה"
                      value={creds.password}
                      onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
                      dir="ltr"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Data (אופציונלי — לבתי ספר ספציפיים)</Label>
                  <Input
                    placeholder="השאר ריק אם לא נדרש"
                    value={creds.data}
                    onChange={e => setCreds(p => ({ ...p, data: e.target.value }))}
                    className="mt-1"
                    dir="ltr"
                  />
                </div>
                <Button
                  onClick={handleSaveCredentials}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={!creds.url || !creds.username || !creds.password}
                >
                  {savedSuccessfully ? <><CheckCircle2 className="w-4 h-4 mr-2" />נשמר!</> : 'שמור הגדרות'}
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  הפרטים נשמרים רק במכשיר זה ולא נשלחים לשרת
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Controls */}
      <Card className="border-2 border-indigo-100">
        <CardContent className="p-4 space-y-4">
          {/* Child name */}
          {profile && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>ילד:</span>
              <Badge variant="secondary" className="font-medium">{profile.name}</Badge>
            </div>
          )}

          {/* Week selector */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekIndex(w => w - 1)}
              disabled={isSyncing}
              className="min-h-[44px] min-w-[44px]"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <span className="font-semibold text-gray-700 text-sm">{weekLabel()}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekIndex(w => w + 1)}
              disabled={isSyncing}
              className="min-h-[44px] min-w-[44px]"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Sync button */}
          <Button
            onClick={handleSync}
            disabled={isSyncing || !hasCredentials || !profile}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white min-h-[48px] text-base font-bold rounded-xl"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                מסנכרן...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 mr-2" />
                סנכרן שיעורי בית
              </>
            )}
          </Button>

          {!hasCredentials && !showSettings && (
            <p className="text-xs text-center text-amber-600">
              לחץ על ⚙️ למעלה כדי להזין את פרטי ה-webtop
            </p>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {result.error ? (
              <Card className="border-2 border-red-100 bg-red-50">
                <CardContent className="p-4 flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-700">שגיאה</p>
                    <p className="text-sm text-red-600 mt-1">{result.error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-green-100 bg-green-50">
                <CardContent className="p-4 flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-700">{result.message}</p>
                    {(result.synced > 0 || result.skipped > 0) && (
                      <div className="flex gap-3 mt-2">
                        {result.synced > 0 && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {result.synced} חדשים
                          </Badge>
                        )}
                        {result.skipped > 0 && (
                          <Badge variant="secondary">
                            {result.skipped} קיימים
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
