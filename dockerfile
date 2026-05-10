# Build the Frontend [dist folder]

FROM node:20-alpine AS frontend-builder
COPY ./Frontend /app
WORKDIR /app
RUN npm install
RUN npm run build

# Build the Backend

FROM node:20-alpine AS backend-builder
COPY ./Backend /app
WORKDIR /app
RUN npm install

# Copy the built frontend from the previous stage to the backend's public directory

COPY --from=frontend-builder /app/dist /app/public

# Create the runtime image

CMD ["node", "server.js"]