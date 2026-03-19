type TransactionDocumentOverrides = Partial<{
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  createdAt: Date;
  save: jest.Mock;
}>;

export function createTransactionDocument(
  overrides: TransactionDocumentOverrides = {},
) {
  return {
    id: "transaction-1",
    fromAccountId: "account-1",
    toAccountId: "account-2",
    amount: 100,
    description: "Transferencia teste",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}