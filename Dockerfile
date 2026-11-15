FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# Run this target once as a release job before starting application replicas.
# It deliberately retains the Prisma CLI, which is a build-time dependency.
FROM build AS migrate
CMD ["npx", "prisma", "migrate", "deploy"]

FROM build AS production-deps
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
CMD ["npm", "run", "start:prod"]
