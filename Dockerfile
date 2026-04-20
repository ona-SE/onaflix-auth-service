FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY src/ src/

ENV NODE_ENV=production
EXPOSE 3002
USER node
CMD ["node", "src/index.js"]
