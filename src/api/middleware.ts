import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUser, UserRecord } from "../lib/firebase-db.js";

const JWT_SECRET = process.env.JWT_SECRET || "mellodi-premium-loyalty-secret-key";

export interface AuthenticatedRequest extends Request {
  user?: Omit<UserRecord, "password">;
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Không tìm thấy mã token xác thực! Vui lòng đăng nhập." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    const user = await getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Tài khoản liên kết với token này không tồn tại!" });
    }

    // Attach user to request, excluding password
    const { password: _, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Mã token xác thực đã hết hạn hoặc không hợp lệ!" });
  }
}
export { JWT_SECRET };
