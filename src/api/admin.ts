import express from "express";
import { 
  getAllUsers, 
  getAllOrdersGlobal, 
  getAllTransactionsGlobal,
  createUser,
  createOrder,
  createTransaction,
  getAllEducationConsultationsGlobal,
  getUser,
  updateUser,
  createProduct,
  updateProduct,
  deleteProduct,
  UserRecord,
  OrderRecord,
  TransactionRecord
} from "../lib/firebase-db.js";
import { products } from "../data/products.js";

const router = express.Router();

// Helper to get favorite drink for a user's orders
function getFavoriteDrink(orders: OrderRecord[]) {
  if (orders.length === 0) return "N/A";
  const counts: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      const name = item.product.name.vi;
      counts[name] = (counts[name] || 0) + (item.quantity || 1);
    });
  });
  let fav = "N/A";
  let max = 0;
  Object.entries(counts).forEach(([name, count]) => {
    if (count > max) {
      max = count;
      fav = name;
    }
  });
  return fav;
}

// API: Get customers list with aggregated analytics (Search & Filter)
router.get("/customers", async (req, res) => {
  try {
    const search = (req.query.search as string || "").trim().toLowerCase();
    const tierFilter = req.query.tier as string || "all"; // 'all', 'Mellodi Basic', 'Mellodi Gold', 'Mellodi Premium'
    const spendFilter = req.query.spend as string || "all"; // 'all', 'under100', '100to500', 'over500'

    const allUsers = await getAllUsers();
    const allOrders = await getAllOrdersGlobal();

    // Group orders by userId
    const ordersByUser: Record<string, OrderRecord[]> = {};
    allOrders.forEach(order => {
      if (!ordersByUser[order.userId]) {
        ordersByUser[order.userId] = [];
      }
      ordersByUser[order.userId].push(order);
    });

    // Aggregate statistics for each customer
    let customers = allUsers.map(user => {
      const userOrders = ordersByUser[user.id] || [];
      const totalSpent = userOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      const favoriteDrink = getFavoriteDrink(userOrders);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        walletBalance: user.walletBalance,
        lenPoints: user.lenPoints,
        tier: user.tier,
        createdAt: user.createdAt,
        totalOrders: userOrders.length,
        totalSpent,
        favoriteDrink,
        nfcCard: user.nfcCard
      };
    });

    // Apply Search Filter (Name, Email, Phone)
    if (search) {
      customers = customers.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.phone.includes(search)
      );
    }

    // Apply Tier Filter
    if (tierFilter !== "all") {
      customers = customers.filter(c => c.tier === tierFilter);
    }

    // Apply Spending Filter
    if (spendFilter !== "all") {
      if (spendFilter === "under100") {
        customers = customers.filter(c => c.totalSpent < 100000);
      } else if (spendFilter === "100to500") {
        customers = customers.filter(c => c.totalSpent >= 100000 && c.totalSpent <= 500000);
      } else if (spendFilter === "over500") {
        customers = customers.filter(c => c.totalSpent > 500000);
      }
    }

    res.json(customers);
  } catch (error) {
    console.error("Error getting customers list:", error);
    res.status(500).json({ error: "Lỗi tải danh sách khách hàng." });
  }
});

// API: Get 360-degree profile of a single customer
router.get("/customers/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const allUsers = await getAllUsers();
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy khách hàng này!" });
    }

    const allOrders = await getAllOrdersGlobal();
    const allTransactions = await getAllTransactionsGlobal();

    const userOrders = allOrders.filter(o => o.userId === userId);
    const userTransactions = allTransactions.filter(t => t.userId === userId);

    // Calculate product preferences
    const productCounts: Record<string, { name: string; count: number; category: string }> = {};
    userOrders.forEach(o => {
      o.items.forEach(item => {
        const prodId = item.productId;
        if (!productCounts[prodId]) {
          productCounts[prodId] = {
            name: item.product.name.vi,
            count: 0,
            category: item.product.category
          };
        }
        productCounts[prodId].count += item.quantity || 1;
      });
    });

    const preferences = Object.values(productCounts).sort((a, b) => b.count - a.count);
    const totalSpent = userOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    const { password: _, ...safeUser } = user;

    res.json({
      user: safeUser,
      stats: {
        totalSpent,
        totalOrders: userOrders.length,
        averageOrderValue: userOrders.length > 0 ? Math.round(totalSpent / userOrders.length) : 0,
        favoriteDrink: getFavoriteDrink(userOrders)
      },
      preferences,
      orders: userOrders,
      transactions: userTransactions
    });
  } catch (error) {
    console.error("Error getting customer details:", error);
    res.status(500).json({ error: "Lỗi tải thông tin chi tiết khách hàng." });
  }
});

