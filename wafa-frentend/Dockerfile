# Build Stage
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build arguments for Vite environment variables
ARG VITE_API_URL
ARG VITE_BASED_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASED_URL=$VITE_BASED_URL

RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
