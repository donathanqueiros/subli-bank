type AccountDocumentOverrides = Partial<{
  id: string;
  userId: string;
  holderName: string;
  balance: number;
  active: boolean;
  createdAt: Date;
  save: jest.Mock;
}>;

export function createAccountDocument(
  overrides: AccountDocumentOverrides = {},
) {
  return {
    id: "account-1",
    userId: "user-1",
    holderName: "Conta Teste",
    balance: 0,
    active: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}