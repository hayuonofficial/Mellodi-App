/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CardSection } from './components/CardSection';
import { OrderSection } from './components/OrderSection';
import { StoreSection } from './components/StoreSection';
import { VoucherSection } from './components/VoucherSection';
import { HistorySection } from './components/HistorySection';
import { RewardsStoreSection } from './components/RewardsStoreSection';
import { NotificationToast } from './components/NotificationToast';
import { AuthPortal } from './components/AuthPortal';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { BrandLandingPage } from './components/BrandLandingPage';
import { AppDownloadGate } from './components/AppDownloadGate';
import { AIChatbot } from './components/AIChatbot';
import { translations } from './translations';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Smartphone, X } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const { currentUser, isLoading, tierUpgradeInfo, setTierUpgradeInfo, language, setLanguage, logoutUser, nfcLogin } = useApp();
  const [splashDone, setSplashDone] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [showDownloadGate, setShowDownloadGate] = useState<boolean>(false);
  const [showWebAuthModal, setShowWebAuthModal] = useState<boolean>(false);
  const [activeWebSection, setActiveWebSection] = useState<string>('home');
  const [isNfcLoggingIn, setIsNfcLoggingIn] = useState(false);
  const [nfcLoginError, setNfcLoginError] = useState<string | null>(null);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const nfcToken = urlParams.get('nfc_token');
    if (nfcToken) {
      // Clear the token from the URL so it looks clean and cannot be bookmarked
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      const doNfcLogin = async () => {
        setIsNfcLoggingIn(true);
        setNfcLoginError(null);
        // 1.2s delay to give a premium, high-tech connection feel
        await new Promise(r => setTimeout(r, 1200));
        const result = await nfcLogin(nfcToken);
        if (!result.success) {
          setNfcLoginError(result.message);
          setTimeout(() => setIsNfcLoggingIn(false), 3000);
        } else {
          setIsNfcLoggingIn(false);
        }
      };
      doNfcLogin();
    }
  }, [nfcLogin]);

  React.useEffect(() => {
    if (currentUser) {
      setShowWebAuthModal(false);
    }
  }, [currentUser]);

  React.useEffect(() => {
    if (!currentUser) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logoutUser();
        alert(language === 'vi' 
          ? "Tài khoản của bạn đã tự động đăng xuất sau 5 phút không hoạt động để bảo vệ số dư thẻ ví!" 
          : "Your account has been automatically logged out after 5 minutes of inactivity to protect your card balance!");
      }, 5 * 60 * 1000); // 5 minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleEvent = () => resetTimer();
    
    events.forEach(event => window.addEventListener(event, handleEvent));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, handleEvent));
    };
  }, [currentUser, logoutUser, language]);

  React.useEffect(() => {
    const checkIfMobile = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobileDevice(isStandalone || isSmallScreen);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSplashDone(true);
    }, 2400); // 2.4s elegant cinematic duration
    return () => clearTimeout(timer);
  }, []);

  const renderNfcOverlay = () => {
    if (!isNfcLoggingIn) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#2D5A47]/95 text-white backdrop-blur-md p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center space-y-6 text-center"
        >
          {nfcLoginError ? (
            <>
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500 flex items-center justify-center text-rose-500">
                <X className="w-10 h-10 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-rose-300">Đăng nhập NFC Thất Bại</h3>
                <p className="text-xs text-stone-300 max-w-xs">{nfcLoginError}</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-white/20 border-t-[#A37B45] animate-spin"></div>
                <Smartphone className="w-8 h-8 text-white absolute animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-amber-100 animate-pulse">Kết nối Thẻ NFC Mellodi...</h3>
                <p className="text-xs text-white/70">Đang xác thực chữ ký bảo mật và đăng nhập...</p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    );
  };

  if (!splashDone || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#2D5A47] to-[#1F3F32] text-white overflow-hidden relative">
        {renderNfcOverlay()}
        {/* Ambient background glow effects */}
        <motion.div 
          className="absolute w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute w-64 h-64 bg-[#A37B45]/10 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="relative z-10 flex flex-col items-center space-y-8">
          {/* Main Animating Letter M Container */}
          <div className="relative">
            {/* Glowing Golden Ring behind M */}
            <motion.div 
              className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#A37B45] to-amber-200 opacity-35 blur-md"
              animate={{
                rotate: 360,
                scale: [0.95, 1.05, 0.95]
              }}
              transition={{
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            />

            {/* Elegant Outer Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-28 h-28 rounded-full border border-white/20 bg-white/5 flex items-center justify-center backdrop-blur-md relative z-10"
            >
              {/* Inner Circle rotating outline */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="#A37B45"
                  strokeWidth="2.5"
                  fill="transparent"
                  strokeDasharray="290"
                  initial={{ strokeDashoffset: 290 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
              </svg>

              {/* The "M" typography */}
              <motion.span
                initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
                animate={{ scale: [0.3, 1.2, 1], opacity: 1, rotate: 0 }}
                transition={{ 
                  duration: 1.2,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.15
                }}
                className="font-serif font-black text-5xl text-white select-none drop-shadow-md tracking-wider"
              >
                M
              </motion.span>
            </motion.div>

            {/* Star sparkle accent */}
            <motion.div 
              className="absolute -top-1 -right-1 text-amber-300"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z" />
              </svg>
            </motion.div>
          </div>

          {/* Mellodi Brand Name and Tagline */}
          <div className="text-center space-y-2">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="font-serif font-bold text-2xl tracking-widest uppercase text-amber-50"
            >
              MELLODI
            </motion.h1>
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 0.7 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-[10px] font-semibold uppercase tracking-widest text-stone-300"
            >
              Premium Loyalty Experience
            </motion.p>
          </div>

          {/* Elegant Loading bar progress */}
          <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden relative">
            <motion.div 
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#A37B45] to-amber-300 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.1, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    if (!currentUser) {
      return (
        <motion.div
          key="auth"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
        >
          <AuthPortal />
        </motion.div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="space-y-12"
          >
            <Hero setActiveTab={setActiveTab} />
            <CardSection />
          </motion.div>
        );
      case 'order':
        return (
          <motion.div
            key="order"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <OrderSection />
          </motion.div>
        );
      case 'stores':
        return (
          <motion.div
            key="stores"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <StoreSection />
          </motion.div>
        );
      case 'vouchers':
        return (
          <motion.div
            key="vouchers"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <VoucherSection />
          </motion.div>
        );
      case 'history':
        return (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <HistorySection />
          </motion.div>
        );
      case 'rewards':
        return (
          <motion.div
            key="rewards"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <RewardsStoreSection />
          </motion.div>
        );
      case 'admin':
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'manager')) {
          return (
            <div className="p-8 text-center text-stone-500 font-bold font-serif">
              Bạn không có quyền truy cập vào mục quản trị!
            </div>
          );
        }
        return (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            <AdminDashboard />
          </motion.div>
        );
      default:
        return null;
    }
  };
  if (showDownloadGate) {
    return (
      <AppDownloadGate 
        onBackToWeb={() => setShowDownloadGate(false)} 
      />
    );
  }

  if (!isMobileDevice || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F6] text-stone-850 font-sans">
        {renderNfcOverlay()}
        {/* Web Header */}
        <header className="sticky top-0 z-45 bg-white/95 backdrop-blur-md border-b border-coffee-100 py-3.5 px-4 sm:px-6 shadow-xs">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
            
            {/* Top Row: Logo on left, Actions on right (on mobile) */}
            <div className="flex justify-between items-center w-full md:w-auto">
              {/* Logo */}
              <div className="flex items-center space-x-2.5">
                <div className="w-8.5 h-8.5 rounded-full bg-[#4E342E] text-white flex items-center justify-center font-serif font-bold text-base italic">M</div>
                <div className="text-left">
                  <span className="font-serif text-lg font-bold tracking-tight text-coffee-950 block leading-none">MELLODI</span>
                  <span className="text-[8px] tracking-wider text-coffee-600 uppercase font-medium mt-1 block">
                    {translations[language]['brand.tagline']}
                  </span>
                </div>
              </div>

              {/* Mobile Actions (Auth / Language) - hidden on desktop */}
              <div className="flex items-center space-x-2 md:hidden">
                <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl p-0.5 scale-90">
                  {[
                    { code: 'vi', label: 'VI' },
                    { code: 'en', label: 'EN' },
                    { code: 'ko', label: 'KO' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                        language === lang.code
                          ? 'bg-[#4E342E] text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
                {currentUser ? (
                  <div className="flex items-center space-x-2 bg-stone-50 border border-coffee-100 px-2 py-1 rounded-xl scale-95">
                    <span className="text-[10px] font-bold text-coffee-950 truncate max-w-[70px]">
                      {currentUser.name}
                    </span>
                    <button
                      onClick={() => logoutUser()}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[9px] font-black rounded-lg cursor-pointer"
                    >
                      {language === 'vi' ? 'Thoát' : 'Out'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowWebAuthModal(true)}
                    className="px-2.5 py-1.5 bg-[#4E342E] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    {language === 'vi' ? 'Đăng nhập' : 'Login'}
                  </button>
                )}
              </div>
            </div>

            {/* Middle Row: Navigation Links (Scrollable on mobile) */}
            <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1 -my-1 justify-start md:justify-center w-full md:w-auto flex-nowrap md:flex-wrap">
              {[
                { id: 'home', label: translations[language]['nav.home'] },
                { id: 'story', label: translations[language]['landing.story.tag'] },
                { id: 'space', label: translations[language]['landing.space.tag'] },
                { id: 'menu', label: translations[language]['landing.menu.tag'] },
                { id: 'promo', label: translations[language]['landing.promo.tag'] },
                { id: 'membership', label: language === 'vi' ? 'Thành viên' : language === 'ko' ? '멤버십' : 'Membership' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveWebSection(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeWebSection === item.id 
                      ? 'bg-[#4E342E] text-white shadow-xs' 
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-850'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop Actions (Language & User Profile / Portal) - hidden on mobile */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl p-0.5">
                {[
                  { code: 'vi', label: 'VI' },
                  { code: 'en', label: 'EN' },
                  { code: 'ko', label: 'KO' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                      language === lang.code
                        ? 'bg-[#4E342E] text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-850'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {currentUser ? (
                <div className="flex items-center space-x-3 bg-stone-50 border border-coffee-100 px-3 py-1.5 rounded-xl">
                  {/* Clickable Area to go to Membership section */}
                  <div 
                    onClick={() => setActiveWebSection('membership')}
                    className="flex items-center space-x-3 cursor-pointer hover:opacity-85 transition-all"
                  >
                    {/* User Profile Summary */}
                    <div className="text-right text-xs">
                      <p className="font-bold text-coffee-950 leading-none">{currentUser.name}</p>
                      <p className="text-[9px] text-amber-600 font-bold mt-0.5">
                        {currentUser.tier.toUpperCase()} MEMBER
                      </p>
                    </div>
                    <div className="h-7 w-px bg-coffee-100"></div>
                    <div className="text-left text-[10px] text-stone-500 font-medium">
                      <p>Ví: <span className="font-bold text-coffee-900 font-mono">{currentUser.walletBalance.toLocaleString()}đ</span></p>
                      <p>LEN: <span className="font-bold text-amber-500 font-mono">{currentUser.lenPoints.toLocaleString()}</span></p>
                    </div>
                  </div>
                  <div className="h-7 w-px bg-coffee-100"></div>
                  <button
                    onClick={() => logoutUser()}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                  >
                    {language === 'vi' ? 'Đăng xuất' : language === 'ko' ? '로그아웃' : 'Logout'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveWebSection('membership')}
                    className="px-4 py-2 bg-[#4E342E] hover:bg-[#3E2723] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    {language === 'vi' ? 'Đăng nhập / Đăng ký' : language === 'ko' ? '로그인 / 회원가입' : 'Login / Register'}
                  </button>
                  <button
                    onClick={() => setShowDownloadGate(true)}
                    className="px-4 py-2 border border-coffee-200 text-coffee-950 text-xs font-bold rounded-xl hover:bg-stone-50 transition-all cursor-pointer"
                  >
                    {translations[language]['landing.promo.btn']}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Brand Landing Page */}
        <main className="flex-grow">
          <BrandLandingPage activeSection={activeWebSection} onOpenApp={() => setShowDownloadGate(true)} />
        </main>

        {/* Global Web AI Chatbot */}
        <AIChatbot mode="web" />

        {/* Web Auth Modal */}
        {showWebAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-2 max-w-md w-full border border-coffee-100 shadow-2xl relative my-auto">
              <button
                onClick={() => setShowWebAuthModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors cursor-pointer z-50"
              >
                <X className="w-4 h-4 text-stone-600" />
              </button>
              <AuthPortal />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Native Mobile PWA View
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F6] text-coffee-950 relative overflow-x-hidden font-sans">
      {renderNfcOverlay()}
      
      {/* Upper Navigation inside Mobile App - Only shown when logged in */}
      {currentUser && <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />}

      {/* Floating location geofence promotions notifier */}
      {currentUser && <NotificationToast />}

      {/* Primary body view content */}
      <main className="flex-grow p-4 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {renderActiveSection()}
        </AnimatePresence>
      </main>

      {/* Localized branding footer - Only shown when logged in */}
      {currentUser && <Footer />}

      {/* App AI Chatbot */}
      <AIChatbot mode="app" />

      {/* Tier Upgrade Celebration Modal */}
      <AnimatePresence>
        {tierUpgradeInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -30 }}
              className="bg-gradient-to-b from-[#4E342E] to-[#251511] text-white rounded-3xl p-6 max-w-sm w-full text-center relative border border-amber-500/30 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent pointer-events-none"></div>

              <div className="relative z-10 space-y-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 mx-auto flex items-center justify-center shadow-lg"
                >
                  <Award className="w-10 h-10 text-[#3E2723] fill-current" />
                </motion.div>

                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/15 px-3 py-1 rounded-full border border-amber-400/25">
                    Thăng Hạng Thành Viên
                  </span>
                  <h3 className="font-serif text-2xl font-black text-white tracking-wide">
                    CHÀO MỪNG HẠNG {tierUpgradeInfo.tier.toUpperCase()}!
                  </h3>
                  <p className="text-[10px] text-emerald-100/70 max-w-xs mx-auto leading-relaxed">
                    Mellodi gửi tặng bạn một phần quà đặc quyền cấp độ VIP mới.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-400 text-[#3E2723] flex items-center justify-center font-black text-md shadow-inner flex-shrink-0 font-mono">
                    {tierUpgradeInfo.voucher.value}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-amber-300 truncate">
                      {tierUpgradeInfo.voucher.title.vi}
                    </h4>
                    <p className="text-[9px] text-white/60 line-clamp-2 mt-0.5">
                      {tierUpgradeInfo.voucher.description.vi}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTierUpgradeInfo(null)}
                  className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-[#3E2723] text-xs rounded-xl transition-all shadow-md active:scale-98 cursor-pointer uppercase tracking-wider font-black"
                >
                  Nhận Quà & Tiếp Tục
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
