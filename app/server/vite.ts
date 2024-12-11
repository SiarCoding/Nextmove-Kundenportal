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
  const distPath = path.join(__dirname, '../dist/client');
  const publicPath = path.join(__dirname, '../client/public');
  
  console.log('Serving static files from:', distPath);
  console.log('Serving public files from:', publicPath);

  // Serve public files first (higher priority)
  app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
      // Set cache control for images
      if (filePath.match(/\.(jpg|jpeg|png|svg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
        if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
          res.setHeader('Content-Type', 'image/jpeg');
        } else if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        } else if (filePath.endsWith('.svg')) {
          res.setHeader('Content-Type', 'image/svg+xml');
        }
      }
    }
  }));

  // Then serve dist files
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      }
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      }
    }
  }));

  // Handle client-side routing
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.url.startsWith('/api')) {
      return next();
    }

    // Try to serve from public first
    const publicFilePath = path.join(publicPath, req.url);
    if (fs.existsSync(publicFilePath)) {
      return res.sendFile(publicFilePath);
    }

    // Then try dist
    const distFilePath = path.join(distPath, req.url);
    if (fs.existsSync(distFilePath)) {
      return res.sendFile(distFilePath);
    }

    // Finally, serve index.html for client routing
    res.sendFile(path.join(distPath, 'index.html'));
  });
}