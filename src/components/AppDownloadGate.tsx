import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { Smartphone, ArrowLeft, Wallet, Award, ShoppingBag, Compass, X, Share2, PlusSquare } from 'lucide-react';

interface AppDownloadGateProps {
  onBackToWeb: () => void;
}

export const AppDownloadGate: React.FC<AppDownloadGateProps> = ({ onBackToWeb }) => {
  const { language } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showiOSModal, setShowiOSModal] = useState(false);

  // Listen for the PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    // Check if the device is iOS (iPhone/iPad/iPod)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setShowiOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback for browsers that don't support or have already installed
      alert(
        language === 'vi'
          ? 'Ứng dụng đã được cài đặt hoặc trình duyệt của bạn không hỗ trợ cài đặt tự động. Vui lòng thêm thủ công vào màn hình chính!'
          : language === 'ko'
          ? '앱이 이미 설치되었거나 브라우저가 자동 설치를 지원하지 않습니다. 홈 화면에 수동으로 추가해 주세요!'
          : 'App is already installed or your browser does not support auto-install. Please add to home screen manually!'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User choice outcome: ${outcome}`);
    setDeferredPrompt(null);
  };

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
                <p className="text-[10px] text-stone-500">{translations[language]['gate.item.1.desc']}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-[#4E342E] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-coffee-950">{translations[language]['gate.item.2.title']}</p>
                <p className="text-[10px] text-stone-500">{translations[language]['gate.item.2.desc']}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-coffee-950">{translations[language]['gate.item.3.title']}</p>
                <p className="text-[10px] text-stone-500">{translations[language]['gate.item.3.desc']}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-coffee-950">{translations[language]['gate.item.4.title']}</p>
                <p className="text-[10px] text-stone-500">{translations[language]['gate.item.4.desc']}</p>
              </div>
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            {/* Install PWA Button - Colored Gold to stand out */}
            <button
              onClick={handleInstallClick}
              className="bg-amber-400 text-[#3E2723] hover:bg-amber-500 px-4 py-2.5 rounded-xl flex items-center space-x-2.5 cursor-pointer transition-all border border-amber-350 shadow-sm min-w-[180px] justify-center font-bold"
            >
              <Smartphone className="w-4.5 h-4.5 shrink-0 text-[#3E2723]" />
              <div className="text-left">
                <span className="text-[10px] font-black block leading-tight">
                  {language === 'vi' ? 'CÀI ĐẶT TRỰC TIẾP' : language === 'ko' ? '앱 즉시 설치' : 'INSTALL DIRECTLY (PWA)'}
                </span>
              </div>
            </button>

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

            <div className="pt-2 text-[10px] text-stone-400 leading-normal">
              {language === 'vi' ? 'Quét mã bằng camera điện thoại để truy cập nhanh Mellodi và tiến hành cài đặt ứng dụng.' : 
               language === 'ko' ? '휴대폰 카메라로 QR 코드를 스캔하여 Mellodi에 접속하고 앱을 설치하세요.' :
               'Scan the QR code with your phone camera to access Mellodi and install the app.'}
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto w-full border-t border-coffee-100 pt-6 text-center text-[10px] text-stone-400">
        <p>{translations[language]['gate.footer']}</p>
      </footer>

      {/* iOS Safari Installation Guide Modal */}
      {showiOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-coffee-100 shadow-2xl relative text-left space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setShowiOSModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-stone-600" />
            </button>

            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-coffee-950">
                {language === 'vi' ? 'Cài đặt trên iPhone/iPad' : language === 'ko' ? 'iPhone/iPad 설치 안내' : 'Install on iPhone/iPad'}
              </h3>
              <p className="text-[11px] text-stone-400 leading-normal">
                {language === 'vi' 
                  ? 'Safari trên iOS không hỗ trợ tự động tải. Hãy làm theo hướng dẫn 3 bước đơn giản dưới đây:' 
                  : language === 'ko' 
                  ? 'iOS Safari는 자동 설치를 지원하지 않습니다. 아래 3단계에 따라 홈 화면에 추가해 주세요:'
                  : 'Safari on iOS does not support auto-install. Follow these 3 simple steps:'}
              </p>
            </div>

            <div className="space-y-4 text-xs font-medium text-stone-600">
              <div className="flex items-start space-x-3.5 bg-stone-50 p-3 rounded-2xl border border-stone-200/40">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#4E342E] flex items-center justify-center font-bold shrink-0">1</div>
                <div className="leading-relaxed">
                  <p className="text-coffee-950 font-bold">
                    {language === 'vi' ? 'Nhấp nút Chia sẻ' : language === 'ko' ? '공유 버튼 클릭' : 'Tap the Share button'}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5 flex items-center">
                    {language === 'vi' ? 'Biểu tượng' : language === 'ko' ? '아이콘' : 'Icon'} <Share2 className="w-3.5 h-3.5 mx-1 text-blue-500" /> {language === 'vi' ? 'ở thanh công cụ của Safari.' : language === 'ko' ? '을 누르세요.' : 'in Safari toolbar.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 bg-stone-50 p-3 rounded-2xl border border-stone-200/40">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#4E342E] flex items-center justify-center font-bold shrink-0">2</div>
                <div className="leading-relaxed">
                  <p className="text-coffee-950 font-bold">
                    {language === 'vi' ? 'Thêm vào Màn hình chính' : language === 'ko' ? '홈 화면에 추가 선택' : 'Add to Home Screen'}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5 flex items-center flex-wrap">
                    {language === 'vi' ? 'Cuộn xuống và chọn' : language === 'ko' ? '아래로 스크롤하여' : 'Scroll down and select'} <PlusSquare className="w-3.5 h-3.5 mx-1 text-stone-700" /> <strong>"{language === 'vi' ? 'Thêm vào MH chính' : language === 'ko' ? '홈 화면에 추가' : 'Add to Home Screen'}"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 bg-stone-50 p-3 rounded-2xl border border-stone-200/40">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#4E342E] flex items-center justify-center font-bold shrink-0">3</div>
                <div className="leading-relaxed">
                  <p className="text-coffee-950 font-bold">
                    {language === 'vi' ? 'Xác nhận Thêm' : language === 'ko' ? '추가 완료' : 'Tap Add to confirm'}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {language === 'vi' ? 'Nhấn nút "Thêm" ở góc trên cùng bên phải.' : language === 'ko' ? '우측 상단의 "추가" 버튼을 누르세요.' : 'Tap the "Add" button in the top-right corner.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowiOSModal(false)}
              className="w-full py-3 bg-[#4E342E] hover:bg-[#3E2723] text-white text-xs font-bold rounded-xl transition-all text-center cursor-pointer"
            >
              {language === 'vi' ? 'Đã hiểu' : language === 'ko' ? '확인' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
