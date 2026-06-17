FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/
RUN pnpm install --frozen-lockfile || pnpm install

FROM deps AS build
COPY shared ./shared
COPY backend ./backend
RUN pnpm --filter @building-app/shared build
RUN cd backend && npx prisma generate
RUN pnpm --filter @building-app/backend build

FROM base AS runner
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/shared ./shared
COPY --from=build /app/backend ./backend
COPY package.json pnpm-workspace.yaml ./
RUN mkdir -p /app/uploads
EXPOSE 3001
CMD ["sh", "-c", "cd backend && npx prisma db push && npx tsx prisma/seed.ts && node dist/server.js"]
