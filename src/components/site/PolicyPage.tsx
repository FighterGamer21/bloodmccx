import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "./SiteLayout";
import { PageHeader } from "./PageHeader";

export function PolicyPage({ slug, eyebrow }: { slug: string; eyebrow?: string }) {
  const { data: page } = useQuery({
    queryKey: ["policy", slug],
    queryFn: async () => (await supabase.from("policy_pages").select("*").eq("slug", slug).maybeSingle()).data,
  });
  return (
    <SiteLayout>
      <PageHeader eyebrow={eyebrow} title={page?.title || "..."} />
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <p className="whitespace-pre-line text-muted-foreground leading-relaxed">{page?.content}</p>
      </section>
    </SiteLayout>
  );
}
