import { model, Schema } from "mongoose";
import type { UserRole } from "../../types/auth";

export type ISession = {
  token: string;
  userId: string;
  role: UserRole;
  expiresAt: Date;
  createdAt: Date;
};

const sessionSchema = new Schema<ISession>({
  token: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  role: { type: String, enum: ["USER", "ADMIN"], required: true },
  expiresAt: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export const Session = model("Session", sessionSchema);
