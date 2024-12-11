import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Skip API routes
      if (url.startsWith("/api")) {
        return next();
      }

      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html"
      );

      if (!fs.existsSync(clientTemplate)) {
        throw new Error(`Could not find template at ${clientTemplate}`);
      }

      const template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const clientDistPath = path.join(__dirname, "..", "dist", "client");
  const clientPublicPath = path.join(__dirname, "..", "client", "public");

  // Serve public files first
  app.use(express.static(clientPublicPath, {
    index: false,
    setHeaders: (res, filePath) => {
      // Set correct MIME types for images
      if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
      
      // Set cache control headers
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    }
  }));

  // Then serve dist files
  app.use(express.static(clientDistPath, {
    index: false
  }));

  // Handle client-side routing
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) {
      return next();
    }

    // Try to serve from public first
    const publicFilePath = path.join(clientPublicPath, req.path);
    if (fs.existsSync(publicFilePath) && fs.statSync(publicFilePath).isFile()) {
      return res.sendFile(publicFilePath);
    }

    // Then try dist
    const distFilePath = path.join(clientDistPath, req.path);
    if (fs.existsSync(distFilePath) && fs.statSync(distFilePath).isFile()) {
      return res.sendFile(distFilePath);
    }

    // Finally serve index.html for client routing
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}