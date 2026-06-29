import React, { useState } from 'react';
import { useApp, API_BASE_URL, getAuthHeaders } from '../context/AppContext';
import { products } from '../data/products';
import { Product, ProductCategory, CartItem, Voucher } from '../types';
import { translations } from '../translations';
import { 
  ShoppingBag, Plus, Minus, Trash2, Tag, Check, Sparkles, X, 
  ChevronRight, Coffee, Info, AlertTriangle, ShieldCheck, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const OrderSection: React.FC = () => {
  const {
    language,
    currency,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    vouchers,
    appliedVoucher,
    applyVoucher,
    checkout,
    walletBalance,
    lenPoints,
    formatPrice,
    formatPriceInCurrency,
    convertVNDToActiveCurrency,
    getPointsCost,
    orders,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Customization state
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [ice, setIce] = useState<'0%' | '50%' | '100%' | 'None'>('100%');
  const [sugar, setSugar] = useState<'0%' | '50%' | '100%' | 'None'>('50%');
  const [toppings, setToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Cart open drawer
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: translations[language]['order.category.all'] },
    { id: 'espresso', label: translations[language]['order.category.espresso'] },
    { id: 'brewed', label: translations[language]['order.category.brewed'] },
    { id: 'coldbrew', label: translations[language]['order.category.coldbrew'] },
    { id: 'tea', label: translations[language]['order.category.tea'] },
    { id: 'pastry', label: translations[language]['order.category.pastry'] },
  ];

  const [dynamicProducts, setDynamicProducts] = useState<Product[]>(products);

  React.useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDynamicProducts(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic menu:", err);
      }
    };
    fetchMenu();
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? dynamicProducts 
    : dynamicProducts.filter(p => p.category === selectedCategory);

  const getProductPriceInActiveCurrency = (p: Product) => {
    if (currency === 'USD') return p.priceUSD;
    if (currency === 'KRW') return p.priceKRW;
    return p.priceVND;
  };

  const getToppingPriceInActiveCurrency = () => {
    // 5000 VND base
    if (currency === 'USD') return 0.20;
    if (currency === 'KRW') return 300;
    return 5000;
  };

  // Calculate customized price for modal
  const calculateCustomizedPrice = (p: Product) => {
    let base = getProductPriceInActiveCurrency(p);
    
    // Size multiplier
    const sizeMultiplier = size === 'L' ? 1.2 : size === 'M' ? 1.1 : 1.0;
    let price = base * sizeMultiplier;

    // Toppings cost
    const toppingPrice = getToppingPriceInActiveCurrency();
    price += toppings.length * toppingPrice;

    if (currency === 'USD') return parseFloat(price.toFixed(2));
    if (currency === 'KRW') return Math.round(price);
    return Math.round(price);
  };

  const handleOpenCustomize = (product: Product) => {
    setSelectedProduct(product);
    setSize('M');
    if (product.category === 'pastry') {
      setIce('None');
      setSugar('None');
    } else {
      setIce('100%');
      setSugar('50%');
    }
    setToppings([]);
    setQuantity(1);
    setNote('');
  };

  const handleToggleTopping = (topping: string) => {
    setToppings(prev => 
      prev.includes(topping) 
        ? prev.filter(t => t !== topping) 
        : [...prev, topping]
    );
  };

  const handleAddToCartSubmit = () => {
    if (!selectedProduct) return;
    addToCart(selectedProduct, size, ice, sugar, toppings, quantity, note);
    setSelectedProduct(null);
  };

  // Cart Pricing Calculations (in active currency)
  const calculateCartSubtotal = () => {
    return cart.reduce((sum, item) => {
      let base = getProductPriceInActiveCurrency(item.product);
      const sizeMultiplier = item.size === 'L' ? 1.2 : item.size === 'M' ? 1.1 : 1.0;
      let price = base * sizeMultiplier;
      price += item.toppings.length * getToppingPriceInActiveCurrency();
      
      const itemCost = currency === 'USD' ? parseFloat(price.toFixed(2)) : Math.round(price);
      return sum + (itemCost * item.quantity);
    }, 0);
  };

  const getVoucherDiscount = (subtotal: number) => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.discountType === 'percent') {
      const discount = subtotal * (appliedVoucher.value / 100);
      return currency === 'USD' ? parseFloat(discount.toFixed(2)) : Math.round(discount);
    } else {
      // flat amount (value is stored in base VND). Convert to active currency!
      const convertedValue = convertVNDToActiveCurrency(appliedVoucher.value);
      return Math.min(subtotal, convertedValue);
    }
  };

  const subtotal = calculateCartSubtotal();
  const discount = getVoucherDiscount(subtotal);
  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.toUpperCase().trim();
    
    // Find claimed voucher matching code
    const voucher = vouchers.find(vc => vc.code === code && vc.claimed && !vc.used);
    
    if (voucher) {
      // Check minimum order threshold
      const minOrder = currency === 'USD' ? voucher.minOrderUSD : currency === 'KRW' ? voucher.minOrderKRW : voucher.minOrderVND;
      if (subtotal < minOrder) {
        setPromoError(
          language === 'vi' ? `Đơn hàng tối thiểu phải đạt ${formatPrice(minOrder)} để áp dụng mã!` :
          language === 'ko' ? `이 쿠폰은 ${formatPrice(minOrder)} 이상 주문 시 적용 가능합니다!` :
          `Minimum order value of ${formatPrice(minOrder)} is required for this code!`
        );
        return;
      }
      applyVoucher(voucher);
      setPromoInput('');
    } else {
      const unclaimed = vouchers.find(vc => vc.code === code);
      if (unclaimed && !unclaimed.claimed) {
        setPromoError(
          language === 'vi' ? 'Vui lòng nhận voucher này ở mục "Ưu đãi" trước khi dùng!' :
          language === 'ko' ? '먼저 "쿠폰" 탭에서 쿠폰을 다운로드해 주세요!' :
          'Please claim this voucher under the "Offers" tab first!'
        );
      } else {
        setPromoError(
          language === 'vi' ? 'Mã ưu đãi không hợp lệ hoặc đã sử dụng!' :
          language === 'ko' ? '유효하지 않거나 이미 사용된 코드입니다!' :
          'Invalid or already used coupon code!'
        );
      }
    }
  };

  const [vietQrData, setVietQrData] = useState<{ orderId: string; amountVND: number; qrCodeUrl: string; memo: string; bankInfo: any } | null>(null);
  const [isOrderPaid, setIsOrderPaid] = useState(false);

  React.useEffect(() => {
    if (vietQrData) {
      const currentOrder = orders.find(o => o.id === vietQrData.orderId);
      if (currentOrder && currentOrder.status !== 'pending') {
        setIsOrderPaid(true);
        const timer = setTimeout(() => {
          setVietQrData(null);
          setIsOrderPaid(false);
        }, 2500);
        return () => clearTimeout(timer);
      }
    } else {
      setIsOrderPaid(false);
    }
  }, [orders, vietQrData]);
 
  const handleCheckoutSubmit = async (method: 'wallet' | 'vietqr' | 'cash') => {
    // Perform checkout logic. Need base VND for backend
    const result = await checkout(method);
    if (result.success) {
      setCheckoutStatus({ success: true, message: result.message });
      setIsCartOpen(false);
      if (method === 'vietqr' && result.orderId && result.amountVND && result.qrCodeUrl) {
        setVietQrData({ 
          orderId: result.orderId, 
          amountVND: result.amountVND,
          qrCodeUrl: result.qrCodeUrl,
          memo: result.memo,
          bankInfo: result.bankInfo
        });
      }
    } else {
      setCheckoutStatus({ success: false, message: result.message });
    }
  };

  return (
    <div className="relative">
      
      {/* MENU HEADLINE AND CATEGORY TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-coffee-950 flex items-center space-x-2">
            <Coffee className="w-8 h-8 text-coffee-800" />
            <span>{translations[language]['order.title']}</span>
          </h2>
          <p className="text-xs text-coffee-500 mt-1">Giao hỏa tốc hoặc nhận tại quầy Mellodi chỉ trong 5-10 phút.</p>
        </div>

        {/* Floating Cart Button */}
        <button
          id="btn-floating-cart"
          onClick={() => setIsCartOpen(true)}
          className="relative px-5 py-3 rounded-xl bg-coffee-900 text-white flex items-center space-x-2 shadow-lg hover:bg-coffee-950 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-sm font-semibold">{translations[language]['order.cart']}</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold font-mono animate-bounce border-2 border-white">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* CATEGORY SWIPER */}
      <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-thin border-b border-coffee-100 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat.id}
            id={`cat-tab-${cat.id}`}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4.5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-coffee-900 text-white shadow-md shadow-coffee-900/10'
                : 'bg-white text-coffee-700 border border-coffee-200/60 hover:bg-coffee-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <motion.div
            layout
            key={p.id}
            id={`product-card-${p.id}`}
            className="bg-white rounded-2xl p-5 border border-coffee-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group overflow-hidden"
          >
            {/* Removed "Yêu thích nhất" badge as requested */}

            <div className="flex items-start justify-between space-x-4 mb-4">
              <div className="space-y-1.5 flex-1">
                <h3 className="font-serif text-lg font-bold text-coffee-950 leading-snug group-hover:text-coffee-700 transition-colors">
                  {p.name[language]}
                </h3>
                <p className="text-xs text-coffee-500 line-clamp-3 leading-relaxed">
                  {p.description[language]}
                </p>
              </div>

              {/* Coffee Graphic/Cup Visualizer */}
              <div className="w-20 h-20 rounded-xl bg-coffee-50 border border-coffee-100 flex items-center justify-center text-4xl shadow-inner relative group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                <span>{p.image}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-coffee-50 pt-4 mt-auto">
              <div>
                <span className="text-[10px] text-coffee-400 block uppercase font-semibold">Price</span>
                <span className="text-base font-bold text-coffee-900 font-mono">
                  {formatPrice(getProductPriceInActiveCurrency(p))}
                </span>
              </div>

              <button
                id={`btn-open-customize-${p.id}`}
                onClick={() => handleOpenCustomize(p)}
                className="px-4 py-2 bg-coffee-100 hover:bg-coffee-900 hover:text-white text-coffee-900 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer"
              >
                + {translations[language]['common.apply']}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CUSTOMIZE PRODUCT MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-coffee-100"
            >
              {/* Close Button */}
              <button
                id="btn-close-customize"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-coffee-400 hover:bg-coffee-100 hover:text-coffee-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start space-x-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-coffee-50 flex items-center justify-center text-3xl border border-coffee-100 flex-shrink-0">
                  {selectedProduct.image}
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-coffee-950">
                    {selectedProduct.name[language]}
                  </h3>
                  <p className="text-xs text-coffee-500 mt-1">{selectedProduct.description[language]}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* 1. Size Options */}
                <div>
                  <h4 className="text-xs font-bold text-coffee-700 uppercase tracking-wider mb-2">
                    {translations[language]['order.size']}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'S', label: 'Tall (Small)', factor: 'Base' },
                      { id: 'M', label: 'Grande (Medium)', factor: '+10%' },
                      { id: 'L', label: 'Venti (Large)', factor: '+20%' }
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        id={`size-opt-${sz.id}`}
                        type="button"
                        onClick={() => setSize(sz.id as any)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          size === sz.id
                            ? 'bg-coffee-900 border-coffee-900 text-white shadow-xs'
                            : 'border-coffee-200 text-coffee-700 hover:bg-coffee-50'
                        }`}
                      >
                        <p className="text-xs font-bold">{sz.label}</p>
                        <p className="text-[10px] text-coffee-400 font-mono mt-0.5">{sz.factor}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Ice / Sugar (Skip for pastry!) */}
                {selectedProduct.category !== 'pastry' && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Ice Level */}
                    <div>
                      <h4 className="text-xs font-bold text-coffee-700 uppercase tracking-wider mb-2">
                        {translations[language]['order.ice']}
                      </h4>
                      <div className="flex bg-coffee-50 p-1 rounded-xl border border-coffee-200">
                        {['0%', '50%', '100%'].map((lvl) => (
                          <button
                            key={lvl}
                            id={`ice-lvl-${lvl}`}
                            type="button"
                            onClick={() => setIce(lvl as any)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              ice === lvl
                                ? 'bg-white text-coffee-900 shadow-xs'
                                : 'text-coffee-500 hover:text-coffee-900'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sugar Level */}
                    <div>
                      <h4 className="text-xs font-bold text-coffee-700 uppercase tracking-wider mb-2">
                        {translations[language]['order.sugar']}
                      </h4>
                      <div className="flex bg-coffee-50 p-1 rounded-xl border border-coffee-200">
                        {['0%', '50%', '100%'].map((lvl) => (
                          <button
                            key={lvl}
                            id={`sugar-lvl-${lvl}`}
                            type="button"
                            onClick={() => setSugar(lvl as any)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              sugar === lvl
                                ? 'bg-white text-coffee-900 shadow-xs'
                                : 'text-coffee-500 hover:text-coffee-900'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Extra Toppings */}
                <div>
                  <h4 className="text-xs font-bold text-coffee-700 uppercase tracking-wider mb-2">
                    {translations[language]['order.toppings']} (+{formatPrice(getToppingPriceInActiveCurrency())}/item)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'caramel', label: 'Caramel Drizzle (Sốt Caramel)' },
                      { id: 'whip', label: 'Whipped Cream (Kem Phô Mai)' },
                      { id: 'shot', label: 'Extra Espresso Shot' },
                      { id: 'lotus', label: 'Lotus Seeds (Hạt sen dẻo)' }
                    ].map((top) => {
                      const isSelected = toppings.includes(top.id);
                      return (
                        <button
                          key={top.id}
                          id={`topping-opt-${top.id}`}
                          type="button"
                          onClick={() => handleToggleTopping(top.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-amber-50 border-amber-300 text-amber-950'
                              : 'border-coffee-200 text-coffee-700 hover:bg-coffee-50'
                          }`}
                        >
                          <span className="text-xs font-medium">{top.label}</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-coffee-300'}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Notes */}
                <div>
                  <h4 className="text-xs font-bold text-coffee-700 uppercase tracking-wider mb-2">
                    {translations[language]['order.note']}
                  </h4>
                  <textarea
                    id="barista-notes-textarea"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="E.g., Không lấy nắp nhựa, mang theo cốc cá nhân bảo vệ môi trường..."
                    className="w-full bg-coffee-50/50 border border-coffee-200 rounded-xl p-3 text-xs focus:outline-hidden focus:ring-2 focus:ring-coffee-600"
                  />
                </div>

                {/* 5. Quantity & Submit */}
                <div className="flex items-center justify-between border-t border-coffee-100 pt-6 mt-6">
                  <div className="flex items-center space-x-3 bg-coffee-100 rounded-xl p-1.5">
                    <button
                      id="btn-dec-customize-qty"
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-1.5 bg-white text-coffee-900 rounded-lg hover:bg-coffee-50 active:scale-90 transition-transform"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm w-6 text-center text-coffee-950">{quantity}</span>
                    <button
                      id="btn-inc-customize-qty"
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-1.5 bg-white text-coffee-900 rounded-lg hover:bg-coffee-50 active:scale-90 transition-transform"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    id="btn-add-to-cart-submit"
                    type="button"
                    onClick={handleAddToCartSubmit}
                    className="flex-1 ml-6 bg-coffee-900 hover:bg-coffee-950 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md flex justify-between items-center px-6 cursor-pointer"
                  >
                    <span>{translations[language]['order.addtocart']}</span>
                    <span className="font-mono font-bold text-amber-200">
                      {formatPrice(calculateCustomizedPrice(selectedProduct) * quantity)}
                    </span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CART RIGHT SLIDE OUT DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            {/* Click outside backdrop to close */}
            <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white max-w-md w-full h-full relative z-10 flex flex-col justify-between shadow-2xl border-l border-coffee-100"
            >
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-coffee-100 flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-xl font-bold text-coffee-950 flex items-center space-x-2">
                    <ShoppingBag className="text-coffee-800 w-5 h-5" />
                    <span>{translations[language]['order.cart']}</span>
                  </h3>
                  <span className="text-[10px] text-coffee-500 block uppercase font-mono mt-0.5">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} items in basket
                  </span>
                </div>
                <button
                  id="btn-close-cart-drawer"
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-coffee-400 hover:text-coffee-950 rounded-full hover:bg-coffee-50 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body (Scrollable items) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-coffee-50 flex items-center justify-center text-coffee-300">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-medium text-coffee-700">{translations[language]['order.cart.empty']}</p>
                      <button
                        id="btn-drawer-start-ordering"
                        onClick={() => setIsCartOpen(false)}
                        className="text-xs font-bold text-amber-700 hover:underline mt-2 cursor-pointer"
                      >
                        ← Start adding items
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {cart.map((item) => {
                      const basePrice = getProductPriceInActiveCurrency(item.product);
                      const sizeMultiplier = item.size === 'L' ? 1.2 : item.size === 'M' ? 1.1 : 1.0;
                      let itemSinglePrice = basePrice * sizeMultiplier;
                      itemSinglePrice += item.toppings.length * getToppingPriceInActiveCurrency();
                      const itemCost = currency === 'USD' ? parseFloat(itemSinglePrice.toFixed(2)) : Math.round(itemSinglePrice);

                      return (
                        <div 
                          key={item.id} 
                          id={`cart-item-${item.id}`}
                          className="flex items-start space-x-3 p-3 bg-coffee-50/50 rounded-xl border border-coffee-100"
                        >
                          <div className="w-10 h-10 rounded-lg bg-coffee-100 flex items-center justify-center text-2xl flex-shrink-0">
                            {item.product.image}
                          </div>

                          <div className="flex-1 space-y-0.5">
                            <h4 className="font-semibold text-xs text-coffee-950">{item.product.name[language]}</h4>
                            
                            <p className="text-[10px] text-coffee-500 leading-tight">
                              Size {item.size} • Ice {item.ice} • Sugar {item.sugar}
                              {item.toppings.length > 0 && ` • Toppings: ${item.toppings.join(', ')}`}
                            </p>
                            
                            {item.note && (
                              <p className="text-[9px] text-amber-700 italic">
                                Note: "{item.note}"
                              </p>
                            )}

                            <div className="flex justify-between items-center pt-2">
                              {/* Quantity selectors */}
                              <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-coffee-200">
                                <button
                                  id={`btn-cart-dec-${item.id}`}
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                  className="p-1 hover:bg-coffee-50 rounded"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="text-[11px] font-bold w-4 text-center">{item.quantity}</span>
                                <button
                                  id={`btn-cart-inc-${item.id}`}
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:bg-coffee-50 rounded"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-bold text-coffee-900">
                                  {formatPrice(itemCost * item.quantity)}
                                </span>
                                <button
                                  id={`btn-cart-del-${item.id}`}
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-1 text-coffee-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Promo coupon form */}
                    <div className="pt-4 border-t border-coffee-100">
                      <form onSubmit={handleApplyPromoCode} className="space-y-2">
                        <label className="block text-[11px] font-bold text-coffee-600 uppercase tracking-wider">
                          {translations[language]['voucher.title']}
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            id="promo-code-input"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            placeholder="Nhập mã ưu đãi..."
                            className="flex-1 bg-coffee-50 border border-coffee-200 rounded-lg px-3 py-2 text-xs uppercase font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-coffee-600"
                          />
                          <button
                            type="submit"
                            id="btn-apply-promo"
                            className="bg-coffee-900 hover:bg-coffee-950 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            {translations[language]['common.apply']}
                          </button>
                        </div>
                        {promoError && (
                          <p className="text-[10px] text-rose-600 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            <span>{promoError}</span>
                          </p>
                        )}
                        {appliedVoucher && (
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2 rounded-lg flex items-center justify-between text-[11px] font-semibold mt-2">
                            <span className="flex items-center space-x-1.5">
                              <Tag className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Mã áp dụng: <b>{appliedVoucher.code}</b> ({translations[language]['voucher.percent']} {appliedVoucher.value}{appliedVoucher.discountType === 'percent' ? '%' : 'K đ'})</span>
                            </span>
                            <button
                              id="btn-remove-promo"
                              type="button"
                              onClick={() => applyVoucher(null)}
                              className="text-rose-600 font-bold hover:underline"
                            >
                              {translations[language]['common.cancel']}
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  </>
                )}
              </div>

              {/* Drawer Footer (Pricing & Checkout) */}
              {cart.length > 0 && (
                <div className="bg-coffee-50 border-t border-coffee-100 p-6 space-y-4">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-coffee-600">
                      <span>{translations[language]['order.cart.total']}</span>
                      <span className="font-mono">{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>{translations[language]['order.cart.discount']}</span>
                        <span className="font-mono">-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-coffee-950 font-bold text-sm border-t border-coffee-100 pt-1.5">
                      <span>{translations[language]['order.cart.final']}</span>
                      <span className="font-mono text-base text-coffee-900">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-coffee-600 uppercase tracking-wider">
                      {translations[language]['order.pay.method']}
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {/* E-wallet option */}
                      <button
                        id="pay-opt-wallet"
                        onClick={() => handleCheckoutSubmit('wallet')}
                        className="p-3 bg-white hover:bg-amber-50/20 rounded-xl border border-coffee-200 text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-coffee-950">{translations[language]['order.pay.wallet']}</p>
                          <p className="text-[10px] text-coffee-400 mt-0.5">Balance: {formatPriceInCurrency(walletBalance)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-coffee-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      {/* VietQR Bank Transfer option */}
                      <button
                        id="pay-opt-vietqr"
                        onClick={() => handleCheckoutSubmit('vietqr')}
                        className="p-3 bg-white hover:bg-amber-50/20 rounded-xl border border-coffee-200 text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#2D5A47] flex items-center space-x-1.5">
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Chuyển khoản VietQR (Vietinbank)</span>
                          </p>
                          <p className="text-[10px] text-coffee-400 mt-0.5">Quét mã thanh toán tức thì. Nhận 10% điểm LEN khi hoàn tất đơn.</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-coffee-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      {/* COD cash option */}
                      <button
                        id="pay-opt-cash"
                        onClick={() => handleCheckoutSubmit('cash')}
                        className="p-3 bg-white hover:bg-amber-50/20 rounded-xl border border-coffee-200 text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <p className="text-xs font-bold text-coffee-950">{translations[language]['order.pay.cash']}</p>
                          <p className="text-[10px] text-coffee-400 mt-0.5">Thanh toán khi nhận hàng. Nhận 10% điểm LEN khi hoàn tất đơn.</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-coffee-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT SUCCESS DIALOG */}
      <AnimatePresence>
        {checkoutStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative border border-coffee-100"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
              </div>

              <h3 className="font-serif text-xl font-bold text-coffee-950 mb-2">
                {checkoutStatus.success ? translations[language]['common.success'] : translations[language]['common.error']}
              </h3>
              <p className="text-xs text-coffee-600 mb-6 leading-relaxed">
                {checkoutStatus.message}
              </p>

              <button
                id="btn-dismiss-checkout-status"
                onClick={() => setCheckoutStatus(null)}
                className="w-full bg-coffee-900 text-white font-bold text-xs py-3 rounded-xl hover:bg-coffee-950 transition-colors cursor-pointer"
              >
                {translations[language]['common.close']}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIETQR PAY MODAL OVERLAY */}
      <AnimatePresence>
        {vietQrData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-coffee-100 relative space-y-5"
            >
              <button
                onClick={() => setVietQrData(null)}
                className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-950 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {isOrderPaid ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200 animate-bounce">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif text-2xl font-bold text-emerald-800">Thanh Toán Thành Công!</h4>
                    <p className="text-xs text-stone-500 max-w-sm">
                      Mellodi đã nhận được thanh toán chuyển khoản cho đơn hàng <span className="font-bold text-[#4E342E]">{vietQrData.orderId}</span>. Quầy đang tiến hành pha chế món nước của bạn!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2D5A47] flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-coffee-950">
                      {language === 'vi' ? 'Thanh Toán Qua VietQR' : language === 'ko' ? 'VietQR 즉시 송금 결제' : 'VietQR Bank Transfer'}
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                      {language === 'vi'
                        ? 'Quét mã QR dưới đây bằng ứng dụng ngân hàng của bạn để thanh toán hóa đơn.'
                        : 'Scan this QR code with any mobile banking app to complete order transfer.'}
                    </p>
                  </div>

                  {/* QR Image & details */}
                  <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-coffee-100 flex flex-col items-center justify-center space-y-4">
                    <div className="p-3 bg-white rounded-xl border border-coffee-100 shadow-sm relative overflow-hidden">
                      <img
                        src={vietQrData.qrCodeUrl}
                        alt="VietQR Mellodi Order Payment"
                        referrerPolicy="no-referrer"
                        className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                      />
                      <div className="absolute inset-x-4 h-0.5 bg-emerald-500 top-1/2 animate-pulse shadow-sm shadow-emerald-500"></div>
                    </div>

                    {/* Transfer Info Sheet */}
                    <div className="w-full space-y-2 text-xs divide-y divide-coffee-100/50 pt-1">
                      <div className="flex justify-between py-1.5">
                        <span className="text-stone-400">{language === 'vi' ? 'Ngân hàng' : 'Bank'}</span>
                        <span className="font-bold text-coffee-900">{vietQrData.bankInfo.bankId}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-stone-400">{language === 'vi' ? 'Số tài khoản' : 'Account No.'}</span>
                        <span className="font-mono font-bold text-[#2D5A47] select-all">{vietQrData.bankInfo.accountNo}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-stone-400">{language === 'vi' ? 'Chủ tài khoản' : 'Account Name'}</span>
                        <span className="font-bold text-coffee-900">{vietQrData.bankInfo.accountName}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-stone-400">{language === 'vi' ? 'Số tiền' : 'Amount'}</span>
                        <span className="font-mono font-bold text-rose-600">{formatPrice(vietQrData.amountVND)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 bg-amber-50 border border-amber-100 p-2 rounded-xl">
                        <span className="text-amber-800 font-bold">{language === 'vi' ? 'Nội dung CK' : 'Memo'}</span>
                        <span className="font-mono font-black text-amber-900 select-all bg-white px-2 py-0.5 rounded-md border border-amber-200">{vietQrData.memo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-[11px] font-semibold animate-pulse">
                    <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang chờ chuyển khoản... (Tự động duyệt sau 8 giây)</span>
                  </div>

                  {/* Action (for manual simulation bypass) */}
                  <button
                    onClick={async () => {
                      try {
                        const simulateRes = await fetch(`${API_BASE_URL}/api/payment/simulate`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            description: vietQrData.memo,
                            amount: vietQrData.amountVND
                          })
                        });
                        if (!simulateRes.ok) {
                          alert('Hệ thống chưa ghi nhận được chuyển khoản. Vui lòng thử lại!');
                        }
                      } catch (err) {
                        alert('Lỗi kết nối máy chủ giả lập thanh toán.');
                      }
                    }}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs py-3 rounded-xl transition-all border border-stone-200 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>{language === 'vi' ? 'Giả lập thanh toán nhanh' : 'Simulate Instant Payment'}</span>
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Draggable & Hand-Responsive Floating Cart Button */}
      <motion.div
        drag
        dragConstraints={{ left: -250, right: 10, top: -450, bottom: 80 }}
        dragElastic={0.15}
        dragTransition={{ bounceStiffness: 400, bounceDamping: 15 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 z-40 flex cursor-grab active:cursor-grabbing"
      >
        <button
          id="btn-draggable-floating-cart"
          onClick={() => setIsCartOpen(true)}
          className="relative p-4 rounded-full bg-[#2D5A47] text-white shadow-2xl hover:bg-[#1E4334] flex items-center justify-center border-2 border-white/40 group active:scale-95 transition-all"
        >
          <ShoppingBag className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold font-mono animate-bounce border-2 border-[#2D5A47]">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
          {/* Draggable indicator tooltip */}
          <span className="absolute bottom-[-28px] bg-coffee-950/90 text-white text-[9px] px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-medium">
            {language === 'vi' ? '🖐️ Kéo chỉnh tầm tay' : '🖐️ Drag to adjust'}
          </span>
        </button>
      </motion.div>

    </div>
  );
};
