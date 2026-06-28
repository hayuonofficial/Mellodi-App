export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export const getBotResponse = (input: string, lang: 'vi' | 'en' | 'ko'): string => {
  const query = input.toLowerCase().trim();
  
  if (lang === 'vi') {
    if (query.includes('địa chỉ') || query.includes('ở đâu') || query.includes('đường') || query.includes('quận') || query.includes('tới quán') || query.includes('chi nhánh')) {
      return 'Trụ sở chính và cửa hàng Flagship của Mellodi tọa lạc tại: 69/2/37 Nguyễn Gia Trí, Phường Thạnh Mỹ Tây, Thành Phố Hồ Chí Minh (khu vực Bình Thạnh cũ) ạ! Rất hân hạnh được đón tiếp bạn ghé thưởng thức cà phê.';
    }
    if (query.includes('sđt') || query.includes('điện thoại') || query.includes('hotline') || query.includes('liên hệ') || query.includes('số')) {
      return 'Bạn có thể liên hệ trực tiếp với bộ phận chăm sóc khách hàng của Mellodi qua số Hotline: 0375681791 hoặc gửi email về địa chỉ contact@mellodi.vn nhé. Chúng tôi luôn sẵn sàng hỗ trợ!';
    }
    if (query.includes('tích điểm') || query.includes('điểm') || query.includes('len') || query.includes('thẻ') || query.includes('hạng') || query.includes('vip')) {
      return 'Hệ thống tích điểm của Mellodi sử dụng điểm thưởng gọi là LEN. Khi bạn đặt nước hoặc nạp ví trên ứng dụng, hệ thống sẽ tự động tích lũy 10% giá trị hóa đơn thành điểm LEN. Tích đủ điểm bạn sẽ được tự động nâng hạng lên Green hoặc Gold VIP để nhận các voucher sinh nhật và ưu đãi giảm giá lên tới 30%!';
    }
    if (query.includes('thực đơn') || query.includes('nước') || query.includes('uống') || query.includes('món') || query.includes('signature') || query.includes('giá')) {
      return 'Mellodi tự hào giới thiệu thực đơn Signature đặc trưng:\n1. Cà Phê Muối Mellodi (55.000đ) - Lớp kem muối béo ngậy kết hợp cà phê Robusta đậm đà.\n2. Trà Đào Hồng Đài Các (60.000đ) - Trà đen thanh mát cùng đào chín ngọt lịm.\n3. Matcha Latte Sương Mù (65.000đ) - Bột matcha Shizuoka thượng hạng.\nBạn có thể vào mục Đặt hàng trên App để xem toàn bộ thực đơn và tùy chỉnh topping nhé!';
    }
    if (query.includes('khuyến mãi') || query.includes('voucher') || query.includes('ưu đãi') || query.includes('giảm giá') || query.includes('mã')) {
      return 'Hiện tại Mellodi đang chạy các ưu đãi độc quyền sau:\n- Tặng ngay Voucher giảm 30% cho thành viên mới đăng ký.\n- Tích lũy 10% điểm thưởng LEN trên mọi hóa đơn.\n- Tặng voucher đồ uống miễn phí vào ngày sinh nhật cho thành viên hạng Green & Gold VIP. Hãy đăng ký tài khoản thành viên ngay hôm nay để nhận quà nhé!';
    }
    if (query.includes('ereh') || query.includes('công ty') || query.includes('chủ quản') || query.includes('ereh global')) {
      return 'Dạ, Mellodi là thương hiệu cà phê đặc sản trực thuộc sở hữu của Công Ty Ereh Global. Chúng tôi ứng dụng công nghệ để nâng tầm nông sản Việt và tối ưu hóa dịch vụ khách hàng.';
    }
    if (query.includes('chào') || query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('ad')) {
      return 'Mellodi xin chào! Tôi là Trợ lý ảo AI phục vụ 24/7 của Mellodi. Tôi có thể giúp gì cho bạn? Bạn có thể chọn các câu hỏi nhanh bên dưới hoặc hỏi tôi bất cứ thông tin gì về quán nhé!';
    }
    return 'Tôi đã ghi nhận câu hỏi của bạn. Vì tôi là trợ lý ảo AI đang được huấn luyện, nếu bạn cần hỗ trợ gấp hoặc gặp sự cố về tài khoản/thanh toán, vui lòng gọi trực tiếp số Hotline hỗ trợ 0375681791 để nhân viên tổng đài xử lý ngay lập tức ạ!';
  } 
  
  if (lang === 'en') {
    if (query.includes('address') || query.includes('where') || query.includes('location') || query.includes('branch')) {
      return 'Mellodi\'s headquarters and flagship store is located at: 69/2/37 Nguyen Gia Tri, Thanh My Tay Ward, Ho Chi Minh City, Viet Nam. We look forward to welcoming you!';
    }
    if (query.includes('phone') || query.includes('hotline') || query.includes('contact') || query.includes('number')) {
      return 'You can contact Mellodi customer support via Hotline: 0375681791 or email us at contact@mellodi.vn. We are here to help!';
    }
    if (query.includes('point') || query.includes('len') || query.includes('tier') || query.includes('vip') || query.includes('membership')) {
      return 'Mellodi loyalty program uses LEN points. You earn 10% of your bill back in LEN points for every order or wallet top-up on the app. Accumulate points to level up to Green or Gold VIP tier for exclusive vouchers and up to 30% discounts!';
    }
    if (query.includes('menu') || query.includes('drink') || query.includes('coffee') || query.includes('signature') || query.includes('price')) {
      return 'Mellodi\'s Signature Menu features:\n1. Mellodi Salted Cream Coffee (55k VND) - Rich Robusta with savory salted cream.\n2. Imperial Peach Tea (60k VND) - Refreshing black tea with sweet peach slices.\n3. Misty Matcha Latte (65k VND) - Premium Shizuoka matcha. Check the Order tab in our App to view the full menu!';
    }
    if (query.includes('promo') || query.includes('voucher') || query.includes('offer') || query.includes('discount')) {
      return 'Current Mellodi promotions include:\n- Get a 30% discount welcome voucher upon registration.\n- Accumulate 10% LEN points on all purchases.\n- Free birthday drink voucher for Green & Gold VIP members. Register now to claim!';
    }
    if (query.includes('ereh') || query.includes('company') || query.includes('ereh global')) {
      return 'Mellodi is proudly owned and operated by Ereh Global Joint Stock Company, bringing technological innovation to Vietnam\'s specialty coffee sector.';
    }
    if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('greet')) {
      return 'Hello! I am Mellodi\'s AI Virtual Assistant. How can I help you today? You can ask me about our menu, store address, membership points, or active promotions!';
    }
    return 'Thank you for your message. As an AI assistant under training, if you need urgent assistance regarding orders or payments, please call our Hotline at 0375681791 for immediate support!';
  }

  // Korean
  if (query.includes('주소') || query.includes('위치') || query.includes('어디') || query.includes('매장')) {
    return '멜로디의 본사 및 플래그십 매장 주소는 다음과 같습니다: 69/2/37 Nguyen Gia Tri, Thanh My Tay Ward, Ho Chi Minh City, Viet Nam. 여러분의 방문을 진심으로 환영합니다!';
  }
  if (query.includes('전화') || query.includes('연락') || query.includes('번호') || query.includes('콜센터')) {
    return '멜로디 고객 지원 센터 번호는 0375681791 이며, 이메일은 contact@mellodi.vn 입니다. 언제든 편하게 문의해 주세요!';
  }
  if (query.includes('적립') || query.includes('포인트') || query.includes('len') || query.includes('등급') || query.includes('vip') || query.includes('멤버십')) {
    return '멜로디 리워즈는 LEN 포인트를 사용합니다. 앱을 통해 주문하거나 지갑을 충전할 때 결제 금액의 10%가 LEN 포인트로 자동 적립됩니다. 포인트를 모아 에메랄드(Green) 또는 골드(Gold) VIP 등급으로 승급하여 최대 30% 할인 혜택을 누려보세요!';
  }
  if (query.includes('메뉴') || query.includes('커피') || query.includes('음료') || query.includes('시그니처') || query.includes('가격')) {
    return '멜로디의 대표 시그니처 메뉴입니다:\n1. 소금 크림 커피 (55,000 VND) - 짭조름한 크림과 진한 로부스타의 조화.\n2. 황실 복숭아 차 (60,000 VND) - 시원한 홍차와 달콤한 복숭아.\n3. 안개 말차 라떼 (65,000 VND) - 고급 시즈오카 말차. 앱의 주문 탭에서 전체 메뉴를 확인해 보세요!';
  }
  if (query.includes('쿠폰') || query.includes('할인') || query.includes('혜택') || query.includes('이벤트')) {
    return '현재 진행 중인 멜로디 프로모션입니다:\n- 신규 회원 가입 시 30% 웰컴 할인 쿠폰 지급.\n- 모든 주문 금액의 10% LEN 포인트 즉시 적립.\n- Green 및 Gold VIP 회원 대상 무료 생일 음료 쿠폰 증정. 지금 회원가입하고 혜택을 받아보세요!';
  }
  if (query.includes('에레') || query.includes('회사') || query.includes('ereh global')) {
    return '멜로디는 Ereh Global 주식회사가 소유하고 운영하는 프리미엄 스페셜티 커피 브랜드입니다.';
  }
  if (query.includes('안녕') || query.includes('헬로') || query.includes('하이')) {
    return '안녕하세요! 멜로디의 24/7 AI 고객지원 가상 비서입니다. 무엇을 도와드릴까요? 메뉴, 매장 위치, 멤버십 혜택, 이벤트 등에 대해 물어보세요!';
  }
  return '메시지를 접수했습니다. 저는 학습 중인 AI 비서이므로, 주문이나 결제와 관련된 긴급한 문의는 고객센터 0375681791 로 전화해 주시면 신속히 안내해 드리겠습니다!';
};
