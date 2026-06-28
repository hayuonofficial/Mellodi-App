import { Store } from '../types';

export const stores: Store[] = [
  {
    id: 'st-1',
    name: {
      vi: 'Mellodi Reserve Nhà Thờ Lớn',
      en: 'Mellodi Reserve St. Joseph Cathedral',
      ko: '멜로디 리저브 대성당점'
    },
    address: {
      vi: 'Số 12 Nhà Thờ, Hoàn Kiếm, Hà Nội',
      en: '12 Nha Tho St, Hoan Kiem District, Hanoi',
      ko: '하노이 호안끼엠구 냐토거리 12호 (성요셉 대성당 앞)'
    },
    coords: { x: 38, y: 42 },
    distance: 0.8,
    phone: '024 3938 1234',
    openHours: '07:00 - 23:00'
  },
  {
    id: 'st-2',
    name: {
      vi: 'Mellodi Hồ Gươm Premium',
      en: 'Mellodi Hoan Kiem Lake View',
      ko: '멜로디 호안끼엠 레이크뷰점'
    },
    address: {
      vi: 'Số 1 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
      en: '1 Dinh Tien Hoang, Hoan Kiem, Hanoi',
      ko: '하노이 호안끼엠구 딘띠엔황거리 1호 (레이크뷰)'
    },
    coords: { x: 45, y: 35 },
    distance: 1.2,
    phone: '024 3938 5678',
    openHours: '06:30 - 23:30'
  },
  {
    id: 'st-3',
    name: {
      vi: 'Mellodi Landmark Nguyễn Hữu Cảnh',
      en: 'Mellodi Landmark Nguyen Huu Canh',
      ko: '멜로디 랜드마크 센트럴파크점'
    },
    address: {
      vi: 'Tòa L1, Vinhomes Central Park, Bình Thạnh, TP. HCM',
      en: 'L1 Tower, Vinhomes Central Park, Binh Thanh, HCMC',
      ko: '호치민 빈탄구 빈홈즈 센트럴파크 L1동'
    },
    coords: { x: 58, y: 65 },
    distance: 4.5,
    phone: '028 3822 9999',
    openHours: '07:00 - 22:30'
  },
  {
    id: 'st-4',
    name: {
      vi: 'Mellodi Gangnam Boulevard',
      en: 'Mellodi Gangnam Boulevard',
      ko: '멜로디 강남대로점'
    },
    address: {
      vi: '352 Gangnam-daero, Gangnam-gu, Seoul',
      en: '352 Gangnam-daero, Gangnam-gu, Seoul',
      ko: '서울특별시 강남구 강남대로 352'
    },
    coords: { x: 72, y: 22 },
    distance: 12.4,
    phone: '02-551-2024',
    openHours: '06:30 - 22:00'
  },
  {
    id: 'st-5',
    name: {
      vi: 'Mellodi Union Square San Francisco',
      en: 'Mellodi Union Square SF',
      ko: '멜로디 유니언 스퀘어 샌프란시스코점'
    },
    address: {
      vi: '350 Powell St, San Francisco, CA 94102',
      en: '350 Powell St, San Francisco, CA 94102',
      ko: '미국 샌프란시스코 파월가 350 (유니언 스퀘어)'
    },
    coords: { x: 15, y: 78 },
    distance: 8200,
    phone: '+1 415-555-0199',
    openHours: '06:00 - 21:00'
  }
];
