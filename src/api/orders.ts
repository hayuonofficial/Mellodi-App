import express from "express";
import { 
  getUser, 
  updateUser, 
  createOrder, 
  getUserOrders, 
  getOrder, 
  updateOrder,
  OrderRecord 
} from "../lib/firebase-db";
import { addNotification, updateUserPointsAndTier } from "./utils";
import { authenticateToken, AuthenticatedRequest } from "./middleware";
import { sendSSEEvent } from "./sse";
import { processPayment } from "./webhook";

const router = express.Router();

const BANK_ID = process.env.BANK_ID || "MB";
const BANK_ACCOUNT = process.env.BANK_ACCOUNT || "090123456789";
const BANK_ACCOUNT_NAME = process.env.BANK_ACCOUNT_NAME || "MELLODI COFFEE";

// Helper to simulate order preparation and delivery automatically (Automation)
export function startOrderLifecycleSimulation(orderId: string) {
  // 1. Transition from preparing to shipping after 15 seconds
  setTimeout(async () => {
    try {
      const order = await getOrder(orderId);
      if (!order || order.status !== "preparing") return;

      await updateOrder(orderId, { status: "shipping" });
      
      // Broadcast SSE status update
      sendSSEEvent(order.userId, "order_status_updated", { orderId, status: "shipping" });

      await addNotification(
        order.userId,
        {
          vi: "Đơn hàng đang trên đường giao 🛵",
          en: "Your order is on the way 🛵",
          ko: "배달 bắt đầu 🛵"
        },
        {
          vi: `Đơn hàng ${order.id} đang được giao tới bạn bởi Mellodi Express. Giữ điện thoại nhé!`,
          en: `Your order ${order.id} is heading your way with Mellodi Express. Keep your phone handy!`,
          ko: `Mellodi Express를 통해 주문 ${order.id} 배달이 시작되었습니다. 전화를 잘 받아주세요!`
        },
        "order"
      );

      // 2. Transition from shipping to completed after another 15 seconds
      setTimeout(async () => {
        try {
          const finishedOrder = await getOrder(orderId);
          if (!finishedOrder || finishedOrder.status !== "shipping") return;

          // Award loyalty points and recalculate tier via centralized helper
          const pointsEarned = finishedOrder.pointsEarned;
          const updatedUser = await updateUserPointsAndTier(finishedOrder.userId, pointsEarned, 0);

          await updateOrder(orderId, { status: "completed" });
          
          // Broadcast SSE status update
          sendSSEEvent(finishedOrder.userId, "order_status_updated", { orderId, status: "completed" });

          await addNotification(
            finishedOrder.userId,
            {
              vi: "Đơn hàng hoàn tất & Tích điểm thành công 🎉",
              en: "Order Completed & Points Awarded 🎉",
              ko: "주문 완료 및 포인트 적립 🎉"
            },
            {
              vi: `Đơn hàng ${finishedOrder.id} đã hoàn tất thành công! Bạn nhận được +${pointsEarned.toLocaleString("vi-VN")} điểm thưởng LEN (10% giá trị hóa đơn). Tổng điểm LEN: ${updatedUser?.lenPoints.toLocaleString("vi-VN") || ''}.`,
              en: `Your order ${finishedOrder.id} is successfully completed! You have been awarded +${pointsEarned.toLocaleString()} LEN reward points (10% of bill). Total points: ${updatedUser?.lenPoints.toLocaleString() || ''} LEN.`,
              ko: `주문 ${finishedOrder.id}이 성공적으로 완료되었습니다! 총 결제 금액 của 10%인 +${pointsEarned.toLocaleString()} LEN 포인트가 적립되었습니다. 보유 포인트: ${updatedUser?.lenPoints.toLocaleString() || ''} LEN.`
            },
            "order"
          );
        } catch (err) {
          console.error("Error in order completion simulation:", err);
        }
      }, 15000);

    } catch (err) {
      console.error("Error in order shipping simulation:", err);
    }
  }, 15000);
}

// API: Get user order history (secured)
router.get("/my-orders", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  try {
    const userOrders = await getUserOrders(userId);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: "Lỗi tải lịch sử đơn hàng." });
  }
});

