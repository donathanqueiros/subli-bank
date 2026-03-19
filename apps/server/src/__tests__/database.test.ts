jest.mock("mongoose", () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    connection: {
      on: jest.fn(),
    },
  },
}));

jest.mock("../modules/ledger/LedgerEntryModel", () => ({
  LedgerEntry: {
    syncIndexes: jest.fn(),
  },
}));

import mongoose from "mongoose";
import { connectDatabase } from "../database";
import { LedgerEntry } from "../modules/ledger/LedgerEntryModel";

const mongooseMock = mongoose as unknown as {
  connect: jest.Mock;
  connection: {
    on: jest.Mock;
  };
};

const LedgerEntryModel = LedgerEntry as unknown as {
  syncIndexes: jest.Mock;
};

describe("connectDatabase", () => {
  it("sincroniza os indices do ledger ao conectar", async () => {
    mongooseMock.connect.mockResolvedValue(undefined);
    LedgerEntryModel.syncIndexes.mockResolvedValue(undefined);

    await connectDatabase();

    expect(mongooseMock.connect).toHaveBeenCalledTimes(1);
    expect(LedgerEntryModel.syncIndexes).toHaveBeenCalledTimes(1);
  });
});