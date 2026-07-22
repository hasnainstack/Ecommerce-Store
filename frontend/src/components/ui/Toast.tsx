"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useUIStore } from "@/stores/ui";

export function Toast() {
  const { toast, clearToast } = useUIStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(clearToast, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  const icons = {
    success: <CheckCircle size={20} className="text-success" />,
    error: <XCircle size={20} className="text-danger" />,
    info: <Info size={20} className="text-info" />,
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className="fixed top-4 left-1/2 z-[100] flex items-center gap-3 bg-card border border-border shadow-hover rounded-[var(--radius-sm)] px-5 py-3 min-w-[320px]"
        >
          {icons[toast.type]}
          <span className="text-sm text-text flex-1">{toast.message}</span>
          <button onClick={clearToast} className="p-0.5 hover:bg-border rounded transition-colors">
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
