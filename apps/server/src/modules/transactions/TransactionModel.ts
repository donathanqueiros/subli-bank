import { model, Schema, Types } from "mongoose";

export type ITransaction = {
  fromAccountId: Types.ObjectId;
  toAccountId: Types.ObjectId;
  amount: number;
  idempotencyKey: string;
  externalReference?: string;
  description?: string;
  createdAt: Date;
};

const transactionSchema = new Schema<ITransaction>({
  fromAccountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  toAccountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  amount: { type: Number, required: true },
  idempotencyKey: { type: String, required: true },
  externalReference: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.index({ externalReference: 1 }, { unique: true, sparse: true });

export const Transaction = model("Transaction", transactionSchema);
