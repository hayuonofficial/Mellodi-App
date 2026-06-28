import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Tag, Calendar, CheckCircle2, Ticket, Sparkles, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VoucherSection: React.FC = () => {
  const {
    language,
    vouchers,
    claimVoucher,
    claimVoucherByCode,
    formatPrice,
    formatPriceInCurrency
  } = useApp();

  const [claimInput, setClaimInput] = useState('');
  const [claimStatus, setClaimStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const claimedActiveVouchers = vouchers.filter(vc => vc.claimed && !vc.used);
  const claimedUsedVouchers = vouchers.filter(vc => vc.claimed && vc.used);
  const unclaimedVouchers = vouchers.filter(vc => !vc.claimed);

  const handleClaimByCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimStatus(null);
    if (!claimInput.trim()) return;

    const result = claimVoucherByCode(claimInput);
    if (result.success) {
      setClaimStatus({ type: 'success', text: result.message });
      setClaimInput('');
    } else {
      setClaimStatus({ type: 'error', text: result.message });
    }
    setTimeout(() => setClaimStatus(null), 5000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-8">
      
      {/* ENTER COUPON HEADER */}
      <div className="bg-white rounded-3xl border border-coffee-100 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-700 mx-auto">
          <Ticket className="w-6 h-6" />
        </div>
        
        <div>
          <h3 className="font-serif text-xl font-bold text-coffee-950">
            {translations[language]['voucher.title']}
          </h3>
          <p className="text-xs text-coffee-500 mt-1">Nhập mã hoặc nhận trực tiếp các ưu đãi hấp dẫn để thưởng thức cà phê Mellodi tiết kiệm hơn.</p>
        </div>

        <form onSubmit={handleClaimByCodeSubmit} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            id="voucher-claim-code-input"
            value={claimInput}
            onChange={(e) => setClaimInput(e.target.value)}
            placeholder="Mã voucher (E.g., MELLODINEW)..."
            className="flex-1 bg-coffee-50/50 border border-coffee-200 rounded-xl px-4 py-3 text-xs font-mono font-bold uppercase focus:outline-hidden focus:ring-1 focus:ring-coffee-600"
          />
          <button
            type="submit"
            id="btn-claim-voucher-by-code"
            className="bg-coffee-900 hover:bg-coffee-950 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
          >
            {translations[language]['voucher.claim']}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {claimStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 max-w-md mx-auto rounded-xl text-xs flex items-center justify-center space-x-1.5 ${
                claimStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  : 'bg-rose-50 text-rose-800 border border-rose-100'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${claimStatus.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`} />
              <span className="font-semibold">{claimStatus.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TWO SECTIONS: MY WALLET VOUCHERS VS UNCLAIMED OFFERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: My Claimed Coupons (Voucher của bạn) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-serif text-lg font-bold text-coffee-950 flex items-center space-x-2 border-b border-coffee-100 pb-2">
            <Tag className="w-5 h-5 text-coffee-800" />
            <span>{translations[language]['voucher.title']} ({claimedActiveVouchers.length})</span>
          </h3>

          {claimedActiveVouchers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-coffee-100 text-center text-coffee-400 text-xs">
              <Ticket className="w-8 h-8 text-coffee-200 mx-auto mb-2" />
              <span>{translations[language]['voucher.empty']} Săn mã khuyến mãi bên phải để nạp ngay!</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {claimedActiveVouchers.map((vc) => (
                <div
                  key={vc.id}
                  id={`my-voucher-card-${vc.id}`}
                  className="bg-white rounded-2xl border border-coffee-100 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Decorative side notches to look like a real ticket */}
                  <div className="absolute top-1/2 -left-2 w-4 h-4 bg-stone-50 rounded-full border-r border-coffee-100 transform -translate-y-1/2"></div>
                  <div className="absolute top-1/2 -right-2 w-4 h-4 bg-stone-50 rounded-full border-l border-coffee-100 transform -translate-y-1/2"></div>

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200/50 px-2 py-0.5 rounded-md uppercase">
                        {vc.code}
                      </span>
                      <button
                        id={`btn-copy-voucher-code-${vc.id}`}
                        onClick={() => handleCopyCode(vc.code)}
                        className="text-coffee-400 hover:text-coffee-900 p-1"
                      >
                        {copiedCode === vc.code ? (
                          <span className="text-[9px] font-bold text-emerald-600 uppercase">Copied!</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-coffee-950 line-clamp-1">
                      {vc.title[language]}
                    </h4>
                    <p className="text-[10px] text-coffee-500 line-clamp-2 leading-relaxed">
                      {vc.description[language]}
                    </p>
                  </div>

                  <div className="bg-coffee-50 p-3.5 flex justify-between items-center text-[10px] border-t border-coffee-100/50">
                    <div className="flex items-center space-x-1 text-coffee-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{translations[language]['voucher.expired']}: {vc.expiryDate}</span>
                    </div>

                    <span className="font-semibold text-amber-700">
                      {vc.discountType === 'percent' ? `Giảm ${vc.value}%` : `Giảm ${formatPriceInCurrency(vc.value)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Used Vouchers Sublist */}
          {claimedUsedVouchers.length > 0 && (
            <div className="pt-4">
              <h4 className="text-[11px] font-bold text-coffee-400 uppercase tracking-wider mb-2">Đã sử dụng ({claimedUsedVouchers.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60">
                {claimedUsedVouchers.map((vc) => (
                  <div key={vc.id} className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <h5 className="font-serif font-bold text-stone-700 line-clamp-1">{vc.title[language]}</h5>
                      <span className="text-[9px] font-mono text-stone-400 uppercase">{vc.code}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-bold uppercase">{translations[language]['common.applied']}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Voucher Claim Center (Săn ưu đãi) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-serif text-lg font-bold text-coffee-950 flex items-center space-x-2 border-b border-coffee-100 pb-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>{translations[language]['voucher.all']}</span>
          </h3>

          {unclaimedVouchers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-coffee-100 text-center text-coffee-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>Tuyệt vời! Bạn đã săn hết tất cả voucher hiện tại.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {unclaimedVouchers.map((vc) => (
                <div
                  key={vc.id}
                  id={`unclaimed-voucher-${vc.id}`}
                  className="bg-white p-4 rounded-2xl border border-coffee-100 shadow-xs flex items-center justify-between space-x-4 hover:border-coffee-200 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-md">
                        {vc.discountType === 'percent' ? `Giảm ${vc.value}%` : `Giảm ${formatPriceInCurrency(vc.value)}`}
                      </span>
                      <span className="text-[9px] text-coffee-400">Min: {formatPriceInCurrency(vc.minOrderVND)}</span>
                    </div>
                    
                    <h4 className="font-serif font-bold text-sm text-coffee-950 leading-snug">
                      {vc.title[language]}
                    </h4>
                    <p className="text-[10.5px] text-coffee-500 line-clamp-1 leading-normal">
                      {vc.description[language]}
                    </p>
                  </div>

                  <button
                    id={`btn-claim-voucher-${vc.id}`}
                    onClick={() => claimVoucher(vc.id)}
                    className="px-4.5 py-2 rounded-xl bg-coffee-100 text-coffee-900 text-xs font-bold hover:bg-coffee-900 hover:text-white transition-all cursor-pointer"
                  >
                    {translations[language]['voucher.claim']}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
