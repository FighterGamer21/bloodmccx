import { Link } from "@tanstack/react-router";
import { Skull, MessageSquare, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/30">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blood">
              <Skull className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-wider">BLOOD<span className="text-blood">MC</span></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">The official BloodMC network store. Premium ranks, tags & elite BedWars perks.</p>
          <p className="mt-3 font-mono text-sm text-blood">play.bloodmc.net</p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider">Store</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/store" className="hover:text-foreground">All Products</Link></li>
            <li><Link to="/ranks" className="hover:text-foreground">Ranks</Link></li>
            <li><Link to="/tags" className="hover:text-foreground">Tags</Link></li>
            <li><Link to="/cart" className="hover:text-foreground">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider">Help</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/support" className="hover:text-foreground">Support</Link></li>
            <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
            <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
            <li><Link to="/refund" className="hover:text-foreground">Refund Policy</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider">Community</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a href="https://discord.gg/kUZjRQsxtm" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4" /> Discord
            </a>
            <a href="https://www.youtube.com/@ShadowRoni" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Youtube className="h-4 w-4" /> YouTube
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} BloodMC Store. All rights reserved.</p>
        <p className="mt-1">Not affiliated with Mojang AB. Minecraft is a trademark of Mojang AB.</p>
      </div>
    </footer>
  );
}