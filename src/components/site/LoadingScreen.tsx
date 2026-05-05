export function LoadingScreen({ label = "Loading BloodMC" }: { label?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="bmc-loader mx-auto" aria-hidden="true">
          <span>+</span><span>-</span><span>+</span>
          <span>-</span><span>+</span><span>-</span>
          <span>+</span><span>-</span><span>+</span>
        </div>
        <p className="mt-5 text-xs font-bold uppercase text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
