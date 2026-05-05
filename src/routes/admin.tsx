import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skull, LayoutDashboard, ShoppingBag, Package, Settings, LogOut, HelpCircle, FileText, Tag, Users } from "lucide-react";
import { LoadingScreen } from "@/components/site/LoadingScreen";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthed(false); setLoading(false); return; }
      setAuthed(true);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <LoadingScreen label="Loading admin" />;
  if (!authed) return <AuthScreen />;
  if (!isAdmin) return <div className="min-h-screen flex flex-col items-center justify-center gap-3"><h1 className="text-2xl font-bold">Access denied</h1><p className="text-muted-foreground">You're signed in but not an admin.</p><Button onClick={() => supabase.auth.signOut()}>Sign out</Button></div>;
  return <AdminShell />;
}

function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    setBusy(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message); else toast.success("Signed in");
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
      if (error) toast.error(error.message); else toast.success("Account created — first admin signup is auto-promoted.");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-blood">
        <div className="flex items-center gap-2 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blood"><Skull className="h-5 w-5 text-primary-foreground" /></div>
          <span className="text-xl font-bold tracking-wider">BLOOD<span className="text-blood">MC</span> Admin</span>
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">{mode === "signin" ? "Sign in to manage the store" : "Create the first admin account"}</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" className="w-full bg-blood shadow-blood" disabled={busy}>{busy ? "..." : (mode === "signin" ? "Sign In" : "Create Account")}</Button>
          <button type="button" className="w-full text-xs text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "First time? Create the admin account" : "Already have an account? Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">The first user to sign up becomes admin automatically.</p>
      </div>
    </div>
  );
}

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/users", label: "Users & Wallets", icon: Users },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/policies", label: "Policies", icon: FileText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const signOut = async () => { await supabase.auth.signOut(); nav({ to: "/admin" }); };
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="border-r border-border bg-sidebar p-4 md:min-h-screen">
        <Link to="/admin" className="flex items-center gap-2 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blood"><Skull className="h-5 w-5 text-primary-foreground" /></div>
          <div><p className="text-sm font-bold tracking-wider">BLOODMC</p><p className="text-[10px] text-muted-foreground uppercase tracking-widest">Admin Panel</p></div>
        </Link>
        <nav className="flex md:flex-col gap-1 overflow-x-auto">
          {navItems.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors whitespace-nowrap ${active ? "bg-blood text-primary-foreground" : "text-muted-foreground hover:bg-sidebar-accent"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="ghost" size="sm" className="mt-6 w-full justify-start" onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
      </aside>
      <main className="p-6 md:p-8 max-w-full overflow-x-auto"><Outlet /></main>
    </div>
  );
}
