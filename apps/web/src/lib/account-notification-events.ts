export const ACCOUNT_TRANSFER_RECEIVED_EVENT = "woovi-bank:transfer-received";
export const ACCOUNT_DEPOSIT_CONFIRMED_EVENT = "woovi-bank:deposit-confirmed";
export const ACCOUNT_PHONE_CREDIT_PURCHASED_EVENT = "woovi-bank:phone-credit-purchased";

export type AccountTransferReceivedDetail = {
  transactionId: string;
  fromAccountId: string;
  fromAccountHolderName: string;
  toAccountId: string;
  amount: number;
  description?: string | null;
  createdAt: string;
};

export type AccountDepositConfirmedDetail = {
  depositId: string;
  accountId: string;
  correlationID: string;
  amount: number;
  createdAt: string;
  completedAt: string;
};

export type AccountPhoneCreditPurchasedDetail = {
  id: string;
  accountId: string;
  phone: string;
  amount: number;
  status: "RECORDED";
  createdAt: string;
};

export function dispatchAccountTransferReceived(detail: AccountTransferReceivedDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AccountTransferReceivedDetail>(ACCOUNT_TRANSFER_RECEIVED_EVENT, {
      detail,
    }),
  );
}

export function dispatchAccountDepositConfirmed(detail: AccountDepositConfirmedDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AccountDepositConfirmedDetail>(ACCOUNT_DEPOSIT_CONFIRMED_EVENT, {
      detail,
    }),
  );
}

export function dispatchAccountPhoneCreditPurchased(
  detail: AccountPhoneCreditPurchasedDetail,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AccountPhoneCreditPurchasedDetail>(
      ACCOUNT_PHONE_CREDIT_PURCHASED_EVENT,
      {
        detail,
      },
    ),
  );
}
