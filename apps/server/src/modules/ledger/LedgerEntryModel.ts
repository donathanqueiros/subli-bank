import { model, Schema, Types } from "mongoose";

export type LedgerEntryType = "INITIAL_CREDIT" | "DEBIT" | "CREDIT" | "ADMIN_CREDIT";

export type ILedgerEntry = {
  accountId: Types.ObjectId;
  transferId?: Types.ObjectId;
  amount: number;
  type: LedgerEntryType;
  createdAt: Date;
};

const ledgerEntrySchema = new Schema<ILedgerEntry>({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
  transferId: { type: Schema.Types.ObjectId, ref: "Transaction" },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ["INITIAL_CREDIT", "DEBIT", "CREDIT", "ADMIN_CREDIT"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

ledgerEntrySchema.index(
  { transferId: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      transferId: { $exists: true },
    },
  },
);

export const LedgerEntry = model("LedgerEntry", ledgerEntrySchema);
