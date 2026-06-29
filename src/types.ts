export type Language = 'vi' | 'ko' | 'en';
export type Currency = 'VND' | 'KRW' | 'USD';

export type ProductCategory = 'espresso' | 'brewed' | 'coldbrew' | 'tea' | 'pastry';

export interface Product {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  category: ProductCategory;
  priceVND: number;
  priceKRW: number;
  priceUSD: number;
  image: string; // SVG code or custom illustration
  popular?: boolean;
}

export interface CartItem {
  id: string; // Unique instance ID
  productId: string;
  product: Product;
  size: 'S' | 'M' | 'L';
  ice: '0%' | '50%' | '100%' | 'None';
  sugar: '0%' | '50%' | '100%' | 'None';
  toppings: string[];
  quantity: number;
  note: string;
}

export interface Store {
  id: string;
  name: Record<Language, string>;
  address: Record<Language, string>;
  coords: { x: number; y: number }; // 0-100 values for mock map
  distance: number; // in km
  phone: string;
  openHours: string;
}

export interface Voucher {
  id: string;
  code: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  discountType: 'percent' | 'amount';
  value: number; // 20 for 20% or flat currency values (VND equivalence)
  minOrderVND: number;
  minOrderKRW: number;
  minOrderUSD: number;
  claimed: boolean;
  used: boolean;
  expiryDate: string;
}

export interface UserState {
  walletBalance: number; // stored in base VND. 1,000 VND = 1,000 Wallet points
  lenPoints: number; // loyalty points. 1,000 VND top-up = 1,000 LEN points. Pay using LEN points
  tier: 'Mellodi Basic' | 'Mellodi Gold' | 'Mellodi Premium';
  savedStores: string[];
  currentStoreId: string | null;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number; // in base VND
  currency: Currency;
  pointsEarned: number;
  pointsUsed: number;
  paymentMethod: 'wallet' | 'vietqr' | 'cash';
  status: 'pending' | 'preparing' | 'shipping' | 'completed' | 'cancelled';
  date: string;
}

export interface LocationPromo {
  id: string;
  storeId: string;
  storeName: Record<Language, string>;
  message: Record<Language, string>;
  voucherCode: string;
}
