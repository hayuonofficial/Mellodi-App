import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Smartphone, ArrowLeft, Wallet, Award, ShoppingBag, Sparkles, Compass } from 'lucide-react';

interface AppDownloadGateProps {
  onBackToWeb: () => void;
  onSimulateApp: () => void;
}

export const AppDownloadGate: React.FC<AppDownloadGateProps> = ({ onBackToWeb, onSimulateApp }) => {
  const { language } = useApp();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF9F6] text-stone-850 p-6 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4E342E]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#A37B45]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER */}
      <header className="max-w-4xl mx-auto w-full flex justify-between items-center relative z-10">
        <button
          onClick={onBackToWeb}
          className="px-4 py-2 bg-white hover:bg-stone-50 border border-coffee-100 text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-stone-600" />
          <span>{translations[language]['gate.back']}</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#4E342E] text-white flex items-center justify-center font-serif font-bold text-sm italic">M</div>
          <span className="font-serif font-bold text-base tracking-widest text-coffee-950">MELLODI</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center my-auto relative z-10 py-10">
        
        {/* Left Side: App Pitch */}
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-100 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#4E342E]">
            <Smartphone className="w-3.5 h-3.5" />
            <span>{translations[language]['gate.tag']}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-black leading-tight text-coffee-950">
            {translations[language]['gate.title']}
          </h2>

          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-lg">
            {translations[language]['gate.desc']}
          </p>

          {/* Key app features list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start space-x-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-[#4E342E] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-coffee-950">{translations[language]['gate.item.1.title']}</p>
                <p className="text-[10px] text-stone-455">{translations[language]['gate.item.1.desc']}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-[#4E342E] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-coffee-950">{translations[language]['gate.item.2.title']}</p>
                <p className="text-[10px] text-stone-455">{translations[language]['gate.item.2.desc']}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-coffee-950">{translations[language]['gate.item.3.title']}</p>
                <p className="text-[10px] text-stone-455">{translations[language]['gate.item.3.desc']}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-coffee-950">{translations[language]['gate.item.4.title']}</p>
                <p className="text-[10px] text-stone-455">{translations[language]['gate.item.4.desc']}</p>
              </div>
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            {/* Mock App Store */}
            <div className="bg-stone-900 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-stone-950 transition-all border border-stone-800 shadow-sm min-w-[180px] justify-center">
              <svg className="w-4.5 h-4.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.56 2.95-1.39z" />
              </svg>
              <div className="text-left">
                <span className="text-[10px] font-bold block leading-tight">{translations[language]['gate.download.appstore']}</span>
              </div>
            </div>

            {/* Mock Google Play */}
            <div className="bg-stone-900 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2.5 cursor-pointer hover:bg-stone-950 transition-all border border-stone-800 shadow-sm min-w-[180px] justify-center">
              <svg className="w-4.5 h-4.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                <path d="M3.609 2.056A1.986 1.986 0 0 0 3 3.5v17a1.986 1.986 0 0 0 .609 1.444l.066.066L13.35 12.35v-.7l-9.675-9.66-.066.066zM16.734 8.945l-3.384 3.385v.7l3.385 3.385.074-.043 4.02-2.294c1.144-.65 1.144-1.72 0-2.37l-4.02-2.294-.075-.043zM12.656 13.056l3.328 3.328 1.484-2.812-4.812-4.812zM12.656 10.944L17.468 6.13l-1.484-2.812-3.328 3.328z" />
              </svg>
              <div className="text-left">
                <span className="text-[10px] font-bold block leading-tight">{translations[language]['gate.download.googleplay']}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: QR Code & Simulation */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="bg-white border border-coffee-100 p-8 rounded-3xl shadow-lg text-center space-y-6 w-full max-w-[340px]">
            <h4 className="font-serif text-sm font-bold text-[#4E342E]">{translations[language]['gate.qr.title']}</h4>
            
            <div className="p-4 bg-[#FAF9F6] rounded-2xl inline-block border border-coffee-100">
              {/* Mock QR Code */}
              <div className="w-36 h-36 bg-white rounded-xl flex flex-col items-center justify-center border border-stone-200 text-[#4E342E] font-bold text-xs p-2 shadow-inner">
                <Compass className="w-10 h-10 mb-2 animate-spin-slow text-[#4E342E]" />
                <span className="text-[9px] text-center uppercase tracking-wider text-stone-450">{translations[language]['gate.qr.scan']}</span>
                <span className="text-[10px] text-center font-mono text-coffee-950">MELLODI</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-[10px] text-stone-400">{translations[language]['gate.simulate.ask']}</p>
              <button
                onClick={onSimulateApp}
                className="w-full py-3 px-4 bg-[#4E342E] hover:bg-[#3E2723] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>{translations[language]['gate.simulate.btn']}</span>
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto w-full border-t border-coffee-100 pt-6 text-center text-[10px] text-stone-400">
        <p>{translations[language]['gate.footer']}</p>
      </footer>
    </div>
  );
};
