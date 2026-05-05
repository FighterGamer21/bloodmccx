import { Link } from "@tanstack/react-router";
import { MessageSquare, Skull, Youtube } from "lucide-react";
import { useSiteSettings } from "@/lib/site-settings";

function BrandName({ name }: { name: string }) {
  const upper = name.toUpperCase();
  return upper.includes("MC") ? <>{upper.replace("MC", "")}<span className="text-blood">MC</span></> : <>{upper}</>;
}

export function Footer() {
  const { settings } = useSiteSettings();
  const siteName = settings.site_name || "BloodMC";

  return (
    <footer className="mt-24 border-t border-border/60 bg-card/30">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            {settings.site_logo_url ? (
              <img src={settings.site_logo_url} alt={siteName} className="h-8 w-8 rounded-md object-cover shadow-blood" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blood">
                <Skull className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <span className="text-lg font-bold tracking-wider"><BrandName name={siteName} /></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{settings.tagline}</p>
          <p className="mt-3 font-mono text-sm text-blood">{settings.server_ip}</p>
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
            <a href={settings.discord_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4" /> Discord
            </a>
            <a href={settings.youtube_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <Youtube className="h-4 w-4" /> YouTube
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {siteName} Store. All rights reserved.</p>
        <p className="mt-1">Not affiliated with Mojang AB. Minecraft is a trademark of Mojang AB.</p>
      </div>
    </footer>
  );
}
