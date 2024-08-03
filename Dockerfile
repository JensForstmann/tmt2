FROM node:20 AS BACKEND_BUILD_IMAGE
WORKDIR /app/backend
COPY backend/package-lock.json .
COPY backend/package.json .
RUN npm ci
COPY common ../common
COPY backend/src src
COPY backend/tsconfig.json .
COPY backend/tsoa.json .
RUN npm run build
RUN npm prune --production

FROM node:20 AS FRONTEND_BUILD_IMAGE
WORKDIR /app/frontend
COPY frontend/package-lock.json .
COPY frontend/package.json .
RUN npm ci
COPY common ../common
COPY frontend/src src
COPY frontend/index.html .
COPY frontend/postcss.config.js .
COPY frontend/tailwind.config.js .
COPY frontend/tsconfig.json .
COPY frontend/vite.config.mts .
RUN npm run build

FROM node:20
COPY --from=BACKEND_BUILD_IMAGE /app/backend/package.json /app/backend/swagger.json /app/backend/
COPY --from=BACKEND_BUILD_IMAGE /app/backend/dist /app/backend/dist
COPY --from=BACKEND_BUILD_IMAGE /app/backend/node_modules /app/backend/node_modules
COPY --from=FRONTEND_BUILD_IMAGE /app/frontend/dist /app/frontend/dist
VOLUME /app/backend/storage
EXPOSE 8080
ARG COMMIT_SHA
ENV COMMIT_SHA=${COMMIT_SHA}
WORKDIR /app/backend
CMD ["npm", "start"]
