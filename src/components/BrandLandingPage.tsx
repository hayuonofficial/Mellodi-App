import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Coffee, MapPin, Star, BookOpen, 
  ArrowRight, Compass, Phone, Mail, Clock, Building, X,
  Award, Wallet, CreditCard, Gift, History, Plus, Ticket, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthPortal } from './AuthPortal';

interface BrandLandingPageProps {
  activeSection: string;
  onOpenApp: () => void;
}

export const BrandLandingPage: React.FC<BrandLandingPageProps> = ({ activeSection, onOpenApp }) => {
  const { 
    language, 
    currentUser, 
    walletBalance, 
    lenPoints, 
    orders, 
    vouchers, 
    claimVoucherByCode, 
    topUpWallet,
    formatPrice
  } = useApp();
  
  // State for 3D tilt effect on menu cards
  const [tiltStyles, setTiltStyles] = useState<Record<string, string>>({});
  
  // State for 3D ingredient explosion modal
  const [activeExplosionProduct, setActiveExplosionProduct] = useState<string | null>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // States for membership dashboard
  const [voucherCode, setVoucherCode] = useState('');
  const [claimStatus, setClaimStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(50000);
  const [topUpStatus, setTopUpStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  // Check screen size for responsive explosion radius
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Calculate rotation: max 12 degrees
    const rotateX = -(y / (box.height / 2)) * 12;
    const rotateY = (x / (box.width / 2)) * 12;
    
    setTiltStyles(prev => ({
      ...prev,
      [cardId]: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`
    }));
  };

  const handleMouseLeave = (cardId: string) => {
    setTiltStyles(prev => ({
      ...prev,
      [cardId]: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`
    }));
  };

  const signatureDrinks = [
    {
      id: "drink-salted",
      name: { vi: "Cà Phê Kem Muối Mellodi", en: "Mellodi Salt Cream Coffee", ko: "멜로디 소금 크림 커피" },
      desc: { vi: "Lớp kem muối béo ngậy mằn mặn phủ lên trên cốt cà phê phin đậm đà đặc trưng của Mellodi. Nhấp để xem cấu tạo 3D!", en: "Savory salted cream layered over our signature bold slow-dripped coffee. Click to explore 3D ingredients!", ko: "짭조름하고 부드러운 소금 크림을 올린 멜로디 시그니처 커피. 3D 구성을 보려면 클릭하세요!" },
      price: "55.000đ",
      tag: "Best Seller",
      image: "https://images.unsplash.com/photo-1572286258217-40142c1c6a70?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "drink-peach",
      name: { vi: "Trà Đào Mellodi", en: "Mellodi Peach Tea", ko: "멜로디 복숭아 홍차" },
      desc: { vi: "Trà đào thanh ngọt kết hợp cùng đào miếng giòn ngọt chín mọng tự nhiên và sả tươi. Nhấp để xem cấu tạo 3D!", en: "Sweet peach tea topped with crunchy peach slices and fresh lemongrass. Click to explore 3D ingredients!", ko: "아삭한 복숭아 과육과 레몬그라스를 더한 아이스 티. 3D 구성을 보려면 클릭하세요!" },
      price: "65.000đ",
      tag: "3D Interactive",
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "drink-special",
      name: { vi: "Mellodi Đặc Biệt (Mellodi Special)", en: "Mellodi Special Signature", ko: "멜로디 스페셜 시그니처" },
      desc: { vi: "Thức uống đặc chế độc quyền của Mellodi đem lại hương vị đột phá đầy cảm xúc. Nhấp để xem cấu tạo 3D!", en: "Our exclusive signature creation bringing a breakthrough of rich and layered flavors. Click to explore 3D!", ko: "멜로디만의 특별 레시피로 깊고 풍부한 맛을 선사하는 시그니처. 3D 구성을 보려면 클릭하세요!" },
      price: "65.000đ",
      tag: "Specialty",
      image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80"
    }
  ];

  // Explosion offsets based on screen size
  const rScale = isMobile ? 0.65 : 1;

  const explosionData: Record<string, {
    title: { vi: string, en: string, ko: string },
    desc: { vi: string, en: string, ko: string },
    image: string,
    ingredients: Array<{ id: number, name: { vi: string, en: string, ko: string }, desc: { vi: string, en: string, ko: string }, icon: string, x: number, y: number }>
  }> = {
    'drink-salted': {
      title: {
        vi: 'CẤU TẠO CÀ PHÊ KEM MUỐI MELLODI',
        en: 'MELLODI SALT CREAM COFFEE COMPOSITION',
        ko: '멜로디 소금 크림 커피 성분 구성'
      },
      desc: {
        vi: 'Ly cà phê phin xoay 360 độ giải phóng lớp kem muối béo ngậy và hương vị cà phê đậm đà.',
        en: 'The cup rotates 360 degrees to release rich salted cream and bold coffee layers.',
        ko: '360도 회전하며 부드러운 소금 크림과 진한 커피의 조화를 시각적으로 보여줍니다.'
      },
      image: 'https://images.unsplash.com/photo-1572286258217-40142c1c6a70?auto=format&fit=crop&w=600&q=80',
      ingredients: [
        { 
          id: 1, 
          name: { vi: 'Cốt cà phê phin', en: 'Traditional Espresso', ko: '오리지널 커피 샷' }, 
          desc: { vi: 'Robusta Buôn Ma Thuột rang mộc đậm vị nguyên bản', en: '100% Robusta beans for a bold traditional kick', ko: '100% 로부스타 원두의 깊고 진한 맛' }, 
          icon: '☕', 
          x: -160 * rScale, 
          y: -110 * rScale 
        },
        { 
          id: 2, 
          name: { vi: 'Lớp kem muối béo', en: 'Savory Salt Cream', ko: '솔티 폼 크림' }, 
          desc: { vi: 'Phối sữa béo và muối biển tinh tế mằn mặn', en: 'Rich milk foam blended with premium sea salt', ko: '신선한 생크림에 해수를 더한 단짠 크림' }, 
          icon: '🥛', 
          x: 160 * rScale, 
          y: -110 * rScale 
        },
        { 
          id: 3, 
          name: { vi: 'Sữa đặc thượng hạng', en: 'Condensed Milk', ko: '달콤한 연유' }, 
          desc: { vi: 'Độ ngọt béo hài hòa tự nhiên ngọt hậu', en: 'Thick sweet condensed milk for smooth body', ko: '우유의 풍미 và 달콤함을 더해주는 연유' }, 
          icon: '🍯', 
          x: -160 * rScale, 
          y: 110 * rScale 
        },
        { 
          id: 4, 
          name: { vi: 'Đá viên tinh khiết', en: 'Pure Ice Cubes', ko: '정수 얼음' }, 
          desc: { vi: 'Làm lạnh nhanh giữ vị sảng khoái', en: 'Keeps the drink cold and refreshing', ko: '음료를 시원하고 청량하게 만드는 얼음' }, 
          icon: '🧊', 
          x: 160 * rScale, 
          y: 110 * rScale 
        },
        { 
          id: 5, 
          name: { vi: 'Bột Cacao phủ', en: 'Cocoa Powder', ko: '카카오 파우더' }, 
          desc: { vi: 'Bột cacao nguyên chất thơm nhẹ trang trí trên mặt', en: 'A light dust of premium cacao on top', ko: '크림 위에 뿌려져 풍미를 더하는 카카오' }, 
          icon: '🍫', 
          x: 0 * rScale, 
          y: -175 * rScale 
        }
      ]
    },
    'drink-peach': {
      title: {
        vi: 'CẤU TẠO TRÀ ĐÀO MELLODI',
        en: 'MELLODI PEACH TEA COMPOSITION',
        ko: '멜로디 복숭아 홍차 성분 구성'
      },
      desc: {
        vi: 'Ly trà đào xoay 360 độ giải phóng các nguyên liệu tinh khiết tạo thành hương vị thanh mát.',
        en: 'The cup rotates 360 degrees to release pure ingredients that craft our refreshing flavor.',
        ko: '아삭한 복숭아와 허브가 어우러져 시원한 과일티의 탄생 과정을 보여줍니다.'
      },
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
      ingredients: [
        { 
          id: 1, 
          name: { vi: 'Trà đen thượng hạng', en: 'Premium Black Tea', ko: '프리미엄 블랙티' }, 
          desc: { vi: 'Trà đen đậm vị ủ lạnh 12h thơm dịu', en: 'Strongly brewed black tea for smooth floral base', ko: '12시간 저온 추출하여 떫은맛이 없는 홍차' }, 
          icon: '🍂', 
          x: -160 * rScale, 
          y: -110 * rScale 
        },
        { 
          id: 2, 
          name: { vi: 'Đào vàng chín mọng', en: 'Crunchy Peach', ko: '아삭한 황도 복숭아' }, 
          desc: { vi: 'Đào dày miếng, giòn ngọt thơm mọng nước', en: 'Thick, sweet, and crunchy premium peach slices', ko: '과육이 두껍고 아삭하여 씹는 맛이 있는 복숭아' }, 
          icon: '🍑', 
          x: 160 * rScale, 
          y: -110 * rScale 
        },
        { 
          id: 3, 
          name: { vi: 'Sả tươi thơm nồng', en: 'Fresh Lemongrass', ko: '신선한 레몬그라스' }, 
          desc: { vi: 'Sả tươi giải phóng tinh dầu thơm thư giãn', en: 'Fresh crushed lemongrass stalk for herbal aroma', ko: '싱그러운 시트러스 향을 더해주는 레몬그라스' }, 
          icon: '🌱', 
          x: -160 * rScale, 
          y: 110 * rScale 
        },
        { 
          id: 4, 
          name: { vi: 'Siro đào đặc chế', en: 'Peach Syrup', ko: '특제 복숭아 시럽' }, 
          desc: { vi: 'Tăng hương thơm quả chín và vị ngọt thanh', en: 'Signature syrup to enhance sweet fruity notes', ko: '복숭아 본연의 향과 달콤함을 극대화하는 시럽' }, 
          icon: '🍯', 
          x: 160 * rScale, 
          y: 110 * rScale 
        },
        { 
          id: 5, 
          name: { vi: 'Đá viên tinh khiết', en: 'Pure Ice Cubes', ko: '정수 얼음' }, 
          desc: { vi: 'Giữ lạnh sảng khoái suốt ngày dài', en: 'Keeps the drink cold and refreshing', ko: '시원함을 오랫동안 유지해주는 얼음' }, 
          icon: '🧊', 
          x: 0 * rScale, 
          y: -175 * rScale 
        }
      ]
    },
    'drink-special': {
      title: {
        vi: 'CẤU TẠO MELLODI ĐẶC BIỆT',
        en: 'MELLODI SPECIAL COMPOSITION',
        ko: '멜로디 스페셜 성분 구성'
      },
      desc: {
        vi: 'Ly đặc chế xoay 360 độ thể hiện sự phối trộn tinh tế tạo nên hương vị béo ngậy ngọt ngào.',
        en: 'The specialty cup rotates 360 degrees to showcase the layered sweet and creamy blend.',
        ko: '멜로디만의 특별한 레이어드 크림과 과일 베이스의 조화를 보여줍니다.'
      },
      image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80',
      ingredients: [
        { 
          id: 1, 
          name: { vi: 'Trà Ô Long Nhài', en: 'Jasmine Oolong', ko: '자스민 우롱차' }, 
          desc: { vi: 'Nền trà ô long thơm ngát hương nhài tự nhiên', en: 'Fragrant oolong tea base with natural jasmine notes', ko: '은은한 자스민 향이 입안 가득 퍼지는 우롱차' }, 
          icon: '🍵', 
          x: -160 * rScale, 
          y: -110 * rScale 
        },
        { 
          id: 2, 
          name: { vi: 'Kem sữa béo ngậy', en: 'Rich Milk Cream', ko: '부드러운 스팀 밀크' }, 
          desc: { vi: 'Kem sữa đặc chế sánh mịn béo ngậy', en: 'Special creamy milk blend for velvety texture', ko: '우유의 풍부한 바디감을 더해주는 크림 밀크' }, 
          icon: '🥛', 
          x: 160 * rScale, 
          y: -110 * rScale 
        },
        { 
          id: 3, 
          name: { vi: 'Sốt dâu tây tự nhiên', en: 'Strawberry Puree', ko: '수제 딸기 퓨레' }, 
          desc: { vi: 'Dâu tây tươi nghiền chua ngọt tự nhiên', en: 'Fresh strawberries mashed into sweet-sour sauce', ko: '신선한 딸기를 으깨어 만든 새콤달콤한 소스' }, 
          icon: '🍓', 
          x: -160 * rScale, 
          y: 110 * rScale 
        },
        { 
          id: 4, 
          name: { vi: 'Thạch dừa giòn ngọt', en: 'Coconut Jelly', ko: '쫄깃한 코코넛 젤리' }, 
          desc: { vi: 'Thạch dừa dai giòn sần sật ngọt nhẹ vui miệng', en: 'Chewy coconut jelly cubes for fun texture', ko: '씹는 재미와 은은한 단맛을 주는 코코넛 나타드코코' }, 
          icon: '🥥', 
          x: 160 * rScale, 
          y: 110 * rScale 
        },
        { 
          id: 5, 
          name: { vi: 'Đá viên tinh khiết', en: 'Pure Ice Cubes', ko: '정수 얼음' }, 
          desc: { vi: 'Giữ lạnh hoàn hảo sảng khoái tối đa', en: 'Keeps the drink cold and refreshing', ko: '끝까지 상큼하고 시원하게 해주는 얼음' }, 
          icon: '🧊', 
          x: 0 * rScale, 
          y: -175 * rScale 
        }
      ]
    }
  };

  const handleCardClick = (id: string) => {
    setActiveExplosionProduct(id);
    setIsExploded(false);
    setTimeout(() => {
      setIsExploded(true);
    }, 1200);
  };

  const currentData = activeExplosionProduct ? explosionData[activeExplosionProduct] : null;

  // Render slides based on activeSection
  const renderSlide = () => {
    switch (activeSection) {
      
      // SLIDE 1: TRANG CHỦ & CONTACT INFO
      case 'home':
        return (
          <motion.div
            key="slide-home"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="space-y-16"
          >
            {/* Hero Banner */}
            <div className="relative bg-[#4E342E] text-white py-20 px-6 overflow-hidden rounded-3xl shadow-xl min-h-[460px] flex items-center">
              {/* Background patterns */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#A37B45]/15 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-10 items-center relative z-10">
                <div className="md:col-span-7 space-y-6 text-left">
                  <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/10 px-3.5 py-1.5 rounded-full text-[10px] font-bold text-amber-300">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Mellodi</span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                    {translations[language]['landing.hero.title']}
                  </h1>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
                    {translations[language]['landing.hero.desc']}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      onClick={onOpenApp}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-[#3E2723] text-xs font-bold rounded-xl transition-all shadow-md active:scale-98 flex items-center space-x-2 cursor-pointer"
                    >
                      <span>{translations[language]['landing.hero.cta.points']}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onOpenApp}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all active:scale-98 cursor-pointer"
                    >
                      {translations[language]['landing.hero.cta.order']}
                    </button>
                  </div>
                </div>

                {/* Card Preview */}
                <div className="md:col-span-5 flex justify-center">
                  <div 
                    onClick={onOpenApp}
                    className="w-full max-w-[320px] bg-gradient-to-tr from-[#3E2723] to-[#4E342E] border border-white/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden cursor-pointer hover:scale-103 transition-transform duration-500"
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <span className="font-serif font-bold text-base tracking-widest text-white">MELLODI</span>
                        <span className="text-[8px] text-amber-300 block font-bold uppercase tracking-wider mt-0.5">VIP Member</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-white">
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-white/50 block font-mono">{translations[language]['auth.fullname']}</span>
                      <span className="font-mono text-sm tracking-widest text-white">•••• •••• •••• 8888</span>
                    </div>
                    <div className="mt-8 flex justify-between items-end">
                      <div>
                        <span className="text-[8px] text-white/40 block">{translations[language]['card.tier']}</span>
                        <span className="text-xs font-bold text-white uppercase">{translations[language]['card.tier.welcome']}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-white/40 block">{translations[language]['card.points.balance']}</span>
                        <span className="text-xs font-black text-amber-300 font-mono">0 LEN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info & Contact Details */}
            <div className="bg-white rounded-3xl border border-coffee-100 p-8 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-left">
              <div className="md:col-span-7 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#A37B45] uppercase tracking-wider flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>{translations[language]['footer.about.title']}</span>
                  </span>
                  <h3 className="font-serif text-xl font-bold text-coffee-950">{translations[language]['landing.contact.company']}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {translations[language]['landing.contact.desc']}
                  </p>
                </div>

                <div className="space-y-3.5 text-xs font-semibold text-stone-600">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-[#A37B45] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-coffee-950 font-bold">{translations[language]['landing.contact.address.title']}</p>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5">{translations[language]['landing.contact.address.val']}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-[#A37B45] shrink-0" />
                    <div>
                      <p className="text-coffee-950 font-bold">{translations[language]['landing.contact.phone.title']}</p>
                      <p className="text-[11px] text-stone-500 font-mono font-medium mt-0.5">0375681791 (08:00 - 22:00)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-[#A37B45] shrink-0" />
                    <div>
                      <p className="text-coffee-950 font-bold">{translations[language]['landing.contact.email.title']}</p>
                      <p className="text-[11px] text-stone-500 font-mono font-medium mt-0.5">contact@mellodi.vn</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 bg-[#FAF9F6] border border-coffee-150/40 rounded-2xl p-6 space-y-4">
                <h4 className="font-serif text-sm font-bold text-coffee-950 flex items-center space-x-1.5 border-b border-coffee-100 pb-2">
                  <Clock className="w-4.5 h-4.5 text-[#A37B45]" />
                  <span>{translations[language]['landing.contact.hours.title']}</span>
                </h4>
                <div className="space-y-2 text-xs font-semibold text-stone-600">
                  <div className="flex justify-between">
                    <span>{translations[language]['landing.contact.hours.weekday'].split(': ')[0]}:</span>
                    <span className="font-mono text-coffee-950">{translations[language]['landing.contact.hours.weekday'].split(': ')[1]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{translations[language]['landing.contact.hours.weekend'].split(': ')[0]}:</span>
                    <span className="font-mono text-coffee-950">{translations[language]['landing.contact.hours.weekend'].split(': ')[1]}</span>
                  </div>
                  <div className="pt-2 border-t border-stone-200/50 text-[10px] text-stone-400 leading-normal">
                    {translations[language]['landing.contact.hours.note']}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      // SLIDE 2: CÂU CHUYỆN
      case 'story':
        return (
          <motion.div
            key="slide-story"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center py-8 text-left"
          >
            <div className="md:col-span-5 bg-white border border-coffee-100 rounded-3xl p-8 text-center shadow-2xs relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#4E342E] text-white flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-coffee-950 mt-4 mb-2">{translations[language]['landing.story.desc.box.title']}</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                {translations[language]['landing.story.desc.box.text']}
              </p>
            </div>

            <div className="md:col-span-7 space-y-4">
              <span className="text-xs font-bold text-[#A37B45] uppercase tracking-wider block">{translations[language]['landing.story.tag']}</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">{translations[language]['landing.story.title']}</h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {translations[language]['landing.story.desc.main.1']}
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {translations[language]['landing.story.desc.main.2']}
              </p>
            </div>
          </motion.div>
        );

      // SLIDE 3: KHÔNG GIAN (SPACE)
      case 'space':
        return (
          <motion.div
            key="slide-space"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 py-4 text-center"
          >
            <div className="max-w-xl mx-auto space-y-3">
              <span className="text-xs font-bold text-[#4E342E] uppercase tracking-wider block">{translations[language]['landing.space.tag']}</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">{translations[language]['landing.space.title']}</h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                {translations[language]['landing.space.desc']}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="bg-white border border-coffee-100 rounded-2xl p-6 text-center space-y-3 shadow-2xs">
                <span className="text-3xl">🌿</span>
                <h4 className="font-serif text-sm font-bold text-coffee-950">{translations[language]['landing.space.box.1.title']}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{translations[language]['landing.space.box.1.desc']}</p>
              </div>
              <div className="bg-white border border-coffee-100 rounded-2xl p-6 text-center space-y-3 shadow-2xs">
                <span className="text-3xl">🪑</span>
                <h4 className="font-serif text-sm font-bold text-coffee-950">{translations[language]['landing.space.box.2.title']}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{translations[language]['landing.space.box.2.desc']}</p>
              </div>
              <div className="bg-white border border-coffee-100 rounded-2xl p-6 text-center space-y-3 shadow-2xs">
                <span className="text-3xl">☕</span>
                <h4 className="font-serif text-sm font-bold text-coffee-950">{translations[language]['landing.space.box.3.title']}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{translations[language]['landing.space.box.3.desc']}</p>
              </div>
            </div>
          </motion.div>
        );

      // SLIDE 4: THỰC ĐƠN & HIỆU ỨNG HOẠT ẢNH 3D
      case 'menu':
        return (
          <motion.div
            key="slide-menu"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="space-y-10 py-4 text-center"
          >
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#A37B45] uppercase tracking-wider block">{translations[language]['landing.menu.tag']}</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">{translations[language]['landing.menu.title']}</h2>
              <p className="text-xs text-stone-500 max-w-lg mx-auto leading-relaxed">
                {translations[language]['landing.menu.desc']}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {signatureDrinks.map((d) => (
                <div
                  key={d.id}
                  onMouseMove={(e) => handleMouseMove(e, d.id)}
                  onMouseLeave={() => handleMouseLeave(d.id)}
                  onClick={() => handleCardClick(d.id)}
                  style={{
                    transform: tiltStyles[d.id] || 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                    transition: 'transform 0.1s ease-out, box-shadow 0.15s ease-out',
                    transformStyle: 'preserve-3d'
                  }}
                  className="bg-white border border-coffee-100 rounded-3xl p-6 shadow-xs hover:shadow-xl flex flex-col justify-between h-auto min-h-[310px] relative text-left group cursor-pointer"
                >
                  <div className="space-y-4" style={{ transform: 'translateZ(20px)' }}>
                    <div className="flex justify-between items-start">
                      {/* Realistic 3D Cup photo container */}
                      <div 
                        style={{ transform: 'translateZ(40px)' }}
                        className="w-20 h-20 rounded-2xl overflow-hidden border border-coffee-100 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0"
                      >
                        <img src={d.image} alt={d.name.vi} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[8px] font-bold text-[#4E342E] bg-[#FAF9F6] border border-coffee-150 px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                        {d.tag}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-serif text-sm font-bold text-coffee-950 group-hover:text-[#4E342E] transition-colors">
                        {d.name[language] || d.name['vi']}
                      </h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        {d.desc[language] || d.desc['vi']}
                      </p>
                    </div>
                  </div>
                  
                  <div 
                    style={{ transform: 'translateZ(30px)' }}
                    className="mt-6 flex justify-between items-center pt-3.5 border-t border-stone-100"
                  >
                    <span className="font-mono text-xs font-black text-coffee-950">{d.price}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(d.id);
                      }}
                      className="text-[10px] font-bold text-[#4E342E] hover:text-[#3E2723] flex items-center space-x-0.5 cursor-pointer bg-stone-55 border border-stone-200/65 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <span>3D View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      // SLIDE 5: KHUYẾN MÃI (PROMOS)
      case 'promo':
        return (
          <motion.div
            key="slide-promo"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center py-4 text-left"
          >
            <div className="md:col-span-7 space-y-6">
              <span className="text-xs font-bold text-[#A37B45] uppercase tracking-wider block">{translations[language]['landing.promo.tag']}</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950 leading-tight">
                {translations[language]['landing.promo.title']}
              </h2>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-[#4E342E] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                  <div>
                    <p className="font-bold text-coffee-950">{translations[language]['landing.promo.item.1.title']}</p>
                    <p className="text-stone-500">{translations[language]['landing.promo.item.1.desc']}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-[#4E342E] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                  <div>
                    <p className="font-bold text-coffee-950">{translations[language]['landing.promo.item.2.title']}</p>
                    <p className="text-stone-500">{translations[language]['landing.promo.item.2.desc']}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-[#4E342E] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">✓</div>
                  <div>
                    <p className="font-bold text-coffee-950">{translations[language]['landing.promo.item.3.title']}</p>
                    <p className="text-stone-500">{translations[language]['landing.promo.item.3.desc']}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenApp}
                className="mt-4 px-6 py-3 bg-[#4E342E] hover:bg-[#3E2723] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-98 flex items-center space-x-2 cursor-pointer"
              >
                <span>{translations[language]['landing.promo.btn']}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="md:col-span-5 bg-[#4E342E] border border-white/10 text-white rounded-3xl p-8 space-y-6 text-center shadow-lg">
              <h4 className="font-serif text-sm font-bold text-amber-300">{translations[language]['landing.promo.box.title']}</h4>
              <p className="text-xs text-white/75 leading-relaxed">
                {translations[language]['landing.promo.box.desc']}
              </p>
              <div className="p-4 bg-white rounded-2xl inline-block shadow-md">
                {/* Mock QR Code */}
                <div className="w-32 h-32 bg-stone-100 rounded-xl flex flex-col items-center justify-center border border-stone-200 text-[#4E342E] font-bold text-xs p-2">
                  <Compass className="w-8 h-8 mb-2 animate-spin-slow text-[#4E342E]" />
                  <span className="text-[9px] text-center uppercase tracking-wider text-stone-450">{translations[language]['landing.promo.box.qr']}</span>
                  <span className="text-[10px] text-center font-mono text-coffee-950">MELLODI</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'membership':
        if (!currentUser) {
          return (
            <motion.div
              key="slide-membership-auth"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="py-4"
            >
              <div className="max-w-xl mx-auto space-y-3 text-center mb-8">
                <span className="text-xs font-bold text-[#4E342E] uppercase tracking-wider block">Mellodi Coffee Portal</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">Đăng Ký & Đăng Nhập Thành Viên</h2>
                <p className="text-xs text-stone-500 leading-relaxed font-semibold">
                  Trở thành thành viên Mellodi Coffee để nhận ngay nhiều ưu đãi đặc quyền, tích điểm LEN đổi quà và thanh toán ví tiện lợi.
                </p>
              </div>
              <AuthPortal />
            </motion.div>
          );
        }

        return (
          <motion.div
            key="slide-membership-dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 py-4"
          >
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-coffee-100 pb-5">
              <div className="text-left">
                <span className="text-xs font-bold text-[#A37B45] uppercase tracking-wider block">Mellodi Member Club</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-coffee-950">Xin chào, {currentUser.name}!</h2>
                <p className="text-xs text-stone-500 mt-1 font-semibold">
                  Chúc bạn một ngày tuyệt vời cùng hương vị cà phê Mellodi đặc biệt.
                </p>
              </div>
              <div className="flex items-center space-x-3 bg-stone-50 border border-coffee-100 px-4 py-2.5 rounded-2xl shadow-2xs self-start md:self-auto">
                <span className="text-xs font-bold text-stone-550">Hạng thành viên:</span>
                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                  currentUser.tier === 'Gold' 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : currentUser.tier === 'Green'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  {currentUser.tier}
                </span>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN (Grid 4): Member Card & Quick Top-up */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Holographic Member Card */}
                <div className="relative bg-gradient-to-br from-[#2D5A47] to-[#1F3F32] text-white p-6 rounded-3xl shadow-xl overflow-hidden min-h-[220px] flex flex-col justify-between border border-white/10 group transition-all duration-300 hover:shadow-2xl">
                  {/* Glowing background circles */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#A37B45]/20 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <span className="font-serif font-extrabold text-lg tracking-widest text-white block">MELLODI</span>
                      <span className="text-[8px] text-amber-300 block font-bold uppercase tracking-widest mt-0.5">Loyalty Member</span>
                    </div>
                    <Award className={`w-7 h-7 ${
                      currentUser.tier === 'Gold' ? 'text-amber-300' : currentUser.tier === 'Green' ? 'text-emerald-300' : 'text-stone-300'
                    }`} />
                  </div>

                  <div className="space-y-1.5 z-10 my-4 text-left">
                    <span className="text-[8px] text-white/50 block font-mono uppercase tracking-wider">Mã thành viên</span>
                    <span className="font-mono text-sm tracking-widest text-white">{currentUser.id.toUpperCase()}</span>
                    {/* Mock Barcode */}
                    <div className="h-6 w-full bg-white/10 rounded-sm flex items-center justify-between px-2 overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
                      {[...Array(24)].map((_, i) => (
                        <div 
                          key={i} 
                          className="h-full bg-white" 
                          style={{ width: `${[1, 2, 3, 1, 4, 2, 1, 3][i % 8]}px` }} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-end z-10 pt-2 border-t border-white/15">
                    <div className="text-left">
                      <span className="text-[8px] text-white/40 block">Hội viên từ</span>
                      <span className="text-[10px] font-bold text-white uppercase">
                        {new Date(currentUser.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-white/40 block">Tích lũy</span>
                      <span className="text-sm font-black text-amber-300 font-mono">{lenPoints.toLocaleString()} LEN</span>
                    </div>
                  </div>
                </div>

                {/* Quick Wallet Info & Top-up */}
                <div className="bg-white border border-coffee-100 rounded-3xl p-6 shadow-2xs space-y-5 text-left">
                  <h4 className="font-serif text-sm font-bold text-coffee-950 flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-[#A37B45]" />
                    <span>Số Dư Ví Thành Viên</span>
                  </h4>
                  <div className="bg-stone-55 border border-coffee-100 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-stone-450 font-bold uppercase tracking-wider block">Ví Mellodi Pay</span>
                      <span className="text-xl font-black text-coffee-950 font-mono mt-1 block">
                        {formatPrice(walletBalance)}
                      </span>
                    </div>
                    <CreditCard className="w-8 h-8 text-coffee-300" />
                  </div>

                  {/* Simulate Top-up Form */}
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-bold text-coffee-900 uppercase tracking-wider block">Nạp tiền nhanh vào ví</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[50000, 100000, 200000].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setTopUpAmount(amount)}
                          className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                            topUpAmount === amount
                              ? 'bg-[#2D5A47] border-[#2D5A47] text-white'
                              : 'bg-stone-55 border-coffee-100 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          +{amount.toLocaleString()}đ
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={isTopUpLoading}
                      onClick={async () => {
                        setIsTopUpLoading(true);
                        setTopUpStatus(null);
                        try {
                          const res = await topUpWallet(topUpAmount, 'vietqr');
                          if (res.success) {
                            setTopUpStatus({
                              success: true,
                              message: `Nạp thành công ${topUpAmount.toLocaleString()}đ vào ví! (Đã cộng thêm 10% LEN thưởng)`
                            });
                          } else {
                            setTopUpStatus({ success: false, message: res.message });
                          }
                        } catch (err) {
                          setTopUpStatus({ success: false, message: 'Lỗi nạp tiền.' });
                        }
                        setIsTopUpLoading(false);
                      }}
                      className="w-full py-2.5 bg-[#2D5A47] hover:bg-[#1E3F31] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isTopUpLoading ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}</span>
                    </button>

                    {topUpStatus && (
                      <div className={`p-2 rounded-xl text-[10px] font-semibold border text-center mt-2 ${
                        topUpStatus.success 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                          : 'bg-rose-50 border-rose-100 text-rose-800'
                      }`}>
                        {topUpStatus.message}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN (Grid 8): Vouchers & Orders */}
              <div className="lg:col-span-8 space-y-6 text-left">
                
                {/* Active Vouchers */}
                <div className="bg-white border border-coffee-100 rounded-3xl p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-coffee-50 pb-3">
                    <h4 className="font-serif text-sm font-bold text-coffee-950 flex items-center space-x-2">
                      <Ticket className="w-4.5 h-4.5 text-[#A37B45]" />
                      <span>Voucher Ưu Đãi Của Tôi ({vouchers.filter(v => !v.used).length})</span>
                    </h4>
                    {/* Claim Voucher input */}
                    <div className="flex items-center space-x-2 max-w-xs w-full sm:w-auto">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Mã ưu đãi (VD: WELCOMEGOLD)"
                        className="w-full px-3 py-1.5 border border-coffee-200 rounded-xl text-[10px] focus:ring-1 focus:ring-[#2D5A47] focus:border-transparent outline-none bg-stone-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!voucherCode.trim()) return;
                          const res = claimVoucherByCode(voucherCode.trim());
                          setClaimStatus(res);
                          if (res.success) {
                            setVoucherCode('');
                          }
                          setTimeout(() => setClaimStatus(null), 4000);
                        }}
                        className="px-3.5 py-1.5 bg-[#4E342E] hover:bg-[#3E2723] text-white text-[10px] font-bold rounded-xl shrink-0 cursor-pointer transition-colors"
                      >
                        Nhận mã
                      </button>
                    </div>
                  </div>

                  {claimStatus && (
                    <div className={`p-2 rounded-xl text-[10px] font-semibold border ${
                      claimStatus.success 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                        : 'bg-rose-50 border-rose-100 text-rose-800'
                    }`}>
                      {claimStatus.message}
                    </div>
                  )}

                  {/* Vouchers Grid */}
                  {vouchers.filter(v => !v.used).length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-xs text-stone-400 font-semibold">Bạn không có voucher khả dụng nào.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {vouchers.filter(v => !v.used).map((voucher) => (
                        <div 
                          key={voucher.id}
                          className="border border-coffee-100 rounded-2xl p-4 bg-stone-50 flex items-start justify-between relative overflow-hidden group hover:border-coffee-200 transition-colors"
                        >
                          {/* Left decorative circle */}
                          <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 bg-white border-r border-coffee-100 rounded-full"></div>
                          {/* Right decorative circle */}
                          <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 bg-white border-l border-coffee-100 rounded-full"></div>

                          <div className="space-y-1 pl-2 text-left">
                            <span className="text-[8px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Code: {voucher.code}
                            </span>
                            <h5 className="font-serif font-bold text-xs text-coffee-950 mt-1.5">
                              {voucher.title[language] || voucher.title['vi']}
                            </h5>
                            <p className="text-[10px] text-stone-555 leading-normal max-w-[190px] font-medium">
                              {voucher.description[language] || voucher.description['vi']}
                            </p>
                            <p className="text-[9px] text-stone-400 font-mono mt-1">
                              Hạn dùng: {voucher.expiryDate}
                            </p>
                          </div>

                          <Gift className="w-5 h-5 text-coffee-300 mr-2 shrink-0 self-center" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white border border-coffee-100 rounded-3xl p-6 shadow-2xs space-y-4">
                  <h4 className="font-serif text-sm font-bold text-coffee-950 flex items-center space-x-2 border-b border-coffee-50 pb-3">
                    <History className="w-4.5 h-4.5 text-[#A37B45]" />
                    <span>Lịch Sử Đơn Hàng Gần Đây</span>
                  </h4>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <span className="text-3xl block">☕</span>
                      <p className="text-xs text-stone-400 font-bold">Bạn chưa có đơn hàng nào.</p>
                      <button
                        onClick={onOpenApp}
                        className="text-[10px] font-black text-[#2D5A47] hover:underline cursor-pointer"
                      >
                        Bắt đầu đặt món ngay trên ứng dụng di động →
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-coffee-100 text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">
                            <th className="py-3 px-2">Mã Đơn</th>
                            <th className="py-3 px-2">Thời Gian</th>
                            <th className="py-3 px-2">Món Ăn/Uống</th>
                            <th className="py-3 px-2 text-right">Tổng Tiền</th>
                            <th className="py-3 px-2 text-right">Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-xs font-semibold">
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                              <td className="py-3 px-2 font-mono font-bold text-coffee-950">
                                #{order.id.replace('ord-', '').toUpperCase()}
                              </td>
                              <td className="py-3 px-2 text-stone-500 whitespace-nowrap font-medium">
                                {new Date(order.date).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="py-3 px-2 text-stone-600 max-w-[200px] truncate font-medium">
                                {order.items.map(item => `${item.name[language] || item.name} (x${item.quantity})`).join(', ')}
                              </td>
                              <td className="py-3 px-2 text-right font-mono font-bold text-coffee-950">
                                {formatPrice(order.totalPrice)}
                              </td>
                              <td className="py-3 px-2 text-right">
                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  order.status === 'completed' || order.status === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                                    : order.status === 'cancelled' || order.status === 'failed'
                                    ? 'bg-rose-50 text-rose-800 border border-rose-100'
                                    : 'bg-amber-50 text-amber-800 border border-amber-100'
                                }`}>
                                  {order.status === 'completed' || order.status === 'success' ? 'Hoàn thành' : order.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <AnimatePresence mode="wait">
        {renderSlide()}
      </AnimatePresence>

      {/* 3D Ingredient Explosion Modal */}
      <AnimatePresence>
        {activeExplosionProduct && currentData && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4 text-white">
            {/* Close Button */}
            <button
              onClick={() => {
                setActiveExplosionProduct(null);
                setIsExploded(false);
              }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 border border-white/10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-8 max-w-md">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-450/20">
                Interactive 3D Composition
              </span>
              <h3 className="font-serif text-2xl font-black text-white mt-3 tracking-wide">
                {currentData.title[language] || currentData.title['vi']}
              </h3>
              <p className="text-[11px] text-stone-400 leading-relaxed mt-1.5">
                {currentData.desc[language] || currentData.desc['vi']}
              </p>
            </div>

            {/* Animation Stage */}
            <div className="relative w-full max-w-lg h-[400px] flex items-center justify-center">
              
              {/* Animated Connector Lines */}
              <svg className="absolute w-1 h-1 overflow-visible pointer-events-none" style={{ left: '50%', top: '50%' }}>
                {isExploded && currentData.ingredients.map((ing) => (
                  <motion.line
                    key={ing.id}
                    x1={0}
                    y1={0}
                    x2={ing.x}
                    y2={ing.y}
                    stroke="rgba(245, 158, 11, 0.45)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: 0.1 + ing.id * 0.1, ease: 'easeOut' }}
                  />
                ))}
              </svg>

              {/* Central Premium Cup Image */}
              <motion.div
                initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
                animate={{ 
                  rotate: [0, 360],
                  scale: [0.5, 1.2, 1],
                  opacity: 1
                }}
                transition={{ 
                  duration: 1.2, 
                  ease: "easeInOut"
                }}
                className="w-28 h-28 rounded-full overflow-hidden border-2 border-amber-450/30 relative shadow-[0_0_60px_rgba(245,158,11,0.25)] z-10 select-none cursor-pointer hover:scale-105 transition-transform"
              >
                <img src={currentData.image} alt="Mellodi Drink" className="w-full h-full object-cover" />
              </motion.div>

              {/* Exploded Ingredients */}
              {currentData.ingredients.map((ing) => (
                <motion.div
                  key={ing.id}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={isExploded ? { x: ing.x, y: ing.y, opacity: 1, scale: 1 } : { x: 0, y: 0, opacity: 0, scale: 0 }}
                  transition={{ type: 'spring', delay: 0.3 + ing.id * 0.08, damping: 14, stiffness: 90 }}
                  className="absolute z-20 flex flex-col items-center max-w-[150px] text-center"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl shadow-lg mb-1.5 transition-transform hover:scale-110 select-none">
                    {ing.icon}
                  </div>
                  <h5 className="font-serif font-bold text-[11px] text-amber-300 tracking-wide">
                    {ing.name[language] || ing.name['vi']}
                  </h5>
                  <p className="text-[9px] text-stone-400 leading-normal max-w-[110px] mt-0.5">
                    {ing.desc[language] || ing.desc['vi']}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Call To Action */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={isExploded ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 1 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => {
                  setActiveExplosionProduct(null);
                  setIsExploded(false);
                  onOpenApp();
                }}
                className="px-8 py-3 bg-amber-450 hover:bg-amber-500 text-[#3E2723] text-xs font-black rounded-xl shadow-lg active:scale-98 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>{translations[language]['landing.hero.cta.order']}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
