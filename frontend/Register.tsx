import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, User, Mail, Lock, Eye, EyeOff, Users, Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInMock } from "@/lib/auth";
export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — AuditOne" }] }),
  component: RegisterPage,
});
function RegisterPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [email, setEmail] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    signInMock(email || "user@acme.com");
    navigate({ to: "/dashboard" });
  };
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="flex h-20 items-center justify-between px-8 text-primary-foreground" style={{ background: "var(--gradient-header)" }}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-7 w-7" />
          <span className="text-2xl font-bold tracking-tight">AuditOne</span>
        </div>
        <Link to="/dashboard" className="flex items-center gap-2 rounded-md border border-white/40 px-4 py-2 text-sm font-medium hover:bg-white/10">
          <Home className="h-4 w-4" /> Home
        </Link>
      </header>
      <main className="flex justify-center px-4 py-12">
        <div className="w-full max-w-2xl rounded-2xl bg-card p-10 shadow-xl">
          <h1 className="text-center text-3xl font-bold">Create your AuditOne account</h1>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field icon={Building2} label="Company Name" placeholder="Enter your company name" />
            <Field icon={User} label="Full Name" placeholder="Enter your full name" />
            <Field icon={Mail} type="email" label="Email" placeholder="Enter your email address" value={email} onChange={setEmail} />
            <PasswordField label="Password" placeholder="Enter your password" show={show} onToggle={() => setShow((s) => !s)} />
            <PasswordField label="Confirm Password" placeholder="Confirm your password" show={show2} onToggle={() => setShow2((s) => !s)} />
            <div className="space-y-2">
              <Label className="font-semibold">Role</Label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select className="h-12 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm">
                  <option>Company User / Auditor</option>
                  <option>Admin</option>
                  <option>Manager</option>
                </select>
              </div>
            </div>
            <Button type="submit" className="h-12 w-full text-base font-semibold" style={{ background: "var(--gradient-primary)" }}>
              Register
            </Button>
            <p className="text-center text-sm">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
function Field({ icon: Icon, label, placeholder, type = "text", value, onChange }: { icon: React.ComponentType<{ className?: string }>; label: string; placeholder: string; type?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className="font-semibold">{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type={type} placeholder={placeholder} className="h-12 pl-10" value={value} onChange={(e) => onChange?.(e.target.value)} />
      </div>
    </div>
  );
}
function PasswordField({ label, placeholder, show, onToggle }: { label: string; placeholder: string; show: boolean; onToggle: () => void }) {
  return (
    <div className="space-y-2">
      <Label className="font-semibold">{label}</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input type={show ? "text" : "password"} placeholder={placeholder} className="h-12 pl-10 pr-10" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}