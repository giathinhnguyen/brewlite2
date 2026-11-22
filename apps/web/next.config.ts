import type { NextConfig } from 'next';
import path from 'node:path';
import { existsSync } from 'node:fs';

// The monorepo keeps its local configuration in the repository root.
// Only NEXT_PUBLIC_* values are exposed to browser bundles by Next.js.
const workspaceRoot = path.join(import.meta.dirname, '../..');
const workspaceEnv = path.join(workspaceRoot, '.env');
if (existsSync(workspaceEnv)) process.loadEnvFile(workspaceEnv);
// Compatibility for existing local/AWS configuration during the migration.
process.env.NEXT_PUBLIC_API_URL ??= process.env.VITE_API_URL ?? 'http://localhost:3000/api';
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??= process.env.VITE_GOOGLE_CLIENT_ID;

const config: NextConfig = {
  devIndicators: false,
  output: process.env.NEXT_STANDALONE === 'true' ? 'standalone' : undefined,
  outputFileTracingRoot: workspaceRoot,
  turbopack: { root: workspaceRoot },
};
export default config;
