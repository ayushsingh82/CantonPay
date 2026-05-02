"use client";

import type { ReactNode } from "react";
import { CantonAuthProvider } from "@/contexts/canton-auth";

export function Providers({ children }: { children: ReactNode }) {
  return <CantonAuthProvider>{children}</CantonAuthProvider>;
}
