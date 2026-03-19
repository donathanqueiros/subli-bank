import { GraphQLBoolean, GraphQLNonNull, GraphQLString } from "graphql";
import { Account } from "../AccountModel";
import { runWithOptionalTransaction } from "../../../database/runWithOptionalTransaction";
import { IdempotencyRequest } from "../../idempotency/IdempotencyRequestModel";
import { LedgerEntry } from "../../ledger/LedgerEntryModel";
import { Transaction } from "../../transactions/TransactionModel";
import { User } from "../../users/UserModel";
import type { GraphQLContext } from "../../../types/auth";

export const DeleteUserMutation = {
  type: new GraphQLNonNull(GraphQLBoolean),
  args: {
    userId: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _source: unknown,
    { userId }: { userId: string },
    context: GraphQLContext,
  ) => {
    if (context.auth?.role !== "ADMIN") {
      throw new Error("Apenas administrador pode excluir usuario");
    }

    const account = await Account.findOne({ userId });

    if (!account) {
      throw new Error("Conta do usuario nao encontrada");
    }

    const transferIds = await Transaction.find({
      $or: [
        { fromAccountId: account.id },
        { toAccountId: account.id },
      ],
    }).distinct("_id");

    await runWithOptionalTransaction(async (dbSession) => {
      const sessionOptions = dbSession ? { session: dbSession } : null;

      if (sessionOptions) {
        await IdempotencyRequest.deleteMany(
          { transferId: { $in: transferIds } },
          sessionOptions,
        );
        await LedgerEntry.deleteMany(
          {
            $or: [
              { accountId: account.id },
              { transferId: { $in: transferIds } },
            ],
          },
          sessionOptions,
        );
        await Transaction.deleteMany(
          { _id: { $in: transferIds } },
          sessionOptions,
        );
        await Account.deleteOne({ _id: account.id }, sessionOptions);
        await User.deleteOne({ _id: userId }, sessionOptions);
        return;
      }

      await IdempotencyRequest.deleteMany({ transferId: { $in: transferIds } });
      await LedgerEntry.deleteMany({
        $or: [
          { accountId: account.id },
          { transferId: { $in: transferIds } },
        ],
      });
      await Transaction.deleteMany({ _id: { $in: transferIds } });
      await Account.deleteOne({ _id: account.id });
      await User.deleteOne({ _id: userId });
    });

    return true;
  },
};
