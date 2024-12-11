import express, { type Express, type Response } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import type { ServeStaticOptions } from "serve-static";
import type { ServerResponse } from "http";
import type { IncomingMessage } from "http";

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

  // Verbesserte statische Datei-Konfiguration
  const staticOptions: ServeStaticOptions = {
    index: false,
    etag: true,
    lastModified: true,
    setHeaders: (res: ServerResponse<IncomingMessage>, filePath: string) => {
      // Cache-Kontrolle für verschiedene Dateitypen
      if (filePath.match(/\.(jpg|jpeg|png|gif|ico|svg)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 Stunden
      } else if (filePath.match(/\.(css|js)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 Jahr
      }
    }
  };

  // Serve public files first
  app.use(express.static(clientPublicPath, staticOptions));
  
  // Then serve dist files
  app.use(express.static(clientDistPath, staticOptions));

  // Handle client-side routing
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    
    const indexPath = path.join(clientDistPath, "index.html");
    res.sendFile(indexPath);
  });
}
