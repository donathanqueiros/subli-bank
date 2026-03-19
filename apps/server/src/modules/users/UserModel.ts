import { model, Schema } from "mongoose";
import type { UserRole } from "../../types/auth";

export type IUser = {
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
};

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = model("User", userSchema);
