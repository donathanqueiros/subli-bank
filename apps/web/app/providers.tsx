"use client";

import { type ReactNode } from "react";
import { RelayEnvironmentProvider } from "react-relay";
import { relayEnvironment } from "@/lib/relay/environment";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      {children}
    </RelayEnvironmentProvider>
  );
}
