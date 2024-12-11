import { type Request, type Response } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema";

export const requireAuth = async (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Nicht authentifiziert" });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.session.userId)
    });

    if (!user) {
        (req.session as any) = null;
      return res.status(401).json({ error: "Nicht authentifiziert" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Serverfehler" });
  }
}; 