import { LedgerEntry } from "../LedgerEntryModel";

describe("LedgerEntry model", () => {
  it("define indice unico apenas quando transferId existe", () => {
    const indexes = LedgerEntry.schema.indexes();

    expect(indexes).toContainEqual([
      { transferId: 1, type: 1 },
      {
        unique: true,
        partialFilterExpression: {
          transferId: { $exists: true },
        },
      },
    ]);
  });
});