FROM oven/bun:1.3.9 AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY index.ts tsconfig.json ./
COPY src ./src

RUN bun run build

FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=8000

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

EXPOSE 8000

CMD ["node", "dist/index.js"]
