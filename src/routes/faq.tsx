import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — BloodMC" }] }),
  component: FaqPage,
});

function FaqPage() {
  const { data = [] } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => (await supabase.from("faqs").select("*").eq("visible", true).order("sort_order")).data || [],
  });
  return (
    <SiteLayout>
      <PageHeader eyebrow="Help" title="Frequently Asked Questions" />
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <Accordion type="single" collapsible className="rounded-xl border border-border/60 bg-card divide-y divide-border/60">
          {data.map((f: any) => (
            <AccordionItem key={f.id} value={f.id} className="px-5 border-0">
              <AccordionTrigger className="text-left font-semibold">{f.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