// API: Get global system analytics
router.get("/analytics", async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    const allOrders = await getAllOrdersGlobal();

    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalPointsIssued = allUsers.reduce((sum, u) => sum + u.lenPoints, 0);

    // Tier distribution
    const tiers = { "Mellodi Basic": 0, "Mellodi Gold": 0, "Mellodi Premium": 0 };
    allUsers.forEach(u => {
      if (u.tier in tiers) {
        tiers[u.tier as keyof typeof tiers]++;
      }
    });

    // Top selling products
    const productCounts: Record<string, { name: string; count: number; revenue: number; image: string }> = {};
    allOrders.forEach(o => {
      o.items.forEach(item => {
        const prodId = item.productId;
        if (!productCounts[prodId]) {
          productCounts[prodId] = {
            name: item.product.name.vi,
            count: 0,
            revenue: 0,
            image: item.product.image
          };
        }
        productCounts[prodId].count += item.quantity || 1;
        productCounts[prodId].revenue += (item.product.priceVND * (item.size === 'L' ? 1.2 : item.size === 'M' ? 1.1 : 1.0) + (item.toppings.length * 5000)) * item.quantity;
      });
    });

    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      summary: {
        totalCustomers: allUsers.length,
        totalOrders: allOrders.length,
        totalRevenue,
        totalPointsIssued,
        averageOrderValue: allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0
      },
      tierDistribution: tiers,
      topProducts
    });
  } catch (error) {
    console.error("Error getting system analytics:", error);
    res.status(500).json({ error: "Lỗi tải thống kê hệ thống." });
  }
});

// API: Seeding 50+ Detailed Customers and purchase history (Automation)
router.post("/seed-data", async (req, res) => {
  console.log("[Seed] Starting data seeding process...");
  
  const vnFirstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
  const vnMiddleNames = ["Văn", "Thị", "Minh", "Anh", "Đức", "Hải", "Tuấn", "Hoài", "Ngọc", "Xuân", "Thanh", "Quốc", "Hữu", "Khánh", "Phương", "Trọng"];
  const vnLastNames = ["Anh", "Dũng", "Hùng", "Cường", "Trang", "Linh", "Hương", "Lan", "Nam", "Bình", "Sơn", "Long", "Phúc", "Tâm", "Vy", "Hà", "Tuấn", "Minh", "Đông"];

  const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randomRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  try {
    const createdUsers: UserRecord[] = [];

    // Create 50 Mock Customers
    for (let i = 1; i <= 52; i++) {
      const name = `${randomItem(vnFirstNames)} ${randomItem(vnMiddleNames)} ${randomItem(vnLastNames)}`;
      const email = `customer.${i}.${Math.random().toString(36).substring(2, 5)}@gmail.com`.toLowerCase();
      const phone = `09${randomRange(10000000, 99999999)}`;
      const userId = `u-seed-${1000 + i}`;

      // Distribute Tiers and balances realistically
      let tier: "Mellodi Basic" | "Mellodi Gold" | "Mellodi Premium" = "Mellodi Basic";
      let lenPoints = randomRange(0, 50000);
      let walletBalance = randomRange(0, 150000);

      const tierRoll = Math.random();
      if (tierRoll > 0.88) {
        tier = "Mellodi Premium";
        lenPoints = randomRange(300000, 800000);
        walletBalance = randomRange(100000, 850000);
      } else if (tierRoll > 0.6) {
        tier = "Mellodi Gold";
        lenPoints = randomRange(100000, 290000);
        walletBalance = randomRange(50000, 450000);
      }

      const joinDaysAgo = randomRange(1, 45);
      const createdAt = new Date(Date.now() - joinDaysAgo * 24 * 60 * 60 * 1000).toISOString();

      const user: UserRecord = {
        id: userId,
        name,
        email,
        phone,
        walletBalance,
        lenPoints,
        tier,
        createdAt
      };

      await createUser(user);
      createdUsers.push(user);

      // Generate 1 to 7 Orders for this customer
      const orderCount = randomRange(1, 7);
      for (let j = 1; j <= orderCount; j++) {
        const orderId = `MEL-SEED-${userId.split("-")[2]}-${j}`;
        
        // Choose 1 to 3 random products
        const itemCount = randomRange(1, 3);
        const orderItems: any[] = [];
        let totalPriceVND = 0;

        for (let k = 0; k < itemCount; k++) {
          const prod = randomItem(products);
          const size = randomItem(["S", "M", "L"]) as "S" | "M" | "L";
          const qty = randomRange(1, 2);
          
          const sizeMultiplier = size === 'L' ? 1.2 : size === 'M' ? 1.1 : 1.0;
          const toppingsCost = randomRange(0, 2) * 5000;
          const itemCost = Math.round((prod.priceVND * sizeMultiplier) + toppingsCost);
          
          orderItems.push({
            id: `item-${j}-${k}-${Math.random().toString(36).substring(2, 5)}`,
            productId: prod.id,
            product: prod,
            size,
            ice: randomItem(["50%", "100%"]),
            sugar: randomItem(["50%", "100%"]),
            toppings: toppingsCost > 0 ? ["Trân châu hoàng kim"] : [],
            quantity: qty,
            note: ""
          });

          totalPriceVND += itemCost * qty;
        }

        const orderDate = new Date(new Date(createdAt).getTime() + randomRange(1, joinDaysAgo) * 24 * 60 * 60 * 1000).toISOString();
        const pointsEarned = Math.round(totalPriceVND * 0.1);

        const order: OrderRecord = {
          id: orderId,
          userId,
          items: orderItems,
          totalPrice: totalPriceVND,
          currency: "VND",
          pointsEarned,
          pointsUsed: 0,
          paymentMethod: randomItem(["wallet", "vietqr", "cash"]),
          status: "completed",
          date: new Date(orderDate).toLocaleString()
        };

        await createOrder(order);
      }

      // Generate 1 to 3 Top-up Transactions
      const txCount = randomRange(1, 3);
      for (let t = 1; t <= txCount; t++) {
        const txId = `TX-SEED-${userId.split("-")[2]}-${t}`;
        const amountVND = randomItem([50000, 100000, 200000, 500000]);
        const txDate = new Date(new Date(createdAt).getTime() + randomRange(0, joinDaysAgo) * 24 * 60 * 60 * 1000).toISOString();

        const tx: TransactionRecord = {
          id: txId,
          userId,
          type: "topup",
          amountVND,
          paymentMethod: randomItem(["VietQR_Transfer", "Napas_CreditCard"]),
          status: "success",
          date: new Date(txDate).toLocaleString()
        };

        await createTransaction(tx);
      }
    }

    res.json({
      success: true,
      message: `Đã nạp thành công bộ dữ liệu lớn gồm ${createdUsers.length} khách hàng VIP, cùng hơn 200 đơn hàng và giao dịch nạp ví thực tế!`
    });
  } catch (err) {
    console.error("Failed to seed database:", err);
    res.status(500).json({ error: "Lỗi hệ thống trong quá trình tạo dữ liệu lớn giả lập." });
  }
});

