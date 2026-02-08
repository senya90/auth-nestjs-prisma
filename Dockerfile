FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig*.json nest-cli.json ./
RUN npm install
COPY src ./src
RUN npm run build

FROM node:24-alpine
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001
WORKDIR /app
COPY --from=builder --chown=nodeuser:nodejs /app/package*.json ./
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist
RUN npm ci --only=production && npm cache clean --force

USER nodeuser
EXPOSE 4000
CMD ["node", "dist/main.js"]