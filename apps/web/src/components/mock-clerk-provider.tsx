// This is a mock ClerkProvider that doesn't use Clerk's authentication system
// It's used for local development when no valid Clerk key is available

import React from 'react';

interface MockClerkProviderProps {
  children: React.ReactNode;
}

export function MockClerkProvider({ children }: MockClerkProviderProps) {
  return <>{children}</>;
}
