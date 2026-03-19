"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, User, DollarSign, Calendar, Loader2, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchQuery, graphql, useRelayEnvironment } from "react-relay";
import type { accountsQuery } from "./__generated__/accountsQuery.graphql";
import { graphqlRequest } from "@/lib/graphqlClient";
import { useAuth } from "@/lib/use-auth";

const accountsPageQuery = graphql`
  query accountsQuery {
    accounts {
      id
      holderName
      balance
      createdAt
    }
  }
`;

type Account = NonNullable<accountsQuery["response"]["accounts"]>[number];

const TRANSFER_MUTATION = `
  mutation Transfer($fromAccountId: String!, $toAccountId: String!, $amount: Float!, $idempotencyKey: String!, $description: String) {
    Transfer(
      fromAccountId: $fromAccountId
      toAccountId: $toAccountId
      amount: $amount
      idempotencyKey: $idempotencyKey
      description: $description
    ) {
      id
      amount
      createdAt
    }
  }
`;

const ADD_CREDIT_MUTATION = `
  mutation AddCredit($accountId: String!, $amount: Float!, $idempotencyKey: String!) {
    AddCredit(accountId: $accountId, amount: $amount, idempotencyKey: $idempotencyKey) {
      id
      balance
    }
  }
`;

const DELETE_USER_MUTATION = `
  mutation DeleteUser($userId: String!) {
    DeleteUser(userId: $userId)
  }
`;

const LOGOUT_MUTATION = `
  mutation Logout {
    Logout
  }
`;

