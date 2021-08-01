# Install dependencies and make production build, then remove non production dependencies
FROM node:12.18.2-alpine3.12 AS builder
WORKDIR /usr/app
COPY package-lock.json .
COPY package.json .
RUN npm install --quiet
COPY . .
RUN npm run build

# Copy build and production dependencies
FROM node:12.18.2-alpine3.12
WORKDIR /usr/app
COPY --from=builder /usr/app/package.json .
COPY --from=builder /usr/app/node_modules ./node_modules
COPY --from=builder /usr/app/dist ./dist
EXPOSE 3555
CMD ["node", "dist/main"]
