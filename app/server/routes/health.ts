import { type Express } from "express";

export function registerHealthRoutes(app: Express) {
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
  });
}
