import express from "express";
import authRouter from "./auth";
import walletRouter from "./wallet";
import ordersRouter from "./orders";
import giftsRouter from "./gifts";
import notificationsRouter from "./notifications";
import usersRouter from "./users";
import webhookRouter from "./webhook";
import adminRouter from "./admin";
import educationRouter from "./education";

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

export default apiRouter;