function formatBalance(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(isoString: string) {
  const ts = Number(isoString);
  const date = Number.isFinite(ts) ? new Date(ts) : new Date(isoString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function newIdempotencyKey() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function AccountsPage() {
  const relayEnvironment = useRelayEnvironment();
  const { user, logout } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("100");
  const [transferDescription, setTransferDescription] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferFeedback, setTransferFeedback] = useState<string | null>(null);
  const [creditAccountId, setCreditAccountId] = useState("");
  const [creditAmount, setCreditAmount] = useState("100");
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState("");

  const authHeaders = useMemo(() => undefined, []);

  const myAccount = useMemo(
    () => accounts.find((account) => account.id === user?.accountId) ?? null,
    [accounts, user?.accountId],
  );

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchQuery<accountsQuery>(
        relayEnvironment,
        accountsPageQuery,
        {},
      ).toPromise();

      if (!data) {
        throw new Error("Resposta vazia do servidor");
      }

      setAccounts([...data.accounts]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [relayEnvironment]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    if (myAccount && !creditAccountId) {
      setCreditAccountId(myAccount.id);
    }
  }, [creditAccountId, myAccount]);

  const filtered = accounts.filter((acc) =>
    acc.holderName.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleTransfer() {
    if (!user) {
      return;
    }

    if (!transferTo) {
      setTransferFeedback("Escolha uma conta de destino.");
      return;
    }

    setTransferLoading(true);
    setTransferFeedback(null);

    try {
      await graphqlRequest(TRANSFER_MUTATION, {
        fromAccountId: user.accountId,
        toAccountId: transferTo,
        amount: Number(transferAmount),
        idempotencyKey: newIdempotencyKey(),
        description: transferDescription || undefined,
      }, authHeaders);

      setTransferFeedback("Transferencia enviada com sucesso.");
      setTransferDescription("");
      await loadAccounts();
    } catch (err: unknown) {
      setTransferFeedback(err instanceof Error ? err.message : "Falha na transferencia");
    } finally {
      setTransferLoading(false);
    }
  }

  async function handleAddCredit() {
    setAdminLoading(true);
    setAdminFeedback(null);

    try {
      await graphqlRequest(
        ADD_CREDIT_MUTATION,
        {
          accountId: creditAccountId,
          amount: Number(creditAmount),
          idempotencyKey: newIdempotencyKey(),
        },
        authHeaders,
      );

      setAdminFeedback("Credito adicionado com sucesso.");
      await loadAccounts();
    } catch (err: unknown) {
      setAdminFeedback(err instanceof Error ? err.message : "Falha ao adicionar credito");
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteUserId) {
      setAdminFeedback("Informe o ID do usuario para excluir.");
      return;
    }

    setAdminLoading(true);
    setAdminFeedback(null);

    try {
      await graphqlRequest(DELETE_USER_MUTATION, { userId: deleteUserId }, authHeaders);
      setAdminFeedback("Usuario excluido com sucesso.");
      setDeleteUserId("");
      await loadAccounts();
    } catch (err: unknown) {
      setAdminFeedback(err instanceof Error ? err.message : "Falha ao excluir usuario");
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await graphqlRequest(LOGOUT_MUTATION, {}, authHeaders);
    } catch {
      // Always clear local auth state even if session cleanup fails remotely.
    } finally {
      logout();
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">painel</p>
            <h1 className="text-3xl font-semibold tracking-tight">Contas e transferencias</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Usuario: {user?.email} ({user?.role})
            </p>
          </div>
          <Button variant="outline" onClick={() => void handleLogout()}>
            Sair
          </Button>
        </div>

        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Transferir dinheiro</h2>
              <p className="text-xs text-slate-600">
                Botao de acao para enviar entre contas.
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-slate-500">Saldo da sua conta</p>
              <p className="font-semibold">{formatBalance(myAccount?.balance ?? 0)}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              Destino
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                value={transferTo}
                onChange={(event) => setTransferTo(event.target.value)}
              >
                <option value="">Selecione</option>
                {accounts
                  .filter((account) => account.id !== user?.accountId)
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.holderName} ({account.id.slice(0, 8)})
                    </option>
                  ))}
              </select>
            </label>

            <label className="text-sm">
              Valor
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                type="number"
                min={0.01}
                step="0.01"
                value={transferAmount}
                onChange={(event) => setTransferAmount(event.target.value)}
              />
            </label>

            <label className="text-sm">
              Descricao
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                value={transferDescription}
                onChange={(event) => setTransferDescription(event.target.value)}
              />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={() => void handleTransfer()} disabled={transferLoading}>
              <SendHorizontal className="mr-2 h-4 w-4" />
              {transferLoading ? "Transferindo..." : "Transferir agora"}
            </Button>
            {transferFeedback ? (
              <p className="text-sm text-slate-700">{transferFeedback}</p>
            ) : null}
          </div>
        </section>

        {user?.role === "ADMIN" ? (
          <section className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
            <h2 className="text-sm font-semibold">Acoes de administrador</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">
                Conta para credito
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  value={creditAccountId}
                  onChange={(event) => setCreditAccountId(event.target.value)}
                />
              </label>
              <label className="text-sm">
                Valor do credito
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={creditAmount}
                  onChange={(event) => setCreditAmount(event.target.value)}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void handleAddCredit()} disabled={adminLoading}>
                Adicionar credito
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="text-sm">
                ID do usuario para excluir
                <input
                  className="mt-1 w-full rounded-lg border border-rose-300 bg-white px-3 py-2"
                  value={deleteUserId}
                  onChange={(event) => setDeleteUserId(event.target.value)}
                  placeholder="user id"
                />
              </label>
              <div className="self-end">
                <Button
                  variant="destructive"
                  disabled={adminLoading}
                  onClick={() => void handleDeleteUser()}
                >
                  Excluir usuario
                </Button>
              </div>
            </div>

            {adminFeedback ? <p className="text-sm">{adminFeedback}</p> : null}
          </section>
        ) : null}

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome do titular..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm",
              "outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30",
            )}
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Carregando contas...</span>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <ul className="space-y-3">
            {filtered.map((account) => (
              <li
                key={account.id}
                className="rounded-xl border border-border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{account.holderName}</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{account.id}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1 text-sm font-semibold">
                      <DollarSign className="size-3.5 text-muted-foreground" />
                      {formatBalance(account.balance)}
                    </div>
                    <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      {formatDate(account.createdAt)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
