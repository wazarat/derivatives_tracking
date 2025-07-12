'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 1, className }: CardSkeletonProps) {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className={cn(
              "rounded-lg border bg-card p-4 shadow-sm",
              className
            )}
          >
            <div className="space-y-3">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex items-center space-x-4 pt-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        ))}
    </>
  );
}

export function TableSkeleton({ count = 5, className }: CardSkeletonProps) {
  return (
    <div className={cn("w-full space-y-3", className)}>
      <div className="flex items-center space-x-4 py-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
      </div>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="flex items-center space-x-4 py-3">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        ))}
    </div>
  );
}

export function NotificationSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="flex items-start space-x-3 p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
    </div>
  );
}

export function AssetDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      
      <Skeleton className="h-[300px] w-full" />
      
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
