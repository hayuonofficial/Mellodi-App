import React, { useState, useEffect } from 'react';
import { useApp, API_BASE_URL } from '../context/AppContext';
import { 
  Users, TrendingUp, ShoppingBag, Award, Search, Filter, 
  ChevronRight, ArrowLeft, RefreshCw, BarChart2, Download, 
  DollarSign, Calendar, Star, Coffee, Sparkles, AlertCircle, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  lenPoints: number;
  tier: 'Welcome' | 'Green' | 'Gold';
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  favoriteDrink: string;
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
    Welcome: number;
    Green: number;
    Gold: number;
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
    tier: 'Welcome' | 'Green' | 'Gold';
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

export const AdminDashboard: React.FC = () => {
  const { language, formatPrice } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'directory'>('analytics');
  
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
                      {/* Gold */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-stone-700">
                          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span><span>Hạng Gold (Vàng)</span></span>
                          <span className="font-mono">{analytics.tierDistribution.Gold} ({Math.round((analytics.tierDistribution.Gold / analytics.summary.totalCustomers) * 100) || 0}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${(analytics.tierDistribution.Gold / analytics.summary.totalCustomers) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Green */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-stone-700">
                          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span><span>Hạng Green (Ngọc bích)</span></span>
                          <span className="font-mono">{analytics.tierDistribution.Green} ({Math.round((analytics.tierDistribution.Green / analytics.summary.totalCustomers) * 100) || 0}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600" style={{ width: `${(analytics.tierDistribution.Green / analytics.summary.totalCustomers) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Welcome */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-stone-700">
                          <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-stone-500"></span><span>Hạng Welcome (Chào mừng)</span></span>
                          <span className="font-mono">{analytics.tierDistribution.Welcome} ({Math.round((analytics.tierDistribution.Welcome / analytics.summary.totalCustomers) * 100) || 0}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-500" style={{ width: `${(analytics.tierDistribution.Welcome / analytics.summary.totalCustomers) * 100}%` }}></div>
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
                        <option value="Welcome">Hạng Welcome</option>
                        <option value="Green">Hạng Green</option>
                        <option value="Gold">Hạng Gold</option>
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

    </div>
  );
};
