"use client";

import { DerivativesPanel } from '../../metrics/components/DerivativesPanel';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CexFuturesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/research">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">CEX Futures Research</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <DerivativesPanel sector="cex-futures" title="CEX Futures Market Overview" />
        
        {/* Additional research components can be added here */}
      </div>
    </div>
  );
}
