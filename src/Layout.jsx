import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Gift, Settings, Heart, LogOut, LifeBuoy, Menu, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage, LanguageProvider } from "@/components/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import FeedbackButton from "@/components/FeedbackButton";
import OfflineBanner from "@/components/OfflineBanner";
import WhatsNewModal, { LATEST_VERSION } from "@/components/WhatsNewModal";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const BACKGROUND_GRADIENTS = {
  blue: 'from-blue-50 via-cyan-50 to-purple-50',
  pink: 'from-pink-50 via-rose-50 to-purple-50',
  purple: 'from-purple-50 via-pink-50 to-blue-50',
  green: 'from-green-50 via-emerald-50 to-teal-50',
  red: 'from-red-50 via-orange-50 to-pink-50',
  rainbow: 'from-pink-50 via-purple-50 to-cyan-50',
  space: 'from-indigo-100 via-purple-50 to-blue-50',
  ocean: 'from-blue-50 via-teal-50 to-cyan-50',
  minimal: 'from-gray-50 via-white to-gray-50',
  dark: 'from-slate-100 via-slate-200 to-slate-100',
  nature: 'from-green-50 via-blue-50 to-green-50'
};

function AppLayout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, direction, isRTL } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isParent, setIsParent] = useState(false);
  const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const scrollPositions = useRef({});
  const mainRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await base44.auth.me();
        const selectedChildId = localStorage.getItem('selectedChildId');

        if (selectedChildId) {
          const childrenData = await base44.entities.ChildProfile.filter({ created_by: user.email });
          const currentProfile = childrenData.find(c => c.id === selectedChildId);
          if (currentProfile) {
            setProfile(currentProfile);
          }
        }

        if (user?.family_id) {
          const families = await base44.entities.Family.filter({ id: user.family_id });
          if (families.length > 0 && families[0].primary_parent_email === user.email) {
            setIsParent(true);
          }
        }
      } catch (error) {
        console.log("Could not load profile for background");
      }
    };

    loadProfile();

    // Check for new updates
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    if (!lastSeenVersion || lastSeenVersion !== LATEST_VERSION) {
      setHasNewUpdates(true);
    }
  }, []);

  // Scroll position management
  useEffect(() => {
    // Reset scroll to top when navigating to a new page
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      navigate(createPageUrl("Registration"));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { path: "Dashboard", icon: Home, label: t('home'), color: "blue" },
    { path: "Wishlist", icon: Gift, label: t('wishlist'), color: "pink" },
    { path: "Rewards", icon: Heart, label: t('rewards'), color: "yellow" },
    ...(isParent ? [{ path: "ParentPanel", icon: Settings, label: t('settings'), color: "green" }] : []),
    { path: "Guide", icon: LifeBuoy, label: t('guide'), color: "blue" },
  ];

  const handleWhatsNewClick = () => {
    setIsWhatsNewOpen(true);
    setHasNewUpdates(false);
  };

  const backgroundGradient = profile?.color_theme 
    ? BACKGROUND_GRADIENTS[profile.color_theme] || 'from-blue-50 via-purple-50 to-pink-50'
    : 'from-blue-50 via-purple-50 to-pink-50';

  const isSubPage = !['Dashboard', 'Wishlist', 'Rewards'].includes(currentPageName);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 md:pb-0`} dir={direction} style={{ overscrollBehavior: 'none' }}>
      <style>{`
        :root {
          --primary-blue: #3B82F6;
          --primary-green: #10B981;
          --primary-yellow: #F59E0B;
          --primary-pink: #EC4899;
          --bg-soft: #F8FAFC;
        }
        
        * {
          font-family: ${isRTL ? "'Segoe UI', Tahoma, Arial, sans-serif" : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"};
        }
        
        /* Selective user-select: none for interactive elements only */
        button, .nav-item, .icon-wrapper, [role="button"] {
          user-select: none;
          -webkit-user-select: none;
        }
        
        .bounce-in {
          animation: bounceIn 0.6s ease-out;
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(${isRTL ? '3deg' : '-3deg'}); }
          75% { transform: rotate(${isRTL ? '-3deg' : '3deg'}); }
        }
        
        .float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      
      <div className="hidden md:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-xl">🌟</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent select-none">
                {t('appTitle')}
              </h1>
            </div>
            
            <div className={`flex gap-2 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <LanguageSelector compact />

              {navItems.map(item => (
                <Link key={item.path} to={createPageUrl(item.path)}>
                  <div className={`p-3 rounded-full transition-all duration-200 nav-item ${
                    location.pathname === createPageUrl(item.path) 
                      ? `bg-${item.color}-100 text-${item.color}-600 dark:bg-${item.color}-900/30 dark:text-${item.color}-400` 
                      : "hover:bg-white/50 dark:hover:bg-gray-700/50"
                  }`} title={item.label}>
                    <item.icon className="w-5 h-5 icon-wrapper" />
                  </div>
                </Link>
              ))}

              <button
                onClick={handleWhatsNewClick}
                className="p-3 rounded-full transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 text-gray-500 dark:text-gray-400 relative"
                title={isRTL ? 'מה חדש' : 'What\'s New'}
              >
                <span className="text-xl icon-wrapper">🌟</span>
                {hasNewUpdates && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              <button
                onClick={handleLogout}
                className="p-3 rounded-full transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 text-gray-500 dark:text-gray-400"
                title={t('logout')}
              >
                <LogOut className="w-5 h-5 icon-wrapper" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-50 px-4 py-3" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between">
          {isSubPage ? (
            <button
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="font-semibold">{t('back')}</span>
            </button>
          ) : (
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center icon-wrapper">
                <span className="text-lg">🌟</span>
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {t('appTitle')}
              </h1>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <LanguageSelector compact />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="px-4 py-2">
              {navItems.map(item => (
                <Link 
                  key={item.path} 
                  to={createPageUrl(item.path)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={`flex items-center gap-3 p-3 rounded-lg mb-1 transition-all nav-item ${
                    location.pathname === createPageUrl(item.path)
                      ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <item.icon className="w-5 h-5 icon-wrapper" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <LogOut className="w-5 h-5 icon-wrapper" />
                <span className="font-medium">{t('logout')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 z-50 pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={createPageUrl(item.path)}
              onClick={(e) => {
                // If already on this tab, reset to root of that page
                if (location.pathname === createPageUrl(item.path)) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  // Force re-render by navigating to same path
                  navigate(createPageUrl(item.path), { replace: true });
                }
              }}
            >
              <div className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all nav-item ${
                location.pathname === createPageUrl(item.path)
                  ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                <item.icon className="w-6 h-6 mb-1 icon-wrapper" />
                <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-x-hidden" ref={mainRef}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <OfflineBanner />
      <FeedbackButton />
      <WhatsNewModal isOpen={isWhatsNewOpen} onClose={() => setIsWhatsNewOpen(false)} />

      {/* Copyright Footer */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 opacity-70 pointer-events-none z-40">
        {isRTL ? 'כל הזכויות שמורות להודיה ברקוביץ' : 'All rights reserved to Hodaya Berckovitz'}
      </div>
      </div>
      );
      }

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <AppLayout children={children} currentPageName={currentPageName} />
    </LanguageProvider>
  );
}