FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build || true
EXPOSE 3000
CMD ["npm","run","dev"]
