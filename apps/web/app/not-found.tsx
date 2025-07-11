import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-12 text-center">
      <div className="space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">404 - Page Not Found</h1>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild>
            <Link href="/">
              Return Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/research">
              Explore Markets
            </Link>
          </Button>
        </div>
        
        <div className="pt-6">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact our support team at{" "}
            <a href="mailto:support@canhav.com" className="text-primary hover:underline">
              support@canhav.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
