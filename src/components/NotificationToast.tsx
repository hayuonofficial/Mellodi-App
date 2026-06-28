import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { MapPin, X, Sparkles, Check, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationToast: React.FC = () => {
  const { language, activePromo, dismissPromo, claimVoucherByCode } = useApp();
  const [successClaim, setSuccessClaim] = useState(false);

  if (!activePromo) return null;

  const handleClaimPromo = () => {
    const result = claimVoucherByCode(activePromo.voucherCode);
    if (result.success) {
      setSuccessClaim(true);
      setTimeout(() => {
        setSuccessClaim(false);
        dismissPromo();
      }, 3000);
    } else {
      dismissPromo();
    }
  };

  return (
    <div className="fixed top-24 right-4 z-50 max-w-sm w-full p-1.5 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="bg-coffee-950 text-white rounded-2xl shadow-xl p-4 border border-coffee-800 pointer-events-auto relative overflow-hidden"
        >
          {/* Decorative gold background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D7CCC8]/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-white/15 text-[#D7CCC8] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 animate-bounce">
              <Bell className="w-4 h-4 fill-[#D7CCC8]" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#D7CCC8] uppercase tracking-widest flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-red-400 fill-red-400" />
                  <span>Geofence Alert</span>
                </span>
                
                <button
                  id="btn-dismiss-promo-toast"
                  onClick={dismissPromo}
                  className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <h4 className="font-serif font-bold text-sm text-white">
                {translations[language]['promo.location.title']}
              </h4>
              
              <p className="text-[11px] text-white/80 leading-normal">
                {activePromo.message[language]}
              </p>

              <div className="pt-2">
                <button
                  id="btn-toast-claim-reward"
                  onClick={handleClaimPromo}
                  disabled={successClaim}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer ${
                    successClaim
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-coffee-950 hover:bg-[#FAF9F6] active:scale-98'
                  }`}
                >
                  {successClaim ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{translations[language]['common.applied']}!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#4E342E]" />
                      <span>{translations[language]['promo.location.get']}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
