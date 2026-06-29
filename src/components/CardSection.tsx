import React, { useState } from 'react';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { translations } from '../translations';
import { CreditCard, QrCode, PlusCircle, RefreshCw, Sparkles, CheckCircle, Wallet, HelpCircle, ArrowRight, Lock, Check, ShieldCheck, QrCode as ScanIcon, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


export const CardSection: React.FC = () => {
  const {
    language,
    walletBalance,
    lenPoints,
    topUpWallet,
    buyLenPoints,
    formatPriceInCurrency,
    currentUser,
    disableBiometric
  } = useApp();

  const [topUpAmount, setTopUpAmount] = useState<string>('100000');
  const [buyPointsAmount, setBuyPointsAmount] = useState<string>('50000');
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState<'topup' | 'buylen'>('topup');
  
  // Payment gateway simulation states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'credit' | 'momo'>('vietqr');
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success' | 'vietqr'>('select');
  const [vietQrInfo, setVietQrInfo] = useState<{ qrCodeUrl: string; memo: string; bankInfo: any; amount: number } | null>(null);
  const [processingMessage, setProcessingMessage] = useState('');
  
  // Credit card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);



  const getTierDetails = () => {
    if (lenPoints >= 50000) {
      return {
        name: translations[language]['card.tier.gold'],
        bg: 'bg-gradient-to-br from-[#AA771C] via-[#E1B153] to-[#8A5205] text-[#3E2723]',
        starsBg: 'bg-black/10',
        starColor: 'text-[#5C3E09]',
        textColor: 'text-[#3E2723]',
        accentTextColor: 'text-[#3E2723]/80',
        stars: 3,
        percentToNext: 100,
        nextLabel: 'MAX TIER'
      };
    } else if (lenPoints >= 20000) {
      return {
        name: translations[language]['card.tier.green'],
        bg: 'bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#0D532C] text-white shadow-lg shadow-[#1B5E20]/20',
        starsBg: 'bg-white/15',
        starColor: 'text-amber-300',
        textColor: 'text-white',
        accentTextColor: 'text-white/80',
        stars: 2,
        percentToNext: Math.min(100, Math.round(((lenPoints - 20000) / 30000) * 100)),
        nextLabel: 'GOLD (50K LEN)'
      };
    } else {
      return {
        name: translations[language]['card.tier.welcome'],
        bg: 'bg-gradient-to-br from-[#4E342E] via-[#6D4C41] to-[#3E2723] text-white border border-[#E0D7D0]/20 shadow-md',
        starsBg: 'bg-white/10',
        starColor: 'text-amber-400',
        textColor: 'text-white',
        accentTextColor: 'text-white/70',
        stars: 1,
        percentToNext: Math.min(100, Math.round((lenPoints / 20000) * 100)),
        nextLabel: 'EMERALD (20K LEN)'
      };
    }
  };

  const tier = getTierDetails();

  // Listen for wallet balance updates to automatically transition from VietQR pending to Success
  const [prevBalance, setPrevBalance] = useState(walletBalance);
  React.useEffect(() => {
    if (walletBalance > prevBalance) {
      if (paymentStep === 'vietqr') {
        setPaymentStep('success');
      }
      setPrevBalance(walletBalance);
    } else if (walletBalance < prevBalance) {
      setPrevBalance(walletBalance); // Sync if balance decreased (e.g. checkout)
    }
  }, [walletBalance, paymentStep, prevBalance]);

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(topUpAmount, 10);
    if (!val || val <= 0 || isNaN(val)) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập số tiền hợp lệ!' });
      return;
    }
    setPaymentStep('select');
    setShowPaymentModal(true);
  };

  const startPaymentProcessing = async () => {
    const val = parseInt(topUpAmount, 10);
    if (!val || val <= 0 || isNaN(val)) return;

    if (paymentMethod === 'vietqr') {
      setPaymentStep('processing');
      setProcessingMessage('Đang tạo mã VietQR động từ hệ thống ngân hàng Mellodi...');
      
      try {
        const res = await topUpWallet(val, 'VietQR_Transfer');
        if (res.success && res.qrCodeUrl && res.memo) {
          setVietQrInfo({
            qrCodeUrl: res.qrCodeUrl,
            memo: res.memo,
            bankInfo: res.bankInfo,
            amount: val
          });
          setPaymentStep('vietqr');
        } else {
          setPaymentStep('select');
          alert(res.message || 'Không thể tạo mã thanh toán.');
        }
      } catch (err) {
        setPaymentStep('select');
        alert('Lỗi kết nối khi tạo mã thanh toán.');
      }
      return;
    }

    setPaymentStep('processing');
    setProcessingMessage('Đang kết nối cổng thanh toán an toàn Mellodi Pay...');
    
    setTimeout(() => {
      setProcessingMessage('Đang xác minh thông tin tài khoản ngân hàng đối tác...');
    }, 1500);

    setTimeout(() => {
      setProcessingMessage('Đang đối soát sao kê tài khoản ngân hàng đối tác...');
    }, 3000);

    setTimeout(async () => {
      const res = await topUpWallet(val, paymentMethod === 'credit' ? 'Napas_CreditCard' : 'MoMo_Wallet');
      if (res.success) {
        setPaymentStep('success');
      } else {
        setPaymentStep('select');
        alert(res.message);
      }
    }, 4500);
  };

  const handleBuyPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(buyPointsAmount, 10);
    const result = await buyLenPoints(val);
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* LEFT COLUMN: Visual Mellodi Card and Stats */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* MEMBERSHIP CARD */}
        <motion.div 
          whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
          style={{ perspective: 1200 }}
          className={`w-full aspect-[1.6/1] rounded-3xl ${tier.bg} p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden`}
        >
          {/* Decorative background vectors/textures */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12 pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
          
          {/* Subtle hologram security wave patterns */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

          {/* Top Row: Brand & Tier indicators */}
          <div className="flex justify-between items-start z-10">
            <div>
              <span className="font-serif font-black text-xl sm:text-2xl tracking-widest uppercase">
                {translations[language]['brand.name']}
              </span>
              <span className="text-[9px] uppercase tracking-widest block opacity-75 font-mono">
                {translations[language]['card.title']}
              </span>
            </div>
            
            {/* Stars rendering like a VIP tier badge */}
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full backdrop-blur-md ${tier.starsBg} border border-white/10`}>
              {Array.from({ length: tier.stars }).map((_, i) => (
                <Sparkles key={i} className={`w-3.5 h-3.5 ${tier.starColor} fill-current animate-pulse`} />
              ))}
              <span className="text-[10px] font-bold uppercase tracking-wider ml-1">{tier.name}</span>
            </div>
          </div>

          {/* Middle Row: Gold Contact Chip, NFC Wave, QR Scan Button */}
          <div className="flex justify-between items-center z-10 my-1">
            {/* Gold Sim contact chip illustration */}
            <div className="flex items-center space-x-4">
              <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 border border-amber-400 p-1 flex flex-col justify-between opacity-80 shadow-inner">
                <div className="grid grid-cols-3 gap-0.5 h-full w-full">
                  <div className="border-r border-amber-600/30"></div>
                  <div className="border-r border-amber-600/30"></div>
                  <div></div>
                </div>
              </div>
              
              {/* NFC signal graphic */}
              <div className="flex flex-col space-y-0.5 opacity-50">
                <span className="w-4 h-0.5 bg-current rounded-full"></span>
                <span className="w-3 h-0.5 bg-current rounded-full"></span>
                <span className="w-2 h-0.5 bg-current rounded-full"></span>
              </div>
            </div>

            {/* Pay Button */}
            <button 
              id="btn-card-qr"
              onClick={() => setShowQR(true)}
              className="w-14 h-14 rounded-2xl bg-white text-coffee-950 flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-[#E0D7D0]"
            >
              <QrCode className="w-6 h-6 text-[#2D5A47]" />
              <span className="text-[8px] font-bold uppercase mt-0.5 text-stone-500 tracking-wider">PAY</span>
            </button>
          </div>

          {/* Bottom Row: User Name & Wallet/Points balance */}
          <div className="grid grid-cols-12 gap-2 border-t border-white/15 pt-3.5 z-10 items-end">
            
            {/* Wallet balance */}
            <div className="col-span-4">
              <span className="text-[9px] opacity-75 block uppercase tracking-wide">
                {translations[language]['card.wallet.balance']}
              </span>
              <span className="text-sm sm:text-base font-black font-mono">
                {formatPriceInCurrency(walletBalance)}
              </span>
            </div>

            {/* Point balance */}
            <div className="col-span-4 text-center border-l border-r border-white/10">
              <span className="text-[9px] opacity-75 block uppercase tracking-wide">
                {translations[language]['card.points.balance']}
              </span>
              <span className="text-sm sm:text-base font-black font-mono">
                {lenPoints.toLocaleString()} <span className="text-[9px] font-bold text-amber-300">LEN</span>
              </span>
            </div>

            {/* User name & card identifier */}
            <div className="col-span-4 text-right">
              <span className="text-[10px] font-bold tracking-wider uppercase block font-mono truncate">
                {currentUser?.name || "GUEST MEMBER"}
              </span>
              <span className="text-[8px] font-mono opacity-60 tracking-widest block uppercase">
                ID: {currentUser?.id ? currentUser.id.toUpperCase() : "MEMBER"}
              </span>
            </div>

          </div>
        </motion.div>

        {/* PROGRESS TO NEXT TIER */}
        <div className="bg-white rounded-2xl p-6 border border-coffee-100 shadow-sm">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-coffee-600 uppercase">{translations[language]['card.tier']}</span>
            <span className="text-coffee-950 font-mono">
              {lenPoints.toLocaleString()} / {lenPoints >= 50000 ? '50,000+' : lenPoints >= 20000 ? '50,000' : '20,000'} LEN
            </span>
          </div>
          
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/50">
            <div 
              className="h-full bg-gradient-to-r from-[#2D5A47] via-[#A37B45] to-[#A37B45] rounded-full transition-all duration-500"
              style={{ width: `${tier.percentToNext}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-[11px] text-stone-500 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-[#A37B45]" />
              <span>{translations[language]['card.points.help']}</span>
            </span>
            <span className="text-[11px] font-black text-[#2D5A47]">
              TIẾP THEO: {tier.nextLabel}
            </span>
          </div>
        </div>



      </div>

      {/* RIGHT COLUMN: WALLET TOPUP & CONVERT LEN POINTS (hidden for admin/manager) */}
      {currentUser?.role === 'admin' || currentUser?.role === 'manager' ? (
        <div className="lg:col-span-5 bg-white rounded-2xl border border-coffee-100 shadow-md p-6 flex flex-col items-center justify-center space-y-5 text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2D5A47] to-[#1E3F31] flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-coffee-950">
              {language === 'vi' ? 'Tài khoản Quản Trị Viên' : language === 'ko' ? '관리자 계정' : 'Administrator Account'}
            </h3>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed max-w-xs">
              {language === 'vi'
                ? 'Tài khoản quản trị không tích điểm LEN hay nạp ví. Vui lòng truy cập tab Quản Trị CRM để quản lý khách hàng và hệ thống.'
                : language === 'ko'
                ? '관리자 계정은 LEN 포인트를 적립하거나 지갑을 충전하지 않습니다. CRM 관리 탭에서 고객 및 시스템을 관리하세요.'
                : 'Admin accounts do not earn LEN points or top up wallets. Please visit the CRM Admin tab to manage customers and the system.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <div className="px-4 py-2.5 bg-stone-50 rounded-xl border border-stone-100 text-left">
              <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
                {language === 'vi' ? 'Quyền hạn tài khoản' : 'Account Permissions'}
              </span>
              <div className="mt-1.5 space-y-1">
                {[
                  language === 'vi' ? '✅ Quản lý toàn bộ khách hàng' : '✅ Full customer management',
                  language === 'vi' ? '✅ Cấp / thu hồi thẻ NFC' : '✅ Issue / revoke NFC cards',
                  language === 'vi' ? '✅ Phân quyền tài khoản thành viên' : '✅ Assign member roles',
                  language === 'vi' ? '✅ Chỉnh sửa thực đơn & giá bán' : '✅ Edit menu & pricing',
                  language === 'vi' ? '✅ Xem phân tích doanh thu' : '✅ View revenue analytics',
                  language === 'vi' ? '❌ Không tích điểm LEN' : '❌ No LEN point accumulation',
                ].map((item, i) => (
                  <p key={i} className="text-[11px] text-stone-700 font-semibold">{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="lg:col-span-5 bg-white rounded-2xl border border-coffee-100 shadow-md p-6">
        {/* Toggle Controls */}
        <div className="flex bg-[#F3F0ED] p-1 rounded-xl mb-6">
          <button
            id="tab-topup-wallet"
            onClick={() => { setActiveTab('topup'); setStatusMessage(null); }}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all duration-300 ${
              activeTab === 'topup'
                ? 'bg-white text-coffee-950 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5 text-[#2D5A47]" />
            {translations[language]['card.topup']}
          </button>
          <button
            id="tab-buylen-points"
            onClick={() => { setActiveTab('buylen'); setStatusMessage(null); }}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all duration-300 ${
              activeTab === 'buylen'
                ? 'bg-white text-coffee-950 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5 text-[#A37B45]" />
            {translations[language]['card.buylen']}
          </button>
        </div>

        {/* FEEDBACK MESSAGE */}
        <AnimatePresence mode="wait">
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3.5 rounded-xl mb-6 text-xs flex items-start space-x-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  : 'bg-rose-50 text-rose-800 border border-rose-100'
              }`}
            >
              <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${statusMessage.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`} />
              <span>{statusMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP UP WALLET CONTENT */}
        {activeTab === 'topup' && (
          <form onSubmit={handleOpenPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-coffee-950 uppercase tracking-wide mb-1.5">
                {translations[language]['card.topup']} (VND)
              </label>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">đ</span>
                <input
                  type="number"
                  id="wallet-topup-input"
                  min="20000"
                  step="10000"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-coffee-200 rounded-xl py-3 pl-8 pr-4 text-sm font-bold text-coffee-950 focus:outline-hidden focus:ring-2 focus:ring-[#2D5A47] focus:border-transparent transition-all outline-none"
                  placeholder="Nhập số tiền..."
                />
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {['50000', '100000', '200000', '500000'].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  id={`preset-topup-${amt}`}
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${
                    topUpAmount === amt
                      ? 'bg-[#2D5A47] border-[#2D5A47] text-white shadow-xs'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {(parseInt(amt, 10) / 1000)}K
                </button>
              ))}
            </div>

            {/* Quick explanation */}
            <div className="bg-[#FAF9F6] rounded-xl p-3 text-[11px] text-stone-600 flex items-start space-x-2 border border-stone-200/40">
              <CreditCard className="w-4 h-4 text-[#2D5A47] flex-shrink-0 mt-0.5" />
              <span>Thanh toán nạp tiền thật an toàn qua mã QR Ngân hàng (VietQR), Thẻ nội địa NAPAS hoặc ví điện tử MoMo.</span>
            </div>

            <button
              type="submit"
              id="btn-submit-topup"
              className="w-full bg-[#2D5A47] hover:bg-[#1E3F31] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              Tiến hành nạp tiền thật
            </button>
          </form>
        )}

        {/* BUY LEN POINTS CONTENT */}
        {activeTab === 'buylen' && (
          <form onSubmit={handleBuyPoints} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-coffee-950 uppercase tracking-wide">
                  {translations[language]['card.buylen']}
                </label>
                <span className="text-[10px] font-bold text-[#A37B45] bg-[#A37B45]/10 px-2.5 py-0.5 rounded-md border border-[#A37B45]/20">
                  1,000đ = 1,000 LEN
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400">đ</span>
                <input
                  type="number"
                  id="buylen-points-input"
                  min="1000"
                  step="1000"
                  value={buyPointsAmount}
                  onChange={(e) => setBuyPointsAmount(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E0D7D0] rounded-xl py-3 pl-8 pr-4 text-sm font-bold text-[#4E342E] focus:outline-hidden focus:ring-2 focus:ring-[#A37B45] focus:border-transparent transition-all outline-none"
                  placeholder={translations[language]['card.buylen.placeholder']}
                />
              </div>
            </div>

            {/* Presets for points buy */}
            <div className="grid grid-cols-4 gap-2">
              {['20000', '50000', '100000', '200000'].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  id={`preset-buylen-${amt}`}
                  onClick={() => setBuyPointsAmount(amt)}
                  className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${
                    buyPointsAmount === amt
                      ? 'bg-[#A37B45] border-[#A37B45] text-white shadow-xs'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {(parseInt(amt, 10) / 1000)}K PTS
                </button>
              ))}
            </div>

            <div className="bg-amber-50/40 rounded-xl p-3 text-[11px] text-amber-900 border border-amber-100/50 flex items-start space-x-2">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{translations[language]['card.buylen.desc']}</p>
                <p className="text-[10px] text-stone-500 mt-0.5">Quy đổi số dư ví Mellodi thành điểm LEN thưởng. Điểm LEN được sử dụng vĩnh viễn và có thể thanh toán thay cho tiền mặt tại toàn bộ hệ thống cửa hàng Mellodi.</p>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-buylen"
              className="w-full bg-[#A37B45] hover:bg-[#8A5205] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 cursor-pointer uppercase tracking-wider"
            >
              Quy đổi sang điểm LEN
            </button>
          </form>
        )}

      </div>
      )}

      {/* BANK TRANSFER & GATEWAY SIMULATION MODAL */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto"
            >
              {paymentStep === 'select' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{translations[language]['card.payment.gateway']}</span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4E342E] mt-3">{translations[language]['card.payment.method']}</h3>
                    <p className="text-xs text-stone-500 mt-1">{language === 'vi' ? 'Nạp thực tế' : language === 'ko' ? '실제 충전 금액:' : 'Actual reload amount:'} <span className="font-mono font-bold text-[#4E342E]">{formatPriceInCurrency(parseInt(topUpAmount))}</span></p>
                  </div>

                  {/* Payment Tabs */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vietqr')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'vietqr' ? 'bg-emerald-50 border-emerald-500 text-[#2D5A47]' : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <ScanIcon className="w-5 h-5 text-emerald-600" />
                      <span className="text-[10px] font-bold uppercase">{translations[language]['card.vietqr'].split(' ')[0]}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'credit' ? 'bg-emerald-50 border-emerald-500 text-[#2D5A47]' : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <span className="text-[10px] font-bold uppercase">{translations[language]['card.credit']}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('momo')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                        paymentMethod === 'momo' ? 'bg-emerald-50 border-emerald-500 text-[#2D5A47]' : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="w-5 h-5 bg-[#A50064] text-white flex items-center justify-center font-bold text-[8px] rounded-lg">MoMo</div>
                      <span className="text-[10px] font-bold uppercase">{translations[language]['card.momo']}</span>
                    </button>
                  </div>

                  {/* Dynamic payment form details */}
                  {paymentMethod === 'vietqr' && (
                    <div className="bg-[#FAF9F6] border border-emerald-200/50 rounded-2xl p-4 text-center py-6">
                      <ScanIcon className="w-10 h-10 text-emerald-600 mx-auto mb-2 animate-pulse" />
                      <p className="text-xs font-bold text-stone-700">Thanh toán VietQR động</p>
                      <p className="text-[11px] text-stone-500 mt-1">Mã QR động và nội dung chuyển khoản duy nhất sẽ được tự động tạo ở bước tiếp theo.</p>
                    </div>
                  )}

                  {paymentMethod === 'credit' && (
                    <div className="space-y-3 bg-[#FAF9F6] border border-stone-200/50 rounded-2xl p-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 block uppercase">Số Thẻ *</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4111 2222 3333 4444"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2D5A47] focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 block uppercase">Tên Trên Thẻ *</label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="NGUYEN VAN A"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs uppercase focus:ring-1 focus:ring-[#2D5A47] focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 block uppercase">Hạn Sử Dụng *</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2D5A47] focus:border-transparent outline-none text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-stone-500 block uppercase">CVV *</label>
                          <input
                            type="password"
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="***"
                            maxLength={3}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#2D5A47] focus:border-transparent outline-none text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'momo' && (
                    <div className="bg-[#FAF9F6] border border-stone-200/50 rounded-2xl p-4 flex flex-col items-center space-y-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#A50064] text-white flex items-center justify-center font-black text-xl">M</div>
                      <div>
                        <p className="text-xs font-bold text-[#A50064]">Thanh toán qua Ví MoMo</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Nhấp nút thanh toán phía dưới để kích hoạt chuyển hướng MoMo App.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Hủy giao dịch
                    </button>
                    <button
                      type="button"
                      onClick={startPaymentProcessing}
                      className="flex-1 py-3 px-4 bg-[#2D5A47] hover:bg-[#1E3F31] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Xác nhận thanh toán</span>
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'vietqr' && vietQrInfo && (
                <div className="space-y-6 text-center">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      Thanh Toán VietQR Tự Động
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#4E342E] mt-3">
                      Quét Mã Chuyển Khoản
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Hệ thống tự động nhận diện giao dịch sau khi chuyển khoản thành công
                    </p>
                  </div>

                  {/* QR Code and Scanner Animation */}
                  <div className="relative inline-block bg-white p-4 rounded-3xl border border-stone-200 shadow-md">
                    <img 
                      src={vietQrInfo.qrCodeUrl} 
                      alt="VietQR Code" 
                      className="w-48 h-48 mx-auto object-contain rounded-xl"
                    />
                    {/* Laser scanning line */}
                    <div className="absolute inset-x-4 h-0.5 bg-emerald-500 top-1/2 animate-pulse shadow-sm shadow-emerald-500"></div>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-[#FAF9F6] border border-stone-200 rounded-2xl p-4 text-left font-sans text-xs text-stone-700 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Ngân hàng:</span>
                      <span className="font-bold text-stone-900">{vietQrInfo.bankInfo.bankId} (Ngân hàng Quân Đội)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Số tài khoản:</span>
                      <span className="font-mono font-bold text-stone-900">{vietQrInfo.bankInfo.accountNo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Tên tài khoản:</span>
                      <span className="font-bold text-stone-900">{vietQrInfo.bankInfo.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-dashed border-stone-200 pt-2">
                      <span className="text-stone-500">Số tiền:</span>
                      <span className="font-mono font-black text-[#2D5A47] text-sm">
                        {vietQrInfo.amount.toLocaleString()} đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-amber-50 border border-amber-100 p-2 rounded-xl">
                      <span className="text-amber-800 font-bold">Nội dung chuyển khoản:</span>
                      <span className="font-mono font-black text-amber-900 text-sm bg-white px-2 py-0.5 rounded-md border border-amber-200">
                        {vietQrInfo.memo}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs font-semibold animate-pulse">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang chờ chuyển khoản... (Tự động duyệt sau 8 giây)</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setShowPaymentModal(false); setPaymentStep('select'); }}
                    className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 border-4 border-[#2D5A47] border-t-transparent rounded-full animate-spin"></div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-lg font-bold text-[#4E342E]">Đang xử lý giao dịch...</h4>
                    <p className="text-xs text-stone-500 max-w-xs">{processingMessage}</p>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-stone-400">Vui lòng không tắt trình duyệt hoặc tải lại trang</span>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200 animate-bounce">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-2xl font-bold text-emerald-800">Thanh Toán Thành Công!</h4>
                    <p className="text-xs text-stone-500 max-w-sm">Hệ thống đã ghi nhận nạp thành công <span className="font-bold text-[#4E342E]">{parseInt(topUpAmount).toLocaleString()}đ</span> vào Ví điện tử Mellodi của bạn.</p>
                  </div>

                  <div className="bg-[#FAF9F6] border border-stone-200 rounded-2xl p-4 w-full text-left font-mono text-[11px] text-stone-600 space-y-1">
                    <p className="flex justify-between"><span>MÃ GIAO DỊCH:</span> <span className="font-bold text-stone-800">MEL-{Math.random().toString(36).substring(3, 9).toUpperCase()}</span></p>
                    <p className="flex justify-between"><span>THỜI GIAN:</span> <span className="font-bold text-stone-800">{new Date().toLocaleString()}</span></p>
                    <p className="flex justify-between"><span>SỐ TIỀN NẠP:</span> <span className="font-bold text-stone-800">+{parseInt(topUpAmount).toLocaleString()} đ</span></p>
                    <p className="flex justify-between"><span>PHƯƠNG THỨC:</span> <span className="font-bold text-stone-800">{paymentMethod.toUpperCase()} GATEWAY</span></p>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setShowPaymentModal(false); setPaymentStep('select'); }}
                    className="w-full py-3 px-4 bg-[#2D5A47] text-white text-xs font-bold rounded-xl hover:bg-[#1E3F31] transition-colors cursor-pointer shadow-md uppercase tracking-wider"
                  >
                    Quay lại thẻ thành viên
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCAN QR CODE PAY MODAL */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center relative shadow-2xl border border-stone-200"
            >
              <div className="w-12 h-1 rounded-full bg-stone-200 mx-auto mb-6"></div>
              
              <h3 className="font-serif text-xl font-bold text-coffee-950 mb-1">
                {translations[language]['card.pay.qr']}
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                {translations[language]['card.pay.desc']}
              </p>

              {/* Barcode/QR visualization */}
              <div className="bg-[#FAF9F6] p-4 rounded-2xl inline-block border border-stone-200 mb-6 relative">
                <div className="w-48 h-48 bg-white flex flex-col justify-center items-center p-2 rounded-xl border border-stone-200 shadow-inner">
                  <div className="grid grid-cols-6 gap-1 w-full h-full">
                    {Array.from({ length: 36 }).map((_, i) => {
                      const isFilled = (i % 2 === 0 && i % 3 !== 0) || (i % 5 === 0) || i < 6 || i > 30 || i % 6 === 0;
                      return (
                        <div 
                          key={i} 
                          className={`rounded-xs transition-colors duration-500 ${isFilled ? 'bg-[#2D5A47]' : 'bg-transparent'}`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
                <div className="absolute inset-x-0 h-0.5 bg-red-500 top-1/2 animate-pulse shadow-sm"></div>
              </div>

              {/* Barcode code details */}
              <div className="bg-stone-100 py-2.5 px-4 rounded-xl inline-block font-mono text-xs font-bold text-stone-700 tracking-widest mb-6 border border-stone-200">
                MELLODI-CARD-{lenPoints % 10000}-{walletBalance % 100000}
              </div>

              <div className="flex space-x-3">
                <button
                  id="btn-close-qr-modal"
                  onClick={() => setShowQR(false)}
                  className="w-full bg-coffee-900 hover:bg-coffee-950 text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  {translations[language]['common.close']}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
