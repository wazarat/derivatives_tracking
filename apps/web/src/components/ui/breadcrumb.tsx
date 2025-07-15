import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

interface BreadcrumbLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  asChild?: boolean;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("flex flex-wrap items-center", className)}
        {...props}
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          {children}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      >
        {children}
      </li>
    );
  }
);

BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, href, children, ...props }, ref) => {
    return (
      <Link
        href={href}
        ref={ref}
        className={cn(
          "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

BreadcrumbLink.displayName = "BreadcrumbLink";

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink };
