import { model, Schema, Types } from "mongoose";

export type PhoneCreditPurchaseStatus = "RECORDED";

export type IPhoneCreditPurchase = {
  accountId: Types.ObjectId;
  phone: string;
  amount: number;
  status: PhoneCreditPurchaseStatus;
  idempotencyKey: string;
  ledgerEntryId?: Types.ObjectId;
  createdAt: Date;
};

const phoneCreditPurchaseSchema = new Schema<IPhoneCreditPurchase>({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["RECORDED"],
    required: true,
    default: "RECORDED",
  },
  idempotencyKey: { type: String, required: true },
  ledgerEntryId: { type: Schema.Types.ObjectId, ref: "LedgerEntry" },
  createdAt: { type: Date, default: Date.now, index: true },
});

phoneCreditPurchaseSchema.index({ accountId: 1, idempotencyKey: 1 }, { unique: true });
phoneCreditPurchaseSchema.index({ accountId: 1, createdAt: -1 });

export const PhoneCreditPurchase = model(
  "PhoneCreditPurchase",
  phoneCreditPurchaseSchema,
);
