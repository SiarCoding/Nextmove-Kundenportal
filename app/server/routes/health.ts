import { type Express } from "express";
import { db } from "../db";

export function registerHealthRoutes(app: Express) {
  app.get('/api/health', async (_req, res) => {
    try {
      // Check database connection
      await db.query.users.findFirst();

      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          api: 'running'
        },
        environment: process.env.NODE_ENV
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'disconnected',
          api: 'running'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
