"use client";

import React, { createContext, useContext, useMemo } from "react";
import { toast as sonnerToast, Toaster } from "sonner";

export type ToastVariant = "success" | "danger" | "warning" | "info";

export type ToastFunction = {
  (message: string, variant?: ToastVariant, duration?: number): string | number;
  success: typeof sonnerToast.success;
  error: typeof sonnerToast.error;
  warning: typeof sonnerToast.warning;
  info: typeof sonnerToast.info;
  dismiss: typeof sonnerToast.dismiss;
};

interface ToastContextValue {
  toast: ToastFunction;
  dismiss: typeof sonnerToast.dismiss;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastCallable(): ToastFunction {
  const fn = (
    message: string,
    variant: ToastVariant = "info",
    duration?: number,
  ) => {
    const opts = duration ? { duration } : undefined;
    switch (variant) {
      case "success":
        return sonnerToast.success(message, opts);
      case "danger":
        return sonnerToast.error(message, opts);
      case "warning":
        return sonnerToast.warning(message, opts);
      case "info":
      default:
        return sonnerToast.info(message, opts);
    }
  };

  fn.success = sonnerToast.success;
  fn.error = sonnerToast.error;
  fn.warning = sonnerToast.warning;
  fn.info = sonnerToast.info;
  fn.dismiss = sonnerToast.dismiss;

  return fn as ToastFunction;
}

export const toast: ToastFunction = createToastCallable();

export function useToast() {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(
    () => ({
      toast,
      dismiss: sonnerToast.dismiss,
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export { Toaster };
