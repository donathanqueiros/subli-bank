import { GraphQLFloat, GraphQLNonNull, GraphQLString } from "graphql";
import { Account } from "../AccountModel";
import { AccountType } from "../AccountType";
import { runWithOptionalTransaction } from "../../../database/runWithOptionalTransaction";
import { IdempotencyRequest } from "../../idempotency/IdempotencyRequestModel";
import { LedgerEntry } from "../../ledger/LedgerEntryModel";
import { transferNotificationBus } from "../../notifications/transferNotificationBus";
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

    const account = await Account.findById(accountId);

    if (!account) {
      throw new Error("Conta nao encontrada");
    }

    if (!account.active) {
      throw new Error("Credito administrativo permitido apenas para conta ativa");
    }

    const existingRequest = await IdempotencyRequest.findOne({
      accountId,
      idempotencyKey,
    });

    if (existingRequest) {
      return account;
    }

    const adminSourceAccount = await Account.findOne({
      userId: context.auth.userId,
    });

    if (!adminSourceAccount) {
      throw new Error("Conta do administrador nao encontrada");
    }

    let transfer: InstanceType<typeof Transaction> | null = null;

    await runWithOptionalTransaction(async (dbSession) => {
      const sessionOptions = dbSession ? { session: dbSession } : null;

        transfer = new Transaction({
          fromAccountId: String(adminSourceAccount.id),
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

    if (!transfer) {
      throw new Error("Falha ao criar credito administrativo");
    }

    const persistedTransfer = transfer as {
      id: string;
      createdAt: Date | string;
    };

    transferNotificationBus.publishTransferReceived({
      transactionId: String(persistedTransfer.id),
      fromAccountId: String(adminSourceAccount.id),
      fromAccountHolderName: adminSourceAccount.holderName,
      toAccountId: accountId,
      amount,
      description: "Credito administrativo",
      createdAt: new Date(persistedTransfer.createdAt).toISOString(),
    });

    return account;
  },
};
