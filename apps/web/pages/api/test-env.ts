import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('[TEST-ENV] Testing environment variables');
  
  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    },
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
      exists: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      value: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
      length: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.length || 0
    },
    CLERK_SECRET_KEY: {
      exists: !!process.env.CLERK_SECRET_KEY,
      value: process.env.CLERK_SECRET_KEY ? 'SET' : 'MISSING',
      length: process.env.CLERK_SECRET_KEY?.length || 0
    }
  };

  console.log('[TEST-ENV] Environment check:', envCheck);

  return res.status(200).json({
    message: 'Environment variables test',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envCheck
  });
}
