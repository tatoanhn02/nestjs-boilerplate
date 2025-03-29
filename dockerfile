FROM node:22.11.0-alpine3.19 AS builder

RUN apk add --no-cache bash
RUN npm i -g --ignore-scripts @nestjs/cli typescript ts-node

WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm ci --ignore-scripts

COPY src ./src/
RUN npm run build

FROM node:22.11.0-alpine3.19

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Switch to non-root user
USER appuser

CMD ["node", "dist/main"]
