import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRouter from "./src/api";
import { addClient, removeClient } from "./src/api/sse";

const app = express();
const PORT = 3000;

// Parse JSON payloads
app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Real-time Server-Sent Events
app.get("/api/sse", (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).end("Missing userId");
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Connection": "keep-alive",
    "Cache-Control": "no-cache",
  });

  // Send initial connection message
  res.write(`event: connected\ndata: ${JSON.stringify({ status: "connected" })}\n\n`);

  addClient(userId, res);

  req.on("close", () => {
    removeClient(userId, res);
  });
});

// Mount modular API endpoints
app.use("/api", apiRouter);

// Initialize Vite or serve static production files
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Start local listener if not running on Vercel
initServer().then(() => {
  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Server] Mellodi Full-Stack listening on port ${PORT}`);
    });
  }
});

export default app;
