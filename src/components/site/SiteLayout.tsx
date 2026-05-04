import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";
import { MaintenanceGate } from "./MaintenanceGate";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <MaintenanceGate>
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </MaintenanceGate>
  );
}
