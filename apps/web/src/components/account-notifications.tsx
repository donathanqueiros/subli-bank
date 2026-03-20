import { useEffect } from "react";
import { requestSubscription, useRelayEnvironment } from "react-relay";
import { toast } from "sonner";
import { formatBalance, formatDateTime } from "@/lib/formatters";
import {
  dispatchAccountDepositConfirmed,
  dispatchAccountTransferReceived,
} from "@/lib/account-notification-events";
import { useAuth } from "@/lib/use-auth";
import depositConfirmedSubscriptionNode from "@/pages/__generated__/accountsDepositConfirmedSubscription.graphql";
import transferReceivedSubscriptionNode from "@/pages/__generated__/accountsTransferReceivedSubscription.graphql";
import type { accountsDepositConfirmedSubscription } from "@/pages/__generated__/accountsDepositConfirmedSubscription.graphql";
import type { accountsTransferReceivedSubscription } from "@/pages/__generated__/accountsTransferReceivedSubscription.graphql";

export function AccountNotifications() {
  const relayEnvironment = useRelayEnvironment();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.accountId) {
      return;
    }

    const subscription = requestSubscription<accountsTransferReceivedSubscription>(
      relayEnvironment,
      {
        subscription: transferReceivedSubscriptionNode,
        variables: { accountId: user.accountId },
        onNext: (data) => {
          const payload = data?.transferReceived;

          if (!payload) {
            return;
          }

          toast.success(
            `Voce recebeu ${formatBalance(payload.amount)} de ${payload.fromAccountHolderName}`,
            {
              description: payload.description
                ? payload.description
                : `Transferencia em ${formatDateTime(payload.createdAt)}`,
            },
          );

          dispatchAccountTransferReceived(payload);
        },
      },
    );

    return () => subscription.dispose();
  }, [relayEnvironment, user?.accountId]);

  useEffect(() => {
    if (!user?.accountId) {
      return;
    }

    const subscription = requestSubscription<accountsDepositConfirmedSubscription>(
      relayEnvironment,
      {
        subscription: depositConfirmedSubscriptionNode,
        variables: { accountId: user.accountId },
        onNext: (data) => {
          const payload = data?.depositConfirmed;

          if (!payload) {
            return;
          }

          toast.success(`Deposito confirmado: ${formatBalance(payload.amount)}`, {
            description: `Confirmado em ${formatDateTime(payload.completedAt)}`,
          });

          dispatchAccountDepositConfirmed(payload);
        },
      },
    );

    return () => subscription.dispose();
  }, [relayEnvironment, user?.accountId]);

  return null;
}
