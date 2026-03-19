import { relayEnvironment } from "@/lib/relay/environment";
import { AuthProvider } from "@/lib/auth";
import type { ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <RelayEnvironmentProvider environment={relayEnvironment}>
        {children}
      </RelayEnvironmentProvider>
    </AuthProvider>
  );
}
