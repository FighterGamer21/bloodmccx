import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Skull } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — BloodMC" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [mc, setMc] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/profile" }); }, [user, nav]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = mode === "signin" ? await signIn(mc, password) : await signUp(mc, password);
    setBusy(false);
    if (res.error) toast.error(res.error);
    else { toast.success(mode === "signup" ? "Account created!" : "Welcome back"); nav({ to: "/profile" }); }
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-16 max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-blood">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blood shadow-blood">
              <Skull className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-bold">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              {mode === "signin" ? "Login with your Minecraft username" : "Sign up with your Minecraft username — no email needed"}
            </p>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-3">
            <div>
              <Label htmlFor="mc">Minecraft Username</Label>
              <Input id="mc" value={mc} onChange={(e) => setMc(e.target.value)} placeholder="Notch" maxLength={16} required />
            </div>
            <div>
              <Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-blood shadow-blood">
              {busy ? "..." : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
            <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Don't have an account? Sign up" : "Already registered? Sign in"}
            </button>
          </form>
          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> & <Link to="/privacy" className="underline">Privacy</Link>.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
