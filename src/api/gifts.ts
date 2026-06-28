import express from "express";
import { 
  getUser, 
  updateUser, 
  createRedeemedGift, 
  getUserRedeemedGifts, 
  getRedeemedGift, 
  updateRedeemedGift, 
  createTransaction, 
  RedeemedGift 
} from "../lib/firebase-db";
import { addNotification } from "./utils";
import { authenticateToken, AuthenticatedRequest } from "./middleware";

const router = express.Router();

// Rewards catalog data (static on server)
const GIFTS = [
  {
    id: "gft-drink",
    name: {
      vi: "Đặc sản Ủ Lạnh Mellodi Cold Brew (Free Drink)",
      en: "Mellodi Cold Brew Special (Free Drink)",
      ko: "멜로디 시그니처 콜드브루 (음료 교환권)"
    },
    category: "drink",
    costPoints: 12000,
    image: "🥤",
    description: {
      vi: "Sử dụng hạt Arabica hảo hạng ủ lạnh 18 giờ mang lại vị mượt mà tinh tế.",
      en: "Crafted with premium Arabica beans slow-steeped for 18 hours for a clean profile.",
      ko: "18시간 동안 저온에서 천천히 추출한 깔끔하고 부러운 시그니처 콜드브루."
    }
  },
  {
    id: "gft-pastry",
    name: {
      vi: "Bánh Sừng Bò Bơ Pháp (French Butter Croissant)",
      en: "French Butter Croissant",
      ko: "프랑스산 bơ bánh sừng bò"
    },
    category: "pastry",
    costPoints: 8000,
    image: "🥐",
    description: {
      vi: "Bánh sừng bò ngập bơ Pháp béo ngậy, nướng giòn nóng hổi.",
      en: "Flaky French croissant baked with premium butter, served warm.",
      ko: "프랑스산 고메 버터로 구워내 겉은 바삭하고 속은 촉촉한 크로와상."
    }
  },
  {
    id: "gft-voucher-50",
    name: {
      vi: "Voucher Ưu Đãi Trị Giá 50.000đ",
      en: "50,000 VND Discount Voucher",
      ko: "50,000 VND 할인 쿠폰"
    },
    category: "voucher",
    costPoints: 20000,
    image: "🎫",
    description: {
      vi: "Giảm trực tiếp 50.000đ khi thanh toán mọi hóa đơn nước & bánh tại Mellodi.",
      en: "Flat 50,000 VND discount applicable to any direct orders at Mellodi.",
      ko: "멜로디 매장 및 스마트 오더에서 사용 가능한 5만동 즉시 할인 쿠폰."
    }
  },
  {
    id: "gft-tumbler",
    name: {
      vi: "Bình Giữ Nhiệt Mellodi Signature Thermo Tumbler",
      en: "Mellodi Thermo Tumbler",
      ko: "멜로디 시그니처 텀블러"
    },
    category: "merchandise",
    costPoints: 50000,
    image: "🥛",
    description: {
      vi: "Bình giữ nhiệt bằng thép không gỉ cao cấp 500ml, giữ nóng 12h, lạnh 24h.",
      en: "Premium 500ml stainless steel tumbler. Keeps hot 12h, cold 24h.",
      ko: "프리미엄 500ml 스테인리스 이중 진공 텀블러. 뛰어난 보온 및 보냉력."
    }
  },
  {
    id: "gft-birthday",
    name: {
      vi: "Bánh Cupcake Sweet Strawberry (Quà Sinh Nhật)",
      en: "Sweet Strawberry Birthday Cupcake",
      ko: "스위트 딸기 생일 컵케이크"
    },
    category: "birthday",
    costPoints: 5000,
    image: "🧁",
    description: {
      vi: "Món quà ngọt ngào đặc quyền dành riêng cho khách hàng có sinh nhật tháng này.",
      en: "Exclusive sweet treat reserved for members during their birthday month.",
      ko: "생일인 회원님을 위해 준비한 부드럽고 달콤한 스위트 딸기 컵케이크."
    }
  },
  {
    id: "gft-seasonal",
    name: {
      vi: "Ly Sứ Cozy Gingerbread Mug (Quà Theo Mùa)",
      en: "Cozy Gingerbread Ceramic Mug",
      ko: "코지 진저브레드 도자기 머그컵"
    },
    category: "seasonal",
    costPoints: 30000,
    image: "☕",
    description: {
      vi: "Ly sứ phiên bản giới hạn thiết kế ấm cúng cho mùa đông.",
      en: "Limited edition ceramic mug with a cute gingerbread holiday theme.",
      ko: "홀리데이 시즌 한정판 아기자기한 진저브레드 머그컵."
    }
  },
  {
    id: "gft-vip",
    name: {
      vi: "Tấm Lót Ly Da Thủ Công (VIP Leather Coaster Set)",
      en: "VIP Handcrafted Leather Coaster Set",
      ko: "VIP 수공예 가죽 코스터 세트"
    },
    category: "vip",
    costPoints: 40000,
    image: "🎗️",
    description: {
      vi: "Tấm lót ly bằng da thật dập chìm logo Mellodi mạ vàng cao cấp dành cho VIP.",
      en: "Genuine leather coaster set embossed with Mellodi gold foil logo.",
      ko: "멜로디 로고가 고급스럽게 각인된 천연 가죽 코스터 세트 (VIP 전용)."
    }
  }
];

// API: Get Gift Catalog (public)
router.get("/", (req, res) => {
  res.json(GIFTS);
});

