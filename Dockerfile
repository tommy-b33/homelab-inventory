# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY web/package.json web/package-lock.json* ./web/
WORKDIR /app/web
RUN npm ci

WORKDIR /app
COPY inventory ./inventory
COPY builds ./builds
COPY archive ./archive
COPY web ./web

WORKDIR /app/web
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787
ENV DATA_ROOT=/app
ENV DIST_DIR=/app/web/dist

COPY --from=build /app/web/package.json /app/web/package.json
COPY --from=build /app/web/partsCsv.mjs /app/web/partsCsv.mjs
COPY --from=build /app/web/server.mjs /app/web/server.mjs
COPY --from=build /app/web/dist /app/web/dist

# Seed data into the image (bind mounts override these at runtime)
COPY --from=build /app/inventory /app/inventory
COPY --from=build /app/builds /app/builds
COPY --from=build /app/archive /app/archive

EXPOSE 8787
WORKDIR /app/web
CMD ["node", "server.mjs"]
