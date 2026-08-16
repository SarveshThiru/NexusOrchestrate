# Stage 1: Build the API application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (for caching)
COPY api/package*.json ./
RUN npm install --omit=dev

# Stage 2: Runtime image
FROM node:20-alpine

WORKDIR /app

# Copy only production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy application source
COPY api/. .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1

# Set NODE_ENV
ENV NODE_ENV=production

CMD ["node", "index.js"]