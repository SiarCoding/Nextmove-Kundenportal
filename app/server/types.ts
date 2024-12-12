import { Request } from "express";
import { type User as SchemaUser } from "@db/schema";

export type User = SchemaUser;

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}
