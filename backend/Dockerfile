# Single-stage build to avoid two npm ci runs (Railway OOM exit 137).
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS=--max-old-space-size=460
ENV npm_config_jobs=1

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json nest-cli.json ./
COPY src ./src

RUN npm run build && npm prune --omit=dev --ignore-scripts

COPY data ./data

EXPOSE 3000
CMD ["node", "dist/main.js"]
