import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function configurePrismaForNetlify() {
  if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) return;

  const engineName = 'libquery_engine-rhel-openssl-3.0.x.so.node';
  const engineCandidates = [
    path.join(process.cwd(), 'node_modules/.prisma/client', engineName),
    path.join(process.cwd(), 'frontend/node_modules/.prisma/client', engineName),
    path.join(process.cwd(), 'netlify/functions/node_modules/.prisma/client', engineName),
    path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../node_modules/.prisma/client', engineName),
    path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../../node_modules/.prisma/client', engineName),
  ];

  for (const enginePath of engineCandidates) {
    if (fs.existsSync(enginePath)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
      process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';
      break;
    }
  }
}

configurePrismaForNetlify();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
