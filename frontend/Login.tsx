import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInMock } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: function LoginScreen() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("admin@acme.com");
    const [password, setPassword] = useState("demo");
    const [show, setShow] = useState(false);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await signInMock({ email, password });
      navigate({ to: "/dashboard" });
    };

    return (
      <div className="min-h-screen bg-muted/30">
        <header
          className="flex h-20 items-center justify-between px-8 text-primary-foreground"
          style={{ background: "var(--gradient-header)" }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7" />
            <span className="text-2xl font-bold tracking-tight">AuditOne</span>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-md border border-white/40 px-4 py-2 text-sm font-medium hover:bg-white/10"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </header>

        <main className="flex justify-center px-4 py-16">
          <div className="w-full max-w-xl rounded-2xl bg-card p-10 shadow-xl">
            <h1 className="text-center text-3xl font-bold text-primary">AuditOne Login</h1>
            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                    className="h-12 pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-12 pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full text-base font-semibold text-primary-foreground shadow-md"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Lock className="mr-2 h-4 w-4" /> Login
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>

              <p className="text-center text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Sign Up
                </Link>
              </p>

              <p className="text-center text-xs text-muted-foreground">
                This is a frontend mock. Wire to Lovable Cloud auth to make it real.
              </p>
            </form>
          </div>
        </main>
      </div>
    );
  },
});