// API: Get user redeemed gifts (secured)
router.get("/my-gifts", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  try {
    const userGifts = await getUserRedeemedGifts(userId);
    res.json(userGifts);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tải lịch sử nhận quà." });
  }
});

// API: Redeem Reward Gift with LEN points (secured)
router.post("/redeem", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { giftId, recipientName, recipientPhone, recipientEmail, pickupBranch } = req.body;

  const gift = GIFTS.find(g => g.id === giftId);
  if (!gift) {
    return res.status(404).json({ error: "Không tìm thấy quà tặng này trong hệ thống!" });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy thông tin thành viên!" });
    }

    if (user.lenPoints < gift.costPoints) {
      return res.status(400).json({ error: `Số dư điểm LEN không đủ! Bạn cần ${gift.costPoints.toLocaleString()} LEN (Hiện có: ${user.lenPoints.toLocaleString()} LEN).` });
    }

    // Deduct points and recalculate tier
    const remainingPoints = user.lenPoints - gift.costPoints;
    let newTier = user.tier;
    if (remainingPoints >= 50000) newTier = "Gold";
    else if (remainingPoints >= 20000) newTier = "Green";
    else newTier = "Welcome";

    await updateUser(userId, {
      lenPoints: remainingPoints,
      tier: newTier
    });

    // Create redeemed gift record
    const claimCode = `GFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newRedemption: RedeemedGift = {
      id: `rg-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      giftId,
      giftName: gift.name,
      costPoints: gift.costPoints,
      redeemedDate: new Date().toLocaleString(),
      claimCode,
      status: "active",
      recipientName: recipientName || user.name,
      recipientPhone: recipientPhone || user.phone,
      recipientEmail: recipientEmail || user.email,
      pickupBranch: pickupBranch || "Mellodi Nguyễn Huệ (Quận 1)",
    };

    await createRedeemedGift(newRedemption);

    // Record transaction
    const txId = `TX-GFT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    await createTransaction({
      id: txId,
      userId,
      type: "convert",
      amountVND: 0,
      pointsAmount: gift.costPoints,
      status: "success",
      date: new Date().toLocaleString()
    });

    // Add notification
    const finalEmail = recipientEmail || user.email;
    const finalBranch = pickupBranch || "Mellodi Nguyễn Huệ (Quận 1)";
    
    await addNotification(
      userId,
      {
        vi: "Đổi quà thành công! 🎁",
        en: "Gift Redeemed Successfully! 🎁",
        ko: "선물 교환 성공! 🎁"
      },
      {
        vi: `Mã đổi quà ${claimCode} đã được tạo cho "${gift.name.vi}". Phiếu xác nhận nhận quà và mã QR đã được gửi đến email ${finalEmail}. Nhận quà tại chi nhánh: ${finalBranch}.`,
        en: `Redemption code ${claimCode} created for "${gift.name.en}". The confirmation and QR code have been emailed to ${finalEmail}. Pick up at branch: ${finalBranch}.`,
        ko: `"${gift.name.ko || gift.name.en}"에 대한 교환 코드 ${claimCode}가 생성되었습니다. 수령증과 QR 코드가 ${finalEmail} 주소로 이메일 전송되었습니다. 수령 지점: ${finalBranch}.`
      },
      "gift"
    );

    const latestUser = await getUser(userId);
    const { password: _, ...safeUser } = latestUser!;
    res.json({ success: true, user: safeUser, redemption: newRedemption });
  } catch (error) {
    console.error("Redeem gift error:", error);
    res.status(500).json({ error: "Lỗi hệ thống đổi quà." });
  }
});

// API: Claim Redeemed Gift (Barista scanning simulation)
router.post("/claim/:redeemedGiftId", async (req, res) => {
  const { redeemedGiftId } = req.params;

  try {
    const rg = await getRedeemedGift(redeemedGiftId);
    if (!rg) {
      return res.status(404).json({ error: "Không tìm thấy mã đổi quà tặng!" });
    }

    if (rg.status === "claimed") {
      return res.status(400).json({ error: "Mã quà tặng này đã được sử dụng từ trước!" });
    }

    const updatedRedemption = await updateRedeemedGift(redeemedGiftId, { status: "claimed" });

    // Add notification
    await addNotification(
      rg.userId,
      {
        vi: "Đã nhận quà tại quầy thành công! 🎉",
        en: "Gift Claimed Successfully! 🎉",
        ko: "선물 수령 완료! 🎉"
      },
      {
        vi: `Món quà "${rg.giftName.vi || rg.giftName.en}" đã được trao thành công tại chi nhánh "${rg.pickupBranch || "Mellodi Nguyễn Huệ (Quận 1)"}" cho người nhận ${rg.recipientName || "bạn"}. Cảm ơn bạn!`,
        en: `The reward "${rg.giftName.en}" has been successfully claimed at branch "${rg.pickupBranch || "Mellodi Nguyễn Huệ (Quận 1)"}" by ${rg.recipientName || "you"}. Thank you!`,
        ko: `선물 "${rg.giftName.ko || rg.giftName.en}"이 "${rg.pickupBranch || "Mellodi Nguyễn Huệ (Quận 1)"}" 지점에서 ${rg.recipientName || "회원"}님께 정상적으로 전달되었습니다. 감사합니다!`
      },
      "gift"
    );

    res.json({ success: true, redemption: updatedRedemption });
  } catch (error) {
    console.error("Claim gift error:", error);
    res.status(500).json({ error: "Lỗi hệ thống nhận quà tặng." });
  }
});

export default router;