// API: Submit Order Checkout (secured)
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { items, totalPriceVND, paymentMethod, currency } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Giỏ hàng trống hoặc thông tin không hợp lệ!" });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy thông tin thành viên!" });
    }

    // Double check wallet balance if payment is wallet
    if (paymentMethod === "wallet") {
      if (user.walletBalance < totalPriceVND) {
        return res.status(400).json({ error: "Số dư ví không đủ để thanh toán đơn hàng này!" });
      }
      // Deduct balance
      await updateUser(userId, {
        walletBalance: user.walletBalance - totalPriceVND
      });
    }

    const orderId = `MEL-${Math.floor(100000 + Math.random() * 900000)}`;
    const pointsEarned = Math.round(totalPriceVND * 0.1);

    // Wallet payments start preparing instantly; VietQR and Cash start pending
    // For cash, we can also start it as preparing since it's processed at the counter
    const initialStatus = (paymentMethod === "wallet" || paymentMethod === "cash") ? "preparing" : "pending";

    const newOrder: OrderRecord = {
      id: orderId,
      userId,
      items,
      totalPrice: totalPriceVND,
      currency: currency || "VND",
      pointsEarned,
      pointsUsed: 0,
      paymentMethod,
      status: initialStatus,
      date: new Date().toLocaleString(),
    };

    await createOrder(newOrder);

    // Add order receipt notification
    await addNotification(
      userId,
      {
        vi: "Đặt hàng thành công",
        en: "Order Placed Successfully",
        ko: "주문 완료"
      },
      {
        vi: `Đơn hàng ${orderId} trị giá ${totalPriceVND.toLocaleString("vi-VN")}đ đã được tiếp nhận qua phương thức ${paymentMethod}. Trạng thái: ${initialStatus === 'preparing' ? 'Đang pha chế' : 'Chờ thanh toán'}.`,
        en: `Order ${orderId} worth ${totalPriceVND.toLocaleString()}đ has been received via ${paymentMethod}. Status: ${initialStatus === 'preparing' ? 'Preparing' : 'Pending Payment'}.`,
        ko: `주문 ${orderId}(금액: ${totalPriceVND.toLocaleString()}đ)이 ${paymentMethod} 결제로 접수되었습니다. 상태: ${initialStatus === 'preparing' ? '음료 제조 중' : '대기 중'}.`
      },
      "order"
    );

    // If payment is wallet or cash, start automatic status updates
    if (initialStatus === "preparing") {
      startOrderLifecycleSimulation(orderId);
    }

    // If payment is VietQR, generate dynamic QR code
    if (paymentMethod === "vietqr") {
      const memo = `MELLODI ${orderId}`;
      const qrCodeUrl = `https://img.vietqr.io/image/${BANK_ID}-${BANK_ACCOUNT}-compact.png?amount=${totalPriceVND}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(BANK_ACCOUNT_NAME)}`;

      // AUTOMATION: Simulate bank webhook payment after 8 seconds
      setTimeout(async () => {
        try {
          console.log(`[Automation] Simulating VietQR payment for Order: ${orderId}`);
          await processPayment(memo, totalPriceVND);
        } catch (err) {
          console.error(`[Automation] Failed to auto-process VietQR order payment ${orderId}:`, err);
        }
      }, 8000);

      const updatedUser = await getUser(userId); // Get latest user data
      const { password: _, ...safeUser } = updatedUser!;

      return res.json({
        success: true,
        user: safeUser,
        order: newOrder,
        qrCodeUrl,
        memo,
        bankInfo: {
          bankId: BANK_ID,
          accountNo: BANK_ACCOUNT,
          accountName: BANK_ACCOUNT_NAME
        },
        message: "Đơn hàng chờ thanh toán. Vui lòng quét mã VietQR để hoàn tất."
      });
    }

    const updatedUser = await getUser(userId);
    const { password: _, ...safeUser } = updatedUser!;
    res.json({ success: true, user: safeUser, order: newOrder });
  } catch (error) {
    console.error("Order checkout error:", error);
    res.status(500).json({ error: "Lỗi xử lý đặt hàng." });
  }
});

