import express from "express";
import authRouter from "./auth.js";
import walletRouter from "./wallet.js";
import ordersRouter from "./orders.js";
import giftsRouter from "./gifts.js";
import notificationsRouter from "./notifications.js";
import usersRouter from "./users.js";
import webhookRouter from "./webhook.js";
import adminRouter from "./admin.js";
import educationRouter from "./education.js";

import { getAllProductsGlobal } from "../lib/firebase-db.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/wallet", walletRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/gifts", giftsRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/payment", webhookRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/education", educationRouter);

// Public dynamic menu endpoint
apiRouter.get("/products", async (req, res) => {
  try {
    const products = await getAllProductsGlobal();
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách sản phẩm." });
  }
});

export default apiRouter;
