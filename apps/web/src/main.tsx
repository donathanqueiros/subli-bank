import { BrowserRouter, Route, Routes } from "react-router";

import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Providers } from "./components/providers.tsx";
import { useAuth } from "./lib/use-auth.ts";
import AuthPage from "./pages/auth.tsx";
import AccountsPage from "./pages/accounts.tsx";

function ProtectedAccountsRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div className="px-4 py-10 text-sm">Carregando sessao...</div>;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return <AccountsPage />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <Suspense fallback="Loading...">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/accounts" element={<ProtectedAccountsRoute />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </Providers>
  </StrictMode>,
);
