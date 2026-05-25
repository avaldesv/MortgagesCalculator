# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG API_BASE_URL=
ENV API_BASE_URL=$API_BASE_URL
RUN node scripts/generate-environment.mjs production
RUN npm run build

# Production stage — Railway injects $PORT; nginx template listens on it
FROM nginx:alpine
ENV PORT=8080
COPY nginx/templates/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/mortgage-calculator/browser /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
