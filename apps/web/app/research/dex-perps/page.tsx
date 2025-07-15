import React from "react";
import { SectorDashboard } from "@/components/research/SectorDashboard";
import { onchainPerpColumns, DexPerpInstrument } from "@/config/columns";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRightIcon } from "@radix-ui/react-icons";

// Force dynamic rendering to prevent SSG from hitting Supabase during build
export const dynamic = "force-dynamic";

export default function DexPerpsPage() {
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
          <BreadcrumbLink href="/research/dex-perps">DEX Perpetuals</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <SectorDashboard<DexPerpInstrument>
        sector="dex-perps"
        title="DEX Perpetuals"
        description="Analyze on-chain perpetual markets across decentralized exchanges. Compare funding rates, TVL, utilization, and protocol fees."
        columns={onchainPerpColumns}
      />
    </div>
  );
}
