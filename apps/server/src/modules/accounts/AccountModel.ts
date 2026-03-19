import { model, Schema, Types } from "mongoose";

export type IAccount = {
  userId?: Types.ObjectId;
  holderName: string;
  balance: number;
  active: boolean;
  createdAt: Date;
};

const accountSchema = new Schema<IAccount>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  holderName: { type: String, required: true },
  balance: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const Account = model("Account", accountSchema);
