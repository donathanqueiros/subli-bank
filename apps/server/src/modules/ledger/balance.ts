import { Types } from "mongoose";
import { LedgerEntry } from "./LedgerEntryModel";

export async function getAccountBalance(accountId: string) {
  const normalizedAccountId = Types.ObjectId.isValid(accountId)
    ? new Types.ObjectId(accountId)
    : accountId;

  const [result] = await LedgerEntry.aggregate<{ balance: number }>([
    {
      $match: {
        accountId: normalizedAccountId,
      },
    },
    {
      $group: {
        _id: "$accountId",
        balance: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        balance: 1,
      },
    },
  ]);

  return result?.balance ?? 0;
}
