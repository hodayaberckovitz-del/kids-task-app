import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, Users, CheckCircle, Target, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

export default function Registration() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          navigate(createPageUrl("Dashboard"));
        }
      } catch (error) {
        console.log("Not authenticated");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign up
        if (!formData.fullName || !formData.email || !formData.password) {
          setError(t('fillAllFields'));
          setIsLoading(false);
          return;
        }

        await base44.auth.signUp({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName
        });

        // Show message to check email instead of redirecting immediately
        setError(null);
        setIsSignUp(false);
        alert("נשלח מייל אישור לכתובת שלך — אשרי ואז היכנסי עם הסיסמה");
      } else {
        // Sign in
        if (!formData.email || !formData.password) {
          setError(t('fillAllFields'));
          setIsLoading(false);
          return;
        }

        await base44.auth.signIn({
          email: formData.email,
          password: formData.password
        });

        navigate(createPageUrl("Dashboard"));
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || (isSignUp ? "Error creating account" : "Error signing in"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-300 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              rotate: [0, 360],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {['⭐', '🌟', '✨', '🎯', '🏆'][i % 5]}
          </motion.div>
        ))}
      </div>

      {/* Language Selector */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Info */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white hidden md:block"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-8xl mb-6"
          >
            ⭐
          </motion.div>
          <h1 className="text-5xl font-black mb-4 drop-shadow-lg">{t('welcomeToTaskStar')}</h1>
          <p className="text-2xl mb-8 drop-shadow-md">{t('funWayToManageTasks')}</p>

          <div className="space-y-4">
            {[
              { icon: CheckCircle, text: t('trackDailyTasks') },
              { icon: Star, text: t('earnTokensRewards') },
              { icon: Users, text: t('wholeFamilyTogether') },
              { icon: Target, text: t('achieveGoalsTogether') }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/20 backdrop-blur-sm p-4 rounded-2xl"
              >
                <item.icon className="w-8 h-8" />
                <span className="text-xl font-bold">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-[2rem]">
            <CardHeader className="text-center pb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-black">
                {isSignUp ? t('createYourAccount') : t('signInToAccount')}
              </CardTitle>
              <CardDescription className="text-lg">
                {isSignUp ? t('getStartedDescription') : t('welcomeBack')}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-lg">
                      {t('fullName')}
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={t('enterFullName')}
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                      className="h-12 text-lg"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-lg">
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('enterEmail')}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-12 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-lg">
                    {t('password')}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('enterPassword')}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="h-12 text-lg"
                  />
                </div>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isLoading 
                    ? (isSignUp ? t('creatingAccount') : t('signingIn'))
                    : (isSignUp ? t('createAccount') : t('signIn'))
                  }
                </Button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setFormData({ fullName: "", email: "", password: "" });
                  }}
                  className="text-purple-600 hover:text-purple-800 font-medium text-lg block w-full"
                >
                  {isSignUp 
                    ? `${t('alreadyHaveAccount')} ${t('signIn')}`
                    : `${t('dontHaveAccount')} ${t('signUp')}`
                  }
                </button>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(null); }}
                    className="text-gray-500 hover:text-purple-600 text-sm underline"
                  >
                    {isRTL ? 'שכחתי סיסמה' : 'Forgot password?'}
                  </button>
                )}
              </div>

              {/* Forgot Password Modal */}
              {isForgotPassword && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsForgotPassword(false)}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
                  >
                    {forgotSent ? (
                      <div className="text-center py-4">
                        <div className="text-5xl mb-3">📧</div>
                        <h3 className="text-xl font-bold text-green-600 mb-2">
                          {isRTL ? 'הקישור נשלח!' : 'Link sent!'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {isRTL ? 'בדוק את תיבת המייל שלך' : 'Check your email inbox'}
                        </p>
                        <button onClick={() => { setIsForgotPassword(false); setForgotSent(false); }} className="mt-4 text-purple-600 font-medium underline">
                          {isRTL ? 'סגור' : 'Close'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold mb-1">{isRTL ? 'איפוס סיסמה' : 'Reset Password'}</h3>
                        <p className="text-gray-500 text-sm mb-4">{isRTL ? 'הזן את האימייל שלך ונשלח לך קישור לאיפוס' : 'Enter your email and we\'ll send you a reset link'}</p>
                        <Input
                          type="email"
                          placeholder={t('enterEmail')}
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          className="h-11 mb-3"
                        />
                        <Button
                          disabled={isLoading || !forgotEmail}
                          onClick={async () => {
                            setIsLoading(true);
                            try {
                              await base44.auth.resetPasswordRequest(forgotEmail);
                              setForgotSent(true);
                            } catch(err) {
                              setError(err.message);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                          {isLoading ? '...' : (isRTL ? 'שלח קישור' : 'Send Link')}
                        </Button>
                        <button onClick={() => setIsForgotPassword(false)} className="mt-3 w-full text-gray-400 text-sm">
                          {t('cancel')}
                        </button>
                      </>
                    )}
                  </motion.div>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-gray-500 space-x-2">
                <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-purple-600 underline">
                  {isRTL ? 'מדיניות פרטיות' : 'Privacy Policy'}
                </Link>
                <span>•</span>
                <Link to={createPageUrl("TermsOfService")} className="hover:text-purple-600 underline">
                  {isRTL ? 'תנאי שימוש' : 'Terms of Service'}
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}