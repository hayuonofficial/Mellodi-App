import React from 'react';
import { useApp } from '../context/AppContext';
import { Coffee, ShieldCheck, Heart } from 'lucide-react';
import { translations } from '../translations';

export const Footer: React.FC = () => {
  const { language } = useApp();

  return (
    <footer className="bg-coffee-950 text-white border-t border-coffee-900 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white">
                <span className="font-serif font-bold italic">M</span>
              </div>
              <span className="font-serif font-bold text-lg tracking-wide">
                {translations[language]['brand.name']}
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm">
              {translations[language]['footer.desc']}
            </p>
          </div>

          <div className="flex space-x-8 text-xs text-stone-300">
            <div>
              <h5 className="font-bold text-white mb-2 uppercase tracking-wider text-[10px]">
                {translations[language]['footer.about.title']}
              </h5>
              <ul className="space-y-1.5 text-stone-400">
                <li className="hover:text-white transition-colors cursor-pointer">
                  {translations[language]['footer.about.story']}
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  {translations[language]['footer.about.beans']}
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  {translations[language]['footer.about.green']}
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-2 uppercase tracking-wider text-[10px]">
                {translations[language]['footer.support.title']}
              </h5>
              <ul className="space-y-1.5 text-stone-400">
                <li className="hover:text-white transition-colors cursor-pointer">
                  {translations[language]['footer.support.terms']}
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  {translations[language]['footer.support.privacy']}
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Hotline: 0375681791
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-coffee-900 pt-6 flex flex-col sm:flex-row justify-between items-center text-[10.5px] text-stone-400 gap-4">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>© 2026 Mellodi Vietnam. Bản quyền công nghệ thuộc về Mellodi Coffee. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>for coffee lovers globally</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
