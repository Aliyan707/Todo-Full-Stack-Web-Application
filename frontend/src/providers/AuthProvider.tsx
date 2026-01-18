'use client';

import { AuthProvider as BetterAuthProvider } from '@better-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <BetterAuthProvider
      config={{
        // This would be configured based on your Better Auth setup
        // For now, using a placeholder - in real implementation this would come from env vars
        basePath: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || '/api/auth',
      }}
    >
      {children}
    </BetterAuthProvider>
  );
}