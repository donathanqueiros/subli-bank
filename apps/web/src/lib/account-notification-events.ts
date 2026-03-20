import type { accountsDepositConfirmedSubscription } from "@/pages/__generated__/accountsDepositConfirmedSubscription.graphql";
import type { accountsTransferReceivedSubscription } from "@/pages/__generated__/accountsTransferReceivedSubscription.graphql";

export const ACCOUNT_TRANSFER_RECEIVED_EVENT = "woovi-bank:transfer-received";
export const ACCOUNT_DEPOSIT_CONFIRMED_EVENT = "woovi-bank:deposit-confirmed";

export type AccountTransferReceivedDetail = NonNullable<
  accountsTransferReceivedSubscription["response"]["transferReceived"]
>;

export type AccountDepositConfirmedDetail = NonNullable<
  accountsDepositConfirmedSubscription["response"]["depositConfirmed"]
>;

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
