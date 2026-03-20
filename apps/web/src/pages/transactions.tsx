import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ACCOUNT_PHONE_CREDIT_PURCHASED_EVENT,
  ACCOUNT_TRANSFER_RECEIVED_EVENT,
} from "@/lib/account-notification-events";
import { cn } from "@/lib/utils";
import { formatBalance, formatDateTime } from "@/lib/formatters";
import { graphqlRequest } from "@/lib/graphqlClient";
import { useAuth } from "@/lib/use-auth";

const PAGE_SIZE = 10;
const PHONE_CREDIT_PAGE_SIZE = 5;

const TRANSACTIONS_QUERY = `
  query TransactionsList($page: Int!, $limit: Int!, $accountId: ID) {
    transactionsCount(accountId: $accountId)
    transactions(page: $page, limit: $limit, accountId: $accountId) {
      id
      amount
      description
      createdAt
      fromAccount {
        id
        holderName
      }
      toAccount {
        id
        holderName
      }
    }
  }
`;

const PHONE_CREDITS_QUERY = `
  query PhoneCredits($page: Int!, $limit: Int!) {
    myPhoneCreditPurchasesCount
    myPhoneCreditPurchases(page: $page, limit: $limit) {
      id
      phone
      amount
      status
      createdAt
    }
  }
`;

type Transaction = {
  id: string;
  amount: number;
  description?: string | null;
  createdAt: string;
  fromAccount: { id: string; holderName: string };
  toAccount: { id: string; holderName: string };
};

type PhoneCreditPurchase = {
  id: string;
  phone: string;
  amount: number;
  status: "RECORDED";
  createdAt: string;
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [phoneCredits, setPhoneCredits] = useState<PhoneCreditPurchase[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [phoneCreditsTotalCount, setPhoneCreditsTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactionsData, phoneCreditsData] = await Promise.all([
        graphqlRequest<{
          transactions: Transaction[];
          transactionsCount: number;
        }>(TRANSACTIONS_QUERY, {
          page,
          limit: PAGE_SIZE,
          accountId: user?.accountId,
        }),
        graphqlRequest<{
          myPhoneCreditPurchases: PhoneCreditPurchase[];
          myPhoneCreditPurchasesCount: number;
        }>(PHONE_CREDITS_QUERY, {
          page: 1,
          limit: PHONE_CREDIT_PAGE_SIZE,
        }),
      ]);
      setTransactions(transactionsData.transactions ?? []);
      setTotalCount(transactionsData.transactionsCount ?? 0);
      setPhoneCredits(phoneCreditsData.myPhoneCreditPurchases ?? []);
      setPhoneCreditsTotalCount(phoneCreditsData.myPhoneCreditPurchasesCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [page, user?.accountId]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (typeof window === "undefined" || !user?.accountId) {
      return;
    }

    const handleActivityUpdate = () => {
      void loadTransactions();
    };

    window.addEventListener(ACCOUNT_TRANSFER_RECEIVED_EVENT, handleActivityUpdate);
    window.addEventListener(ACCOUNT_PHONE_CREDIT_PURCHASED_EVENT, handleActivityUpdate);

    return () => {
      window.removeEventListener(ACCOUNT_TRANSFER_RECEIVED_EVENT, handleActivityUpdate);
      window.removeEventListener(ACCOUNT_PHONE_CREDIT_PURCHASED_EVENT, handleActivityUpdate);
    };
  }, [loadTransactions, user?.accountId]);

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt) ||
          Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
    [transactions],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );

  const sortedPhoneCredits = useMemo(
    () =>
      [...phoneCredits].sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt) ||
          Date.parse(b.createdAt) - Date.parse(a.createdAt),
      ),
    [phoneCredits],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-border/70 bg-card px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Historico operacional
            </Badge>
            <h1>Transacoes recentes</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Entradas e saidas com valor, contraparte e data organizados para leitura imediata.
            </p>
          </div>
          <div className="rounded-[20px] border border-border/70 bg-background/80 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Volume
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{totalCount}</p>
            <p className="text-sm text-muted-foreground">transacoes no recorte atual</p>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[24px] border border-border/70 bg-card p-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Carregando transacoes...</span>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {!loading && !error && sortedTransactions.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-background/60 px-5 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              Sem transacoes para exibir no momento.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Novas movimentacoes aparecerao aqui automaticamente.
            </p>
          </div>
        ) : null}

        {!loading && !error && sortedTransactions.length > 0 ? (
          <div className="space-y-3">
            {sortedTransactions.map((transaction) => {
              const outgoing = transaction.fromAccount.id === user?.accountId;
              const counterpart = outgoing
                ? transaction.toAccount.holderName
                : transaction.fromAccount.holderName;

              return (
                <article
                  key={transaction.id}
                  className="rounded-[20px] border border-border/70 bg-background/80 px-4 py-4 transition-all duration-200 hover:border-primary/15 hover:shadow-[0_18px_38px_-30px_color-mix(in_oklab,var(--foreground)_16%,transparent)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex size-11 items-center justify-center rounded-2xl",
                          outgoing
                            ? "bg-destructive/10 text-destructive"
                            : "bg-[var(--success)]/12 text-[var(--success)]",
                        )}
                      >
                        {outgoing ? (
                          <ArrowUpRight className="size-4" />
                        ) : (
                          <ArrowDownLeft className="size-4" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {outgoing ? "Transferencia enviada" : "Transferencia recebida"}
                          </p>
                          <Badge variant={outgoing ? "destructive" : "success"}>
                            {outgoing ? "Saida" : "Entrada"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Contraparte: {counterpart}
                        </p>
                        {transaction.description ? (
                          <p className="text-sm leading-6 text-muted-foreground">
                            {transaction.description}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={cn(
                          "text-lg font-semibold tracking-[-0.03em]",
                          outgoing ? "text-destructive" : "text-[var(--success)]",
                        )}
                      >
                        {outgoing ? "-" : "+"}
                        {formatBalance(transaction.amount)}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1 text-xs text-secondary-foreground">
                        <TrendingUp className="size-3.5" />
                        {formatDateTime(transaction.createdAt)}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Pagina {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Proxima
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[24px] border border-border/70 bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Recargas registradas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Saidas de saldo ligadas a recarga simulada de celular, sem misturar com a paginacao das transferencias.
            </p>
          </div>
          <div className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {phoneCreditsTotalCount} registrada(s)
          </div>
        </div>

        {!loading && !error && sortedPhoneCredits.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border bg-background/60 px-5 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              Nenhuma recarga registrada no momento.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              As proximas recargas feitas na Home aparecerao aqui.
            </p>
          </div>
        ) : null}

        {!loading && !error && sortedPhoneCredits.length > 0 ? (
          <div className="space-y-3">
            {sortedPhoneCredits.map((phoneCredit) => (
              <article
                key={phoneCredit.id}
                className="rounded-[20px] border border-border/70 bg-background/80 px-4 py-4 transition-all duration-200 hover:border-primary/15 hover:shadow-[0_18px_38px_-30px_color-mix(in_oklab,var(--foreground)_16%,transparent)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                      <Smartphone className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          Recarga registrada
                        </p>
                        <Badge variant="destructive">Saida</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Telefone: {phoneCredit.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {phoneCredit.status}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold tracking-[-0.03em] text-destructive">
                      -{formatBalance(phoneCredit.amount)}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1 text-xs text-secondary-foreground">
                      <TrendingUp className="size-3.5" />
                      {formatDateTime(phoneCredit.createdAt)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
