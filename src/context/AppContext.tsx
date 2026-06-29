import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Currency, CartItem, Product, Voucher, Order, LocationPromo } from '../types';
import { initialVouchers } from '../data/vouchers';
import { stores } from '../data/stores';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  lenPoints: number;
  tier: 'Mellodi Basic' | 'Mellodi Gold' | 'Mellodi Premium';
  createdAt: string;
  biometricEnabled?: boolean;
  biometricToken?: string;
}

interface AppContextProps {
  language: Language;
  currency: Currency;
  currentUser: AppUser | null;
  walletBalance: number; // in VND base
  lenPoints: number; // in points base
  cart: CartItem[];
  vouchers: Voucher[];
  appliedVoucher: Voucher | null;
  orders: Order[];
  savedStores: string[];
  currentStoreId: string;
  activePromo: LocationPromo | null;
  isLoading: boolean;
  isOffline: boolean;
  
  setLanguage: (lang: Language) => void;
  registerUser: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => void;
  topUpWallet: (amountVND: number, method?: string) => Promise<{ success: boolean; message: string; qrCodeUrl?: string; memo?: string; bankInfo?: any }>;
  buyLenPoints: (amountVND: number) => Promise<{ success: boolean; message: string }>;
  addToCart: (product: Product, size: 'S' | 'M' | 'L', ice: any, sugar: any, toppings: string[], quantity: number, note: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  claimVoucher: (voucherId: string) => void;
  claimVoucherByCode: (code: string) => { success: boolean; message: string };
  applyVoucher: (voucher: Voucher | null) => void;
  checkout: (paymentMethod: 'wallet' | 'vietqr' | 'cash') => Promise<{ success: boolean; message: string; orderId?: string; paymentMethod?: string; amountVND?: number; qrCodeUrl?: string; memo?: string; bankInfo?: any }>;
  toggleSaveStore: (storeId: string) => void;
  setCurrentStoreId: (storeId: string) => void;
  simulateLocationNearStore: (storeId: string) => void;
  dismissPromo: () => void;
  formatPrice: (amount: number) => string;
  formatPriceInCurrency: (amountVND: number) => string;
  convertVNDToActiveCurrency: (amountVND: number) => number;
  getPointsCost: (amountVND: number) => number;
  notifications: any[];
  fetchNotifications: (userId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addVoucherDirectly: (voucher: Voucher) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
  setLenPoints: React.Dispatch<React.SetStateAction<number>>;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  tierUpgradeInfo: { tier: 'Mellodi Basic' | 'Mellodi Gold' | 'Mellodi Premium'; voucher: Voucher } | null;
  setTierUpgradeInfo: React.Dispatch<React.SetStateAction<{ tier: 'Mellodi Basic' | 'Mellodi Gold' | 'Mellodi Premium'; voucher: Voucher } | null>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const VND_TO_USD_RATE = 25000;
const VND_TO_KRW_RATE = 18; // 1 KRW = 18 VND

// Export API Base URL for components to use
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

// Helper to get headers with JWT auth token
export const getAuthHeaders = (headers: Record<string, string> = {}) => {
  const token = localStorage.getItem('mellodi_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...headers
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('mellodi_lang') as Language) || 'vi';
  });

  const [currency, setCurrency] = useState<Currency>('VND');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [lenPoints, setLenPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mellodi_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem('mellodi_vouchers');
    return saved ? JSON.parse(saved) : initialVouchers;
  });

  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tierUpgradeInfo, setTierUpgradeInfo] = useState<{ tier: 'Mellodi Basic' | 'Mellodi Gold' | 'Mellodi Premium'; voucher: Voucher } | null>(null);

  const [savedStores, setSavedStores] = useState<string[]>(() => {
    const saved = localStorage.getItem('mellodi_saved_stores');
    return saved ? JSON.parse(saved) : ['st-1'];
  });

  const [currentStoreId, setCurrentStoreIdState] = useState<string>(() => {
    return localStorage.getItem('mellodi_current_store') || 'st-1';
  });

  const [activePromo, setActivePromo] = useState<LocationPromo | null>(null);

  // Monitor network changes
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize and check current session
  useEffect(() => {
    async function initSession() {
      setIsLoading(true);
      const savedUserId = localStorage.getItem('mellodi_user_id');
      const token = localStorage.getItem('mellodi_jwt_token');

      if (!savedUserId || !token) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${savedUserId}`, {
          headers: getAuthHeaders()
        });
        setIsOffline(false);
        if (res.ok) {
          const user: AppUser = await res.json();
          setCurrentUser(user);
          setWalletBalance(user.walletBalance);
          setLenPoints(user.lenPoints);

          // Fetch orders for this user (secure endpoint)
          const ordersRes = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
            headers: getAuthHeaders()
          });
          if (ordersRes.ok) {
            const userOrders = await ordersRes.json();
            setOrders(userOrders);
          }

          // Fetch notifications for this user
          const notifRes = await fetch(`${API_BASE_URL}/api/notifications/${user.id}`, {
            headers: getAuthHeaders()
          });
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            setNotifications(notifData.notifications || []);
          }
        } else {
          // If token is invalid or user not found, clear session
          localStorage.removeItem('mellodi_user_id');
          localStorage.removeItem('mellodi_jwt_token');
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Failed to load user session from backend:', err);
        setIsOffline(true);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  // Real-time synchronization using Server-Sent Events (SSE)
  useEffect(() => {
    if (!currentUser) return;

    console.log(`[SSE] Establishing real-time connection for user: ${currentUser.id}`);
    const sseUrl = `${API_BASE_URL}/api/sse?userId=${currentUser.id}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener('connected', () => {
      console.log('[SSE] Connected to Mellodi Real-time Engine');
      setIsOffline(false);
    });

    eventSource.addEventListener('wallet_updated', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        console.log('[SSE] Wallet/Profile updated:', data);
        if (data.user) {
          setCurrentUser(data.user);
          setWalletBalance(data.user.walletBalance);
          setLenPoints(data.user.lenPoints);
          setIsOffline(false);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse wallet_updated event:', err);
      }
    });

    eventSource.addEventListener('order_status_updated', async (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        console.log('[SSE] Order status updated:', data);
        setIsOffline(false);
        
        // Re-fetch orders securely
        const ordersRes = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
          headers: getAuthHeaders()
        });
        if (ordersRes.ok) {
          const userOrders = await ordersRes.json();
          setOrders(userOrders);
        }
      } catch (err) {
        console.error('[SSE] Failed to process order_status_updated event:', err);
      }
    });

    eventSource.addEventListener('notification_received', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        console.log('[SSE] Notification received:', data);
        setIsOffline(false);
        if (data.notification) {
          setNotifications(prev => [data.notification, ...prev]);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse notification_received event:', err);
      }
    });

    eventSource.addEventListener('voucher_issued', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        console.log('[SSE] Voucher issued:', data);
        if (data.voucher) {
          addVoucherDirectly(data.voucher);
        }
      } catch (err) {
        console.error('[SSE] Failed to parse voucher_issued event:', err);
      }
    });

    eventSource.addEventListener('tier_upgraded', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        console.log('[SSE] Tier upgraded:', data);
        if (data.tier && data.voucher) {
          setTierUpgradeInfo({ tier: data.tier, voucher: data.voucher });
        }
      } catch (err) {
        console.error('[SSE] Failed to parse tier_upgraded event:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.error('[SSE] Connection error, marking as offline:', err);
      setIsOffline(true);
    };

    return () => {
      console.log('[SSE] Closing real-time connection');
      eventSource.close();
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (language === 'vi') setCurrency('VND');
    else if (language === 'en') setCurrency('USD');
    else if (language === 'ko') setCurrency('KRW');
    localStorage.setItem('mellodi_lang', language);
  }, [language]);

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem('mellodi_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mellodi_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem('mellodi_saved_stores', JSON.stringify(savedStores));
  }, [savedStores]);

  useEffect(() => {
    localStorage.setItem('mellodi_current_store', currentStoreId);
  }, [currentStoreId]);

  // Pricing Helpers
  const convertVNDToActiveCurrency = (amountVND: number): number => {
    if (currency === 'USD') return parseFloat((amountVND / VND_TO_USD_RATE).toFixed(2));
    if (currency === 'KRW') return Math.round(amountVND / VND_TO_KRW_RATE);
    return amountVND;
  };

  const formatPrice = (amount: number): string => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (currency === 'KRW') {
      return `${amount.toLocaleString('ko-KR')} ₩`;
    }
    return `${amount.toLocaleString('vi-VN')} đ`;
  };

  const formatPriceInCurrency = (amountVND: number): string => {
    const converted = convertVNDToActiveCurrency(amountVND);
    return formatPrice(converted);
  };

  const getPointsCost = (amountVND: number): number => {
    return amountVND; // 1:1 points to VND
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // MEMBERSHIP PORTAL FUNCTIONS
  const registerUser = async (name: string, email: string, phone: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Registration failed' };
      }
      
      // Store token and user details
      localStorage.setItem('mellodi_jwt_token', data.token);
      localStorage.setItem('mellodi_user_id', data.user.id);
      
      setCurrentUser(data.user);
      setWalletBalance(data.user.walletBalance);
      setLenPoints(data.user.lenPoints);
      setOrders([]);
      return { success: true, message: 'Đăng ký thành viên Mellodi thành công!' };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối máy chủ đăng ký.' };
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Login failed' };
      }
      
      // Store token and user details
      localStorage.setItem('mellodi_jwt_token', data.token);
      localStorage.setItem('mellodi_user_id', data.user.id);
      
      setCurrentUser(data.user);
      setWalletBalance(data.user.walletBalance);
      setLenPoints(data.user.lenPoints);

      // Fetch user's orders securely
      const ordersRes = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: getAuthHeaders()
      });
      if (ordersRes.ok) {
        const userOrders = await ordersRes.json();
        setOrders(userOrders);
      } else {
        setOrders([]);
      }
      return { success: true, message: 'Đăng nhập thành công!' };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối máy chủ đăng nhập.' };
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setWalletBalance(0);
    setLenPoints(0);
    setOrders([]);
    setNotifications([]);
    localStorage.removeItem('mellodi_user_id');
    localStorage.removeItem('mellodi_jwt_token');
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${userId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notificationId, userId: currentUser.id })
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/delete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notificationId, userId: currentUser.id })
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // WALLET & LOYALTY FUNCTIONS
  const topUpWallet = async (amountVND: number, method?: string) => {
    if (!currentUser) {
      return { success: false, message: 'Vui lòng đăng nhập để nạp ví!' };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/wallet/topup`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amountVND,
          paymentMethod: method || 'VietQR_Transfer'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Top up failed' };
      }
      
      // If payment is VietQR, the backend returns QR and memo for payment automation
      if (method === 'VietQR_Transfer' || !method) {
        return {
          success: true,
          message: data.message,
          qrCodeUrl: data.qrCodeUrl,
          memo: data.memo,
          bankInfo: data.bankInfo
        };
      }

      setCurrentUser(data.user);
      setWalletBalance(data.user.walletBalance);
      setLenPoints(data.user.lenPoints);
      return {
        success: true,
        message: language === 'vi' ? `Nạp thành công ${amountVND.toLocaleString('vi-VN')}đ vào ví!` : `Successfully topped up ${formatPriceInCurrency(amountVND)}!`
      };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối khi nạp ví.' };
    }
  };

  const buyLenPoints = async (amountVND: number) => {
    if (!currentUser) {
      return { success: false, message: 'Vui lòng đăng nhập để đổi điểm!' };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/wallet/convert-points`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amountVND
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Points conversion failed' };
      }
      setCurrentUser(data.user);
      setWalletBalance(data.user.walletBalance);
      setLenPoints(data.user.lenPoints);
      return {
        success: true,
        message: language === 'vi' ? `Mua thành công ${amountVND.toLocaleString('vi-VN')} điểm LEN!` : `Successfully purchased ${amountVND.toLocaleString()} LEN points!`
      };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối khi đổi điểm.' };
    }
  };

  // CART & CHECKOUT
  const addToCart = (
    product: Product,
    size: 'S' | 'M' | 'L',
    ice: any,
    sugar: any,
    toppings: string[],
    quantity: number,
    note: string
  ) => {
    const optionKey = `${product.id}-${size}-${ice}-${sugar}-${toppings.sort().join(',')}-${note}`;
    setCart(prev => {
      const existing = prev.find(item => {
        const key = `${item.productId}-${item.size}-${item.ice}-${item.sugar}-${item.toppings.sort().join(',')}-${item.note}`;
        return key === optionKey;
      });

      if (existing) {
        return prev.map(item => {
          const key = `${item.productId}-${item.size}-${item.ice}-${item.sugar}-${item.toppings.sort().join(',')}-${item.note}`;
          if (key === optionKey) {
            return { ...item, quantity: item.quantity + quantity };
          }
          return item;
        });
      }

      const newItem: CartItem = {
        id: Math.random().toString(36).substring(2, 9),
        productId: product.id,
        product,
        size,
        ice,
        sugar,
        toppings,
        quantity,
        note
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedVoucher(null);
  };

  const claimVoucher = (voucherId: string) => {
    setVouchers(prev => prev.map(vc => vc.id === voucherId ? { ...vc, claimed: true } : vc));
  };

  const claimVoucherByCode = (code: string) => {
    const trimmed = code.toUpperCase().trim();
    const existing = vouchers.find(vc => vc.code === trimmed);
    if (!existing) {
      return {
        success: false,
        message: language === 'vi' ? 'Mã voucher không hợp lệ!' :
                 language === 'ko' ? '유효하지 않은 쿠폰 코드입니다!' :
                 'Invalid coupon code!'
      };
    }
    if (existing.claimed) {
      return {
        success: false,
        message: language === 'vi' ? 'Bạn đã sở hữu voucher này rồi!' :
                 language === 'ko' ? '이미 보유 중인 쿠폰입니다!' :
                 'You already own this voucher!'
      };
    }
    setVouchers(prev => prev.map(vc => vc.code === trimmed ? { ...vc, claimed: true } : vc));
    return {
      success: true,
      message: language === 'vi' ? `Đã nhận thành công voucher: ${existing.title.vi}` :
               language === 'ko' ? `쿠폰을 다운로드했습니다: ${existing.title.ko}` :
               `Successfully claimed voucher: ${existing.title.en}`
    };
  };

  const applyVoucher = (voucher: Voucher | null) => {
    setAppliedVoucher(voucher);
  };

  const addVoucherDirectly = (voucher: Voucher) => {
    setVouchers(prev => {
      if (prev.some(vc => vc.code === voucher.code)) {
        return prev;
      }
      return [voucher, ...prev];
    });
  };

  const toggleSaveStore = (storeId: string) => {
    setSavedStores(prev => {
      if (prev.includes(storeId)) {
        return prev.filter(id => id !== storeId);
      }
      return [...prev, storeId];
    });
  };

  const setCurrentStoreId = (storeId: string) => {
    setCurrentStoreIdState(storeId);
  };

  const simulateLocationNearStore = (storeId: string) => {
    const store = stores.find(st => st.id === storeId);
    if (!store) return;
    
    const promo: LocationPromo = {
      id: `promo-${Date.now()}`,
      storeId,
      storeName: store.name,
      message: {
        vi: `Bạn đang ở gần ${store.name.vi}! Nhận ngay ưu đãi 30% cho thức uống yêu thích.`,
        en: `You are near ${store.name.en}! Grab an instant 30% discount on your favorite drinks.`,
        ko: `${store.name.ko} 매장 인근에 계시네요! 좋아하는 음료 30% 즉시 할인 혜택을 받아보세요.`
      },
      voucherCode: 'MELLODINEAR'
    };

    setVouchers(prev => {
      if (prev.some(vc => vc.code === 'MELLODINEAR')) {
        return prev.map(vc => vc.code === 'MELLODINEAR' ? { ...vc, claimed: false, used: false } : vc);
      }
      const newVoucher: Voucher = {
        id: 'vc-promo-location',
        code: 'MELLODINEAR',
        title: {
          vi: 'Ưu Đãi Vị Trí - Giảm 30%',
          en: 'Location Special - 30% Off',
          ko: '위치 기반 우대 - 30% 할인'
        },
        description: {
          vi: 'Ưu đãi dành riêng cho khách hàng đang ở gần chi nhánh Mellodi.',
          en: 'Exclusive discount for customers detected near a Mellodi branch.',
          ko: '멜로디 지점 매장 근처 고객을 위한 전용 스페셜 할인 쿠폰.'
        },
        discountType: 'percent',
        value: 30,
        minOrderVND: 30000,
        minOrderKRW: 2000,
        minOrderUSD: 1.50,
        claimed: false,
        used: false,
        expiryDate: '2026-07-10'
      };
      return [...prev, newVoucher];
    });

    setActivePromo(promo);
  };

  const dismissPromo = () => {
    setActivePromo(null);
  };

  const checkout = async (paymentMethod: 'wallet' | 'vietqr' | 'cash') => {
    if (!currentUser) {
      return { success: false, message: 'Vui lòng đăng nhập thành viên để đặt hàng!' };
    }
    if (cart.length === 0) {
      return { success: false, message: 'Giỏ hàng đang trống!' };
    }

    // Calculate total cost of items in VND base
    const totalItemsVND = cart.reduce((sum, item) => {
      let priceBase = item.product.priceVND;
      const toppingsCost = item.toppings.length * 5000;
      const sizeMultiplier = item.size === 'L' ? 1.2 : item.size === 'M' ? 1.1 : 1.0;
      const singleItemCost = Math.round((priceBase * sizeMultiplier) + toppingsCost);
      return sum + (singleItemCost * item.quantity);
    }, 0);

    // Calculate discount
    let discountVND = 0;
    if (appliedVoucher) {
      if (appliedVoucher.discountType === 'percent') {
        discountVND = Math.round(totalItemsVND * (appliedVoucher.value / 100));
      } else {
        discountVND = appliedVoucher.value;
      }
    }

    const finalCostVND = Math.max(0, totalItemsVND - discountVND);

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          items: cart,
          totalPriceVND: finalCostVND,
          paymentMethod,
          currency
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Checkout failed' };
      }

      // Mark applied voucher as used
      if (appliedVoucher) {
        setVouchers(prev => prev.map(vc => vc.id === appliedVoucher.id ? { ...vc, used: true } : vc));
      }

      clearCart();
      const pointsEarned = Math.round(finalCostVND * 0.1);

      let successMsg = '';
      if (language === 'vi') {
        if (paymentMethod === 'wallet') {
          successMsg = `Đặt hàng thành công! Đơn hàng của bạn đang được pha chế. Bạn sẽ nhận được +${pointsEarned.toLocaleString('vi-VN')} điểm LEN khi đơn hoàn tất.`;
        } else if (paymentMethod === 'vietqr') {
          successMsg = `Mã chuyển khoản QR đã được tạo! Vui lòng quét thanh toán đúng số tiền. Bạn sẽ nhận được +${pointsEarned.toLocaleString('vi-VN')} điểm LEN khi đơn hoàn tất.`;
        } else {
          successMsg = `Đặt hàng thành công! Bạn vui lòng thanh toán tiền mặt khi nhận hàng. Nhận +${pointsEarned.toLocaleString('vi-VN')} điểm LEN khi đơn hoàn tất.`;
        }
      } else if (language === 'ko') {
        if (paymentMethod === 'wallet') {
          successMsg = `주문 완료! 멜로디 e-페이로 결제되었습니다. 주문 완료 시 +${pointsEarned.toLocaleString()} LEN 포인트가 적립됩니다.`;
        } else if (paymentMethod === 'vietqr') {
          successMsg = `VietQR 이체 코드가 생성되었습니다! 송금 완료 후 매장에서 제조됩니다. 완료 시 +${pointsEarned.toLocaleString()} LEN 포인트가 적립됩니다.`;
        } else {
          successMsg = `현장 결제 주문 완료! 음료를 수령하며 직접 결제해 주세요. 완료 시 +${pointsEarned.toLocaleString()} LEN 포인트가 적립됩니다.`;
        }
      } else {
        if (paymentMethod === 'wallet') {
          successMsg = `Order placed! Paid via Mellodi wallet. You will earn +${pointsEarned.toLocaleString()} LEN points once your order is Completed.`;
        } else if (paymentMethod === 'vietqr') {
          successMsg = `VietQR code generated! Transfer to start handcrafting. You will earn +${pointsEarned.toLocaleString()} LEN points once your order is Completed.`;
        } else {
          successMsg = `Order placed! Cash on delivery. You will earn +${pointsEarned.toLocaleString()} LEN points once your order is Completed.`;
        }
      }

      // If the payment is VietQR, the backend will return qrCodeUrl, memo, etc.
      if (paymentMethod === 'vietqr') {
        return {
          success: true,
          message: successMsg,
          orderId: data.order.id,
          paymentMethod,
          amountVND: finalCostVND,
          qrCodeUrl: data.qrCodeUrl,
          memo: data.memo,
          bankInfo: data.bankInfo
        };
      }

      setCurrentUser(data.user);
      setWalletBalance(data.user.walletBalance);
      setLenPoints(data.user.lenPoints);

      // Re-fetch orders list securely
      const ordersRes = await fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: getAuthHeaders()
      });
      if (ordersRes.ok) {
        const userOrders = await ordersRes.json();
        setOrders(userOrders);
      }

      return {
        success: true,
        message: successMsg,
        orderId: data.order.id,
        paymentMethod,
        amountVND: finalCostVND
      };
    } catch (error) {
      return { success: false, message: 'Lỗi kết nối khi thanh toán đơn hàng.' };
    }
  };

  return (
    <AppContext.Provider value={{
      language,
      currency,
      currentUser,
      walletBalance,
      lenPoints,
      cart,
      vouchers,
      appliedVoucher,
      orders,
      savedStores,
      currentStoreId,
      activePromo,
      isLoading,
      isOffline,
      setLanguage,
      registerUser,
      loginUser,
      logoutUser,
      topUpWallet,
      buyLenPoints,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      claimVoucher,
      claimVoucherByCode,
      applyVoucher,
      checkout,
      toggleSaveStore,
      setCurrentStoreId,
      simulateLocationNearStore,
      dismissPromo,
      formatPrice,
      formatPriceInCurrency,
      convertVNDToActiveCurrency,
      getPointsCost,
      notifications,
      fetchNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      addVoucherDirectly,
      setCurrentUser,
      setLenPoints,
      setWalletBalance,
      setOrders,
      tierUpgradeInfo,
      setTierUpgradeInfo
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
