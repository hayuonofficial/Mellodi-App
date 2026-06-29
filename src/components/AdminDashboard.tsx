import React, { useState, useEffect } from 'react';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { 
  Users, TrendingUp, ShoppingBag, Award, Search, Filter, 
  ChevronRight, ArrowLeft, RefreshCw, BarChart2, Download, 
  DollarSign, Calendar, Star, Coffee, Sparkles, AlertCircle, CheckCircle,
  GraduationCap, CreditCard, Plus, Wifi, Smartphone, Tag, ShieldCheck, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  lenPoints: number;
  tier: 'Mellodi Basic' | 'Mellodi Gold' | 'Mellodi Premium';
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  favoriteDrink: string;
  nfcCard?: {
    cardId: string;
    status: 'active' | 'suspended';
    linkedAt: string;
    secretKey: string;
  };
}

interface AnalyticsData {
  summary: {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    totalPointsIssued: number;
    averageOrderValue: number;
  };
  tierDistribution: {
    'Mellodi Basic': number;
    'Mellodi Gold': number;
    'Mellodi Premium': number;
  };
  topProducts: Array<{
    name: string;
    count: number;
    revenue: number;
    image: string;
  }>;
}

interface CustomerDetail {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    walletBalance: number;
    lenPoints: number;
    tier: 'Mellodi Basic' | 'Mellodi Gold' | 'Mellodi Premium';
    createdAt: string;
  };
  stats: {
    totalSpent: number;
    totalOrders: number;
    averageOrderValue: number;
    favoriteDrink: string;
  };
  preferences: Array<{
    name: string;
    count: number;
    category: string;
  }>;
  orders: any[];
  transactions: any[];
}

