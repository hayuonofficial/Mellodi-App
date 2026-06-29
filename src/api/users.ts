import express from "express";
import crypto from "crypto";
import { getUser, updateUser, getAllUsers } from "../lib/firebase-db.js";
import { updateUserPointsAndTier, addNotification } from "./utils.js";

const router = express.Router();

// Helper to find user by NFC Card ID
async function getUserByNfcCardId(cardId: string) {
  const allUsers = await getAllUsers();
  return allUsers.find(u => u.nfcCard?.cardId === cardId);
}

// API: Get current User
router.get("/:id", async (req, res) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy thông tin thành viên!" });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tải thông tin thành viên." });
  }
});

// API: Link NFC Card to User (NTAG215)
router.post("/nfc/link", async (req, res) => {
  const { userId, cardId } = req.body;

  if (!userId || !cardId) {
    return res.status(400).json({ error: "Thiếu thông tin người dùng hoặc ID thẻ NFC!" });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy thành viên!" });
    }

    // Check if this card is already linked to another user
    const existingCardUser = await getUserByNfcCardId(cardId);
    if (existingCardUser && existingCardUser.id !== userId) {
      return res.status(400).json({ error: "Thẻ NFC này đã được liên kết với một thành viên khác!" });
    }

    // Generate a unique 32-character secret key for dynamic HMAC verification (anti-cloning)
    const secretKey = crypto.randomBytes(16).toString("hex");

    const updatedUser = await updateUser(userId, {
      nfcCard: {
        cardId,
        status: "active",
        linkedAt: new Date().toISOString(),
        secretKey
      }
    });

    if (!updatedUser) {
      return res.status(500).json({ error: "Không thể cập nhật thông tin thẻ NFC!" });
    }

    // Add notification
    await addNotification(
      userId,
      {
        vi: "Liên kết thẻ thành viên NFC thành công 💳",
        en: "NFC Member Card Linked Successfully 💳",
        ko: "NFC 회원 카드 연결 완료 💳"
      },
      {
        vi: `Thẻ vật lý NTAG215 (ID: ${cardId}) đã được liên kết với tài khoản của bạn. Bây giờ bạn có thể chạm thẻ để thanh toán và tích điểm tại quầy!`,
        en: `Physical NTAG215 card (ID: ${cardId}) has been linked to your account. You can now tap to pay and earn points at the counter!`,
        ko: `실물 NTAG215 카드(ID: ${cardId})가 계정에 연결되었습니다. 이제 카운터에서 카드를 터치하여 결제하고 포인트를 적립할 수 있습니다!`
      },
      "system"
    );

    const { password: _, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("NFC link error:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi liên kết thẻ NFC." });
  }
});

// API: Verify NFC Tap with Dynamic HMAC-SHA256 & Replay Protection (Section 5 of Project Plan)
router.post("/nfc/verify", async (req, res) => {
  const { cardId, timestamp, signature } = req.body;

  if (!cardId || !timestamp || !signature) {
    return res.status(400).json({ error: "Thiếu thông tin xác thực NFC (ID thẻ, Dấu thời gian, hoặc Chữ ký)!" });
  }

  try {
    const user = await getUserByNfcCardId(cardId);
    if (!user || !user.nfcCard) {
      return res.status(404).json({ error: "Không tìm thấy thành viên liên kết với thẻ NFC này!" });
    }

    if (user.nfcCard.status !== "active") {
      return res.status(403).json({ error: "Thẻ NFC này đã bị khóa hoặc tạm ngưng hoạt động!" });
    }

    // 1. Replay Attack Protection: verify timestamp is within 5 minutes (300,000 ms)
    const timeDiff = Math.abs(Date.now() - Number(timestamp));
    if (timeDiff > 5 * 60 * 1000) {
      return res.status(400).json({ error: "Xác thực thất bại: Yêu cầu đã quá hạn (Phòng ngừa tấn công Replay Attack)!" });
    }

    // 2. Dynamic HMAC-SHA256 verification (Anti-cloning protection)
    const expectedSignature = crypto
      .createHmac("sha256", user.nfcCard.secretKey)
      .update(timestamp.toString())
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(403).json({ error: "Cảnh báo bảo mật: Chữ ký thẻ NFC không hợp lệ! Thẻ có thể đã bị sao chép vật lý." });
    }

    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("NFC verify error:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi xác thực thẻ NFC." });
  }
});

// API: Process NFC Card Payment (Deduct from prepaid wallet and award 10% points)
router.post("/nfc/pay", async (req, res) => {
  const { cardId, amountVND, timestamp, signature } = req.body;

  if (!cardId || !amountVND || !timestamp || !signature) {
    return res.status(400).json({ error: "Thiếu thông tin giao dịch NFC!" });
  }

  try {
    const user = await getUserByNfcCardId(cardId);
    if (!user || !user.nfcCard) {
      return res.status(404).json({ error: "Không tìm thấy thành viên liên kết với thẻ NFC này!" });
    }

    if (user.nfcCard.status !== "active") {
      return res.status(403).json({ error: "Thẻ NFC này đã bị khóa!" });
    }

    // Verify dynamic signature incorporating amount to prevent tampering
    const expectedSignature = crypto
      .createHmac("sha256", user.nfcCard.secretKey)
      .update(`${timestamp}-${amountVND}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(403).json({ error: "Giao dịch thất bại: Chữ ký bảo mật NFC không trùng khớp!" });
    }

    if (user.walletBalance < amountVND) {
      return res.status(400).json({ error: "Số dư tài khoản thẻ không đủ để thực hiện thanh toán!" });
    }

    // Deduct balance and award 10% points
    const pointsEarned = Math.round(amountVND * 0.1);
    const updatedUser = await updateUserPointsAndTier(user.id, pointsEarned, -amountVND);

    if (!updatedUser) {
      return res.status(500).json({ error: "Không thể cập nhật số dư tài khoản!" });
    }

    // Add notification
    await addNotification(
      user.id,
      {
        vi: "Thanh toán chạm NFC thành công 💳",
        en: "NFC Tap Payment Successful 💳",
        ko: "NFC 터치 결제 완료 💳"
      },
      {
        vi: `Bạn đã thanh toán ${amountVND.toLocaleString("vi-VN")}đ bằng cách chạm thẻ NFC tại quầy. Nhận thêm +${pointsEarned.toLocaleString("vi-VN")} điểm LEN!`,
        en: `You paid ${amountVND.toLocaleString()}đ by tapping your NFC card at the counter. Earned +${pointsEarned.toLocaleString()} bonus LEN points!`,
        ko: `카운터에서 NFC 카드를 터치하여 ${amountVND.toLocaleString()}đ 결제되었습니다. +${pointsEarned.toLocaleString()} LEN 포인트가 적립되었습니다!`
      },
      "order"
    );

    const { password: _, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("NFC payment error:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi xử lý thanh toán NFC." });
  }
});

// API: Process NFC Card Top-up (Add balance and award 10% bonus points)
router.post("/nfc/topup", async (req, res) => {
  const { cardId, amountVND, timestamp, signature } = req.body;

  if (!cardId || !amountVND || !timestamp || !signature) {
    return res.status(400).json({ error: "Thiếu thông tin nạp tiền NFC!" });
  }

  try {
    const user = await getUserByNfcCardId(cardId);
    if (!user || !user.nfcCard) {
      return res.status(404).json({ error: "Không tìm thấy thành viên liên kết với thẻ NFC này!" });
    }

    // Verify dynamic signature
    const expectedSignature = crypto
      .createHmac("sha256", user.nfcCard.secretKey)
      .update(`${timestamp}-${amountVND}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(403).json({ error: "Nạp tiền thất bại: Chữ ký bảo mật không hợp lệ!" });
    }

    // Add balance and award 10% points
    const bonusPoints = Math.round(amountVND * 0.1);
    const updatedUser = await updateUserPointsAndTier(user.id, bonusPoints, amountVND);

    if (!updatedUser) {
      return res.status(500).json({ error: "Không thể nạp tiền vào tài khoản!" });
    }

    // Add notification
    await addNotification(
      user.id,
      {
        vi: "Nạp tiền thẻ NFC thành công 💰",
        en: "NFC Card Top-up Successful 💰",
        ko: "NFC 카드 충전 완료 💰"
      },
      {
        vi: `Đã nạp thành công ${amountVND.toLocaleString("vi-VN")}đ vào tài khoản thẻ NFC của bạn tại quầy. Nhận thêm +${bonusPoints.toLocaleString("vi-VN")} điểm LEN!`,
        en: `Successfully topped up ${amountVND.toLocaleString()}đ to your NFC card at the counter. Earned +${bonusPoints.toLocaleString()} bonus LEN points!`,
        ko: `카운터에서 NFC 카드에 ${amountVND.toLocaleString()}đ 충전이 완료되었습니다. +${bonusPoints.toLocaleString()} LEN 포인트가 적립되었습니다!`
      },
      "wallet"
    );

    const { password: _, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("NFC topup error:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi nạp tiền NFC." });
  }
});

