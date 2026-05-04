import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Profile = { id: string; minecraft_username: string; balance: number };
type AuthCtx = {
  loading: boolean;
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAdmin: boolean;
  signUp: (mcUsername: string, password: string) => Promise<{ error?: string }>;
  signIn: (mcUsername: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
const mcEmail = (u: string) => `${u.toLowerCase().trim()}@bloodmc.local`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthCtx["user"]>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadProfile = async (uid: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("id, minecraft_username, balance").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
    ]);
    setProfile(p as any);
    setIsAdmin(!!r);
  };

  const refresh = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser({ id: session.user.id, email: session.user.email || "" });
      await loadProfile(session.user.id);
    } else {
      setUser(null); setProfile(null); setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
        setTimeout(() => loadProfile(session.user.id), 0);
      } else { setUser(null); setProfile(null); setIsAdmin(false); }
    });
    refresh();
    return () => sub.subscription.unsubscribe();
  }, []);

  const signUp = async (mc: string, password: string) => {
    if (!/^[A-Za-z0-9_]{3,16}$/.test(mc)) return { error: "Invalid Minecraft username" };
    if (password.length < 6) return { error: "Password must be at least 6 chars" };
    const { error } = await supabase.auth.signUp({
      email: mcEmail(mc), password,
      options: { data: { minecraft_username: mc } },
    });
    if (error) return { error: error.message };
    await supabase.auth.signInWithPassword({ email: mcEmail(mc), password });
    return {};
  };
  const signIn = async (mc: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: mcEmail(mc), password });
    if (error) return { error: error.message };
    return {};
  };
  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ loading, user, profile, isAdmin, signUp, signIn, signOut, refresh }}>{children}</Ctx.Provider>;
}
export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
