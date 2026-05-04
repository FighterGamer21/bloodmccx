export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="border-b border-border/60 bg-card/30">
      <div className="container mx-auto px-4 py-12 md:py-16 text-center">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-widest text-blood">{eyebrow}</p>}
        <h1 className="mt-2 text-4xl md:text-5xl font-bold">{title}</h1>
        {subtitle && <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </div>
  );
}