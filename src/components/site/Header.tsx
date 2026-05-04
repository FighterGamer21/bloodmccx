import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, Menu, X, Skull, User as UserIcon, LogOut, Wallet, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/store", label: "Store" },
  { to: "/ranks", label: "Ranks" },
  { to: "/tags", label: "Tags" },
  { to: "/support", label: "Support" },
  { to: "/faq", label: "FAQ" },
];

export function Header() {
  const { count } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [logo, setLogo] = useState<string>("");
  const [siteName, setSiteName] = useState<string>("BLOODMC");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*").in("key", ["site_logo_url", "site_name"]);
      (data ?? []).forEach((r: any) => {
        if (r.key === "site_logo_url" && typeof r.value === "string") setLogo(r.value);
        if (r.key === "site_name" && typeof r.value === "string" && r.value.trim()) setSiteName(r.value.toUpperCase());
      });
    })();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt={siteName} className="h-9 w-9 rounded-md object-cover shadow-blood" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blood shadow-blood">
              <Skull className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <span className="text-xl font-bold tracking-wider">
            {siteName.includes("MC") ? <>{siteName.replace("MC", "")}<span className="text-blood">MC</span></> : siteName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${path === l.to ? "text-blood" : "text-muted-foreground hover:text-foreground"}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{count}</span>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <UserIcon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{profile?.minecraft_username ?? "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="font-bold">{profile?.minecraft_username}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center"><Wallet className="mr-2 h-4 w-4" />Wallet: ₹{Number(profile?.balance ?? 0).toLocaleString("en-IN")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile"><UserIcon className="mr-2 h-4 w-4" />My Profile</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin"><ShieldCheck className="mr-2 h-4 w-4" />Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="hidden sm:inline-flex">
              <Button size="sm" className="bg-blood shadow-blood">
                <UserIcon className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Login</span>
              </Button>
            </Link>
          )}

          <button className="md:hidden p-2" onClick={() => setOpen((s) => !s)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95">
          <nav className="container mx-auto flex flex-col px-4 py-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className={`py-3 text-sm font-medium ${path === l.to ? "text-blood" : "text-muted-foreground"}`}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-muted-foreground">My Profile (₹{Number(profile?.balance ?? 0).toLocaleString("en-IN")})</Link>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="py-3 text-sm font-medium text-muted-foreground">Admin Panel</Link>}
                <button onClick={() => { setOpen(false); signOut(); }} className="py-3 text-left text-sm font-medium text-muted-foreground">Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="py-3 text-sm font-bold text-blood">Login / Sign Up</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