// API: Get all study abroad consultations
router.get("/education-consultations", async (req, res) => {
  try {
    const consultations = await getAllEducationConsultationsGlobal();
    res.json(consultations);
  } catch (error) {
    console.error("Get education consultations error:", error);
    res.status(500).json({ error: "Lỗi hệ thống lấy danh sách đăng ký." });
  }
});

// API: Admin - Change User Role (Only Admin can do this)
router.post("/change-role", async (req, res) => {
  const { userId, newRole } = req.body;

  if (!userId || !newRole) {
    return res.status(400).json({ error: "Thiếu thông tin người dùng hoặc vai trò mới!" });
  }

  if (!["admin", "manager", "customer"].includes(newRole)) {
    return res.status(400).json({ error: "Vai trò mới không hợp lệ!" });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy thông tin khách hàng!" });
    }

    if (userId === "u-admin") {
      return res.status(403).json({ error: "Không thể thay đổi vai trò của tài khoản Admin tối cao!" });
    }

    const updatedUser = await updateUser(userId, { role: newRole });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Change role error:", error);
    res.status(500).json({ error: "Lỗi hệ thống thay đổi vai trò." });
  }
});

// API: Admin - Add Product
router.post("/products", async (req, res) => {
  const { id, category, name, description, priceVND, priceKRW, priceUSD, image, popular } = req.body;

  if (!id || !category || !name || !priceVND) {
    return res.status(400).json({ error: "Thiếu thông tin sản phẩm bắt buộc!" });
  }

  try {
    const newProduct = {
      id,
      category,
      name,
      description: description || { vi: "", en: "", ko: "" },
      priceVND: Number(priceVND),
      priceKRW: Number(priceKRW || 0),
      priceUSD: Number(priceUSD || 0),
      image: image || "☕",
      popular: !!popular
    };

    const created = await createProduct(newProduct);
    res.json({ success: true, product: created });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi thêm món mới." });
  }
});

// API: Admin - Update Product
router.put("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const updates = req.body;

  try {
    const updated = await updateProduct(productId, updates);
    if (!updated) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm cần cập nhật!" });
    }
    res.json({ success: true, product: updated });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi cập nhật thông tin món." });
  }
});

// API: Admin - Delete Product
router.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const deleted = await deleteProduct(productId);
    if (!deleted) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm cần xóa!" });
    }
    res.json({ success: true, message: "Đã xóa sản phẩm thành công khỏi thực đơn!" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi xóa món." });
  }
});

// API: Admin - Toggle NFC Card Status (Active / Suspended)
router.post("/nfc/toggle-status", async (req, res) => {
  const { userId, cardId, status } = req.body;

  if (!userId || !cardId || !status) {
    return res.status(400).json({ error: "Thiếu thông tin người dùng, ID thẻ hoặc trạng thái mới!" });
  }

  if (!["active", "suspended"].includes(status)) {
    return res.status(400).json({ error: "Trạng thái thẻ không hợp lệ!" });
  }

  try {
    const user = await getUser(userId);
    if (!user || !user.nfcCard || user.nfcCard.cardId !== cardId) {
      return res.status(404).json({ error: "Không tìm thấy thông tin thẻ NFC liên kết với thành viên này!" });
    }

    // Update only the status inside the nfcCard object
    const updatedUser = await updateUser(userId, {
      nfcCard: {
        ...user.nfcCard,
        status: status as 'active' | 'suspended'
      }
    });

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Toggle NFC status error:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi thay đổi trạng thái thẻ." });
  }
});

export default router;
