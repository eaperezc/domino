
FROM node:24-alpine AS deps
RUN npm install -g pnpm@10
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml prisma.config.ts ./
COPY prisma ./prisma
# postinstall runs `prisma generate` (outputs to src/generated)
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

# Runs prisma migrate deploy as a one-off ECS task before each rollout.
FROM build AS migrator
ENV NODE_ENV=production
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
# Fargate injects HOSTNAME=<task DNS>; Next standalone binds to it and stops
# listening on localhost, so pin the bind address at exec time.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
