import React from "react";
import { Skeleton } from "../components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-10">
      <div className="space-y-10">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>

        {/* Content Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="rounded-lg border p-4 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-6 w-[180px]" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-8 w-[100px]" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
        </div>

        {/* Table Skeleton */}
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-[200px]" />
          </div>
          <div className="p-4 space-y-4">
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-8 w-[60px]" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
