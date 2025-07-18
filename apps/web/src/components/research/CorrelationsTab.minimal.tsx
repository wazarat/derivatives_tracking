"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CorrelationsTabMinimal() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Correlations Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a minimal version to test if the correlations tab is causing the crash.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
