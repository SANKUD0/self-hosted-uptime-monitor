# ---------- Étape 1 : deps + build ----------
FROM node:24-alpine3.22 AS builder

# pnpm via corepack (inclus dans Node)
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /repo

# Copier les manifestes du monorepo (cache des deps)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Installer toutes les deps du workspace (avec autorisation des scripts post-install)
RUN pnpm install --frozen-lockfile --config.unsafe-perm=true

# Copier le code du backend
COPY apps/backend ./apps/backend

# Générer le client Prisma + build NestJS
WORKDIR /repo/apps/backend
RUN pnpm prisma generate
RUN pnpm build

# Créer un package de déploiement standalone (résout les symlinks pnpm)
WORKDIR /repo
RUN pnpm --filter backend deploy --prod --legacy /standalone
# Copier le client Prisma généré dans le dossier standalone
RUN cp -r /repo/apps/backend/node_modules/.prisma /standalone/node_modules/.prisma 2>/dev/null || true

# ---------- Étape 2 : runtime ----------
FROM node:24-alpine3.22 AS production

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app

# Copier uniquement ce qui est nécessaire en prod
COPY --from=builder /standalone/package.json ./
COPY --from=builder /standalone/node_modules ./node_modules
COPY --from=builder /repo/apps/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /repo/apps/backend/dist ./dist
COPY --from=builder /repo/apps/backend/prisma ./prisma

EXPOSE 3000

# Applique les migrations puis démarre
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main.js"]