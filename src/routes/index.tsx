import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, MessageSquare, Youtube, Sword, Shield, Zap, Crown, Tag as TagIcon, ChevronRight, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const SERVER_IP = "play.bloodmc.net";
const DISCORD = "https://discord.gg/kUZjRQsxtm";

function Index() {
  const [copied, setCopied] = useState(false);
  const { data: products = [] } = useQuery({
    queryKey: ["products-home"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("enabled", true).order("sort_order");
      return data || [];
    },
  });

  const ranks = products.filter((p) => p.category === "rank").slice(0, 6);
  const tags = products.filter((p) => p.category === "tag").slice(0, 4);
  const featured = products.filter((p) => p.featured);

  const copyIp = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_IP);
      setCopied(true);
      toast.success("Server IP copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><path d=%22M0 0h60v60H0z%22 fill=%22none%22/><path d=%22M30 0v60M0 30h60%22 stroke=%22%23dc2626%22 stroke-opacity=%220.05%22/></svg>')] opacity-50" />
        <div className="container relative mx-auto px-4 py-20 md:py-32 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blood">
            <span className="h-2 w-2 rounded-full bg-blood animate-pulse" /> Network Online
          </span>
          <h1 className="mt-6 text-5xl md:text-7xl font-extrabold tracking-tight">
            Dominate the <span className="text-blood">BloodMC</span> Network
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Premium ranks, exclusive tags & elite BedWars perks. Join thousands of players already ruling the server.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button onClick={copyIp} className="group inline-flex items-center gap-3 rounded-lg border border-primary/40 bg-card/60 px-5 py-3 font-mono text-sm md:text-base shadow-blood backdrop-blur transition-all hover:bg-card">
              <span className="text-blood">{SERVER_IP}</span>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />}
            </button>
            <a href={DISCORD} target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" /> Join Discord
              </Button>
            </a>
            <Link to="/store">
              <Button size="lg" className="bg-blood shadow-blood">
                Browse Store <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { v: "10K+", l: "Players" },
              { v: "24/7", l: "Uptime" },
              { v: "6", l: "Ranks" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-border/60 bg-card/40 p-4 backdrop-blur">
                <p className="text-3xl font-bold text-blood">{s.v}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ranks */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blood">Featured</p>
            <h2 className="text-4xl font-bold mt-1">Choose your Rank</h2>
          </div>
          <Link to="/ranks" className="hidden md:inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            View all ranks <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ranks.map((p: any) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Featured Tags */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blood">Tags</p>
            <h2 className="text-4xl font-bold mt-1">Stand out in chat</h2>
          </div>
          <Link to="/tags" className="hidden md:inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            View all tags <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tags.map((p: any) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Why BloodMC */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest text-blood">Why BloodMC</p>
          <h2 className="text-4xl font-bold mt-1">Built for serious PvP players</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { i: Sword, t: "Elite BedWars", d: "Custom maps, tournaments and ranked queues for the most competitive matches." },
            { i: Shield, t: "Anti-Cheat", d: "Industry-grade anti-cheat keeps the playing field fair for everyone." },
            { i: Zap, t: "Low Latency", d: "Optimized network for smooth, lag-free gameplay across regions." },
          ].map((f) => (
            <div key={f.t} className="rounded-xl border border-border/70 bg-card p-6 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blood shadow-blood">
                <f.i className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-4 text-xl font-bold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest text-blood">Checkout in 4 steps</p>
          <h2 className="text-4xl font-bold mt-1">Get your perks fast</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { n: "01", t: "Pick a product", d: "Choose any rank or tag." },
            { n: "02", t: "Add to cart", d: "Enter your Minecraft username." },
            { n: "03", t: "Pay via UPI", d: "Pay shadowroni@ybl with order ID." },
            { n: "04", t: "Open ticket", d: "Verify in our Discord ticket." },
          ].map((s) => (
            <div key={s.n} className="relative rounded-xl border border-border/70 bg-card p-6">
              <span className="text-5xl font-extrabold text-blood/30">{s.n}</span>
              <h3 className="mt-2 text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured callout */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-10">
          <div className="rounded-2xl border border-primary/30 bg-blood p-8 md:p-12 shadow-blood text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">Ready to dominate?</h2>
            <p className="mt-2 text-primary-foreground/90">Join the BloodMC community on Discord & start your rise today.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={DISCORD} target="_blank" rel="noreferrer">
                <Button size="lg" variant="secondary"><MessageSquare className="mr-2 h-4 w-4" /> Discord</Button>
              </a>
              <a href="https://www.youtube.com/@ShadowRoni" target="_blank" rel="noreferrer">
                <Button size="lg" variant="secondary"><Youtube className="mr-2 h-4 w-4" /> YouTube</Button>
              </a>
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
