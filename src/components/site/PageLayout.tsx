import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ConversionFab } from "./ConversionFab";
import type { TeamMember } from "@/data/team";

export function PageLayout({
  children,
  onlineClinician,
}: {
  children: ReactNode;
  onlineClinician?: TeamMember;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onlineClinician={onlineClinician} />
      <main>{children}</main>
      <Footer hideClinicDetails={Boolean(onlineClinician)} />
      <ConversionFab onlineClinician={onlineClinician} />
    </div>
  );
}
