FROM node:24.18.0-alpine3.24

# Small tool that helps the app shut down cleanly
RUN apk add --no-cache dumb-init

RUN corepack enable
RUN corepack prepare pnpm@10.8.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Create a plain, low-privilege user instead of running as admin
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --chown=nodejs:nodejs . .

# Switch to that plain user before running the app
USER nodejs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["pnpm", "start"]