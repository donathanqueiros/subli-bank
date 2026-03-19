import { model, Schema, Types } from "mongoose";

export type IIdempotencyRequest = {
  accountId: Types.ObjectId;
  idempotencyKey: string;
  transferId: Types.ObjectId;
  createdAt: Date;
};

const idempotencyRequestSchema = new Schema<IIdempotencyRequest>({
  accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
  idempotencyKey: { type: String, required: true },
  transferId: { type: Schema.Types.ObjectId, ref: "Transaction", required: true },
  createdAt: { type: Date, default: Date.now },
});

idempotencyRequestSchema.index({ accountId: 1, idempotencyKey: 1 }, { unique: true });

export const IdempotencyRequest = model("IdempotencyRequest", idempotencyRequestSchema);
