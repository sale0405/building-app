import type { Handler } from '@netlify/functions';
import serverless from 'serverless-http';

let handlerPromise: Promise<ReturnType<typeof serverless>> | undefined;

async function getHandler() {
  if (!handlerPromise) {
    process.env.NETLIFY = 'true';

    try {
      const { getConnectionString } = await import('@netlify/database');
      process.env.DATABASE_URL = getConnectionString();
    } catch (error) {
      console.error('Netlify Database unavailable:', error);
    }

    const { createApp } = await import('./lib/backend/create-app.js');
    const app = await createApp();
    handlerPromise = Promise.resolve(serverless(app));
  }
  return handlerPromise;
}

export const handler: Handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const fn = await getHandler();
  return fn(event, context);
};
