import React from "react";
import { DerivativesPanel } from '../../metrics/components/DerivativesPanel';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from 'next';

// Force dynamic rendering to prevent SSG from hitting Supabase during build
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'DEX Perpetuals | Research',
  description: 'Decentralized Exchange Perpetuals Research Dashboard',
};

export default function DexPerpsPage() {
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
      
      <h1 className="text-3xl font-bold mb-6">DEX Perpetuals Research</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <DerivativesPanel sector="dex-perps" title="DEX Perpetuals Market Overview" />
        
        {/* Additional research components can be added here */}
      </div>
    </div>
  );
}