// Helper to generate HMAC signature using browser Web Crypto API
async function generateHmacSignature(secretKey: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await window.crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData
  );
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const AdminDashboard: React.FC = () => {
  const { language, formatPrice, currentUser } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'directory' | 'education' | 'nfc'>('analytics');
  const [consultations, setConsultations] = useState<any[]>([]);
  
  // NFC Station States
  const [nfcSelectedCustomerId, setNfcSelectedCustomerId] = useState<string>('');
  const [nfcWriteCardId, setNfcWriteCardId] = useState<string>('');
  const [nfcWriteState, setNfcWriteState] = useState<'idle' | 'writing' | 'success' | 'error'>('idle');
  const [nfcWriteMsg, setNfcWriteMsg] = useState<string>('');
  const [nfcWriteLogs, setNfcWriteLogs] = useState<string[]>([]);

  const [posScanCardId, setPosScanCardId] = useState<string>('');
  const [posScanState, setPosScanState] = useState<'idle' | 'reading' | 'success' | 'error'>('idle');
  const [posScanMsg, setPosScanMsg] = useState<string>('');
  const [posScanLogs, setPosScanLogs] = useState<string[]>([]);
  const [posScannedUser, setPosScannedUser] = useState<any | null>(null);
  const [posActionType, setPosActionType] = useState<'points' | 'pay' | 'topup'>('points');
  const [posActionAmount, setPosActionAmount] = useState<number>(100000);
  const [posActionPin, setPosActionPin] = useState<string>('');
  const [posActionState, setPosActionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [posActionMsg, setPosActionMsg] = useState<string>('');
  const [nfcWritePin, setNfcWritePin] = useState<string>('123456');

  // Menu Management States
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [adminProductsLoading, setAdminProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    id: '',
    category: 'espresso',
    nameVi: '',
    nameEn: '',
    nameKo: '',
    descVi: '',
    descEn: '',
    descKo: '',
    priceVND: 50000,
    priceKRW: 3000,
    priceUSD: 2.0,
    image: '☕',
    popular: false
  });

  // Data states
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [spendFilter, setSpendFilter] = useState('all');

  // Loading/Alert states
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch lists
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Analytics
      const analRes = await fetch(`${API_BASE_URL}/api/admin/analytics`);
      if (analRes.ok) {
        const analData = await analRes.json();
        setAnalytics(analData);
      }

      // 2. Fetch Customers
      const custUrl = `${API_BASE_URL}/api/admin/customers?search=${encodeURIComponent(searchTerm)}&tier=${tierFilter}&spend=${spendFilter}`;
      const custRes = await fetch(custUrl);
      if (custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData);
      }

      // 3. Fetch Education Consultations
      const eduRes = await fetch(`${API_BASE_URL}/api/admin/education-consultations`);
      if (eduRes.ok) {
        const eduData = await eduRes.json();
        setConsultations(eduData);
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setStatusMessage({ type: 'error', text: 'Không thể kết nối máy chủ quản trị.' });
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch on filter change
  useEffect(() => {
    fetchData();
  }, [searchTerm, tierFilter, spendFilter]);

  // Fetch customer details when selected
  useEffect(() => {
    if (!selectedCustomerId) {
      setCustomerDetail(null);
      return;
    }
    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/customers/${selectedCustomerId}`);
        if (res.ok) {
          const data = await res.json();
          setCustomerDetail(data);
        }
      } catch (err) {
        console.error("Failed to fetch customer details:", err);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [selectedCustomerId]);

  const fetchAdminProducts = async () => {
    try {
      setAdminProductsLoading(true);
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        setAdminProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin products:", err);
    } finally {
      setAdminProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'menu') {
      fetchAdminProducts();
    }
  }, [activeSubTab]);

  // Seed 50+ mock customers
  const handleSeedData = async () => {
    setSeeding(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/seed-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        fetchData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Lỗi khởi tạo dữ liệu.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Lỗi kết nối máy chủ.' });
    } finally {
      setSeeding(false);
    }
  };

  // Export filtered customers to JSON
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mellodi_customers_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getTierBadgeStyles = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Green':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-coffee-100 pb-5">
        <div>
          <h2 className="font-serif text-3xl font-bold text-coffee-950 flex items-center space-x-2">
            <BarChart2 className="w-8 h-8 text-coffee-800" />
            <span>{language === 'vi' ? 'Quản Trị Dữ Liệu Khách Hàng' : 'Customer CRM & Analytics'}</span>
          </h2>
          <p className="text-xs text-coffee-500 mt-1">Phân tích hành vi, doanh thu, tích điểm và quản lý tập trung hồ sơ khách hàng Mellodi.</p>
        </div>

        {/* Navigation sub-tabs */}
        <div className="flex bg-[#F3F0ED] p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => { setActiveSubTab('analytics'); setSelectedCustomerId(null); }}
            className={`flex-1 sm:flex-none px-5 py-2 text-center text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
              activeSubTab === 'analytics' ? 'bg-white text-coffee-950 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5 text-coffee-800" />
            {language === 'vi' ? 'Phân Tích Hệ Thống' : 'Platform Analytics'}
          </button>
          <button
            onClick={() => { setActiveSubTab('directory'); setSelectedCustomerId(null); }}
            className={`flex-1 sm:flex-none px-5 py-2 text-center text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
              activeSubTab === 'directory' ? 'bg-white text-coffee-950 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5 text-[#2D5A47]" />
            {language === 'vi' ? 'Danh Sách Khách Hàng' : 'Customer Directory'}
          </button>
          <button
            onClick={() => { setActiveSubTab('education'); setSelectedCustomerId(null); }}
            className={`flex-1 sm:flex-none px-5 py-2 text-center text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
              activeSubTab === 'education' ? 'bg-white text-coffee-950 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5 text-amber-700" />
            {language === 'vi' ? 'Đăng Ký Du Học' : 'Study Abroad'}
          </button>
          <button
            onClick={() => { setActiveSubTab('nfc'); setSelectedCustomerId(null); }}
            className={`flex-1 sm:flex-none px-5 py-2 text-center text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
              activeSubTab === 'nfc' ? 'bg-white text-coffee-950 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5 text-blue-600" />
            {language === 'vi' ? 'Trạm Thẻ NFC' : 'NFC Station'}
          </button>
          <button
            onClick={() => { setActiveSubTab('menu'); setSelectedCustomerId(null); }}
            className={`flex-1 sm:flex-none px-5 py-2 text-center text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
              activeSubTab === 'menu' ? 'bg-white text-coffee-950 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5 text-rose-600" />
            {language === 'vi' ? 'Thực Đơn & Khuyến Mãi' : 'Menu & Promos'}
          </button>
        </div>
      </div>

      {/* ALERTS */}
      <AnimatePresence mode="wait">
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl text-xs flex items-start space-x-2 border ${
              statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
            }`}
          >
            {statusMessage.type === 'success' ? <CheckCircle className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0" />}
            <span className="font-semibold">{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE VIEW */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-coffee-850 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-stone-500">Đang tải dữ liệu quản trị...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE: MAIN TABS */}
          <div className={`${selectedCustomerId ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
            
            {/* TAB 1: PLATFORM ANALYTICS */}
            {activeSubTab === 'analytics' && analytics && (
              <div className="space-y-6">
                
                {/* Stats Summary Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  {/* Revenue Card */}
                  <div className="bg-white p-5 rounded-2xl border border-coffee-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2D5A47] flex items-center justify-center mb-3">
                      <DollarSign className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wide">Tổng Doanh Thu</span>
                    <span className="text-lg font-black text-coffee-950 font-mono block mt-1">
                      {formatPrice(analytics.summary.totalRevenue)}
                    </span>
                  </div>

                  {/* Customers Card */}
                  <div className="bg-white p-5 rounded-2xl border border-coffee-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wide">Tổng Khách Hàng</span>
                    <span className="text-lg font-black text-coffee-950 font-mono block mt-1">
                      {analytics.summary.totalCustomers.toLocaleString()}
                    </span>
                  </div>

                  {/* Orders Card */}
                  <div className="bg-white p-5 rounded-2xl border border-coffee-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                      <ShoppingBag className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wide">Tổng Đơn Hàng</span>
                    <span className="text-lg font-black text-coffee-950 font-mono block mt-1">
                      {analytics.summary.totalOrders.toLocaleString()}
                    </span>
                  </div>

                  {/* Average Value Card */}
                  <div className="bg-white p-5 rounded-2xl border border-coffee-100 shadow-2xs">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-3">
                      <TrendingUp className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wide">Trung Bình Đơn (AOV)</span>
                    <span className="text-lg font-black text-coffee-950 font-mono block mt-1">
                      {formatPrice(analytics.summary.averageOrderValue)}
                    </span>
                  </div>

                </div>

                {/* Second Analytics Row: Seeder & Tier Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Seeder & Action Card */}
                  <div className="md:col-span-5 bg-gradient-to-br from-[#2D5A47] to-[#1E3F31] text-white p-6 rounded-3xl shadow-md flex flex-col justify-between relative overflow-hidden h-auto min-h-[220px]">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
                    <div className="space-y-2 relative z-10">
                      <span className="text-[9px] uppercase font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">Tự động hóa dữ liệu</span>
                      <h3 className="font-serif text-xl font-bold">Kiểm thử Dữ liệu lớn</h3>
                      <p className="text-[11px] text-white/75 leading-relaxed">
                        Bạn cần tập dữ liệu lớn để kiểm thử các bộ lọc và hành vi mua sắm? Nhấp nút bên dưới để tự động tạo 50+ khách hàng VIP giả lập kèm lịch sử giao dịch.
                      </p>
                    </div>

                    <button
                      onClick={handleSeedData}
                      disabled={seeding}
                      className="mt-6 w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-[#3E2723] text-xs font-bold rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {seeding ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang khởi tạo 50+ khách hàng...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 fill-current" />
                          <span>Khởi tạo 50+ Khách hàng Demo</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Tier Distribution Chart representation */}
                  <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-coffee-100 shadow-xs space-y-4">
                    <h3 className="font-serif text-sm font-bold text-coffee-950 flex items-center space-x-1.5">
                      <Award className="w-4.5 h-4.5 text-[#A37B45]" />
                      <span>Phân bổ Hạng thành viên</span>
                    </h3>
                    
                    <div className="space-y-3 pt-2">
                      {/* Mellodi Premium */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-stone-700">
                          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span>Hạng Mellodi Premium</span></span>
                          <span className="font-mono">{analytics.tierDistribution['Mellodi Premium']} ({Math.round((analytics.tierDistribution['Mellodi Premium'] / analytics.summary.totalCustomers) * 100) || 0}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${(analytics.tierDistribution['Mellodi Premium'] / analytics.summary.totalCustomers) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Mellodi Gold */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-stone-700">
                          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span><span>Hạng Mellodi Gold</span></span>
                          <span className="font-mono">{analytics.tierDistribution['Mellodi Gold']} ({Math.round((analytics.tierDistribution['Mellodi Gold'] / analytics.summary.totalCustomers) * 100) || 0}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600" style={{ width: `${(analytics.tierDistribution['Mellodi Gold'] / analytics.summary.totalCustomers) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Mellodi Basic */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-stone-700">
                          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-stone-500"></span><span>Hạng Mellodi Basic</span></span>
                          <span className="font-mono">{analytics.tierDistribution['Mellodi Basic']} ({Math.round((analytics.tierDistribution['Mellodi Basic'] / analytics.summary.totalCustomers) * 100) || 0}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-500" style={{ width: `${(analytics.tierDistribution['Mellodi Basic'] / analytics.summary.totalCustomers) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Top Selling Products list */}
                <div className="bg-white p-6 rounded-3xl border border-coffee-100 shadow-xs space-y-4">
                  <h3 className="font-serif text-sm font-bold text-coffee-950 flex items-center space-x-1.5">
                    <Coffee className="w-4.5 h-4.5 text-coffee-700" />
                    <span>Top 5 Món nước bán chạy nhất hệ thống</span>
                  </h3>

                  <div className="divide-y divide-stone-100">
                    {analytics.topProducts.map((p, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-serif font-black text-sm text-stone-400 w-4">{idx + 1}</span>
                          <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-lg">{p.image}</div>
                          <div>
                            <p className="text-xs font-bold text-coffee-950">{p.name}</p>
                            <p className="text-[10px] text-stone-400 font-mono">Đã bán: {p.count} cốc</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold font-mono text-coffee-900">{formatPrice(p.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: CUSTOMER DIRECTORY */}
            {activeSubTab === 'directory' && (
              <div className="bg-white rounded-3xl border border-coffee-100 shadow-xs p-6 space-y-6">
                
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 text-xs focus:ring-2 focus:ring-[#2D5A47] focus:border-transparent outline-none bg-stone-50"
                    />
                  </div>

                  {/* Tier Filter */}
                  <div className="flex gap-2">
                    <div className="relative">
                      <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={tierFilter}
                        onChange={(e) => setTierFilter(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-stone-50 border border-coffee-200 rounded-xl text-xs font-semibold text-coffee-850 focus:outline-hidden appearance-none cursor-pointer"
                      >
                         <option value="all">Hạng thành viên (Tất cả)</option>
                         <option value="Mellodi Basic">Hạng Mellodi Basic</option>
                         <option value="Mellodi Gold">Hạng Mellodi Gold</option>
                         <option value="Mellodi Premium">Hạng Mellodi Premium</option>
                      </select>
                    </div>

                    {/* Spend Filter */}
                    <div className="relative">
                      <select
                        value={spendFilter}
                        onChange={(e) => setSpendFilter(e.target.value)}
                        className="pl-4 pr-8 py-2.5 bg-stone-50 border border-coffee-200 rounded-xl text-xs font-semibold text-coffee-850 focus:outline-hidden appearance-none cursor-pointer"
                      >
                        <option value="all">Chi tiêu lũy kế (Tất cả)</option>
                        <option value="under100">Dưới 100k</option>
                        <option value="100to500">100k - 500k</option>
                        <option value="over500">Trên 500k</option>
                      </select>
                    </div>

                    {/* Export Button */}
                    <button
                      onClick={handleExportData}
                      title="Xuất báo cáo JSON"
                      className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl border border-stone-200 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Customers Directory Table */}
                <div className="overflow-x-auto border border-stone-100 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-400 font-bold border-b border-stone-100 uppercase tracking-wider">
                        <th className="p-4">Khách Hàng</th>
                        <th className="p-4">Hạng</th>
                        <th className="p-4 text-center">Số Đơn</th>
                        <th className="p-4 text-right">Chi Tiêu</th>
                        <th className="p-4 text-right">Món Ưa Thích</th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {customers.length > 0 ? (
                        customers.map((c) => (
                          <tr 
                            key={c.id} 
                            className={`hover:bg-stone-50/50 transition-colors cursor-pointer ${selectedCustomerId === c.id ? 'bg-emerald-50/20' : ''}`}
                            onClick={() => setSelectedCustomerId(c.id)}
                          >
                            <td className="p-4 space-y-0.5">
                              <p className="font-bold text-coffee-950">{c.name}</p>
                              <p className="text-[10px] text-stone-400 font-mono">{c.phone} | {c.email}</p>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getTierBadgeStyles(c.tier)}`}>
                                {c.tier}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono">{c.totalOrders}</td>
                            <td className="p-4 text-right font-mono font-bold text-[#2D5A47]">{formatPrice(c.totalSpent)}</td>
                            <td className="p-4 text-right font-semibold text-coffee-750">{c.favoriteDrink}</td>
                            <td className="p-4 text-right">
                              <ChevronRight className="w-4 h-4 text-stone-400 inline" />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-stone-400 font-semibold">
                            Không tìm thấy khách hàng nào khớp với bộ lọc.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* TAB 3: STUDY ABROAD CONSULTATIONS */}
            {activeSubTab === 'education' && (
              <div className="bg-white rounded-3xl border border-coffee-100 shadow-xs p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-coffee-950 flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5 text-amber-700" />
                      <span>Danh Sách Đăng Ký Tư Vấn Du Học</span>
                    </h3>
                    <p className="text-[10px] text-stone-400 mt-0.5">Tổng số lượt đăng ký từ Mellodi & J2H2 Global: {consultations.length} học viên</p>
                  </div>
                  <button 
                    onClick={fetchData}
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors cursor-pointer"
                    title="Làm mới"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Họ và tên</th>
                        <th className="py-3 px-4">Gmail</th>
                        <th className="py-3 px-4">Số điện thoại</th>
                        <th className="py-3 px-4">Ngày đăng ký</th>
                        <th className="py-3 px-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs font-semibold text-stone-600">
                      {consultations.length > 0 ? (
                        consultations.map((c) => (
                          <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                            <td className="py-3.5 px-4 text-coffee-950 font-bold">{c.name}</td>
                            <td className="py-3.5 px-4 font-mono text-stone-500">{c.email}</td>
                            <td className="py-3.5 px-4 font-mono text-stone-500">{c.phone}</td>
                            <td className="py-3.5 px-4 text-[11px] text-stone-400 font-mono">
                              {c.createdAt ? new Date(c.createdAt).toLocaleString() : 'N/A'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-850 border border-amber-100">
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-stone-400 font-medium">
                            Chưa có dữ liệu đăng ký tư vấn du học nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: NFC CARD STATION */}
            {activeSubTab === 'nfc' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Column 1: Issue/Link Card */}
                  <div className="bg-white rounded-3xl border border-coffee-100 shadow-xs p-6 space-y-4 text-left">
                    <h3 className="font-serif text-sm font-bold text-coffee-950 flex items-center space-x-2">
                      <Plus className="w-4.5 h-4.5 text-[#2D5A47]" />
                      <span>Phát hành & Ghi thẻ thành viên NFC</span>
                    </h3>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Thiết lập bản ghi NDEF cho chip **NTAG215** và liên kết với tài khoản khách hàng trong cơ sở dữ liệu.
                    </p>

                    <div className="space-y-4 pt-2">
                      {/* Customer Selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Chọn khách hàng nhận thẻ</label>
                        <select
                          value={nfcSelectedCustomerId}
                          onChange={(e) => {
                            setNfcSelectedCustomerId(e.target.value);
                            if (!nfcWriteCardId) {
                              const randomUid = '04:' + Array.from({length: 6}, () => Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase()).join(':');
                              setNfcWriteCardId(randomUid);
                            }
                          }}
                          className="w-full px-3 py-2 bg-stone-55 border border-coffee-200 rounded-xl text-xs font-semibold focus:outline-hidden text-stone-900"
                        >
                          <option value="">-- Chọn khách hàng --</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.phone}) - {c.nfcCard ? `Đã có thẻ ${c.nfcCard.cardId}` : 'Chưa có thẻ'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Card ID Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Mã UID Thẻ (7-Byte NTAG215)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={nfcWriteCardId}
                            onChange={(e) => setNfcWriteCardId(e.target.value)}
                            placeholder="04:XX:XX:XX:XX:XX:XX"
                            className="flex-1 px-3 py-2 bg-stone-55 border border-coffee-200 rounded-xl text-xs font-mono font-bold text-stone-900"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const randomUid = '04:' + Array.from({length: 6}, () => Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase()).join(':');
                              setNfcWriteCardId(randomUid);
                            }}
                            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-[10px] font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Tạo mã UID
                          </button>
                        </div>
                      </div>

                      {/* Card PIN Input */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Thiết lập mã PIN thẻ (6 chữ số)</label>
                        <input
                          type="password"
                          maxLength={6}
                          value={nfcWritePin}
                          onChange={(e) => setNfcWritePin(e.target.value.replace(/\D/g, ''))}
                          placeholder="Mặc định: 123456"
                          className="w-full px-3 py-2 bg-stone-55 border border-coffee-200 rounded-xl text-xs font-mono font-bold text-stone-900"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={!nfcSelectedCustomerId || !nfcWriteCardId || nfcWriteState === 'writing'}
                        onClick={async () => {
                          if (!nfcSelectedCustomerId || !nfcWriteCardId) return;
                          setNfcWriteState('writing');
                          setNfcWriteLogs([]);
                          const addLog = (msg: string) => setNfcWriteLogs(prev => [...prev, msg]);

                          addLog("⚡ [Hardware] Kết nối đầu đọc NFC USB ACR122U...");
                          await new Promise(r => setTimeout(r, 600));
                          addLog("📡 [NFC] Phát hiện chip NTAG215 (HF 13.56 MHz)...");
                          await new Promise(r => setTimeout(r, 600));
                          addLog(`✍️ [NFC] Tiến hành ghi chuỗi NDEF: https://mellodi.vn/card/${nfcWriteCardId}`);
                          await new Promise(r => setTimeout(r, 750));
                          addLog("🔐 [NFC] Ghi khóa mật khẩu bảo mật ghi (Static Protection)...");
                          await new Promise(r => setTimeout(r, 550));
                          addLog("🌐 [Database] Đồng bộ hóa thông tin thẻ lên máy chủ Mellodi CRM...");
                          await new Promise(r => setTimeout(r, 800));

                          try {
                            const response = await fetch(`${API_BASE_URL}/api/users/nfc/link`, {
                              method: 'POST',
                              headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('mellodi_jwt_token')}`
                              },
                              body: JSON.stringify({
                                userId: nfcSelectedCustomerId,
                                cardId: nfcWriteCardId,
                                pin: nfcWritePin
                              })
                            });
                            const data = await response.json();
                            if (response.ok) {
                              addLog("✅ [CRM] Liên kết thẻ thành viên NFC thành công!");
                              if (data.user?.nfcCard?.loginToken) {
                                addLog(`📝 [NFC] Đã ghi URL tự động đăng nhập: ${window.location.origin}/?nfc_token=${data.user.nfcCard.loginToken}`);
                              }
                              setNfcWriteState('success');
                              setNfcWriteMsg(`Đã cấp thẻ NFC ${nfcWriteCardId} cho khách hàng thành công.`);
                              fetchData(); // Reload customer list
                            } else {
                              addLog(`❌ [CRM] Thất bại: ${data.error}`);
                              setNfcWriteState('error');
                              setNfcWriteMsg(data.error);
                            }
                          } catch (err) {
                            addLog("❌ [Network] Không thể kết nối với API.");
                            setNfcWriteState('error');
                            setNfcWriteMsg("Lỗi kết nối máy chủ!");
                          }
                        }}
                        className="w-full py-2.5 bg-[#2D5A47] hover:bg-[#1E3F31] disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{nfcWriteState === 'writing' ? 'Đang thực hiện ghi thẻ...' : 'Ghi & Liên kết Thẻ NFC'}</span>
                      </button>

                      {/* Write Logs */}
                      {nfcWriteLogs.length > 0 && (
                        <div className="bg-stone-950 text-stone-300 p-3 rounded-xl border border-stone-850 font-mono text-[9px] space-y-1 max-h-[120px] overflow-y-auto">
                          {nfcWriteLogs.map((log, idx) => (
                            <div key={idx} className={log.startsWith('✅') ? 'text-emerald-400 font-bold' : log.startsWith('❌') ? 'text-rose-400 font-bold' : ''}>
                              {log}
                            </div>
                          ))}
                        </div>
                      )}

                      {nfcWriteState === 'success' && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[11px] font-semibold text-center">
                          {nfcWriteMsg}
                        </div>
                      )}

                      {nfcWriteState === 'error' && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] font-semibold text-center">
                          {nfcWriteMsg}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: POS Terminal Simulator */}
                  <div className="bg-white rounded-3xl border border-coffee-100 shadow-xs p-6 space-y-4 text-left">
                    <h3 className="font-serif text-sm font-bold text-coffee-950 flex items-center space-x-2">
                      <Smartphone className="w-4.5 h-4.5 text-[#A37B45]" />
                      <span>Đầu đọc thẻ NFC tại Quầy (POS Terminal)</span>
                    </h3>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      Chạm thẻ thành viên vật lý của khách hàng để nhận diện, thanh toán bằng ví, nạp tiền hoặc tích điểm.
                    </p>

                    <div className="space-y-4 pt-2">
                      {/* Select card in system */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">Chọn thẻ NFC khách hàng đang chạm</label>
                        <select
                          value={posScanCardId}
                          onChange={(e) => {
                            setPosScanCardId(e.target.value);
                            setPosScannedUser(null);
                            setPosScanState('idle');
                            setPosScanLogs([]);
                          }}
                          className="w-full px-3 py-2 bg-stone-55 border border-coffee-200 rounded-xl text-xs font-semibold focus:outline-hidden text-stone-900"
                        >
                          <option value="">-- Chọn thẻ NFC để chạm --</option>
                          {customers.filter(c => c.nfcCard).map(c => (
                            <option key={c.id} value={c.nfcCard!.cardId}>
                              Thẻ của: {c.name} (UID: {c.nfcCard!.cardId}) - {c.nfcCard!.status === 'active' ? 'Active' : 'Locked'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={!posScanCardId || posScanState === 'reading'}
                        onClick={async () => {
                          if (!posScanCardId) return;
                          setPosScanState('reading');
                          setPosScanLogs([]);
                          setPosScannedUser(null);
                          const addLog = (msg: string) => setPosScanLogs(prev => [...prev, msg]);

                          addLog("📡 [POS] Đầu đọc NFC đang phát trường sóng vô tuyến...");
                          await new Promise(r => setTimeout(r, 500));
                          
                          const matchedCustomer = customers.find(c => c.nfcCard?.cardId === posScanCardId);
                          if (!matchedCustomer || !matchedCustomer.nfcCard) {
                            addLog("❌ [NFC] Không nhận diện được cấu trúc thẻ.");
                            setPosScanState('error');
                            setPosScanMsg("Thẻ không hợp lệ.");
                            return;
                          }

                          addLog(`📖 [NFC] Đã đọc ID thẻ: ${posScanCardId}`);
                          await new Promise(r => setTimeout(r, 500));

                          const timestamp = Date.now();
                          addLog(`⏱️ [NFC] Tạo dấu thời gian giao dịch: ${timestamp}`);
                          await new Promise(r => setTimeout(r, 400));

                          addLog("🔐 [NFC] Tính toán chữ ký động HMAC-SHA256...");
                          const signature = await generateHmacSignature(matchedCustomer.nfcCard.secretKey, timestamp.toString());
                          addLog(`🔑 [NFC] Chữ ký bảo mật: ${signature.substring(0, 16)}...`);
                          await new Promise(r => setTimeout(r, 600));

                          addLog("🌐 [POS] Gửi yêu cầu xác thực bảo mật lên Server...");
                          await new Promise(r => setTimeout(r, 700));

                          try {
                            const response = await fetch(`${API_BASE_URL}/api/users/nfc/verify`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                cardId: posScanCardId,
                                timestamp,
                                signature
                              })
                            });
                            const data = await response.json();
                            if (response.ok) {
                              addLog("✅ [Server] Xác thực thành công! Khớp chữ ký số.");
                              setPosScanState('success');
                              setPosScannedUser(data.user);
                            } else {
                              addLog(`❌ [Server] Bị từ chối: ${data.error}`);
                              setPosScanState('error');
                              setPosScanMsg(data.error);
                            }
                          } catch (err) {
                            addLog("❌ [Network] Lỗi kết nối mạng.");
                            setPosScanState('error');
                            setPosScanMsg("Lỗi kết nối máy chủ!");
                          }
                        }}
                        className="w-full py-2.5 bg-coffee-850 hover:bg-coffee-900 disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Wifi className="w-4 h-4 rotate-90" />
                        <span>{posScanState === 'reading' ? 'Đang đọc thẻ...' : 'Chạm thẻ (Simulate Tap)'}</span>
                      </button>

                      {/* Scan Logs */}
                      {posScanLogs.length > 0 && (
                        <div className="bg-stone-950 text-stone-300 p-3 rounded-xl border border-stone-850 font-mono text-[9px] space-y-1 max-h-[120px] overflow-y-auto">
                          {posScanLogs.map((log, idx) => (
                            <div key={idx} className={log.startsWith('✅') ? 'text-emerald-400 font-bold' : log.startsWith('❌') ? 'text-rose-400 font-bold' : ''}>
                              {log}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Display Scanned User Profile & Quick Actions */}
                      {posScanState === 'success' && posScannedUser && (
                        <div className="border border-emerald-150 bg-emerald-50/10 rounded-2xl p-4 space-y-4">
                          <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                            <div>
                              <h4 className="text-xs font-bold text-coffee-950">{posScannedUser.name}</h4>
                              <p className="text-[9px] text-stone-550 font-mono">Hạng: {posScannedUser.tier}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-coffee-950 font-mono block">{formatPrice(posScannedUser.walletBalance)}</span>
                              <span className="text-[8px] text-stone-450 font-mono block">{posScannedUser.lenPoints.toLocaleString()} LEN</span>
                            </div>
                          </div>

                          {/* Quick POS Transaction Form */}
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              {/* Action Type */}
                              <div className="flex-1">
                                <label className="text-[8px] font-bold text-stone-450 uppercase tracking-wider block mb-1">Loại giao dịch</label>
                                <select
                                  value={posActionType}
                                  onChange={(e: any) => {
                                    setPosActionType(e.target.value);
                                    setPosActionState('idle');
                                    setPosActionMsg('');
                                  }}
                                  className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-[11px] font-bold text-stone-800"
                                >
                                  <option value="pay">Thanh toán trừ ví (NFC Pay)</option>
                                  <option value="topup">Nạp tiền mặt tại quầy (Topup)</option>
                                </select>
                              </div>

                              {/* Amount */}
                              <div className="w-28">
                                <label className="text-[8px] font-bold text-stone-450 uppercase tracking-wider block mb-1">Số tiền (VND)</label>
                                <input
                                  type="number"
                                  value={posActionAmount}
                                  onChange={(e) => setPosActionAmount(Number(e.target.value))}
                                  className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-[11px] font-mono font-bold text-stone-800"
                                />
                              </div>
                            </div>

                            {/* PIN Code Input for Payment */}
                            {posActionType === 'pay' && (
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-[#4E342E] uppercase tracking-wider block">Mã PIN xác thực thẻ (Khách hàng đọc PIN)</label>
                                <input
                                  type="password"
                                  maxLength={6}
                                  value={posActionPin}
                                  onChange={(e) => setPosActionPin(e.target.value.replace(/\D/g, ''))}
                                  placeholder="Nhập 6 chữ số PIN..."
                                  className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono font-bold text-stone-900 focus:outline-hidden"
                                />
                              </div>
                            )}

                            <button
                              type="button"
                              disabled={posActionState === 'loading' || posActionAmount <= 0}
                              onClick={async () => {
                                setPosActionState('loading');
                                setPosActionMsg('');
                                
                                const timestamp = Date.now();
                                const amount = posActionAmount;
                                const endpoint = posActionType === 'pay' ? '/api/users/nfc/pay' : '/api/users/nfc/topup';
                                const messageToSign = `${timestamp}-${amount}`;
                                
                                try {
                                  const signature = await generateHmacSignature(posScannedUser.nfcCard.secretKey, messageToSign);
                                  
                                  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      cardId: posScanCardId,
                                      amountVND: amount,
                                      timestamp,
                                      signature,
                                      pin: posActionPin
                                    })
                                  });
                                  const data = await response.json();
                                  if (response.ok) {
                                    setPosActionState('success');
                                    setPosActionMsg(posActionType === 'pay' 
                                      ? `Thanh toán thành công! Trừ -${amount.toLocaleString()}đ (Đã cộng 10% LEN)` 
                                      : `Nạp tiền thành công! Cộng +${amount.toLocaleString()}đ (Đã cộng 10% LEN)`);
                                    setPosScannedUser(data.user);
                                    fetchData(); // Refresh list
                                  } else {
                                    setPosActionState('error');
                                    setPosActionMsg(data.error);
                                  }
                                } catch (err) {
                                  setPosActionState('error');
                                  setPosActionMsg('Lỗi kết nối máy chủ!');
                                }
                              }}
                              className="w-full py-2 bg-[#2D5A47] hover:bg-[#1E3F31] disabled:bg-stone-200 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                            >
                              <span>{posActionState === 'loading' ? 'Đang thực hiện...' : 'Xác nhận giao dịch'}</span>
                            </button>

                            {posActionMsg && (
                              <div className={`p-2 rounded-lg text-[10px] font-semibold text-center ${
                                posActionState === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                              }`}>
                                {posActionMsg}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 5: MENU & PROMOTION MANAGEMENT */}
            {activeSubTab === 'menu' && (
              <div className="space-y-6">
                
                {/* MENU MANAGEMENT SECTION */}
                <div className="bg-white rounded-3xl border border-coffee-100 shadow-xs p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-4">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-coffee-950 flex items-center space-x-2">
                        <Coffee className="w-5 h-5 text-rose-600" />
                        <span>Quản Lý Thực Đơn (Menu Editor)</span>
                      </h3>
                      <p className="text-[10px] text-stone-400 mt-0.5">Thay đổi giá cả, thêm/bớt món trực tiếp trên hệ thống đặt hàng.</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        const randomId = 'prod-' + Math.random().toString(36).substring(2, 7);
                        setNewProductForm({
                          id: randomId,
                          category: 'espresso',
                          nameVi: '',
                          nameEn: '',
                          nameKo: '',
                          descVi: '',
                          descEn: '',
                          descKo: '',
                          priceVND: 50000,
                          priceKRW: 3000,
                          priceUSD: 2.0,
                          image: '☕',
                          popular: false
                        });
                        setShowAddProductModal(true);
                      }}
                      className="px-4 py-2 bg-[#2D5A47] hover:bg-[#1E3F31] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm món mới</span>
                    </button>
                  </div>

                  {adminProductsLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            <th className="py-3 px-2">Hình</th>
                            <th className="py-3 px-2">Tên Món (VI / EN)</th>
                            <th className="py-3 px-2">Danh mục</th>
                            <th className="py-3 px-2 text-right">Giá VND</th>
                            <th className="py-3 px-2 text-right">Giá USD</th>
                            <th className="py-3 px-2 text-center">Bán chạy</th>
                            <th className="py-3 px-2 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-xs font-semibold text-stone-605">
                          {adminProducts.map((prod) => (
                            <tr key={prod.id} className="hover:bg-stone-50/50 transition-colors">
                              <td className="py-3 px-2 text-xl">{prod.image || '☕'}</td>
                              <td className="py-3 px-2">
                                <div className="font-serif font-bold text-coffee-950">{prod.name.vi}</div>
                                <div className="text-[10px] text-stone-400 font-mono">{prod.name.en}</div>
                              </td>
                              <td className="py-3 px-2 uppercase text-[10px] font-mono text-stone-500">{prod.category}</td>
                              <td className="py-3 px-2 text-right font-mono text-emerald-800">{prod.priceVND.toLocaleString()}đ</td>
                              <td className="py-3 px-2 text-right font-mono text-stone-500">${prod.priceUSD.toFixed(2)}</td>
                              <td className="py-3 px-2 text-center">
                                {prod.popular ? (
                                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500" title="Bán chạy"></span>
                                ) : (
                                  <span className="inline-block w-2 h-2 rounded-full bg-stone-200"></span>
                                )}
                              </td>
                              <td className="py-3 px-2 text-right space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                  }}
                                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm(`Bạn có chắc muốn xóa món "${prod.name.vi}" khỏi thực đơn không?`)) {
                                      try {
                                        const res = await fetch(`${API_BASE_URL}/api/admin/products/${prod.id}`, {
                                          method: 'DELETE',
                                          headers: { 'Authorization': `Bearer ${localStorage.getItem('mellodi_jwt_token')}` }
                                        });
                                        if (res.ok) {
                                          alert("Đã xóa món thành công!");
                                          fetchAdminProducts();
                                        } else {
                                          const data = await res.json();
                                          alert(data.error);
                                        }
                                      } catch (err) {
                                        alert("Lỗi kết nối máy chủ!");
                                      }
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  Xóa
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* PROMOTION / PROGRAM MANAGEMENT SECTION */}
                <div className="bg-white rounded-3xl border border-coffee-100 shadow-xs p-6 space-y-4 text-left">
                  <h3 className="font-serif text-sm font-bold text-coffee-950 flex items-center space-x-2">
                    <Tag className="w-4.5 h-4.5 text-[#2D5A47]" />
                    <span>Quản Lý Chương Trình Khuyến Mãi (Promotions)</span>
                  </h3>
                  <p className="text-[11px] text-stone-550 leading-relaxed">
                    Cấu hình và cập nhật các mã giảm giá đặc quyền tại quán Mellodi. Khách hàng sẽ thấy các ưu đãi này trực tiếp trong ví voucher của họ.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 border border-stone-200 rounded-2xl bg-stone-50/40">
                      <h4 className="text-xs font-bold text-coffee-950 flex items-center"><Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" /> Voucher Bạn Mới (20%)</h4>
                      <p className="text-[10px] text-stone-450 mt-1">Voucher giảm 20% tự động phát hành cho tất cả khách hàng khi đăng ký tài khoản thành viên lần đầu.</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-bold rounded-lg uppercase">Đang hoạt động</span>
                    </div>
                    <div className="p-4 border border-stone-200 rounded-2xl bg-stone-50/40">
                      <h4 className="text-xs font-bold text-coffee-950 flex items-center"><ShieldCheck className="w-3.5 h-3.5 text-blue-500 mr-1" /> Điểm Tích Lũy 10%</h4>
                      <p className="text-[10px] text-stone-450 mt-1">Hoàn trả 10% giá trị hóa đơn dưới dạng điểm LEN cho mọi giao dịch thanh toán bằng thẻ NFC.</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[9px] font-bold rounded-lg uppercase">Đang hoạt động</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: CUSTOMER 360° PROFILE */}
          <AnimatePresence>
            {selectedCustomerId && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-6 space-y-6"
              >
                {detailLoading ? (
                  <div className="bg-white rounded-3xl border border-coffee-100 shadow-xs p-6 py-24 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-3 border-emerald-750 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-stone-400">Đang truy xuất hồ sơ 360°...</span>
                  </div>
                ) : customerDetail ? (
                  <div className="space-y-6">
                    
                    {/* Back header for mobile */}
                    <div className="flex justify-between items-center bg-white rounded-2xl p-4 border border-coffee-100 shadow-2xs">
                      <button
                        onClick={() => setSelectedCustomerId(null)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Đóng hồ sơ</span>
                      </button>
                      <span className="text-xs font-bold font-mono text-stone-400">HỒ SƠ KHÁCH HÀNG 360°</span>
                    </div>

                    {/* Customer Info VIP Card */}
                    <div className="bg-white rounded-3xl border border-coffee-100 shadow-sm p-6 space-y-5">
                      {/* Name & Tier header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-coffee-950">{customerDetail.user.name}</h3>
                          <p className="text-xs text-stone-400 font-mono mt-0.5">ID: {customerDetail.user.id.toUpperCase()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTierBadgeStyles(customerDetail.user.tier)}`}>
                          Hạng {customerDetail.user.tier}
                        </span>
                      </div>

                      {/* Contact sheet */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-stone-600 bg-[#FAF9F6] p-4 rounded-2xl border border-stone-200/40">
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase">Số điện thoại</span>
                          <span className="text-coffee-950 font-mono">{customerDetail.user.phone}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase">Địa chỉ Email</span>
                          <span className="text-coffee-950 font-mono truncate block">{customerDetail.user.email}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase">Gia nhập hệ thống</span>
                          <span className="text-coffee-950 flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-stone-400" />
                            <span>{new Date(customerDetail.user.createdAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase">Số dư Ví / Điểm LEN</span>
                          <span className="text-coffee-950 font-mono">
                            {formatPrice(customerDetail.user.walletBalance)} / {customerDetail.user.lenPoints.toLocaleString()} PTS
                          </span>
                        </div>
                      </div>

                      {/* Aggregate Metrics cards */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 border border-stone-100 rounded-xl bg-stone-50/50">
                          <span className="text-[9px] text-stone-400 block uppercase">Tổng Chi Tiêu</span>
                          <span className="text-xs font-black font-mono text-[#2D5A47] block mt-1">{formatPrice(customerDetail.stats.totalSpent)}</span>
                        </div>
                        <div className="p-3 border border-stone-100 rounded-xl bg-stone-50/50">
                          <span className="text-[9px] text-stone-400 block uppercase">Tổng Đơn Hàng</span>
                          <span className="text-xs font-black font-mono text-coffee-950 block mt-1">{customerDetail.stats.totalOrders} đơn</span>
                        </div>
                        <div className="p-3 border border-stone-100 rounded-xl bg-stone-50/50">
                          <span className="text-[9px] text-stone-400 block uppercase">Giá Trị Đơn (AOV)</span>
                          <span className="text-xs font-black font-mono text-coffee-950 block mt-1">{formatPrice(customerDetail.stats.averageOrderValue)}</span>
                        </div>
                      </div>

                      {/* Role Management (Only Admin can change roles) */}
                      {currentUser?.role === 'admin' && (
                        <div className="pt-4 border-t border-stone-100 space-y-2">
                          <label className="text-[10px] font-bold text-[#4E342E] uppercase tracking-wider block">Phân Quyền Vai Trò Thành Viên</label>
                          <div className="flex gap-2">
                            <select
                              value={customerDetail.user.role || 'customer'}
                              onChange={async (e) => {
                                const newRole = e.target.value;
                                try {
                                  const res = await fetch(`${API_BASE_URL}/api/admin/change-role`, {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('mellodi_jwt_token')}`
                                    },
                                    body: JSON.stringify({
                                      userId: customerDetail.user.id,
                                      newRole
                                    })
                                  });
                                  const data = await res.json();
                                  if (res.ok) {
                                    alert(`Đã cập nhật vai trò của ${customerDetail.user.name} thành: ${newRole === 'admin' ? 'Admin' : newRole === 'manager' ? 'Quản trị viên' : 'Thành viên'}`);
                                    // Refresh details
                                    const detailRes = await fetch(`${API_BASE_URL}/api/admin/customers/${customerDetail.user.id}`, {
                                      headers: { 'Authorization': `Bearer ${localStorage.getItem('mellodi_jwt_token')}` }
                                    });
                                    if (detailRes.ok) {
                                      const detailData = await detailRes.json();
                                      setCustomerDetail(detailData);
                                    }
                                    fetchData(); // Refresh list
                                  } else {
                                    alert(data.error);
                                  }
                                } catch (err) {
                                  alert('Lỗi kết nối máy chủ!');
                                }
                              }}
                              disabled={customerDetail.user.id === 'u-admin'}
                              className="flex-1 px-3 py-2 bg-stone-55 border border-coffee-200 rounded-xl text-xs font-semibold focus:outline-hidden text-stone-900 cursor-pointer"
                            >
                              <option value="customer">Thành viên (Customer)</option>
                              <option value="manager">Quản trị viên (Manager)</option>
                              <option value="admin">Admin tối cao (Admin)</option>
                            </select>
                            {customerDetail.user.id === 'u-admin' && (
                              <span className="text-[10px] text-rose-500 font-bold flex items-center">Tài khoản Admin gốc</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* NFC Card Status Management */}
                      {customerDetail.user.nfcCard && (
                        <div className="pt-4 border-t border-stone-100 space-y-2">
                          <label className="text-[10px] font-bold text-[#4E342E] uppercase tracking-wider block">
                            {language === 'vi' ? 'Quản lý Thẻ NFC' : language === 'ko' ? 'NFC 카드 관리' : 'NFC Card Management'}
                          </label>
                          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/40 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-stone-400 block font-mono">UID: {customerDetail.user.nfcCard.cardId}</span>
                                <div className="flex items-center space-x-1.5 mt-1">
                                  <span className={`inline-block w-2 h-2 rounded-full ${customerDetail.user.nfcCard.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                  <span className="text-xs font-bold text-stone-700">
                                    {customerDetail.user.nfcCard.status === 'active'
                                      ? (language === 'vi' ? 'Đang hoạt động' : language === 'ko' ? '활성' : 'Active')
                                      : (language === 'vi' ? 'Đã khóa tạm thời' : language === 'ko' ? '일시 정지됨' : 'Suspended')}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Lock / Unlock toggle */}
                              <button
                                type="button"
                                onClick={async () => {
                                  const newStatus = customerDetail.user.nfcCard!.status === 'active' ? 'suspended' : 'active';
                                  const confirmMsg = newStatus === 'suspended'
                                    ? (language === 'vi' ? 'Bạn có chắc chắn muốn KHÓA TẠM THỜI thẻ NFC này? Khách hàng sẽ không thể thanh toán bằng thẻ này cho đến khi được mở khóa lại.' : 'Are you sure you want to TEMPORARILY LOCK this NFC card?')
                                    : (language === 'vi' ? 'Bạn có chắc chắn muốn KÍCH HOẠT LẠI thẻ NFC này?' : 'Are you sure you want to RE-ACTIVATE this NFC card?');
                                  
                                  if (!confirm(confirmMsg)) return;

                                  try {
                                    const res = await fetch(`${API_BASE_URL}/api/admin/nfc/toggle-status`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('mellodi_jwt_token')}`
                                      },
                                      body: JSON.stringify({
                                        userId: customerDetail.user.id,
                                        cardId: customerDetail.user.nfcCard!.cardId,
                                        status: newStatus
                                      })
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                      alert(newStatus === 'suspended'
                                        ? (language === 'vi' ? 'Đã khóa thẻ NFC tạm thời thành công!' : 'NFC card locked successfully!')
                                        : (language === 'vi' ? 'Đã kích hoạt lại thẻ NFC thành công!' : 'NFC card activated successfully!'));
                                      const detailRes = await fetch(`${API_BASE_URL}/api/admin/customers/${customerDetail.user.id}`, {
                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('mellodi_jwt_token')}` }
                                      });
                                      if (detailRes.ok) setCustomerDetail(await detailRes.json());
                                      fetchData();
                                    } else {
                                      alert(data.error);
                                    }
                                  } catch (err) {
                                    alert(language === 'vi' ? 'Lỗi kết nối máy chủ!' : 'Server connection error!');
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                                  customerDetail.user.nfcCard.status === 'active'
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100'
                                }`}
                              >
                                {customerDetail.user.nfcCard.status === 'active'
                                  ? (language === 'vi' ? 'Khóa thẻ' : language === 'ko' ? '카드 잠금' : 'Lock Card')
                                  : (language === 'vi' ? 'Mở khóa' : language === 'ko' ? '잠금 해제' : 'Unlock')}
                              </button>
                            </div>

                            {/* Divider + Revoke button */}
                            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                              <span className="text-[10px] text-stone-400 font-semibold">
                                {language === 'vi' ? 'Thu hồi thẻ vĩnh viễn sẽ xóa toàn bộ liên kết.' : 'Revoking permanently removes the card link.'}
                              </span>
                              <button
                                type="button"
                                onClick={async () => {
                                  const confirmMsg = language === 'vi'
                                    ? `Bạn có chắc chắn muốn THU HỒI VĨNH VIỄN thẻ NFC (UID: ${customerDetail.user.nfcCard!.cardId}) của khách hàng này? Hành động này không thể hoàn tác.`
                                    : `Are you sure you want to PERMANENTLY REVOKE this NFC card? This cannot be undone.`;

                                  if (!confirm(confirmMsg)) return;

                                  try {
                                    const res = await fetch(`${API_BASE_URL}/api/users/nfc/unlink`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('mellodi_jwt_token')}`
                                      },
                                      body: JSON.stringify({
                                        userId: customerDetail.user.id,
                                        cardId: customerDetail.user.nfcCard!.cardId
                                      })
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                      alert(language === 'vi' ? 'Đã thu hồi thẻ NFC thành công!' : 'NFC card revoked successfully!');
                                      const detailRes = await fetch(`${API_BASE_URL}/api/admin/customers/${customerDetail.user.id}`, {
                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('mellodi_jwt_token')}` }
                                      });
                                      if (detailRes.ok) setCustomerDetail(await detailRes.json());
                                      fetchData();
                                    } else {
                                      alert(data.error);
                                    }
                                  } catch (err) {
                                    alert(language === 'vi' ? 'Lỗi kết nối máy chủ!' : 'Server connection error!');
                                  }
                                }}
                                className="px-3 py-1.5 bg-stone-900 hover:bg-red-900 text-white rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1"
                              >
                                <X className="w-3 h-3" />
                                <span>{language === 'vi' ? 'Thu hồi thẻ' : language === 'ko' ? '카드 회수' : 'Revoke Card'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Drink Preferences */}
                    <div className="bg-white rounded-3xl border border-coffee-100 shadow-xs p-6 space-y-4">
                      <h4 className="font-serif text-xs font-bold text-coffee-950 flex items-center space-x-1">
                        <Coffee className="w-4 h-4 text-[#A37B45]" />
                        <span>Danh mục đồ uống yêu thích của khách hàng</span>
                      </h4>

                      <div className="space-y-3">
                        {customerDetail.preferences.length > 0 ? (
                          customerDetail.preferences.slice(0, 3).map((pref, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold text-stone-700">
                                <span>{pref.name}</span>
                                <span className="font-mono text-stone-500">{pref.count} lần gọi</span>
                              </div>
                              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#A37B45] rounded-full" 
                                  style={{ width: `${(pref.count / customerDetail.stats.totalOrders) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-stone-400 text-center py-2">Chưa có dữ liệu đồ uống.</p>
                        )}
                      </div>
                    </div>

                    {/* Customer Purchase & Wallet Histories */}
                    <div className="bg-white rounded-3xl border border-coffee-100 shadow-xs p-6 space-y-4">
                      <h4 className="font-serif text-xs font-bold text-coffee-950 flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-[#2D5A47]" />
                        <span>Lịch sử giao dịch gần đây</span>
                      </h4>

                      {/* List of Orders */}
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {customerDetail.orders.length > 0 ? (
                          customerDetail.orders.map((o, idx) => (
                            <div key={idx} className="p-3 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors text-xs font-semibold flex justify-between items-center">
                              <div className="space-y-0.5">
                                <p className="font-mono font-bold text-coffee-950">{o.id}</p>
                                <p className="text-[10px] text-stone-400">{o.date}</p>
                                <p className="text-[10px] text-stone-500 font-serif">
                                  {o.items.map((item: any) => `${item.quantity}x ${item.product.name.vi} (${item.size})`).join(', ')}
                                </p>
                              </div>
                              <div className="text-right space-y-0.5">
                                <span className="font-mono text-[#2D5A47] font-bold">{formatPrice(o.totalPrice)}</span>
                                <span className="block text-[8px] uppercase font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 text-center mt-1">{o.status}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-stone-400 text-center py-4">Khách hàng chưa thực hiện đơn đặt hàng nào.</p>
                        )}
                      </div>
                    </div>

                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl border border-stone-250 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowAddProductModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-stone-100 text-stone-450 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-coffee-950 mb-4 text-left">Thêm Món Mới Vào Thực Đơn</h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('mellodi_jwt_token')}`
                      },
                      body: JSON.stringify({
                        id: newProductForm.id,
                        category: newProductForm.category,
                        name: {
                          vi: newProductForm.nameVi,
                          en: newProductForm.nameEn,
                          ko: newProductForm.nameKo || newProductForm.nameEn
                        },
                        description: {
                          vi: newProductForm.descVi,
                          en: newProductForm.descEn,
                          ko: newProductForm.descKo || newProductForm.descEn
                        },
                        priceVND: Number(newProductForm.priceVND),
                        priceKRW: Number(newProductForm.priceKRW),
                        priceUSD: Number(newProductForm.priceUSD),
                        image: newProductForm.image,
                        popular: newProductForm.popular
                      })
                    });
                    if (res.ok) {
                      alert("Thêm món mới thành công!");
                      setShowAddProductModal(false);
                      fetchAdminProducts();
                    } else {
                      const data = await res.json();
                      alert(data.error);
                    }
                  } catch (err) {
                    alert("Lỗi kết nối máy chủ!");
                  }
                }}
                className="space-y-4 text-left"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 block">MÃ SẢN PHẨM *</label>
                    <input
                      type="text"
                      required
                      value={newProductForm.id}
                      onChange={(e) => setNewProductForm({...newProductForm, id: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 block">DANH MỤC *</label>
                    <select
                      value={newProductForm.category}
                      onChange={(e) => setNewProductForm({...newProductForm, category: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-bold text-stone-900"
                    >
                      <option value="espresso">Cà phê Ý (Espresso)</option>
                      <option value="brewed">Cà phê Phin (Brewed)</option>
                      <option value="coldbrew">Cà phê Lạnh (Cold Brew)</option>
                      <option value="tea">Trà & Trái cây (Tea)</option>
                      <option value="pastry">Bánh & Tráng miệng (Pastry)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 block">TÊN MÓN (TIẾNG VIỆT) *</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.nameVi}
                    onChange={(e) => setNewProductForm({...newProductForm, nameVi: e.target.value})}
                    className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 block">TÊN MÓN (TIẾNG ANH) *</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.nameEn}
                    onChange={(e) => setNewProductForm({...newProductForm, nameEn: e.target.value})}
                    className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 block">GIÁ VND *</label>
                    <input
                      type="number"
                      required
                      value={newProductForm.priceVND}
                      onChange={(e) => setNewProductForm({...newProductForm, priceVND: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-bold font-mono text-stone-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 block">GIÁ USD *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newProductForm.priceUSD}
                      onChange={(e) => setNewProductForm({...newProductForm, priceUSD: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-bold font-mono text-stone-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 block">BIỂU TƯỢNG (EMOJI) *</label>
                    <input
                      type="text"
                      required
                      value={newProductForm.image}
                      onChange={(e) => setNewProductForm({...newProductForm, image: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-bold text-center text-stone-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 block">MÔ TẢ (TIẾNG VIỆT)</label>
                  <textarea
                    value={newProductForm.descVi}
                    onChange={(e) => setNewProductForm({...newProductForm, descVi: e.target.value})}
                    className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-medium h-16 text-stone-900"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="new_popular"
                    checked={newProductForm.popular}
                    onChange={(e) => setNewProductForm({...newProductForm, popular: e.target.checked})}
                    className="rounded-sm text-[#2D5A47] focus:ring-[#2D5A47]"
                  />
                  <label htmlFor="new_popular" className="text-xs font-bold text-stone-700 cursor-pointer select-none">Món bán chạy nổi bật (Popular)</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2D5A47] hover:bg-[#1E3F31] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Xác nhận thêm món
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl border border-stone-250 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setEditingProduct(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-stone-100 text-stone-450 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-serif text-xl font-bold text-coffee-950 mb-4 text-left">Chỉnh Sửa Thông Tin Món</h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/admin/products/${editingProduct.id}`, {
                      method: 'PUT',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('mellodi_jwt_token')}`
                      },
                      body: JSON.stringify({
                        category: editingProduct.category,
                        name: editingProduct.name,
                        description: editingProduct.description,
                        priceVND: Number(editingProduct.priceVND),
                        priceKRW: Number(editingProduct.priceKRW),
                        priceUSD: Number(editingProduct.priceUSD),
                        image: editingProduct.image,
                        popular: editingProduct.popular
                      })
                    });
                    if (res.ok) {
                      alert("Cập nhật món thành công!");
                      setEditingProduct(null);
                      fetchAdminProducts();
                    } else {
                      const data = await res.json();
                      alert(data.error);
                    }
                  } catch (err) {
                    alert("Lỗi kết nối máy chủ!");
                  }
                }}
                className="space-y-4 text-left"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 block">MÃ SẢN PHẨM (KHÔNG THỂ ĐỔI)</label>
                    <input
                      type="text"
                      disabled
                      value={editingProduct.id}
                      className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 block">DANH MỤC *</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-bold text-stone-900"
                    >
                      <option value="espresso">Cà phê Ý (Espresso)</option>
                      <option value="brewed">Cà phê Phin (Brewed)</option>
                      <option value="coldbrew">Cà phê Lạnh (Cold Brew)</option>
                      <option value="tea">Trà & Trái cây (Tea)</option>
                      <option value="pastry">Bánh & Tráng miệng (Pastry)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 block">TÊN MÓN (TIẾNG VIỆT) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name.vi}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      name: { ...editingProduct.name, vi: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 block">TÊN MÓN (TIẾNG ANH) *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name.en}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      name: { ...editingProduct.name, en: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 block">GIÁ VND *</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.priceVND}
                      onChange={(e) => setEditingProduct({...editingProduct, priceVND: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-bold font-mono text-stone-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 block">GIÁ USD *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editingProduct.priceUSD}
                      onChange={(e) => setEditingProduct({...editingProduct, priceUSD: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-bold font-mono text-stone-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-500 block">BIỂU TƯỢNG (EMOJI) *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                      className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-bold text-center text-stone-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-500 block">MÔ TẢ (TIẾNG VIỆT)</label>
                  <textarea
                    value={editingProduct.description.vi}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      description: { ...editingProduct.description, vi: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-stone-55 border border-stone-200 rounded-xl text-xs font-medium h-16 text-stone-900"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_popular"
                    checked={editingProduct.popular}
                    onChange={(e) => setEditingProduct({...editingProduct, popular: e.target.checked})}
                    className="rounded-sm text-[#2D5A47] focus:ring-[#2D5A47]"
                  />
                  <label htmlFor="edit_popular" className="text-xs font-bold text-stone-700 cursor-pointer select-none">Món bán chạy nổi bật (Popular)</label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#2D5A47] hover:bg-[#1E3F31] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
