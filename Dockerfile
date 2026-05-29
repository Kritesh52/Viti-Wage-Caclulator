# Step 1: Base image to build the React application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package configurations and install dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy the rest of the application files and compile
COPY . .
RUN npm run build

# Step 2: Use an extremely lightweight Nginx web server to serve the static app
FROM nginx:alpine

# Copy the built files from builder step
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx configuration to ensure SPA routing rules are followed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Inform Cloud Run we listen on port 8080 (the default Cloud Run port)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
