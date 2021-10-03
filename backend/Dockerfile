FROM node:14-alpine AS BUILD_IMAGE
WORKDIR /app
COPY package-lock.json .
COPY package.json .
RUN npm install
COPY src src
COPY tsconfig.json .
COPY tsoa.json .
RUN npm run build
RUN npm prune --production

FROM node:14-alpine
WORKDIR /app
VOLUME /app/storage
COPY --from=BUILD_IMAGE /app/package.json /app/swagger.json ./
COPY --from=BUILD_IMAGE /app/dist ./dist
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules

EXPOSE 8080
ARG COMMIT_SHA
ENV COMMIT_SHA=${COMMIT_SHA}
CMD ["npm", "start"]
