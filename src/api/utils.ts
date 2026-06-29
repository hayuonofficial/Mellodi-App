import { createNotification, UserNotification, getUser, updateUser, UserRecord } from "../lib/firebase-db.js";
import { sendSSEEvent } from "./sse.js";

export async function addNotification(
  userId: string,
  title: Record<string, string>,
  message: Record<string, string>,
  type: "order" | "wallet" | "gift" | "system"
): Promise<UserNotification> {
  const notif: UserNotification = {
    id: `notif-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    userId,
    title,
    message,
    type,
    date: new Date().toLocaleString(),
    isRead: false
  };

  await createNotification(notif);
  
  // Broadcast new notification via SSE
  sendSSEEvent(userId, "notification_received", { notification: notif });
  
  return notif;
}

/**
 * Centralized helper to update user points and wallet balance.
 * Automatically handles membership tier upgrades, reward voucher issuance, and real-time SSE broadcasts.
 */
export async function updateUserPointsAndTier(
  userId: string,
  additionalPoints: number,
  additionalWalletBalance: number = 0
): Promise<UserRecord | null> {
  try {
    const user = await getUser(userId);
    if (!user) return null;

    const newPoints = user.lenPoints + additionalPoints;
    const newBalance = user.walletBalance + additionalWalletBalance;

    let newTier = user.tier;
    if (newPoints >= 300000) newTier = "Mellodi Premium";
    else if (newPoints >= 100000) newTier = "Mellodi Gold";
    else newTier = "Mellodi Basic";

    // Determine if user has been upgraded
    const isTierUpgraded = newTier !== user.tier && (
      (user.tier === "Mellodi Basic" && (newTier === "Mellodi Gold" || newTier === "Mellodi Premium")) ||
      (user.tier === "Mellodi Gold" && newTier === "Mellodi Premium")
    );

    const updatedUser = await updateUser(userId, {
      lenPoints: newPoints,
      walletBalance: newBalance,
      tier: newTier
    });

    if (!updatedUser) return null;

    // 1. Broadcast wallet and profile update to client via SSE
    const { password: _, ...safeUser } = updatedUser;
    sendSSEEvent(userId, "wallet_updated", { user: safeUser });

    // 2. Handle tier upgrade rewards
    if (isTierUpgraded) {
      const voucherCode = newTier === "Mellodi Premium" ? "WELCOMEPREMIUM" : "WELCOMEGOLD";
      const discountValue = newTier === "Mellodi Premium" ? 50 : 30;
      const tierSafeName = newTier.replace(/\s+/g, '-').toLowerCase();

      const newVoucher = {
        id: `vc-tier-${tierSafeName}-${Date.now()}`,
        code: voucherCode,
        title: {
          vi: `Chào Mừng Hạng ${newTier} - Giảm ${discountValue}%`,
          en: `${newTier} Tier Welcome - ${discountValue}% Off`,
          ko: `${newTier} 등급 환영 쿠폰 - ${discountValue}% 할인`
        },
        description: {
          vi: `Voucher đặc quyền khi thăng hạng ${newTier}. Giảm ${discountValue}% cho đơn hàng tiếp theo.`,
          en: `Exclusive reward voucher for upgrading to ${newTier} tier. Get ${discountValue}% off your next order.`,
          ko: `${newTier} 등급 승급 축하 전용 혜택. 다음 주문 시 ${discountValue}% 특별 할인.`
        },
        discountType: "percent" as const,
        value: discountValue,
        minOrderVND: 30000,
        minOrderKRW: 2000,
        minOrderUSD: 1.50,
        claimed: true,
        used: false,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days
      };

      // Send SSE event to add the voucher to the client's wallet
      sendSSEEvent(userId, "voucher_issued", { voucher: newVoucher });

      // Add system notification
      await addNotification(
        userId,
        {
          vi: `🎉 Thăng hạng thành viên ${newTier}!`,
          en: `🎉 Upgraded to ${newTier} Tier!`,
          ko: `🎉 ${newTier} 등급 승급 완료!`
        },
        {
          vi: `Chúc mừng bạn đã đạt hạng thành viên ${newTier}. Mellodi đã tặng bạn một Voucher ưu đãi giảm ${discountValue}%!`,
          en: `Congratulations on reaching ${newTier} membership tier. We have added a ${discountValue}% discount Voucher to your wallet!`,
          ko: `귀하의 계정이 ${newTier} 등급으로 승급되었습니다. 등급 승급 축하 선물로 ${discountValue}% 할인 쿠폰이 발급되었습니다!`
        },
        "system"
      );

      // Trigger visual tier upgrade modal on frontend
      sendSSEEvent(userId, "tier_upgraded", { tier: newTier, voucher: newVoucher });
    }

    return updatedUser;
  } catch (error) {
    console.error("[Database] Error in updateUserPointsAndTier:", error);
    return null;
  }
}

