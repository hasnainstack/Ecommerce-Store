"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUIStore } from "@/stores/ui";

export function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useUIStore();
  const router = useRouter();

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Registration failed");
      }

      showToast("Account created successfully!", "success");
      router.push("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="name" label="Full Name" placeholder="John Doe" value={form.name} onChange={updateField("name")} required />
      <Input id="email" label="Email" type="email" placeholder="hello@example.com" value={form.email} onChange={updateField("email")} required />
      <Input id="phone" label="Phone" type="tel" placeholder="+1 (555) 123-4567" value={form.phone} onChange={updateField("phone")} />

      <div className="relative">
        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={form.password}
          onChange={updateField("password")}
          required
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-text-secondary">
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <Input
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={form.confirmPassword}
        onChange={updateField("confirmPassword")}
        required
      />

      {error && <div className="bg-danger/10 text-danger text-sm p-3 rounded-[var(--radius-sm)]">{error}</div>}

      <Button type="submit" size="lg" className="w-full" loading={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
          Sign In
        </Link>
      </p>
    </form>
  );
}
