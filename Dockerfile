FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/haccp-frontend/browser /usr/share/nginx/html
COPY public-config.example.js /usr/share/nginx/html/assets/config.js
EXPOSE 80
