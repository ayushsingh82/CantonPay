"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PayrollApp } from "@/components/payroll-app";

export default function OrgPayrollPage() {
  return (
    <ErrorBoundary>
      <PayrollApp />
    </ErrorBoundary>
  );
}
