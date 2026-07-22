"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";

export function AuthGuard() {
  const { isAuthenticated } = useAuthStore();
  const { sessionId, setSessionId } = useCartStore();

  useEffect(() => {
    // Ensure session ID exists
    if (!sessionId) {
      const id = "sess_" + Math.random().toString(36).substring(2, 15);
      setSessionId(id);
    }
  }, [sessionId, setSessionId]);

  return null;
}
