# syntax=docker/dockerfile:1.7

# ── Base ─────────────────────────────────────────────────────────────
FROM oven/bun:1 AS base

WORKDIR /app

# ── Dependencies ─────────────────────────────────────────────────────
FROM base AS deps

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Build ────────────────────────────────────────────────────────────
FROM base AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (override at build time via --build-arg)
ARG NEXT_PUBLIC_API_URL
ARG BACKEND_URL

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV BACKEND_URL=${BACKEND_URL}

# Next.js collects telemetry — disable it during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ── Production ───────────────────────────────────────────────────────
FROM oven/bun:1-slim AS production

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends dumb-init curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system bunjs \
    && useradd --uid 1001 --gid bunjs --shell /usr/sbin/nologin nextjs

WORKDIR /app

# Copy only what the standalone output needs
COPY --from=build --chown=nextjs:bunjs /app/public ./public
COPY --from=build --chown=nextjs:bunjs /app/.next/standalone ./
COPY --from=build --chown=nextjs:bunjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "server.js"]