// API: Toggle NFC Card Status (Active / Suspended)
router.post("/nfc/status", async (req, res) => {
  const { cardId, status, timestamp, signature } = req.body;

  if (!cardId || !status || !timestamp || !signature) {
    return res.status(400).json({ error: "Thiếu thông tin thay đổi trạng thái thẻ NFC!" });
  }

  try {
    const user = await getUserByNfcCardId(cardId);
    if (!user || !user.nfcCard) {
      return res.status(404).json({ error: "Không tìm thấy thành viên liên kết với thẻ NFC này!" });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", user.nfcCard.secretKey)
      .update(`${timestamp}-${status}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(403).json({ error: "Thao tác thất bại: Xác thực chữ ký không hợp lệ!" });
    }

    const updatedUser = await updateUser(user.id, {
      nfcCard: {
        ...user.nfcCard,
        status
      }
    });

    if (!updatedUser) {
      return res.status(500).json({ error: "Không thể cập nhật trạng thái thẻ!" });
    }

    // Add notification
    await addNotification(
      user.id,
      {
        vi: status === "active" ? "Kích hoạt lại thẻ NFC thành công 🔓" : "Khóa thẻ NFC tạm thời thành công 🔒",
        en: status === "active" ? "NFC Card Reactivated 🔓" : "NFC Card Locked 🔒",
        ko: status === "active" ? "NFC 카드 재활성화 완료 🔓" : "NFC 카드 잠금 완료 🔒"
      },
      {
        vi: status === "active" 
          ? "Thẻ NFC của bạn đã được kích hoạt lại và có thể sử dụng bình thường." 
          : "Thẻ NFC của bạn đã bị khóa tạm thời để đảm bảo an toàn. Nếu không phải bạn thực hiện, vui lòng liên hệ hotline 24/7 ngay lập tức.",
        en: status === "active"
          ? "Your NFC card has been reactivated and is ready for use."
          : "Your NFC card has been locked for safety. If this wasn't you, please contact our 24/7 hotline immediately.",
        ko: status === "active"
          ? "귀하의 NFC 카드가 재활성화되어 정상 사용이 가능합니다."
          : "귀하의 NFC 카드가 안전을 위해 일시 잠금되었습니다. 본인의 요청이 아닌 경우 즉시 24/7 고객센터로 연락바랍니다."
      },
      "system"
    );

    const { password: _, ...safeUser } = updatedUser;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error("NFC status toggle error:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi thay đổi trạng thái thẻ NFC." });
  }
});

export default router;
