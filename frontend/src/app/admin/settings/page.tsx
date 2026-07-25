"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Send, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/stores/ui";
import { api } from "@/lib/api";

interface SiteSettings {
  id: number;
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  tax_rate: number;
  shipping_fee: number;
  free_shipping_min: number;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  logo_url: string;
  favicon_url: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_use_tls: boolean;
  from_email: string;
  updated_at: string;
}

const defaults: SiteSettings = {
  id: 1,
  site_name: "Store",
  site_description: "",
  contact_email: "",
  contact_phone: "",
  address: "",
  currency: "USD",
  tax_rate: 0,
  shipping_fee: 0,
  free_shipping_min: 0,
  facebook_url: "",
  twitter_url: "",
  instagram_url: "",
  logo_url: "",
  favicon_url: "",
  smtp_host: "",
  smtp_port: 587,
  smtp_user: "",
  smtp_password: "",
  smtp_use_tls: true,
  from_email: "",
  updated_at: "",
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5 lg:p-6">
      <h3 className="text-lg font-heading font-semibold text-text mb-5 pb-3 border-b border-border">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { showToast } = useUIStore();
  const [form, setForm] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Test-email state
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; detail: string } | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<SiteSettings>("/admin/settings");
      setForm(data);
    } catch {
      showToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateField = (field: keyof SiteSettings) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    let value: string | number | boolean = target.value;
    if (target.type === "number") {
      value = parseFloat(target.value) || 0;
    } else if (target.type === "checkbox") {
      value = (target as HTMLInputElement).checked;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.patch<SiteSettings>("/admin/settings", {
        site_name: form.site_name,
        site_description: form.site_description,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        address: form.address,
        currency: form.currency,
        tax_rate: form.tax_rate,
        shipping_fee: form.shipping_fee,
        free_shipping_min: form.free_shipping_min,
        facebook_url: form.facebook_url,
        twitter_url: form.twitter_url,
        instagram_url: form.instagram_url,
        logo_url: form.logo_url,
        favicon_url: form.favicon_url,
        smtp_host: form.smtp_host,
        smtp_port: form.smtp_port,
        smtp_user: form.smtp_user,
        smtp_password: form.smtp_password,
        smtp_use_tls: form.smtp_use_tls,
        from_email: form.from_email,
      });
      setForm(updated);
      showToast("Settings saved", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      showToast("Enter a recipient email address", "error");
      return;
    }
    setTestSending(true);
    setTestResult(null);
    try {
      const result = await api.post<{ ok: boolean; detail: string }>("/admin/settings/test-email", {
        to_email: testEmail.trim(),
      });
      setTestResult(result);
    } catch (err) {
      setTestResult({ ok: false, detail: err instanceof Error ? err.message : "Request failed" });
    } finally {
      setTestSending(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-48 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text">Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your store configuration</p>
        </div>
        <Button variant="primary" type="submit" loading={saving}>
          <Save size={16} className="mr-1.5" />
          Save Changes
        </Button>
      </div>
        {/* General */}
        <SectionCard title="General">
          <Input
            id="site_name"
            label="Store Name"
            value={form.site_name}
            onChange={updateField("site_name")}
          />
          <Textarea
            id="site_description"
            label="Store Description"
            value={form.site_description}
            onChange={updateField("site_description")}
          />
          <Input
            id="logo_url"
            label="Logo URL"
            value={form.logo_url}
            onChange={updateField("logo_url")}
            placeholder="/uploads/logo.png"
          />
          <Input
            id="favicon_url"
            label="Favicon URL"
            value={form.favicon_url}
            onChange={updateField("favicon_url")}
            placeholder="/uploads/favicon.ico"
          />
        </SectionCard>

        {/* Contact */}
        <SectionCard title="Contact">
          <Input
            id="contact_email"
            label="Contact Email"
            type="email"
            value={form.contact_email}
            onChange={updateField("contact_email")}
          />
          <Input
            id="contact_phone"
            label="Phone Number"
            value={form.contact_phone}
            onChange={updateField("contact_phone")}
          />
          <Textarea
            id="address"
            label="Business Address"
            value={form.address}
            onChange={updateField("address")}
          />
        </SectionCard>

        {/* Social */}
        <SectionCard title="Social Links">
          <Input
            id="facebook_url"
            label="Facebook URL"
            value={form.facebook_url}
            onChange={updateField("facebook_url")}
            placeholder="https://facebook.com/your-store"
          />
          <Input
            id="twitter_url"
            label="Twitter URL"
            value={form.twitter_url}
            onChange={updateField("twitter_url")}
            placeholder="https://twitter.com/your-store"
          />
          <Input
            id="instagram_url"
            label="Instagram URL"
            value={form.instagram_url}
            onChange={updateField("instagram_url")}
            placeholder="https://instagram.com/your-store"
          />
        </SectionCard>

        {/* Business */}
        <SectionCard title="Business Settings">
          <Input
            id="currency"
            label="Currency"
            value={form.currency}
            onChange={updateField("currency")}
            placeholder="USD"
          />
          <Input
            id="tax_rate"
            label="Tax Rate (%)"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={form.tax_rate}
            onChange={updateField("tax_rate")}
          />
          <Input
            id="shipping_fee"
            label="Shipping Fee"
            type="number"
            step="0.01"
            min="0"
            value={form.shipping_fee}
            onChange={updateField("shipping_fee")}
          />
          <Input
            id="free_shipping_min"
            label="Free Shipping Minimum"
            type="number"
            step="0.01"
            min="0"
            value={form.free_shipping_min}
            onChange={updateField("free_shipping_min")}
          />
        </SectionCard>

        {/* SMTP / Email */}
        <SectionCard title="Email (SMTP)">
          <p className="text-sm text-text-secondary -mt-2">
            Configure your SMTP server to send transactional emails (order confirmations, password resets, etc.).
          </p>
          <Input
            id="smtp_host"
            label="SMTP Host"
            value={form.smtp_host}
            onChange={updateField("smtp_host")}
            placeholder="smtp.gmail.com"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="smtp_port"
              label="SMTP Port"
              type="number"
              min="1"
              max="65535"
              value={form.smtp_port}
              onChange={updateField("smtp_port")}
              placeholder="587"
            />
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.smtp_use_tls}
                  onChange={(e) => setForm((prev) => ({ ...prev, smtp_use_tls: e.target.checked }))}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm text-text">Use TLS</span>
              </label>
            </div>
          </div>
          <Input
            id="smtp_user"
            label="SMTP Username"
            value={form.smtp_user}
            onChange={updateField("smtp_user")}
            placeholder="you@gmail.com"
            autoComplete="off"
          />
          <Input
            id="smtp_password"
            label="SMTP Password"
            type="password"
            value={form.smtp_password}
            onChange={updateField("smtp_password")}
            placeholder="App password or SMTP password"
            autoComplete="off"
          />
          <Input
            id="from_email"
            label="From Email"
            type="email"
            value={form.from_email}
            onChange={updateField("from_email")}
            placeholder="noreply@yourstore.com"
          />

          {/* Test email */}
          <div className="pt-3 border-t border-border mt-2">
            <p className="text-sm font-medium text-text mb-3">Send Test Email</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  id="test_email_recipient"
                  placeholder="recipient@example.com"
                  type="email"
                  value={testEmail}
                  onChange={(e) => {
                    setTestEmail(e.target.value);
                    setTestResult(null);
                  }}
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleTestEmail}
                loading={testSending}
                disabled={testSending}
                type="button"
              >
                <Send size={14} className="mr-1.5" />
                Send Test
              </Button>
            </div>
            {testResult && (
              <div className={`mt-3 flex items-start gap-2 text-sm p-3 rounded-[var(--radius-sm)] ${
                testResult.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              }`}>
                {testResult.ok ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
                <span>{testResult.detail}</span>
              </div>
            )}
          </div>
        </SectionCard>
    </form>
  );
}
