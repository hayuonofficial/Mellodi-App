import { Voucher } from '../types';

export const initialVouchers: Voucher[] = [
  {
    id: 'vc-1',
    code: 'MELLODINEW',
    title: {
      vi: 'Chào Bạn Mới - Giảm 20%',
      en: 'Welcome Cup - 20% Off',
      ko: '웰컴 가입 축하 - 20% 할인'
    },
    description: {
      vi: 'Giảm 20% trên tổng hóa đơn cho đơn hàng đầu tiên của bạn tại Mellodi.',
      en: '20% discount on your very first order at Mellodi Coffee.',
      ko: '멜로디 가입 첫 주문 시 전체 금액의 20% 특별 즉시 할인 쿠폰.'
    },
    discountType: 'percent',
    value: 20,
    minOrderVND: 30000,
    minOrderKRW: 2000,
    minOrderUSD: 1.50,
    claimed: true, // Claimed by default for newcomers
    used: false,
    expiryDate: '2026-09-30'
  },
  {
    id: 'vc-2',
    code: 'LENLOYAL',
    title: {
      vi: 'Tích Điểm Trọn Vẹn - Giảm 30K',
      en: 'Loyalty Boost - 30K VND Off',
      ko: '충성 고객 혜 tiết - 30K VND 할인'
    },
    description: {
      vi: 'Mã tri ân thành viên Mellodi, giảm thẳng 30.000đ (hoặc tương đương) cho đơn hàng thanh toán qua điểm LEN.',
      en: 'Special member appreciation discount of 30,000 VND (or currency equivalent) for orders paid using LEN points.',
      ko: '멜로디 회원 감사의 뜻으로 LEN 포인트 결제 시 30,000 VND 상당 전액 특별 할인.'
    },
    discountType: 'amount',
    value: 30000, // base VND. We'll scale it to equivalent currency in UI
    minOrderVND: 80000,
    minOrderKRW: 5000,
    minOrderUSD: 3.50,
    claimed: false,
    used: false,
    expiryDate: '2026-08-31'
  },
  {
    id: 'vc-3',
    code: 'COFFEETIME',
    title: {
      vi: 'Giờ Cà Phê - Giảm 15%',
      en: 'Coffee Break - 15% Off',
      ko: '커피 브레이크 - 15% 할인'
    },
    description: {
      vi: 'Giảm 15% cho tất cả các loại đồ uống thuộc danh mục Cà Phê Ý & Phin từ 14h đến 17h hàng ngày.',
      en: 'Enjoy 15% off on all espresso & traditional brewed coffees between 2 PM and 5 PM.',
      ko: '매일 오후 2시부터 5시까지 에스프레소 및 브루잉 커피 카테고리 15% 즉시 할인.'
    },
    discountType: 'percent',
    value: 15,
    minOrderVND: 45000,
    minOrderKRW: 3000,
    minOrderUSD: 2.00,
    claimed: false,
    used: false,
    expiryDate: '2026-07-15'
  },
  {
    id: 'vc-4',
    code: 'SWEETTREAT',
    title: {
      vi: 'Bánh Ngọt Trọn Vị - Giảm 15K',
      en: 'Sweet Treat - 15K VND Off',
      ko: '달콤한 디저트 - 15K VND 할인'
    },
    description: {
      vi: 'Ưu đãi ngọt ngào giảm ngay 15.000đ khi mua kèm 1 đồ uống và 1 bánh ngọt bất kỳ tại cửa hàng.',
      en: 'Get 15,000 VND discount when purchasing any beverage paired with a pastry cake.',
      ko: '음료와 베이커리를 세트로 주문할 때 사용 가능한 15,000 VND 즉시 할인 쿠폰.'
    },
    discountType: 'amount',
    value: 15000,
    minOrderVND: 60000,
    minOrderKRW: 4000,
    minOrderUSD: 2.50,
    claimed: false,
    used: false,
    expiryDate: '2026-10-31'
  }
];
