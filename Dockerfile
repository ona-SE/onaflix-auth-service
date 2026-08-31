FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --chown=node:node src ./src

USER node

EXPOSE 3002

CMD ["node", "src/index.js"]
