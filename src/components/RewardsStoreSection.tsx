import React, { useState, useEffect } from 'react';
import { useApp, API_BASE_URL, getAuthHeaders } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Gift, Sparkles, Check, X, ShieldCheck, Coffee, Package, 
  Ticket, Heart, Snowflake, Star, Clock, AlertCircle, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GiftItem {
  id: string;
  name: Record<string, string>;
  category: string;
  costPoints: number;
  image: string;
  description: Record<string, string>;
}

interface RedeemedGift {
  id: string;
  userId: string;
  giftId: string;
  giftName: Record<string, string>;
  costPoints: number;
  redeemedDate: string;
  claimCode: string;
  status: 'active' | 'claimed';
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  pickupBranch?: string;
}

export const MELLODI_BRANCHES = [
  "Mellodi Nguyễn Huệ (Quận 1)",
  "Mellodi Điện Biên Phủ (Quận 3)",
  "Mellodi Sư Vạn Hạnh (Quận 10)",
  "Mellodi Thảo Điền (Quận 2)",
  "Mellodi Phan Xích Long (Phú Nhuận)"
];

export const RewardsStoreSection: React.FC = () => {
  const { 
    language, 
    currentUser, 
    lenPoints, 
    setLenPoints, 
    setCurrentUser,
    formatPrice,
    addVoucherDirectly
  } = useApp();

  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [redeemedGifts, setRedeemedGifts] = useState<RedeemedGift[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  
  // Dialog/Modal states
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [redemptionStatus, setRedemptionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [claimingGift, setClaimingGift] = useState<RedeemedGift | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Recipient details for gift redemption
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [pickupBranch, setPickupBranch] = useState('Mellodi Nguyễn Huệ (Quận 1)');
  const [lastRedeemedGift, setLastRedeemedGift] = useState<any>(null);

  // Initialize recipient details to current user when selectedGift changes
  useEffect(() => {
    if (currentUser) {
      setRecipientName(currentUser.name || '');
      setRecipientPhone(currentUser.phone || '');
      setRecipientEmail(currentUser.email || '');
    }
  }, [selectedGift, currentUser]);

  const fetchGiftsCatalog = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/gifts`);
      if (res.ok) {
        const data = await res.json();
        setGifts(data);
      }
    } catch (err) {
      console.error('Error fetching gifts:', err);
    }
  };

  const fetchRedeemedGifts = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/gifts/my-gifts`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setRedeemedGifts(data);
      }
    } catch (err) {
      console.error('Error fetching redeemed history:', err);
    }
  };

  useEffect(() => {
    fetchGiftsCatalog();
    fetchRedeemedGifts();
  }, [currentUser]);

  const handleRedeemSubmit = async () => {
    if (!currentUser || !selectedGift) return;
    
    setIsRedeeming(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/gifts/redeem`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          giftId: selectedGift.id,
          recipientName,
          recipientPhone,
          recipientEmail,
          pickupBranch
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setRedemptionStatus({
          success: false,
          message: data.error || 'Redemption failed'
        });
        setLastRedeemedGift(null);
      } else {
        setRedemptionStatus({
          success: true,
          message: language === 'vi' 
            ? `Đổi quà thành công! Phiếu nhận quà và mã QR đã được gửi về email ${recipientEmail}. Bạn có thể nhận tại chi nhánh ${pickupBranch}.` 
            : `Successfully redeemed! A pickup voucher and QR code have been emailed to ${recipientEmail}. You can pick it up at ${pickupBranch}.`
        });
        setLastRedeemedGift(data.redemption);
        
        // If the reward is of category "voucher", add a real usable voucher to the user's available vouchers!
        if (selectedGift.category === 'voucher') {
          const value = selectedGift.id === 'gft-voucher-50' ? 50000 : 100000;
          addVoucherDirectly({
            id: `vc-redeemed-${data.redemption.claimCode}`,
            code: data.redemption.claimCode,
            title: {
              vi: selectedGift.name.vi,
              en: selectedGift.name.en,
              ko: selectedGift.name.ko || selectedGift.name.en,
            },
            description: {
              vi: selectedGift.description.vi,
              en: selectedGift.description.en,
              ko: selectedGift.description.ko || selectedGift.description.en,
            },
            discountType: 'amount',
            value: value,
            minOrderVND: 0,
            minOrderKRW: 0,
            minOrderUSD: 0,
            claimed: true,
            used: false,
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days
          });
        }

        // Update user state
        setCurrentUser(data.user);
        setLenPoints(data.user.lenPoints);
        setSelectedGift(null);
        fetchRedeemedGifts();
      }
    } catch (err) {
      setRedemptionStatus({
        success: false,
        message: language === 'vi' ? 'Lỗi hệ thống khi đổi quà!' : 'System error during redemption!'
      });
      setLastRedeemedGift(null);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleClaimGiftSimulation = async () => {
    if (!claimingGift) return;

    setIsClaiming(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/gifts/claim/${claimingGift.id}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Claim failed');
      } else {
        // Success
        setClaimingGift(null);
        fetchRedeemedGifts();
        // Notify
        alert(
          language === 'vi'
            ? 'Xác nhận đổi quà thành công! Nhân viên quầy Mellodi đang chuẩn bị quà cho bạn.'
            : 'Gift claimed successfully! Mellodi staff is preparing your rewards.'
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClaiming(false);
    }
  };

  const categories = [
    { id: 'all', label: language === 'vi' ? 'Tất cả' : language === 'ko' ? '전체' : 'All', icon: Star },
    { id: 'drink', label: language === 'vi' ? 'Đồ uống' : language === 'ko' ? '음료' : 'Drinks', icon: Coffee },
    { id: 'pastry', label: language === 'vi' ? 'Bánh ngọt' : language === 'ko' ? '디저트' : 'Pastries', icon: CakeIcon },
    { id: 'voucher', label: language === 'vi' ? 'Voucher' : language === 'ko' ? '쿠폰' : 'Vouchers', icon: Ticket },
    { id: 'merchandise', label: language === 'vi' ? 'Đồ lưu niệm' : language === 'ko' ? '굿즈' : 'Merchandise', icon: Package },
    { id: 'birthday', label: language === 'vi' ? 'Quà sinh nhật' : language === 'ko' ? '생일 선물' : 'Birthday', icon: Heart },
    { id: 'seasonal', label: language === 'vi' ? 'Mùa lễ hội' : language === 'ko' ? '시즌 선물' : 'Seasonal', icon: Snowflake },
  ];

  const filteredGifts = selectedCategory === 'all'
    ? gifts
    : gifts.filter(g => g.category === selectedCategory);

  return (
    <div className="space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-coffee-100 pb-5">
        <div>
          <h2 className="font-serif text-3xl font-bold text-coffee-950 flex items-center space-x-2.5">
            <Gift className="w-8 h-8 text-[#2D5A47]" />
            <span>{language === 'vi' ? 'Đổi Quà Điểm LEN' : language === 'ko' ? 'LEN 포인트 선물교환소' : 'LEN Reward Store'}</span>
          </h2>
          <p className="text-xs text-coffee-500 mt-1">
            {language === 'vi' 
              ? 'Tích lũy 10% điểm LEN từ hóa đơn hoàn thành và đổi lấy quà tặng độc quyền tại Mellodi.'
              : 'Earn 10% LEN points on completed orders & claim exclusive products at Mellodi.'}
          </p>
        </div>

        {/* Dynamic points balance status panel */}
        <div className="flex items-center space-x-3 bg-[#F4F1EE] p-3 rounded-2xl border border-coffee-100">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] text-coffee-500 block font-bold uppercase tracking-wider">
              {language === 'vi' ? 'Điểm LEN khả dụng' : language === 'ko' ? '보유 LEN 포인트' : 'Available LEN'}
            </span>
            <span className="font-mono text-lg font-bold text-coffee-900">{lenPoints.toLocaleString()} LEN</span>
          </div>
        </div>
      </div>

      {/* REWARDS STORE MAIN TABS */}
      <div className="flex border-b border-coffee-100/60 pb-1.5 gap-4">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-[#2D5A47] text-[#2D5A47]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          {language === 'vi' ? 'Danh Mục Quà Tặng' : language === 'ko' ? '사은품 목록' : 'Reward Gifts Catalog'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
            activeTab === 'history'
              ? 'border-[#2D5A47] text-[#2D5A47]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <span>{language === 'vi' ? 'Quà Đã Đổi' : language === 'ko' ? '내 교환 사은품' : 'Redeemed Gifts'}</span>
          {redeemedGifts.filter(g => g.status === 'active').length > 0 && (
            <span className="absolute -top-1 -right-3.5 bg-rose-500 text-white font-mono text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
              {redeemedGifts.filter(g => g.status === 'active').length}
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT: CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* CATEGORIES WRAPPER */}
          <div className="flex space-x-2 overflow-x-auto pb-3 scrollbar-thin -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#2D5A47] text-white shadow-sm'
                      : 'bg-white text-[#4A3B32] border border-coffee-200/50 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* REWARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGifts.map((gift) => {
              const canAfford = lenPoints >= gift.costPoints;
              return (
                <div
                  key={gift.id}
                  className="bg-white rounded-3xl border border-coffee-100 p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Category Pill Tag */}
                  <span className="absolute top-4 left-4 z-10 bg-[#FAF8F5] text-coffee-700 border border-coffee-100 text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full">
                    {gift.category}
                  </span>

                  <div className="flex items-start justify-between space-x-4 mb-4 mt-4">
                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-serif text-base font-bold text-coffee-950 leading-snug">
                        {gift.name[language] || gift.name['en']}
                      </h3>
                      <p className="text-xs text-coffee-500 line-clamp-3 leading-relaxed">
                        {gift.description[language] || gift.description['en']}
                      </p>
                    </div>

                    {/* Graphic/Cup visual */}
                    <div className="w-16 h-16 rounded-2xl bg-amber-50/40 border border-amber-100/50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform flex-shrink-0">
                      <span>{gift.image}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-coffee-50 pt-4 mt-auto">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                        {language === 'vi' ? 'Chi phí điểm' : 'Points Cost'}
                      </span>
                      <span className="text-sm font-bold text-amber-700 flex items-center space-x-1 font-mono">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{gift.costPoints.toLocaleString()} LEN</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedGift(gift)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-[#2D5A47] text-white hover:bg-[#1E4334] shadow-sm shadow-[#2D5A47]/10'
                          : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      {language === 'vi' ? 'Đổi ngay' : 'Redeem'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: REDEEMED GIFTS LIST */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {redeemedGifts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-coffee-100 text-center text-coffee-400 space-y-4 shadow-xs max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-coffee-50 flex items-center justify-center text-coffee-300 mx-auto">
                <Gift className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-coffee-700">
                  {language === 'vi' ? 'Bạn chưa đổi quà tặng nào' : 'No gifts redeemed yet'}
                </p>
                <p className="text-xs text-coffee-500 mt-1">
                  {language === 'vi' 
                    ? 'Hãy tích lũy điểm LEN khi hoàn tất hóa đơn nước uống để đổi các phần quà giá trị.'
                    : 'Earn LEN points from orders to swap for cute Mellodi souvenirs and drinks.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              {redeemedGifts.map((rg) => (
                <div
                  key={rg.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 ${
                    rg.status === 'claimed'
                      ? 'border-stone-200/50 bg-stone-50/50 opacity-60'
                      : 'border-coffee-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-2xl flex items-center justify-center border border-amber-100 flex-shrink-0">
                      <span>{rg.giftId.includes('drink') ? '🥤' : rg.giftId.includes('pastry') ? '🥐' : rg.giftId.includes('voucher') ? '🎫' : '🎁'}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-xs text-coffee-950 sm:text-sm">
                        {rg.giftName[language] || rg.giftName['en']}
                      </h4>
                      <p className="text-[10px] text-stone-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{rg.redeemedDate}</span>
                      </p>
                      
                      <div className="flex items-center space-x-2 pt-1">
                        <span className="font-mono text-[10px] bg-coffee-100 text-coffee-800 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Mã đổi: {rg.claimCode}
                        </span>
                        {rg.status === 'claimed' ? (
                          <span className="text-[9px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-md font-bold uppercase">
                            {language === 'vi' ? 'Đã nhận quà' : 'Claimed'}
                          </span>
                        ) : (
                          <span className="text-[9px] bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-md font-bold uppercase border border-[#C8E6C9]">
                            {language === 'vi' ? 'Sẵn sàng nhận' : 'Ready'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  {rg.status === 'active' && (
                    <button
                      onClick={() => setClaimingGift(rg)}
                      className="px-4 py-2.5 bg-coffee-900 hover:bg-coffee-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 self-end sm:self-auto"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{language === 'vi' ? 'Nhận quà tại quầy' : 'Claim at counter'}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIRM REDEEM DIALOG */}
      <AnimatePresence>
        {selectedGift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-coffee-100"
            >
              <button
                onClick={() => setSelectedGift(null)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-3xl flex items-center justify-center mx-auto border border-amber-100">
                  {selectedGift.image}
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-serif text-xl font-bold text-coffee-950">
                    {language === 'vi' ? 'Xác nhận đổi quà?' : 'Confirm Redemption?'}
                  </h3>
                  <p className="text-xs text-coffee-600 font-medium">
                    {selectedGift.name[language]}
                  </p>
                </div>

                {/* RECIPIENT INFORMATION FORM */}
                <div className="text-left bg-[#FAF9F7] p-4 rounded-2xl border border-coffee-100/50 space-y-3">
                  <span className="text-stone-700 text-[11px] block uppercase font-bold tracking-wider border-b border-coffee-100/60 pb-1.5">
                    {language === 'vi' ? 'Thông tin người nhận quà' : 'Recipient Details'}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-coffee-800 uppercase block">
                        {language === 'vi' ? 'Họ và tên' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full bg-white border border-coffee-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#2D5A47]"
                        placeholder={language === 'vi' ? 'Nguyễn Văn A' : 'John Doe'}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-coffee-800 uppercase block">
                        {language === 'vi' ? 'Số điện thoại' : 'Phone'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        className="w-full bg-white border border-coffee-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#2D5A47]"
                        placeholder="0912345678"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-coffee-800 uppercase block">
                      Email (Nhận vé & QR)
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full bg-white border border-coffee-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#2D5A47]"
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-coffee-800 uppercase block">
                      {language === 'vi' ? 'Chi nhánh nhận quà' : 'Pickup Branch'}
                    </label>
                    <select
                      value={pickupBranch}
                      onChange={(e) => setPickupBranch(e.target.value)}
                      className="w-full bg-white border border-coffee-200 rounded-xl px-2 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#2D5A47]"
                    >
                      {MELLODI_BRANCHES.map(branch => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-[#FAF8F6] p-4 rounded-2xl border border-coffee-100/50 flex justify-between items-center text-xs">
                  <div className="text-left space-y-0.5">
                    <span className="text-stone-400 text-[10px] block uppercase font-bold">{language === 'vi' ? 'Trừ điểm' : 'Points deduction'}</span>
                    <span className="font-bold text-rose-600 font-mono">-{selectedGift.costPoints.toLocaleString()} LEN</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-stone-400 text-[10px] block uppercase font-bold">{language === 'vi' ? 'Còn lại sau đổi' : 'Points after'}</span>
                    <span className="font-bold text-emerald-700 font-mono">{(lenPoints - selectedGift.costPoints).toLocaleString()} LEN</span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedGift(null)}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    {language === 'vi' ? 'Hủy bỏ' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleRedeemSubmit}
                    disabled={isRedeeming}
                    className="flex-1 py-3 bg-[#2D5A47] hover:bg-[#1E4334] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex justify-center items-center"
                  >
                    {isRedeeming ? (
                      <span className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>{language === 'vi' ? 'Xác nhận đổi' : 'Confirm'}</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REDEMPTION STATUS DIALOG */}
      <AnimatePresence>
        {redemptionStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white rounded-3xl p-6 sm:p-8 ${
                redemptionStatus.success ? 'max-w-md' : 'max-w-sm'
              } w-full text-center shadow-2xl relative border border-coffee-100 max-h-[90vh] overflow-y-auto`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border ${
                redemptionStatus.success 
                  ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]' 
                  : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                {redemptionStatus.success ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <AlertCircle className="w-8 h-8" />
                )}
              </div>

              <h3 className="font-serif text-lg font-bold text-coffee-950 mb-1">
                {redemptionStatus.success 
                  ? (language === 'vi' ? 'Đổi Quà Thành Công!' : 'Redemption Successful!') 
                  : (language === 'vi' ? 'Lỗi Đổi Quà!' : 'Redemption Error!')}
              </h3>
              <p className="text-xs text-coffee-600 mb-4 leading-relaxed">
                {redemptionStatus.message}
              </p>

              {/* SUCCESS TICKET & QR CONFIRMATION */}
              {redemptionStatus.success && lastRedeemedGift && (
                <div className="my-5 text-left bg-stone-50 border border-stone-200 rounded-2xl p-5 relative overflow-hidden space-y-4">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                  
                  {/* Ticket Header */}
                  <div className="flex justify-between items-start border-b border-dashed border-stone-200 pb-3">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 block bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                        {language === 'vi' ? 'Vé Nhận Quà' : 'Pickup Ticket'}
                      </span>
                      <h4 className="font-serif text-xs font-bold text-coffee-900 mt-1 max-w-[200px] truncate">
                        {lastRedeemedGift.giftName[language] || lastRedeemedGift.giftName['en']}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-stone-400 block uppercase font-bold">{language === 'vi' ? 'Mã số' : 'Code'}</span>
                      <span className="text-xs font-mono font-bold text-coffee-950">{lastRedeemedGift.claimCode}</span>
                    </div>
                  </div>

                  {/* Ticket Content */}
                  <div className="grid grid-cols-2 gap-3 text-[11px] text-stone-600">
                    <div>
                      <span className="text-[9px] text-stone-400 block uppercase font-bold">{language === 'vi' ? 'Người nhận' : 'Recipient'}</span>
                      <span className="font-bold text-stone-800 block truncate">{lastRedeemedGift.recipientName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 block uppercase font-bold">{language === 'vi' ? 'Số điện thoại' : 'Phone'}</span>
                      <span className="font-bold text-stone-800 block">{lastRedeemedGift.recipientPhone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-stone-400 block uppercase font-bold">Email nhận phiếu</span>
                      <span className="font-bold text-stone-800 block truncate">{lastRedeemedGift.recipientEmail}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-stone-400 block uppercase font-bold">{language === 'vi' ? 'Chi nhánh nhận quà' : 'Pickup Branch'}</span>
                      <span className="font-bold text-stone-800 block">{lastRedeemedGift.pickupBranch}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 block uppercase font-bold">{language === 'vi' ? 'Ngày đổi' : 'Date'}</span>
                      <span className="text-stone-500 block truncate">{lastRedeemedGift.redeemedDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 block uppercase font-bold">{language === 'vi' ? 'Trạng thái' : 'Status'}</span>
                      <span className="text-emerald-700 font-bold block">{language === 'vi' ? 'Sẵn sàng nhận' : 'Ready'}</span>
                    </div>
                  </div>

                  {/* Ticket QR Code */}
                  <div className="flex flex-col items-center justify-center border-t border-dashed border-stone-200 pt-4 space-y-2">
                    <div className="p-2 bg-white rounded-lg border border-stone-200 shadow-sm">
                      {/* Simulated ticket QR code */}
                      <svg className="w-24 h-24 text-stone-800" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="white" />
                        <path d="M5,5 h20 v20 h-20 z M13,13 h4 v4 h-4 z M75,5 h20 v20 h-20 z M83,13 h4 v4 h-4 z M5,75 h20 v20 h-20 z M13,83 h4 v4 h-4 z" fill="currentColor" />
                        <path d="M35,10 h5 v5 h-5 z M45,5 h10 v5 h-10 z M60,15 h10 v5 h-10 z M10,35 h5 v5 h-5 z M20,40 h15 v5 h-15 z M50,30 h10 v10 h-10 z M70,35 h15 v5 h-15 z M35,50 h15 v5 h-15 z M55,45 h10 v15 h-10 z M15,60 h10 v5 h-10 z M45,70 h5 v10 h-5 z M75,50 h15 v5 h-15 z M65,70 h20 v5 h-20 z M80,80 h15 v15 h-15 z" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-stone-400 italic text-center leading-normal">
                      {language === 'vi' ? 'Đưa mã QR này cho nhân viên tại quầy chi nhánh đã chọn để nhận quà' : 'Show this QR code to Mellodi baristas to claim your gift'}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setRedemptionStatus(null);
                  setLastRedeemedGift(null);
                }}
                className="w-full bg-coffee-900 text-white font-bold text-xs py-3 rounded-xl hover:bg-coffee-950 transition-colors cursor-pointer"
              >
                {language === 'vi' ? 'Đóng lại' : 'Close'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLAIM COUNTER SCAN SIMULATOR DIALOG */}
      <AnimatePresence>
        {claimingGift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative border border-coffee-100"
            >
              <button
                onClick={() => setClaimingGift(null)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-coffee-950">
                    {language === 'vi' ? 'Đổi Quà Tại Quầy' : 'Redeem Gift At Counter'}
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                    {language === 'vi' 
                      ? 'Đưa mã QR này cho nhân viên quầy Mellodi hoặc bấm nút "Giả Lập Quét Mã" để xác nhận nhận quà tại quán.'
                      : 'Show this QR code to Mellodi staff or click "Simulate Scanning" to claim immediately.'}
                  </p>
                </div>

                {/* Virtual QR Code Card */}
                <div className="bg-[#FAF9F6] p-6 rounded-2xl border-2 border-dashed border-coffee-200 flex flex-col items-center justify-center space-y-4">
                  <div className="p-3 bg-white rounded-xl border border-coffee-100 shadow-sm">
                    {/* Simulated SVG QR Code */}
                    <svg className="w-40 h-40 text-coffee-950" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white" />
                      {/* Quiet zones & corners */}
                      <path d="M5,5 h20 v20 h-20 z M13,13 h4 v4 h-4 z M75,5 h20 v20 h-20 z M83,13 h4 v4 h-4 z M5,75 h20 v20 h-20 z M13,83 h4 v4 h-4 z" fill="currentColor" />
                      {/* Random pixel path mock */}
                      <path d="M35,10 h5 v5 h-5 z M45,5 h10 v5 h-10 z M60,15 h10 v5 h-10 z M10,35 h5 v5 h-5 z M20,40 h15 v5 h-15 z M50,30 h10 v10 h-10 z M70,35 h15 v5 h-15 z M35,50 h15 v5 h-15 z M55,45 h10 v15 h-10 z M15,60 h10 v5 h-10 z M45,70 h5 v10 h-5 z M75,50 h15 v5 h-15 z M65,70 h20 v5 h-20 z M80,80 h15 v15 h-15 z" fill="currentColor" />
                    </svg>
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="text-[11px] font-bold text-coffee-700 font-mono tracking-widest uppercase block">
                      {claimingGift.claimCode}
                    </span>
                    <span className="text-[10px] text-stone-400 block truncate max-w-[240px]">
                      {claimingGift.giftName[language] || claimingGift.giftName['en']}
                    </span>
                  </div>
                </div>

                {/* Simulated claim trigger to bypass physical scanning */}
                <button
                  onClick={handleClaimGiftSimulation}
                  disabled={isClaiming}
                  className="w-full bg-[#2D5A47] hover:bg-[#1E4334] text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isClaiming 
                      ? 'Đang xác thực...' 
                      : (language === 'vi' ? 'Giả Lập Quét Nhận Quà' : 'Simulate Scanning Code')}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// Simple mock for CakeIcon since it is missing in lucide-react sometimes
const CakeIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
    <path d="M2 21h20" />
    <path d="M7 8v3" />
    <path d="M12 8v3" />
    <path d="M17 8v3" />
    <path d="M7 4h.01" />
    <path d="M12 4h.01" />
    <path d="M17 4h.01" />
  </svg>
);
