import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import cors from "cors";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with absolute path
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? ["https://nextmove-docker.onrender.com", "https://nextmove-kundenportal.onrender.com"]
    : ["http://localhost:5000", "http://localhost:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Session configuration
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? ".onrender.com" : undefined,
    path: "/"
  },
  name: "nextmove.sid"
});

app.use(sessionMiddleware);

app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));

// Serve uploaded files
const uploadsPath = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsPath));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  log(`${req.method} ${req.path}`);
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms :: ${JSON.stringify(req.session?.user || null)}`);
  });
  
  next();
});

(async () => {
  registerRoutes(app);
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment variable or fallback to 5000
  const PORT = parseInt(process.env.PORT || '5000', 10);
  server.listen(PORT, () => {
    log(`serving on port ${PORT}`);
  });
})();
