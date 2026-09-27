"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";

const ToastContext = createContext({ notify: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  const notify = useCallback(
    (message, tone = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex max-w-md items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg",
              toast.tone === "error" ? "bg-danger text-white" : "bg-night text-white"
            )}
          >
            <span className="flex-1">{toast.message}</span>
            <button type="button" onClick={() => dismiss(toast.id)} className="text-white/70 hover:text-white" aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
