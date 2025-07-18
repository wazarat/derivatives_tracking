"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Test importing DerivativesPanel - SUCCESS!
// Now test useDerivatives hook
try {
  const { useDerivatives } = require('../../../src/hooks/useDerivatives');
  console.log('✅ useDerivatives hook import successful');
} catch (error) {
  console.error('❌ useDerivatives hook import failed:', error);
}

export default function CexPerpsDebugPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/research">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Research
          </Link>
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">CEX Derivatives Debug Page</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Step 1: Basic UI Components Work</h2>
          <p>✅ This page loads successfully with proper styling</p>
          <p>✅ Button and Link components work</p>
          <p>✅ Tailwind CSS is working</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Step 2: Test useDerivatives Hook</h2>
          <p>✅ DerivativesPanel import successful (check server logs)</p>
          <p>❌ Headers() error still occurring - likely in useDerivatives hook</p>
          <p>Next: Test the hook in isolation</p>
        </div>
      </div>
    </div>
  );
}
