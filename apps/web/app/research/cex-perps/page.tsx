import React from "react";
import { SectorDashboard } from "@/components/research/SectorDashboard";
import { fundingColumns, PerpetualInstrument } from "@/config/columns";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRightIcon } from "@radix-ui/react-icons";

// Force dynamic rendering to prevent SSG from hitting Supabase during build
export const dynamic = "force-dynamic";

export default function CexPerpsPage() {
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
          <BreadcrumbLink href="/research/cex-perps">CEX Perpetuals</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <SectorDashboard<PerpetualInstrument>
        sector="cex-perps"
        title="CEX Perpetuals"
        description="Analyze funding rate opportunities across centralized exchanges. Compare funding rates, open interest, and skew metrics."
        columns={fundingColumns}
      />
    </div>
  );
}
