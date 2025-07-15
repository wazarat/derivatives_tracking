import React from "react";
import { SectorDashboard } from "@/components/research/SectorDashboard";
import { basisColumns, FuturesInstrument } from "@/config/columns";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRightIcon } from "@radix-ui/react-icons";

// Force dynamic rendering to prevent SSG from hitting Supabase during build
export const dynamic = "force-dynamic";

export default function CexFuturesPage() {
  return (
    <div className="container py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRightIcon className="h-4 w-4" />
          <BreadcrumbLink href="/research">Research</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <ChevronRightIcon className="h-4 w-4" />
          <BreadcrumbLink href="/research/cex-futures">CEX Futures</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <SectorDashboard<FuturesInstrument>
        sector="cex-futures"
        title="CEX Futures"
        description="Analyze basis trading opportunities across centralized exchanges. Compare basis, term structure, and liquidity metrics."
        columns={basisColumns}
      />
    </div>
  );
}
