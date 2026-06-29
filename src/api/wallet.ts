import express from "express";
import { 
  getUser, 
  createTransaction, 
  getUserTransactions,
  TransactionRecord 
} from "../lib/firebase-db.js";
import { addNotification, updateUserPointsAndTier } from "./utils.js";
import { authenticateToken, AuthenticatedRequest } from "./middleware.js";
import { processPayment } from "./webhook.js";
import { sendSSEEvent } from "./sse.js";

const router = express.Router();

const BANK_ID = process.env.BANK_ID || "MB"; // Default to Military Bank
const BANK_ACCOUNT = process.env.BANK_ACCOUNT || "090123456789"; // Default mock account
const BANK_ACCOUNT_NAME = process.env.BANK_ACCOUNT_NAME || "MELLODI COFFEE";

// API: Get user transactions (secured)
router.get("/transactions", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  try {
    const transactions = await getUserTransactions(userId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tải lịch sử giao dịch." });
  }
});

// API: Wallet Top-Up (Direct Payment or VietQR Generation)
router.post("/topup", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { amountVND, paymentMethod } = req.body;

  if (!amountVND || isNaN(amountVND) || amountVND <= 0) {
    return res.status(400).json({ error: "Số tiền nạp không hợp lệ!" });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy thông tin thành viên!" });
    }

    const txId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const isVietQR = paymentMethod === "VietQR_Transfer";

    // Record transaction
    const newTransaction: TransactionRecord = {
      id: txId,
      userId,
      type: "topup",
      amountVND,
      paymentMethod: paymentMethod || "VietQR_Transfer",
      status: isVietQR ? "pending" : "success", // VietQR starts as pending, others (like mock card) succeed instantly
      date: new Date().toLocaleString(),
    };

    await createTransaction(newTransaction);

    if (isVietQR) {
      // Generate real dynamic VietQR URL (img.vietqr.io is a free, standard Vietnamese banking service)
      // The memo contains the unique transaction ID so the webhook can match it.
      const memo = `MELLODI ${txId}`;
      const qrCodeUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-compact.png?amount=${amountVND}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(BANK_ACCOUNT_NAME)}`;

      // AUTOMATION: Simulate bank webhook payment after 8 seconds
      setTimeout(async () => {
        try {
          console.log(`[Automation] Simulating VietQR payment for Top-up: ${txId}`);
          await processPayment(memo, amountVND);
        } catch (err) {
          console.error(`[Automation] Failed to auto-process VietQR top-up ${txId}:`, err);
        }
      }, 8000);

      return res.json({
        success: true,
        transaction: newTransaction,
        qrCodeUrl,
        memo,
        bankInfo: {
          bankId: BANK_ID,
          accountNo: BANK_ACCOUNT,
          accountName: BANK_ACCOUNT_NAME
        },
        message: "Mã chuyển khoản VietQR đã được tạo. Vui lòng quét để hoàn tất thanh toán."
      });
    }

    // Direct success (for simulated credit card/instant payments)
    const bonusPoints = Math.round(amountVND * 0.1);
    const updatedUser = await updateUserPointsAndTier(userId, bonusPoints, amountVND);

    await addNotification(
      userId,
      {
        vi: "Nạp tiền vào ví thành công 💰",
        en: "Wallet Top-up Successful 💰",
        ko: "멜로디 e-페이 충전 완료 💰"
      },
      {
        vi: `Bạn đã nạp thành công ${amountVND.toLocaleString("vi-VN")}đ vào ví Mellodi và nhận thêm +${bonusPoints.toLocaleString("vi-VN")} điểm LEN. Hạng thành viên hiện tại: ${updatedUser?.tier}!`,
        en: `Successfully topped up ${amountVND.toLocaleString()}đ to your Mellodi wallet and received +${bonusPoints.toLocaleString()} bonus LEN points. Current tier: ${updatedUser?.tier}!`,
        ko: `e-페이에 ${amountVND.toLocaleString()}đ 충전되었습니다. 보너스로 +${bonusPoints.toLocaleString()} LEN 포인트가 적립되었습니다. 회원 등급: ${updatedUser?.tier}!`
      },
      "wallet"
    );

    const { password: _, ...safeUser } = updatedUser!;
    res.json({ success: true, user: safeUser, transaction: newTransaction });
  } catch (error) {
    console.error("Topup error:", error);
    res.status(500).json({ error: "Lỗi hệ thống nạp tiền." });
  }
});

// API: Convert Wallet Balance to LEN Points
router.post("/convert-points", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { amountVND } = req.body;

  if (!amountVND || isNaN(amountVND) || amountVND <= 0) {
    return res.status(400).json({ error: "Số tiền quy đổi không hợp lệ!" });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy thông tin thành viên!" });
    }

    if (user.walletBalance < amountVND) {
      return res.status(400).json({ error: "Số dư ví điện tử không đủ để đổi điểm LEN!" });
    }

    // Deduct wallet and add points via centralized helper (1:1 ratio)
    const updatedUser = await updateUserPointsAndTier(userId, amountVND, -amountVND);

    // Record transaction
    const txId = `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const newTransaction: TransactionRecord = {
      id: txId,
      userId,
      type: "convert",
      amountVND,
      pointsAmount: amountVND,
      status: "success",
      date: new Date().toLocaleString(),
    };

    await createTransaction(newTransaction);

    await addNotification(
      userId,
      {
        vi: "Quy đổi điểm LEN thành công 🔄",
        en: "LEN Points Conversion Successful 🔄",
        ko: "LEN 포인트 전환 완료 🔄"
      },
      {
        vi: `Bạn đã đổi thành công ${amountVND.toLocaleString("vi-VN")}đ sang +${amountVND.toLocaleString("vi-VN")} điểm LEN. Hạng thành viên hiện tại: ${updatedUser?.tier}!`,
        en: `Successfully converted ${amountVND.toLocaleString()}đ into +${amountVND.toLocaleString()} LEN points. Current tier: ${updatedUser?.tier}!`,
        ko: `e-페이 ${amountVND.toLocaleString()}đ이 +${amountVND.toLocaleString()} LEN 포인트로 전환되었습니다. 회원 등급: ${updatedUser?.tier}!`
      },
      "wallet"
    );

    const { password: _, ...safeUser } = updatedUser!;
    res.json({ success: true, user: safeUser, transaction: newTransaction });
  } catch (error) {
    console.error("Convert points error:", error);
    res.status(500).json({ error: "Lỗi hệ thống đổi điểm." });
  }
});

export default router;