// API: Update Order Status (Admin/Simulation)
router.post("/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!["pending", "preparing", "shipping", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "Trạng thái đơn hàng không hợp lệ!" });
  }

  try {
    const order = await getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: "Không tìm thấy thông tin đơn hàng!" });
    }

    const previousStatus = order.status;
    if (previousStatus === status) {
      return res.json({ success: true, order });
    }

    // Calculate the difference in points and wallet balance based on the status transition
    let diffPoints = 0;
    let diffWalletBalance = 0;

    if (status === "completed") {
      if (previousStatus !== "completed") {
        diffPoints = order.pointsEarned;
      }
    } else if (status === "cancelled") {
      if (previousStatus === "completed") {
        diffPoints = -order.pointsEarned; // Deduct points if it was completed
      }
      if (order.paymentMethod === "wallet") {
        diffWalletBalance = order.totalPrice; // Refund to wallet
      }
    } else {
      // If moving away from completed to another state (e.g. preparing)
      if (previousStatus === "completed") {
        diffPoints = -order.pointsEarned;
      }
    }

    const latestUser = await updateUserPointsAndTier(order.userId, diffPoints, diffWalletBalance);

    const updatedOrder = await updateOrder(orderId, { status });

    // Broadcast SSE status update
    sendSSEEvent(order.userId, "order_status_updated", { orderId, status });

    // Add status update notification
    let statusTitle: Record<string, string> = { vi: "Cập nhật đơn hàng", en: "Order Update", ko: "주문 업데이트" };
    let statusMessage: Record<string, string> = { vi: `Đơn hàng ${order.id} đã chuyển sang trạng thái mới.`, en: `Order ${order.id} status updated.`, ko: `주문 ${order.id}의 상태가 업데이트되었습니다.` };

    if (status === "preparing") {
      statusTitle = {
        vi: "Đơn hàng đang chuẩn bị ☕",
        en: "Your order is being prepared ☕",
        ko: "주문 음료 제조 중 ☕"
      };
      statusMessage = {
        vi: `Barista tại Mellodi đang bắt tay vào pha chế đơn hàng ${order.id} của bạn. Hãy chờ một chút nhé!`,
        en: `Mellodi Baristas are crafting your order ${order.id}. Hang tight!`,
        ko: `멜로디 바리스타가 주문 ${order.id} 음료를 제조하고 있습니다. 잠시만 기다려 주세요!`
      };
      // Trigger background simulation if moved to preparing manually
      startOrderLifecycleSimulation(orderId);
    } else if (status === "shipping") {
      statusTitle = {
        vi: "Đơn hàng đang trên đường giao 🛵",
        en: "Your order is on the way 🛵",
        ko: "배달 bắt đầu 🛵"
      };
      statusMessage = {
        vi: `Đơn hàng ${order.id} đang được giao tới bạn bởi Mellodi Express. Giữ điện thoại nhé!`,
        en: `Your order ${order.id} is heading your way with Mellodi Express. Keep your phone handy!`,
        ko: `Mellodi Express를 통해 주문 ${order.id} 배달이 시작되었습니다. 전화를 잘 받아주세요!`
      };
    } else if (status === "completed") {
      statusTitle = {
        vi: "Đơn hàng hoàn tất & Tích điểm thành công 🎉",
        en: "Order Completed & Points Awarded 🎉",
        ko: "주문 완료 및 포인트 적립 🎉"
      };
      statusMessage = {
        vi: `Đơn hàng ${order.id} đã hoàn tất thành công! Bạn nhận được +${order.pointsEarned.toLocaleString("vi-VN")} điểm thưởng LEN (10% giá trị hóa đơn). Tổng điểm LEN: ${(latestUser?.lenPoints || 0).toLocaleString("vi-VN")}.`,
        en: `Your order ${order.id} is successfully completed! You have been awarded +${order.pointsEarned.toLocaleString()} LEN reward points (10% of bill). Total points: ${(latestUser?.lenPoints || 0).toLocaleString()} LEN.`,
        ko: `주문 ${order.id}이 성공적으로 완료되었습니다! tổng kết tế của 10%인 +${order.pointsEarned.toLocaleString()} LEN 포인트가 적립되었습니다. 보유 điểm LEN: ${(latestUser?.lenPoints || 0).toLocaleString()} LEN.`
      };
    } else if (status === "cancelled") {
      statusTitle = {
        vi: "Đơn hàng đã hủy ❌",
        en: "Order Cancelled ❌",
        ko: "주문 취소 ❌"
      };
      statusMessage = {
        vi: `Đơn hàng ${order.id} đã bị hủy. ${order.paymentMethod === "wallet" ? `Mellodi đã hoàn trả ${order.totalPrice.toLocaleString("vi-VN")}đ vào ví của bạn.` : ""}`,
        en: `Order ${order.id} has been cancelled. ${order.paymentMethod === "wallet" ? `Mellodi refunded ${order.totalPrice.toLocaleString()}đ to your wallet.` : ""}`,
        ko: `주문 ${order.id}이 취소되었습니다. ${order.paymentMethod === "wallet" ? `멜로디 e-페이로 ${order.totalPrice.toLocaleString()}đ가 환불되었습니다.` : ""}`
      };
    }

    await addNotification(order.userId, statusTitle, statusMessage, "order");

    const { password: _, ...safeUser } = latestUser!;
    res.json({ success: true, user: safeUser, order: updatedOrder });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Lỗi hệ thống cập nhật đơn hàng." });
  }
});

export default router;
