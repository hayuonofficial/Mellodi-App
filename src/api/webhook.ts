import express from "express";
import { 
  getTransaction, 
  updateTransaction, 
  getUser, 
  updateUser, 
  getOrder, 
  updateOrder 
} from "../lib/firebase-db";
import { addNotification } from "./utils";
import { startOrderLifecycleSimulation } from "./orders";

const router = express.Router();

// Common handler to process bank transfer payment
export async function processPayment(description: string, amount: number): Promise<{ success: boolean; message: string }> {
  const cleanDesc = description.toUpperCase();
  
  // 1. Check if it's a Wallet Top-up (e.g. MELLODI TX-ABCDEF)
  const txMatch = cleanDesc.match(/TX-[A-Z0-9]+/);
  if (txMatch) {
    const txId = txMatch[0];
    const tx = await getTransaction(txId);
    
    if (!tx) {
      return { success: false, message: `Không tìm thấy mã giao dịch: ${txId}` };
    }
    
    if (tx.status === "success") {
      return { success: true, message: `Giao dịch ${txId} đã được xử lý trước đó.` };
    }

    const user = await getUser(tx.userId);
    if (!user) {
      return { success: false, message: "Không tìm thấy người dùng sở hữu giao dịch." };
    }

    // Update transaction to success
    await updateTransaction(txId, { status: "success" });

    // Update user balance and points
    const topUpAmount = amount || tx.amountVND;
    const bonusPoints = Math.round(topUpAmount * 0.1);
    const newBalance = user.walletBalance + topUpAmount;
    const newPoints = user.lenPoints + bonusPoints;

    // Recalculate tier
    let newTier = user.tier;
    if (newPoints >= 50000) newTier = "Gold";
    else if (newPoints >= 20000) newTier = "Green";

    await updateUser(user.id, {
      walletBalance: newBalance,
      lenPoints: newPoints,
      tier: newTier
    });

    await addNotification(
      user.id,
      {
        vi: "Tự động nạp ví thành công 💰",
        en: "Automatic Wallet Top-up Successful 💰",
        ko: "e-페이 자동 충전 완료 💰"
      },
      {
        vi: `Hệ thống đã ghi nhận khoản chuyển khoản ${topUpAmount.toLocaleString("vi-VN")}đ (Mã: ${txId}). Số dư ví của bạn đã được cập nhật. Nhận thêm +${bonusPoints.toLocaleString("vi-VN")} điểm LEN!`,
        en: `We received your bank transfer of ${topUpAmount.toLocaleString()}đ (ID: ${txId}). Your wallet balance has been updated. Earned +${bonusPoints.toLocaleString()} bonus LEN points!`,
        ko: `은행 이체 ${topUpAmount.toLocaleString()}đ(ID: ${txId})가 확인되었습니다. e-페이 잔액이 충전되었으며, +${bonusPoints.toLocaleString()} LEN 포인트가 적립되었습니다!`
      },
      "wallet"
    );

    return { success: true, message: `Nạp ví thành công cho người dùng ${user.name}. Giao dịch: ${txId}` };
  }

  // 2. Check if it's an Order Payment (e.g. MELLODI MEL-123456)
  const orderMatch = cleanDesc.match(/MEL-[0-9]+/);
  if (orderMatch) {
    const orderId = orderMatch[0];
    const order = await getOrder(orderId);

    if (!order) {
      return { success: false, message: `Không tìm thấy mã đơn hàng: ${orderId}` };
    }

    if (order.status !== "pending") {
      return { success: true, message: `Đơn hàng ${orderId} đã được thanh toán hoặc xử lý.` };
    }

    // Update order status to preparing
    await updateOrder(orderId, { status: "preparing" });

    await addNotification(
      order.userId,
      {
        vi: "Thanh toán đơn hàng thành công 🎉",
        en: "Order Payment Received 🎉",
        ko: "주문 결제 확인 🎉"
      },
      {
        vi: `Mellodi đã nhận được thanh toán chuyển khoản cho đơn hàng ${orderId}. Barista đang bắt đầu pha chế món nước của bạn!`,
        en: `Mellodi has received your transfer payment for order ${orderId}. Our baristas are now crafting your drinks!`,
        ko: `주문 ${orderId}에 대한 이체 결제가 완료되었습니다. 바리스타가 음료 제조를 시작합니다!`
      },
      "order"
    );

    // Start automatic order delivery simulation
    startOrderLifecycleSimulation(orderId);

    return { success: true, message: `Thanh toán đơn hàng ${orderId} thành công. Đang pha chế.` };
  }

  return { success: false, message: `Nội dung chuyển khoản không khớp cấu trúc giao dịch Mellodi: "${description}"` };
}

// API: Standard Webhook Endpoint (POST /api/payment/webhook)
// Suitable for PayOS, SePay, Casso, or custom banking gateways
router.post("/webhook", async (req, res) => {
  // PayOS body has data: { description, amount }
  // SePay body has: { content, transferAmount }
  const body = req.body;
  
  // Normalize fields from different gateways
  const description = body.description || body.content || body.data?.description || "";
  const amount = Number(body.amount || body.transferAmount || body.data?.amount || 0);

  if (!description) {
    return res.status(400).json({ error: "Không tìm thấy nội dung chuyển khoản trong webhook payload!" });
  }

  try {
    const result = await processPayment(description, amount);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ status: "success", message: result.message });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Lỗi xử lý webhook thanh toán." });
  }
});

// API: Simulate Bank Transfer Webhook (POST /api/payment/simulate)
// Used by frontend for local demonstration without opening a real banking app
router.post("/simulate", async (req, res) => {
  const { description, amount } = req.body;

  if (!description || !amount) {
    return res.status(400).json({ error: "Vui lòng nhập nội dung chuyển khoản và số tiền!" });
  }

  try {
    const result = await processPayment(description, Number(amount));
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Simulation error:", error);
    res.status(500).json({ error: "Lỗi giả lập chuyển khoản." });
  }
});

export default router;
