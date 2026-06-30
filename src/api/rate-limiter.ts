import { Request, Response, NextFunction } from "express";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-Memory map to track IP addresses
const ipRequestCache = new Map<string, RateLimitInfo>();

// Clean up expired cache entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of ipRequestCache.entries()) {
    if (now > info.resetTime) {
      ipRequestCache.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref(); // unref prevents blocking process exit

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Safely retrieve IP address, taking proxies (like Vercel CDN headers) into consideration
    const ip = (req.headers["x-forwarded-for"] as string) || req.ip || req.socket.remoteAddress || "unknown_ip";
    const now = Date.now();

    let info = ipRequestCache.get(ip);

    if (!info || now > info.resetTime) {
      // Initialize or reset token bucket for this IP
      info = {
        count: 1,
        resetTime: now + options.windowMs
      };
      ipRequestCache.set(ip, info);
      return next();
    }

    info.count++;

    if (info.count > options.max) {
      console.warn(`[Security] Rate limit exceeded for IP: ${ip}. Blocked request to: ${req.originalUrl}`);
      return res.status(429).json({
        error: options.message,
        retryAfterMs: Math.max(0, info.resetTime - now)
      });
    }

    next();
  };
}

// Pre-defined optimized rate limiters
// 1. General API rate limiter: max 120 requests per minute
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: "Hệ thống đang quá tải hoặc bạn gửi quá nhiều yêu cầu! Vui lòng thử lại sau ít phút."
});

// 2. Auth API rate limiter (login/register): max 10 requests per minute to prevent Brute-force and Auth DDoS
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Bạn đã đăng nhập hoặc đăng ký quá nhanh! Thao tác bị tạm khóa 1 phút để bảo vệ tài khoản."
});
