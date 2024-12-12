import { Request } from "express";
import { users } from "@db/schema";
import { type InferModel } from "drizzle-orm";

export type User = {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyId: number | null;
  role: string;
  isApproved: boolean;
  profileImage: string | null;
  createdAt: Date;
  lastActive: Date | null;
  assignedAdmin: string;
  onboardingCompleted: boolean;
  isFirstLogin: boolean;
  currentPhase: string;
  completedPhases: any[];
  progress: number;
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  googleTokenExpiry: Date | null;
  googleDriveConnected: boolean;
  metaAccessToken: string | null;
  metaConnected: boolean;
};

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
