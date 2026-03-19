import mongoose from "mongoose";
import { config } from "./config";
import { LedgerEntry } from "./modules/ledger/LedgerEntryModel";

async function connectDatabase() {
  // eslint-disable-next-line
  mongoose.connection.on("close", () =>
    console.log("Database connection closed."),
  );

  await mongoose.connect(config.MONGO_URI);
  await LedgerEntry.syncIndexes();
}

export { connectDatabase };
