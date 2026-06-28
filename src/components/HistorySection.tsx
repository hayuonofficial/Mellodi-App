import React, { useState } from 'react';
import { useApp, API_BASE_URL, getAuthHeaders } from '../context/AppContext';
import { translations } from '../translations';
import { 
  History, ShoppingBag, Calendar, CheckCircle2, Ticket, CreditCard, 
  Sparkles, RefreshCw, Truck, XCircle, Clock, AlertTriangle 
} from 'lucide-react';

export const HistorySection: React.FC = () => {
  const { 
    language, 
    orders, 
    setOrders,
    setCurrentUser,
    setWalletBalance,
    setLenPoints,
    formatPriceInCurrency 
  } = useApp();

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const getMethodLabel = (method: 'wallet' | 'vietqr' | 'cash') => {
    if (method === 'wallet') return translations[language]['order.pay.wallet'];
    if (method === 'vietqr') return 'Chuyển khoản VietQR';
    return translations[language]['order.pay.cash'];
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        // Update user state
        setCurrentUser(data.user);
        setWalletBalance(data.user.walletBalance);
        setLenPoints(data.user.lenPoints);
        
        // Update local orders list
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>{language === 'vi' ? 'Chờ thanh toán' : language === 'ko' ? '대기 중' : 'Pending'}</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
            <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
            <span>{language === 'vi' ? 'Đang pha chế' : language === 'ko' ? '제조 중' : 'Preparing'}</span>
          </span>
        );
      case 'shipping':
        return (
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
            <Truck className="w-3 h-3 text-indigo-600" />
            <span>{language === 'vi' ? 'Đang giao hàng' : language === 'ko' ? '배달 중' : 'Shipping'}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{language === 'vi' ? 'Đã hoàn thành' : language === 'ko' ? '완료됨' : 'Completed'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>{language === 'vi' ? 'Đã hủy' : language === 'ko' ? '취소됨' : 'Cancelled'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getProgressSteps = (status: string) => {
    if (status === 'cancelled') {
      return (
        <div className="pt-2 pb-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100/50 text-[10.5px] text-rose-700 flex items-center space-x-1.5 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>{language === 'vi' ? 'Đơn hàng đã bị hủy. Tiền ví (nếu thanh toán qua ví Mellodi) đã được tự động hoàn trả!' : 'This order has been cancelled. Payments have been automatically refunded if applicable.'}</span>
        </div>
      );
    }
    const steps = ['pending', 'preparing', 'shipping', 'completed'];
    const currentIdx = steps.indexOf(status);
    
    return (
      <div className="bg-[#FAF9F6] p-4 rounded-xl border border-coffee-100/50">
        <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-2.5 px-1">
          <span className={currentIdx >= 0 ? 'text-[#2D5A47]' : ''}>{language === 'vi' ? 'Tiếp nhận' : 'Received'}</span>
          <span className={currentIdx >= 1 ? 'text-[#2D5A47]' : ''}>{language === 'vi' ? 'Pha chế' : 'Brewing'}</span>
          <span className={currentIdx >= 2 ? 'text-[#2D5A47]' : ''}>{language === 'vi' ? 'Đang giao' : 'Delivering'}</span>
          <span className={currentIdx >= 3 ? 'text-emerald-700' : ''}>{language === 'vi' ? 'Hoàn tất' : 'Arrived'}</span>
        </div>
        <div className="relative w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-[#2D5A47] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((currentIdx + 1) / 4) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  const ongoingOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      <div className="border-b border-coffee-100 pb-4">
        <h3 className="font-serif text-3xl font-bold text-coffee-950 flex items-center space-x-2.5">
          <History className="w-7 h-7 text-coffee-800" />
          <span>{translations[language]['history.title']}</span>
        </h3>
        <p className="text-xs text-coffee-500 mt-1">
          {language === 'vi' 
            ? 'Theo dõi tiến độ thực tế và lịch sử tích lũy 10% điểm thưởng LEN trên mỗi đơn hàng hoàn tất.'
            : 'Track live orders progress and review your 10% LEN point rewards history.'}
        </p>
      </div>

      {/* ADMIN CONTROLLER SIMULATOR FOR TESTING POINTS */}
      {ongoingOrders.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-5 space-y-4 shadow-inner">
          <div className="flex items-center space-x-2">
            <span className="text-lg">☕</span>
            <h4 className="font-bold text-xs sm:text-sm text-coffee-900">
              {language === 'vi' ? 'Bản Giả Lập Trạng Thái Đơn Hàng (Barista Console)' : 'Order Status Live Simulation Tool'}
            </h4>
          </div>
          <p className="text-[11px] text-coffee-600 leading-relaxed -mt-1">
            {language === 'vi'
              ? 'Vì đây là ứng dụng thực tế của bạn, bạn đóng vai trò là Barista. Hãy bấm nút dưới đây để cập nhật trạng thái đơn. Điểm LEN sẽ được cộng khi đơn chuyển sang "Completed".'
              : 'As the store owner, simulate logistic updates below. 10% LEN points will trigger on Completed status.'}
          </p>

          <div className="divide-y divide-amber-100/50">
            {ongoingOrders.map((ord) => (
              <div key={ord.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <span className="font-mono text-[11px] font-extrabold bg-coffee-100 text-coffee-800 px-2 py-0.5 rounded">
                    {ord.id}
                  </span>
                  <span className="text-[10px] text-stone-500 ml-2">({ord.items.length} món • {formatPriceInCurrency(ord.totalPrice)})</span>
                </div>

                {/* Transition flow triggers */}
                <div className="flex flex-wrap gap-2">
                  {ord.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(ord.id, 'preparing')}
                      disabled={isUpdating === ord.id}
                      className="px-3 py-1.5 bg-[#2D5A47] hover:bg-[#1E4334] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      {language === 'vi' ? 'Bắt đầu pha chế' : 'Brew'}
                    </button>
                  )}
                  {ord.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusChange(ord.id, 'shipping')}
                      disabled={isUpdating === ord.id}
                      className="px-3 py-1.5 bg-[#A37B45] hover:bg-[#8F6834] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      {language === 'vi' ? 'Giao cho shipper' : 'Ship'}
                    </button>
                  )}
                  {(ord.status === 'shipping' || ord.status === 'preparing') && (
                    <button
                      onClick={() => handleStatusChange(ord.id, 'completed')}
                      disabled={isUpdating === ord.id}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      {language === 'vi' ? 'Hoàn thành (Cộng 10% LEN)' : 'Complete'}
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusChange(ord.id, 'cancelled')}
                    disabled={isUpdating === ord.id}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                  >
                    {language === 'vi' ? 'Hủy đơn' : 'Cancel'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-coffee-100 text-center text-coffee-400 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-coffee-50 flex items-center justify-center text-coffee-300 mx-auto">
            <History className="w-8 h-8" />
          </div>
          <div>
            <p className="font-semibold text-coffee-700">{translations[language]['history.empty']}</p>
            <p className="text-[11px] text-coffee-500 mt-1">
              {language === 'vi' 
                ? 'Đơn hàng của bạn sau khi khởi tạo thanh toán sẽ xuất hiện để theo dõi tại đây.'
                : 'Your live checkout orders and invoice records will appear in this list.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord.id}
              id={`history-order-${ord.id}`}
              className="bg-white rounded-3xl border border-coffee-100 p-6 shadow-xs space-y-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start border-b border-coffee-50 pb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-bold text-coffee-900 bg-coffee-100 px-2.5 py-1 rounded-md">
                      {ord.id}
                    </span>
                    {getStatusBadge(ord.status)}
                  </div>
                  
                  <div className="flex items-center space-x-1.5 text-[10.5px] text-coffee-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ord.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block uppercase font-bold">Total Bill</span>
                  <span className="font-mono font-bold text-sm text-[#2D5A47]">
                    {formatPriceInCurrency(ord.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Items Detail */}
              <div className="space-y-3 pl-1">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs leading-normal">
                    <div className="flex-1">
                      <p className="font-bold text-coffee-950">
                        {item.product.name[language]} <span className="font-normal text-stone-400">x{item.quantity}</span>
                      </p>
                      <p className="text-[10px] text-coffee-500">
                        Size {item.size} • Ice {item.ice} • Sugar {item.sugar}
                        {item.toppings.length > 0 && ` • Toppings: ${item.toppings.join(', ')}`}
                      </p>
                    </div>
                    
                    <span className="font-mono font-bold text-coffee-600">
                      {formatPriceInCurrency(item.product.priceVND * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic Steps and Progress */}
              {getProgressSteps(ord.status)}

              {/* Transaction footer properties */}
              <div className="flex justify-between items-center bg-coffee-50/50 p-3 rounded-2xl border border-coffee-100/50 text-[10.5px]">
                <div className="flex items-center space-x-1.5 text-coffee-600">
                  <CreditCard className="w-3.5 h-3.5 text-coffee-400" />
                  <span>{translations[language]['history.method']}: <b>{getMethodLabel(ord.paymentMethod)}</b></span>
                </div>

                {ord.status === 'completed' ? (
                  <span className="font-bold text-emerald-700 flex items-center space-x-1 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                    <span>+{ord.pointsEarned.toLocaleString()} LEN</span>
                  </span>
                ) : ord.status === 'cancelled' ? (
                  <span className="text-stone-400 line-through">0 LEN Earned</span>
                ) : (
                  <span className="text-[#A37B45] font-bold flex items-center space-x-1 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>+{ord.pointsEarned.toLocaleString()} LEN ({language === 'vi' ? 'Chờ hoàn thành' : 'Pending Completed'})</span>
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
