import mongoose, { type ClientSession } from "mongoose";

const UNSUPPORTED_TRANSACTION_MESSAGE =
	"Transaction numbers are only allowed on a replica set member or mongos";

function isUnsupportedTransactionError(error: unknown) {
	return (
		error instanceof Error &&
		error.message.includes(UNSUPPORTED_TRANSACTION_MESSAGE)
	);
}

export async function runWithOptionalTransaction<T>(
	callback: (session?: ClientSession) => Promise<T>,
) {
	const dbSession = await mongoose.startSession();

	try {
		return await dbSession.withTransaction(async () => {
			return await callback(dbSession);
		});
	} catch (error) {
		if (!isUnsupportedTransactionError(error)) {
			throw error;
		}

		return await callback();
	} finally {
		await dbSession.endSession();
	}
}