# Build: install everything (sharp, vite, typescript are dev dependencies) and build dist/.
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
# The live address (e.g. https://www.example.nl) for canonical URLs and sitemap.xml.
# Set it in Coolify as a build variable. Empty = the build is marked noindex.
ARG SITE_URL
RUN npm run build

# Serve: only the static files, with our Nginx config.
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q --spider http://127.0.0.1/ || exit 1
