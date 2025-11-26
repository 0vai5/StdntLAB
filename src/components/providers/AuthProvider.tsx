"use client";

import { useEffect } from "react";
import { useAllStores } from "@/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAllStores();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

