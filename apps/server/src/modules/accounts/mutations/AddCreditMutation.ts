import { GraphQLFloat, GraphQLNonNull, GraphQLString } from "graphql";
import { Account } from "../AccountModel";
import { AccountType } from "../AccountType";
import { runWithOptionalTransaction } from "../../../database/runWithOptionalTransaction";
import { IdempotencyRequest } from "../../idempotency/IdempotencyRequestModel";
import { LedgerEntry } from "../../ledger/LedgerEntryModel";
import { Transaction } from "../../transactions/TransactionModel";
import type { GraphQLContext } from "../../../types/auth";

export const AddCreditMutation = {
  type: new GraphQLNonNull(AccountType),
  args: {
    accountId: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLFloat) },
    idempotencyKey: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _source: unknown,
    {
      accountId,
      amount,
      idempotencyKey,
    }: { accountId: string; amount: number; idempotencyKey: string },
    context: GraphQLContext,
  ) => {
    if (context.auth?.role !== "ADMIN") {
      throw new Error("Apenas administrador pode adicionar credito");
    }

    if (amount <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    const existingRequest = await IdempotencyRequest.findOne({
      accountId,
      idempotencyKey,
    });

    if (existingRequest) {
      const account = await Account.findById(accountId);

      if (!account) {
        throw new Error("Conta nao encontrada");
      }

      return account;
    }

    const account = await Account.findById(accountId);

    if (!account) {
      throw new Error("Conta nao encontrada");
    }

    await runWithOptionalTransaction(async (dbSession) => {
      const sessionOptions = dbSession ? { session: dbSession } : null;

        const transfer = new Transaction({
          fromAccountId: accountId,
          toAccountId: accountId,
          amount,
          idempotencyKey,
          description: "Credito administrativo",
        });
        if (sessionOptions) {
          await transfer.save(sessionOptions);
        } else {
          await transfer.save();
        }

        const ledgerEntry = new LedgerEntry({
          accountId,
          transferId: transfer.id,
          amount,
          type: "ADMIN_CREDIT",
        });
        if (sessionOptions) {
          await ledgerEntry.save(sessionOptions);
        } else {
          await ledgerEntry.save();
        }

        const idempotencyRequest = new IdempotencyRequest({
          accountId,
          idempotencyKey,
          transferId: transfer.id,
        });
        if (sessionOptions) {
          await idempotencyRequest.save(sessionOptions);
        } else {
          await idempotencyRequest.save();
        }
      });

    return account;
  },
};
