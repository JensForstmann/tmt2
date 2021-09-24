FROM node:14-alpine AS BUILD_IMAGE
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
RUN npm prune --production

FROM node:14-alpine
WORKDIR /app
COPY --from=BUILD_IMAGE /app/package.json ./
COPY --from=BUILD_IMAGE /app/dist ./dist
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

EXPOSE 8080
CMD ["npm", "start"]
