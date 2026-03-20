import { GraphQLFloat, GraphQLNonNull, GraphQLString } from "graphql";
import { Account } from "../../accounts/AccountModel";
import { runWithOptionalTransaction } from "../../../database/runWithOptionalTransaction";
import { LedgerEntry } from "../../ledger/LedgerEntryModel";
import { getAccountBalance } from "../../ledger/balance";
import { PhoneCreditPurchase } from "../PhoneCreditPurchaseModel";
import { PhoneCreditPurchaseType } from "../PhoneCreditPurchaseType";
import {
  isAllowedPhoneCreditAmount,
  isValidPhoneNumber,
} from "../phoneValidation";
import type { GraphQLContext } from "../../../types/auth";

export const PurchasePhoneCreditMutation = {
  type: new GraphQLNonNull(PhoneCreditPurchaseType),
  args: {
    phone: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLFloat) },
    idempotencyKey: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _source: unknown,
    {
      phone,
      amount,
      idempotencyKey,
    }: { phone: string; amount: number; idempotencyKey: string },
    context: GraphQLContext,
  ) => {
    if (!context.auth) {
      throw new Error("Usuario nao autenticado");
    }

    const normalizedPhone = phone.trim();
    const normalizedIdempotencyKey = idempotencyKey.trim();

    if (!isValidPhoneNumber(normalizedPhone)) {
      throw new Error("Telefone invalido. Use o formato internacional.");
    }

    if (!isAllowedPhoneCreditAmount(amount)) {
      throw new Error("Valor de recarga invalido. Use 20, 30, 50 ou 100.");
    }

    if (!normalizedIdempotencyKey) {
      throw new Error("idempotencyKey obrigatoria");
    }

    const account = await Account.findOne({ userId: context.auth.userId });

    if (!account) {
      throw new Error("Conta do usuario nao encontrada");
    }

    if (!account.active) {
      throw new Error("Recarga permitida apenas para conta ativa");
    }

    const existingPurchase = await PhoneCreditPurchase.findOne({
      accountId: account.id,
      idempotencyKey: normalizedIdempotencyKey,
    });

    if (existingPurchase) {
      return existingPurchase;
    }

    const currentBalance = await getAccountBalance(String(account.id));

    if (currentBalance < amount) {
      throw new Error("Saldo insuficiente");
    }

    let purchase: InstanceType<typeof PhoneCreditPurchase> | null = null;

    await runWithOptionalTransaction(async (dbSession) => {
      const sessionOptions = dbSession ? { session: dbSession } : null;

      const purchaseDocument = new PhoneCreditPurchase({
        accountId: account.id,
        phone: normalizedPhone,
        amount,
        status: "RECORDED",
        idempotencyKey: normalizedIdempotencyKey,
      });

      const ledgerEntry = new LedgerEntry({
        accountId: account.id,
        amount: -amount,
        type: "DEBIT",
      });

      if (sessionOptions) {
        await ledgerEntry.save(sessionOptions);
      } else {
        await ledgerEntry.save();
      }

      Object.assign(purchaseDocument, { ledgerEntryId: ledgerEntry._id });

      if (sessionOptions) {
        await purchaseDocument.save(sessionOptions);
      } else {
        await purchaseDocument.save();
      }

      purchase = purchaseDocument;
    });

    if (!purchase) {
      throw new Error("Falha ao registrar recarga");
    }

    return purchase;
  },
};
