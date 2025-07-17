"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      
      <h1 className="text-3xl font-bold mb-6">CEX Futures Traders</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Clock className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Coming Soon</CardTitle>
            <CardDescription className="text-lg">
              CEX Futures Traders feature is currently under development
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              We're working hard to bring you comprehensive futures trading analytics and insights.
              This feature will include real-time futures data, market analysis, and trading tools.
            </p>
            <p className="text-sm text-muted-foreground">
              In the meantime, check out our CEX Derivatives Traders for perpetual contracts data.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/research/cex-perps">
                  View CEX Derivatives Traders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
