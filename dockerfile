# Build the Frontend [dist folder]

FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY ./Frontend/package*.json ./
RUN npm ci
COPY ./Frontend ./
RUN npm run build

# Build the Backend

FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY ./Backend/package*.json ./
RUN npm ci --omit=dev
COPY ./Backend ./

# Copy the built frontend from the previous stage to the backend's public directory

COPY --from=frontend-builder /app/dist /app/public
RUN mkdir -p /app/public/temp && chown -R node:node /app
USER node

# Create the runtime image

CMD ["node", "server.js"]
