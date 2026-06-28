import { Product } from '../types';

export const products: Product[] = [
  // Category: brewed (Mellodi Tradition)
  {
    id: 'tr-1',
    category: 'brewed',
    name: {
      vi: 'Cà Phê Đen Mellodi (Black Coffee)',
      en: 'Mellodi Black Coffee',
      ko: '멜로디 블랙 커피'
    },
    description: {
      vi: 'Cà phê Robusta rang mộc đậm đà truyền thống, đậm vị đắng thanh thoát.',
      en: 'Bold and traditional roasted Robusta black coffee with a clean, strong finish.',
      ko: '전통적인 방식으로 로스팅하여 깊고 진한 맛을 내는 멜로디 오리지널 블랙 커피.'
    },
    priceVND: 45000,
    priceKRW: 3000,
    priceUSD: 2.00,
    image: '☕',
    popular: true
  },
  {
    id: 'tr-2',
    category: 'brewed',
    name: {
      vi: 'Cà Phê Sữa Mellodi (White Coffee)',
      en: 'Mellodi White Coffee',
      ko: '멜로디 화이트 연유 커피'
    },
    description: {
      vi: 'Sự hòa quyện ngọt ngào giữa Robusta đậm đà và sữa đặc kiểu Việt Nam hảo hạng.',
      en: 'A sweet and creamy blend of bold Robusta and premium Vietnamese condensed milk.',
      ko: '진한 로부스타 에스프레소와 달콤한 연유가 어우러진 멜로디식 연유 커피.'
    },
    priceVND: 50000,
    priceKRW: 3200,
    priceUSD: 2.20,
    image: '🥛',
    popular: true
  },
  {
    id: 'tr-3',
    category: 'brewed',
    name: {
      vi: 'Cà Phê Sữa Tươi Mellodi',
      en: 'Mellodi Fresh Milk Coffee',
      ko: '멜로디 생우유 커피'
    },
    description: {
      vi: 'Cà phê nguyên chất kết hợp cùng sữa tươi thanh trùng béo nhẹ, dễ uống.',
      en: 'Pure coffee combined with pasteurized fresh milk for a smooth and light body.',
      ko: '신선한 생우유와 깔끔한 커피 샷이 어우러져 부드럽게 즐기는 멜로디 커피.'
    },
    priceVND: 55000,
    priceKRW: 3500,
    priceUSD: 2.50,
    image: '🥤'
  },
  {
    id: 'tr-4',
    category: 'brewed',
    name: {
      vi: 'Cà Phê Kem Muối Mellodi',
      en: 'Mellodi Salt Cream Coffee',
      ko: '멜로디 소금 크림 커피'
    },
    description: {
      vi: 'Lớp kem muối béo ngậy mằn mặn phủ lên trên cốt cà phê phin đậm đà đặc trưng.',
      en: 'Rich, savory salted cream layered over our signature bold slow-dripped coffee.',
      ko: '달콤 짭조름하고 부드러운 소금 크림을 올린 멜로디 시그니처 커피.'
    },
    priceVND: 55000,
    priceKRW: 3500,
    priceUSD: 2.50,
    image: '🍮',
    popular: true
  },

  // Category: espresso (Mellodi Italy)
  {
    id: 'esp-1',
    category: 'espresso',
    name: {
      vi: 'Espresso Mellodi',
      en: 'Mellodi Espresso',
      ko: '멜로디 에스프레소'
    },
    description: {
      vi: 'Cà phê Arabica và Robusta phối trộn được chiết xuất máy áp suất cao, thơm nồng đậm vị.',
      en: 'A blend of Arabica and Robusta extracted under high pressure for a rich aroma.',
      ko: '엄선된 원두를 고압 추출하여 아로마가 살아있는 멜로디 에스프레소.'
    },
    priceVND: 50000,
    priceKRW: 3200,
    priceUSD: 2.20,
    image: '☕'
  },
  {
    id: 'esp-2',
    category: 'espresso',
    name: {
      vi: 'Americano Mellodi',
      en: 'Mellodi Americano',
      ko: '멜로디 아메리카노'
    },
    description: {
      vi: 'Espresso nguyên chất pha loãng với nước nóng mang lại hậu vị mượt mà sảng khoái.',
      en: 'Pure espresso diluted with hot water for a smooth, refreshing daily coffee.',
      ko: '에스프레소에 물을 더해 깔끔하고 청량한 맛을 내는 아메리카노.'
    },
    priceVND: 55000,
    priceKRW: 3500,
    priceUSD: 2.50,
    image: '🧊'
  },
  {
    id: 'esp-3',
    category: 'espresso',
    name: {
      vi: 'Latte Mellodi (Hot/Iced)',
      en: 'Mellodi Latte',
      ko: '멜로디 라떼'
    },
    description: {
      vi: 'Cà phê espresso hòa quyện cùng sữa tươi ấm và lớp bọt sữa mỏng mịn.',
      en: 'Espresso combined with velvety steamed milk and a thin layer of micro-foam.',
      ko: '진한 에스프레소와 부드러운 스팀 우유가 조화를 이루는 고소한 라떼.'
    },
    priceVND: 65000,
    priceKRW: 4200,
    priceUSD: 3.00,
    image: '🥛'
  },
  {
    id: 'esp-4',
    category: 'espresso',
    name: {
      vi: 'Cà Phê Caramel Muối Mellodi',
      en: 'Mellodi Salted Caramel Latte',
      ko: '멜로디 솔티드 카라멜 라떼'
    },
    description: {
      vi: 'Latte béo mịn kết hợp cùng sốt caramel ngọt ngào và một chút muối biển tinh tế.',
      en: 'Velvety latte fused with sweet caramel sauce and a touch of fine sea salt.',
      ko: '달콤한 카라멜 시럽에 짭조름한 소금을 가미해 단짠 매력을 살린 라떼.'
    },
    priceVND: 70000,
    priceKRW: 4500,
    priceUSD: 3.20,
    image: '🍯',
    popular: true
  },

  // Category: tea (Mellodi Tea)
  {
    id: 'tea-1',
    category: 'tea',
    name: {
      vi: 'Trà Đào Mellodi',
      en: 'Mellodi Peach Tea',
      ko: '멜로디 복숭아 홍차'
    },
    description: {
      vi: 'Trà đào thanh ngọt kết hợp cùng đào miếng giòn ngọt chín mọng tự nhiên và sả tươi.',
      en: 'Sweet peach tea topped with crunchy peach slices and fresh lemongrass.',
      ko: '향긋한 홍차에 아삭한 복숭아 과육과 싱그러운 레몬그라스를 더한 아이스 티.'
    },
    priceVND: 65000,
    priceKRW: 4200,
    priceUSD: 3.00,
    image: '🍑',
    popular: true
  },
  {
    id: 'tea-2',
    category: 'tea',
    name: {
      vi: 'Trà Hibiscus Vải Mellodi',
      en: 'Mellodi Lychee Hibiscus Tea',
      ko: '멜로디 리치 히비스커스 티'
    },
    description: {
      vi: 'Trà hoa Atiso đỏ chua thanh kết hợp cùng quả vải chín mọng ngọt ngào.',
      en: 'Tart hibiscus flower tea paired with sweet, juicy lychees for a vibrant refresher.',
      ko: '상큼한 히비스커스 티에 달콤한 리치 열매를 가미해 청량감을 주는 티.'
    },
    priceVND: 65000,
    priceKRW: 4200,
    priceUSD: 3.00,
    image: '🍹'
  },
  {
    id: 'tea-3',
    category: 'tea',
    name: {
      vi: 'Trà Ổi Hồng Mellodi',
      en: 'Mellodi Pink Guava Tea',
      ko: '멜로디 핑크 구아바 티'
    },
    description: {
      vi: 'Trà ô long thanh mát kết hợp sốt ổi hồng thơm ngọt và các lát trái cây tươi.',
      en: 'Refreshing oolong tea blended with sweet pink guava puree and fresh fruit slices.',
      ko: '은은한 우롱차에 향긋하고 달콤한 핑크 구아바를 섞어 만든 웰빙 티.'
    },
    priceVND: 65000,
    priceKRW: 4200,
    priceUSD: 3.00,
    image: '🍹'
  },
  {
    id: 'tea-4',
    category: 'tea',
    name: {
      vi: 'Trà Sữa Ô Long Mellodi',
      en: 'Mellodi Oolong Milktea',
      ko: '멜로디 우롱 밀크티'
    },
    description: {
      vi: 'Trà ô long được ủ đậm vị kết hợp sữa béo ngậy bùi, hậu vị ngọt kéo dài.',
      en: 'Strongly brewed oolong tea mixed with rich milk powder for a long sweet aftertaste.',
      ko: '깊게 우려낸 우롱차에 부드러운 우유를 섞어 고소하고 깔끔한 밀크티.'
    },
    priceVND: 60000,
    priceKRW: 3800,
    priceUSD: 2.80,
    image: '🍵'
  },

  // Category: coldbrew (Mellodi Special & Frappe & Non-Coffee)
  {
    id: 'sp-1',
    category: 'coldbrew',
    name: {
      vi: 'Mellodi Đặc Biệt (Mellodi Special)',
      en: 'Mellodi Special Signature',
      ko: '멜로디 스페셜 시그니처'
    },
    description: {
      vi: 'Thức uống đặc chế độc quyền của Mellodi đem lại hương vị đột phá đầy cảm xúc.',
      en: 'Our exclusive signature creation bringing a breakthrough of rich and layered flavors.',
      ko: '멜로디만의 비밀 레시피로 제조하여 독특하고 깊은 맛을 선사하는 특별 시그니처.'
    },
    priceVND: 65000,
    priceKRW: 4200,
    priceUSD: 3.00,
    image: '🌟',
    popular: true
  },
  {
    id: 'sp-2',
    category: 'coldbrew',
    name: {
      vi: 'Matcha Latte Sương Mù Mellodi',
      en: 'Mellodi Matcha Latte',
      ko: '멜로디 말차 라떼'
    },
    description: {
      vi: 'Bột matcha Shizuoka Nhật Bản hảo hạng hòa cùng sữa tươi béo nhẹ thanh trùng.',
      en: 'Premium Japanese Shizuoka matcha powder blended with pasteurized fresh milk.',
      ko: '일본 시즈오카산 고급 말차 가루와 신선한 생우유가 어우러진 말차 라떼.'
    },
    priceVND: 60000,
    priceKRW: 3800,
    priceUSD: 2.80,
    image: '🍵'
  },
  {
    id: 'sp-3',
    category: 'coldbrew',
    name: {
      vi: 'Sô-cô-la Đá Xay Mellodi',
      en: 'Mellodi Cookies Frappe',
      ko: '멜로디 쿠키 프라페'
    },
    description: {
      vi: 'Bánh cookies giòn rụm xay cùng sữa, sô-cô-la đậm đà và phủ kem whipping béo ngậy.',
      en: 'Crunchy chocolate cookies blended with milk, chocolate, and topped with rich whipped cream.',
      ko: '바삭한 쿠키와 달콤한 초콜릿, 우유를 함께 갈아 만든 시원한 프라페.'
    },
    priceVND: 65000,
    priceKRW: 4200,
    priceUSD: 3.00,
    image: '🍪'
  },

  // Category: pastry
  {
    id: 'pas-1',
    category: 'pastry',
    name: {
      vi: 'Bánh Sừng Bò Trứng Muối Chảy',
      en: 'Salted Egg Lava Croissant',
      ko: '솔티드 에그 라바 크로와상'
    },
    description: {
      vi: 'Bánh sừng bò ngàn lớp nướng giòn rụm với nhân sốt trứng muối chảy vàng ươm béo ngậy cực cuốn.',
      en: 'Golden flaky multi-layered croissant loaded with a rich flowing salted egg yolk custard filling.',
      ko: '겹겹이 바삭하게 구운 크로와상 속을 흘러내리는 짭조름하고 고소한 노른자 크림으로 채운 빵.'
    },
    priceVND: 38000,
    priceKRW: 2400,
    priceUSD: 1.70,
    image: '🥐',
    popular: true
  }
];
