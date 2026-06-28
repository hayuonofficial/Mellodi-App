import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Coffee, Globe, History, MapPin, Tag, Wallet, Bell, LogOut, Gift as GiftIcon, Trash2, CheckCheck, X, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    language, 
    setLanguage, 
    walletBalance, 
    lenPoints, 
    formatPriceInCurrency, 
    activePromo, 
    currentUser, 
    logoutUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    isOffline
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const navItems = [
    { id: 'home', label: translations[language]['nav.home'], icon: Coffee },
    { id: 'order', label: translations[language]['nav.order'], icon: Coffee },
    { id: 'stores', label: translations[language]['nav.stores'], icon: MapPin },
    { id: 'vouchers', label: translations[language]['nav.vouchers'], icon: Tag },
    { id: 'rewards', label: translations[language]['nav.rewards'] || (language === 'vi' ? 'Đổi Quà' : language === 'ko' ? '선물 교환' : 'Redeem Gifts'), icon: GiftIcon },
    { id: 'history', label: translations[language]['nav.history'], icon: History },
    ...(currentUser ? [{ id: 'admin', label: language === 'vi' ? 'Quản trị CRM' : language === 'ko' ? 'CRM 관리' : 'CRM Admin', icon: ShieldCheck }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-coffee-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveTab('home')}
            id="brand-logo-container"
          >
            <div className="w-10 h-10 rounded-full bg-coffee-800 flex items-center justify-center text-white shadow-md">
              <span className="font-serif font-bold text-xl italic">M</span>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-coffee-900 block">
                {translations[language]['brand.name']}
              </span>
              <span className="text-[10px] tracking-wider text-coffee-600 uppercase font-medium -mt-1 block">
                {translations[language]['brand.tagline']}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-coffee-900 text-white shadow-md shadow-coffee-900/10'
                      : 'text-coffee-700 hover:bg-coffee-100/50 hover:text-coffee-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls (Language, Balance, Notifications) */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {isOffline && (
              <div 
                id="offline-indicator-badge"
                className="flex items-center space-x-1.5 bg-rose-50 border border-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm"
                title={language === 'vi' ? 'Mellodi đang chạy ở chế độ ngoại tuyến' : language === 'ko' ? '멜로디가 오프라인 모드로 실행 중입니다' : 'Mellodi is running in offline mode'}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <span>{language === 'vi' ? 'Ngoại tuyến' : language === 'ko' ? '오프라인' : 'Offline'}</span>
              </div>
            )}
            
            {/* Quick Balance Status (Desktops) */}
            {currentUser && (
              <div className="hidden lg:flex items-center space-x-3 text-xs font-medium border-r border-coffee-100 pr-4">
                <div className="flex items-center space-x-1 bg-coffee-100/40 text-coffee-800 px-3 py-1.5 rounded-full">
                  <Wallet className="w-3.5 h-3.5 text-coffee-700" />
                  <span>{formatPriceInCurrency(walletBalance)}</span>
                </div>
                <div className="flex items-center space-x-1 bg-amber-100/40 text-amber-900 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
                  <span className="font-mono font-semibold">{lenPoints.toLocaleString()}</span>
                  <span className="text-[10px] uppercase font-bold text-coffee-700">LEN</span>
                </div>
                <div className="flex items-center space-x-2 pl-2 border-l border-coffee-100">
                  <div className="w-8 h-8 rounded-full bg-[#4E342E] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm border border-white/20">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left max-w-[120px]">
                    <p className="font-bold text-[11px] leading-tight text-coffee-950 truncate">{currentUser.name}</p>
                    <p className="text-[9px] text-[#A37B45] font-bold uppercase leading-none">{currentUser.tier} Tier</p>
                  </div>
                </div>
              </div>
            )}

            {/* Real Notification Center Dropdown */}
            {currentUser && (
              <div className="relative">
                <button 
                  id="btn-bell-notif"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full text-coffee-700 hover:bg-coffee-100/50 hover:text-coffee-950 transition-all relative cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {((notifications && notifications.filter((n: any) => !n.isRead).length > 0) || activePromo) && (
                    <span className="absolute top-1 right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] text-white font-extrabold items-center justify-center font-mono">
                        {notifications ? notifications.filter((n: any) => !n.isRead).length : 1}
                      </span>
                    </span>
                  )}
                </button>

                {/* DROPDOWN OVERLAY */}
                {showNotifications && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-[-40px] sm:right-0 mt-3 w-80 sm:w-96 bg-white border border-coffee-100 shadow-2xl rounded-2xl overflow-hidden z-50 text-left flex flex-col max-h-[500px]">
                      {/* Header */}
                      <div className="flex justify-between items-center p-4 bg-coffee-900 text-white">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-4.5 h-4.5" />
                          <span className="font-serif font-bold text-sm">
                            {language === 'vi' ? 'Thông báo Mellodi' : language === 'ko' ? '멜로디 알림' : 'Mellodi Alerts'}
                          </span>
                          {notifications && notifications.filter((n: any) => !n.isRead).length > 0 && (
                            <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                              {notifications.filter((n: any) => !n.isRead).length} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          {notifications && notifications.filter((n: any) => !n.isRead).length > 0 && (
                            <button
                              onClick={() => {
                                markAllNotificationsAsRead();
                              }}
                              className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors text-white font-bold flex items-center space-x-1 cursor-pointer"
                              title={language === 'vi' ? 'Đọc tất cả' : 'Read all'}
                            >
                              <CheckCheck className="w-3 h-3" />
                              <span className="hidden xs:inline">{language === 'vi' ? 'Đọc hết' : 'Read all'}</span>
                            </button>
                          )}
                          <button 
                            onClick={() => setShowNotifications(false)}
                            className="text-white hover:text-stone-300 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="flex-1 overflow-y-auto divide-y divide-stone-100 max-h-[350px]">
                        {notifications && notifications.length > 0 ? (
                          [...notifications].reverse().map((notif) => {
                            // Map notification type to icon & styles
                            let TypeIcon = Bell;
                            let iconBg = 'bg-stone-100 text-stone-600';
                            if (notif.type === 'order') {
                              TypeIcon = Coffee;
                              iconBg = 'bg-amber-50 text-[#4E342E] border border-amber-100';
                            } else if (notif.type === 'wallet') {
                              TypeIcon = Wallet;
                              iconBg = 'bg-blue-50 text-blue-700 border border-blue-100';
                            } else if (notif.type === 'gift') {
                              TypeIcon = GiftIcon;
                              iconBg = 'bg-amber-50 text-amber-800 border border-amber-100';
                            }

                            return (
                              <div 
                                key={notif.id}
                                className={`p-4 flex items-start space-x-3 transition-colors relative group ${
                                  !notif.isRead ? 'bg-coffee-50/10' : 'bg-white'
                                } hover:bg-stone-50/50`}
                                onClick={() => {
                                  if (!notif.isRead) {
                                    markNotificationAsRead(notif.id);
                                  }
                                }}
                              >
                                {/* Unread dot indicator */}
                                {!notif.isRead && (
                                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                                )}

                                {/* Icon */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                                  <TypeIcon className="w-4 h-4" />
                                </div>

                                {/* Texts */}
                                <div className="flex-1 space-y-0.5 text-xs pr-4">
                                  <p className={`text-stone-900 ${!notif.isRead ? 'font-bold' : 'font-semibold'}`}>
                                    {notif.title[language] || notif.title['vi'] || notif.title['en']}
                                  </p>
                                  <p className="text-stone-500 text-[11px] leading-relaxed">
                                    {notif.message[language] || notif.message['vi'] || notif.message['en']}
                                  </p>
                                  <p className="text-[9px] font-mono text-stone-400">
                                    {notif.date}
                                  </p>
                                </div>

                                {/* Delete button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notif.id);
                                  }}
                                  className="absolute right-2 top-4 p-1.5 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                  title={language === 'vi' ? 'Xóa thông báo' : 'Delete'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-coffee-50 flex items-center justify-center mx-auto text-coffee-400">
                              <Bell className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-serif font-bold text-coffee-950">
                              {language === 'vi' ? 'Chưa có thông báo nào' : language === 'ko' ? '알림이 없습니다' : 'No notifications yet'}
                            </p>
                            <p className="text-[10px] text-stone-400">
                              {language === 'vi' ? 'Tất cả hoạt động tài khoản sẽ hiển thị ở đây.' : 'All account activities will show up here.'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="bg-stone-50 p-2 text-center border-t border-stone-100 text-[10px] text-stone-400 font-medium font-mono">
                        {language === 'vi' ? 'Hệ thống Mellodi Loyalty' : 'Mellodi Loyalty Platform'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-coffee-100/40 rounded-full p-1 border border-coffee-200">
              <Globe className="w-3.5 h-3.5 text-coffee-600 ml-2 mr-1" />
              <div className="flex space-x-0.5 text-xs font-semibold">
                {(['vi', 'en', 'ko'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    id={`lang-select-${lang}`}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-2.5 py-1 rounded-full uppercase transition-all duration-300 ${
                      language === lang
                        ? 'bg-coffee-900 text-white shadow-xs'
                        : 'text-coffee-600 hover:text-coffee-900'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Trigger */}
            {currentUser && (
              <button
                id="btn-logout-nav"
                onClick={logoutUser}
                title={translations[language]['nav.logout'] || (language === 'vi' ? 'Đăng xuất' : language === 'ko' ? '로그아웃' : 'Log Out')}
                className="p-2 rounded-full text-stone-400 hover:text-[#4E342E] hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex justify-around items-center border-t border-coffee-100 bg-white py-2 shadow-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-mob-btn-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center space-y-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                isActive ? 'text-coffee-900' : 'text-coffee-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-coffee-900' : ''}`} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
