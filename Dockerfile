# Multi-stage Dockerfile for DSA A2Z Team Tracker (Node.js 24 + SQLite)
FROM node:24-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

RUN npm run postinstall

# Copy source code and build production bundles
COPY . .
RUN npm run build

# Production run stage
FROM node:24-alpine AS production

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/backend/package*.json ./backend/
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/frontend/dist ./frontend/dist

# Ensure database storage directory exists
RUN mkdir -p /app/backend/data

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
