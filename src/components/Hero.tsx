import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Coffee, MapPin, Tag, ArrowRight, Sparkles, Navigation, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  setActiveTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ setActiveTab }) => {
  const { language, lenPoints, simulateLocationNearStore } = useApp();

  const handleSimulateHanoiCathedral = () => {
    simulateLocationNearStore('st-1');
  };

  const handleSimulateHCMC = () => {
    simulateLocationNearStore('st-3');
  };

  return (
    <div className="space-y-8">
      
      {/* LUXURIOUS PROMOTIONAL BANNER */}
      <div className="bg-[#D7CCC8] rounded-3xl p-6 sm:p-10 text-coffee-950 relative overflow-hidden shadow-sm border border-[#E0D7D0] h-auto min-h-[220px] flex items-center">
        {/* Muted Minimalist Background accent circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#4E342E]/10 rounded-full pointer-events-none"></div>
        <div className="absolute right-10 top-4 w-40 h-40 bg-[#4E342E]/5 rounded-full pointer-events-none"></div>
        
        <div className="max-w-xl space-y-4 relative z-10">
          <span className="text-[10px] uppercase font-bold text-coffee-950 bg-white px-3 py-1 rounded-full border border-[#E0D7D0] inline-block shadow-2xs">
            {translations[language]['hero.banner.tag']}
          </span>
          
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-coffee-950">
            {translations[language]['hero.banner.title.1']} <br />
            <span className="text-[#6D4C41]">{translations[language]['hero.banner.title.2']}</span>
          </h2>
          
          <p className="text-xs text-coffee-800 font-medium leading-relaxed max-w-sm sm:max-w-md">
            {translations[language]['hero.banner.desc']}
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              id="btn-hero-order-now"
              onClick={() => setActiveTab('order')}
              className="px-5 py-2.5 rounded-xl bg-[#4E342E] text-white font-bold text-xs hover:bg-[#6D4C41] transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <span>{translations[language]['nav.order']}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-hero-find-stores"
              onClick={() => setActiveTab('stores')}
              className="px-5 py-2.5 rounded-xl bg-white text-[#4E342E] hover:bg-stone-50 text-xs font-bold transition-all border border-[#E0D7D0] flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-coffee-600" />
              <span>{translations[language]['nav.stores']}</span>
            </button>
          </div>
        </div>

        {/* Floating cup/circle design representation on desktop */}
        <div className="hidden lg:flex absolute -right-10 w-48 h-48 bg-[#4E342E] rounded-full items-center justify-center pointer-events-none select-none shadow-lg">
          <div className="w-36 h-36 border border-dashed border-white/30 rounded-full flex items-center justify-center text-white italic font-serif text-lg">
            Mellodi
          </div>
        </div>
      </div>

      {/* QUICK SIMULATION CONTROL BAR */}
      <div className="bg-white rounded-2xl p-5 border border-coffee-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-coffee-900 uppercase tracking-wide flex items-center space-x-1">
            <Navigation className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>{translations[language]['store.simulate.location']}</span>
          </h4>
          <p className="text-[10.5px] text-coffee-500">{translations[language]['hero.sim.desc']}</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            id="btn-quick-sim-cathedral"
            onClick={handleSimulateHanoiCathedral}
            className="flex-1 sm:flex-none px-4 py-2 bg-coffee-50 hover:bg-coffee-100 text-coffee-900 border border-coffee-200 rounded-xl text-[10.5px] font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>📍 Nhà Thờ Lớn (Hanoi)</span>
          </button>
          <button
            id="btn-quick-sim-hcm"
            onClick={handleSimulateHCMC}
            className="flex-1 sm:flex-none px-4 py-2 bg-coffee-50 hover:bg-coffee-100 text-coffee-900 border border-coffee-200 rounded-xl text-[10.5px] font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>📍 Landmark (HCMC)</span>
          </button>
        </div>
      </div>

      {/* THREE BENTO SHORTCUTS CARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Shortcut 1 */}
        <div 
          onClick={() => setActiveTab('order')}
          className="bg-white p-5 rounded-2xl border border-coffee-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          id="bento-shortcut-order"
        >
          <div className="w-9 h-9 rounded-xl bg-coffee-100/50 text-coffee-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Coffee className="w-4 h-4" />
          </div>
          <h4 className="font-serif font-bold text-sm text-coffee-950 flex items-center justify-between">
            <span>{translations[language]['nav.order']}</span>
            <ArrowRight className="w-3.5 h-3.5 text-coffee-400 group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-[11px] text-coffee-500 mt-1 leading-normal">{translations[language]['bento.order.desc']}</p>
        </div>

        {/* Shortcut 2 */}
        <div 
          onClick={() => setActiveTab('vouchers')}
          className="bg-white p-5 rounded-2xl border border-coffee-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          id="bento-shortcut-vouchers"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Tag className="w-4 h-4" />
          </div>
          <h4 className="font-serif font-bold text-sm text-coffee-950 flex items-center justify-between">
            <span>{translations[language]['nav.vouchers']}</span>
            <ArrowRight className="w-3.5 h-3.5 text-coffee-400 group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-[11px] text-coffee-500 mt-1 leading-normal">{translations[language]['bento.vouchers.desc']}</p>
        </div>

        {/* Shortcut 3 */}
        <div 
          onClick={() => setActiveTab('stores')}
          className="bg-white p-5 rounded-2xl border border-coffee-100 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          id="bento-shortcut-stores"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
          <h4 className="font-serif font-bold text-sm text-coffee-950 flex items-center justify-between">
            <span>{translations[language]['nav.stores']}</span>
            <ArrowRight className="w-3.5 h-3.5 text-coffee-400 group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-[11px] text-coffee-500 mt-1 leading-normal">{translations[language]['bento.stores.desc']}</p>
        </div>

      </div>

    </div>
  );
};
