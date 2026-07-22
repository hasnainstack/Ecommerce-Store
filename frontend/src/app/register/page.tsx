"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { Store } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 shadow-card">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Store size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-text">Create Account</h1>
            <p className="text-text-secondary mt-1">Join us and start shopping</p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
