import { model, Schema, Types } from "mongoose";

export type ITransaction = {
  fromAccountId: Types.ObjectId;
  toAccountId: Types.ObjectId;
  amount: number;
  description?: string;
  createdAt: Date;
};

const transactionSchema = new Schema<ITransaction>({
  fromAccountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  toAccountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = model("Transaction", transactionSchema);
