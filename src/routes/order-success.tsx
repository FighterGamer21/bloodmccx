import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/order-success")({
  validateSearch: z.object({ ref: z.string().optional() }),
  head: () => ({ meta: [{ title: "Order Confirmed — BloodMC" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { ref } = Route.useSearch();
  const { settings } = useSiteSettings();
  const copy = async () => { if (!ref) return; await navigator.clipboard.writeText(ref); toast.success("Copied!"); };
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 ring-2 ring-green-500/30"><CheckCircle2 className="h-8 w-8 text-green-500" /></div>
        <h1 className="mt-6 text-4xl font-bold">Order Created!</h1>
        <p className="mt-3 text-muted-foreground">Your order is pending verification.</p>
        {ref && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Order Reference</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <p className="font-mono text-2xl font-bold text-blood">{ref}</p>
              <Button size="icon" variant="outline" onClick={copy}><Copy className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
        <div className="mt-8 rounded-xl border border-primary/30 bg-primary/10 p-6 text-left">
          <h3 className="font-bold text-blood">Next Steps</h3>
          <ol className="mt-3 space-y-2 text-sm list-decimal list-inside">
            <li>Pay via UPI to <span className="font-mono">{settings.upi_id}</span> (INR).</li>
            <li>Join our Discord and open a support ticket.</li>
            <li>Share your Order ID and payment screenshot.</li>
            <li>An admin will deliver your perks within 24 hours.</li>
          </ol>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={settings.discord_url} target="_blank" rel="noreferrer"><Button size="lg" className="bg-blood shadow-blood"><MessageSquare className="mr-2 h-4 w-4" /> Open Discord Ticket</Button></a>
          <Link to="/store"><Button size="lg" variant="outline">Continue Shopping</Button></Link>
        </div>
      </section>
    </SiteLayout>
  );
}
