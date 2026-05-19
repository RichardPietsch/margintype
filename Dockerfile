FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci || npm install
COPY . .
RUN npx prisma generate
RUN npm run build || true
EXPOSE 3000
CMD ["npm","run","dev"]
