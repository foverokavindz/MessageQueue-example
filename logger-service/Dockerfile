# syntax=docker/dockerfile:1.7
FROM node:20-alpine

WORKDIR /app

# Set production mode and a default AMQP URL (override in compose or docker run)
ENV NODE_ENV=production \
    RABBITMQ_URL=amqp://rabbitmq

# Install deps if you have a package.json
COPY package*.json ./
RUN if [ -f package.json ]; then npm ci --omit=dev; fi

# Copy source (your index.js + consumer.js + emailService.js + producer.js, etc.)
COPY . .

# Run as non-root
USER node

CMD ["node", "index.js"]
