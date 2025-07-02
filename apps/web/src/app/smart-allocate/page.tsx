'use client';

import React from 'react';
import { SmartAllocate } from '@/components/portfolio/SmartAllocate';
import { PageHeader } from '@/components/ui/page-header';
import { Sparkles } from 'lucide-react';

export default function SmartAllocatePage() {
  return (
    <div className="container py-6 space-y-6">
      <PageHeader
        title="Smart Allocate"
        description="Let AI generate an optimal portfolio allocation based on your preferences"
        icon={<Sparkles className="h-6 w-6" />}
      />
      <SmartAllocate />
    </div>
  );
}
