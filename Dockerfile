FROM node:20 AS backend_build_image
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

FROM node:20 AS frontend_build_image
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
ENV TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
COPY --from=backend_build_image /app/backend/package.json /app/backend/swagger.json /app/backend/
COPY --from=backend_build_image /app/backend/dist /app/backend/dist
COPY --from=backend_build_image /app/backend/node_modules /app/backend/node_modules
COPY --from=frontend_build_image /app/frontend/dist /app/frontend/dist
VOLUME /app/backend/storage
EXPOSE 8080
ARG TMT_COMMIT_SHA
ENV TMT_COMMIT_SHA=${TMT_COMMIT_SHA}
ARG TMT_VERSION
ENV TMT_VERSION=${TMT_VERSION}
RUN date -u +"%Y-%m-%dT%H:%M:%SZ" > /app/.TMT_IMAGE_BUILD_TIMESTAMP
WORKDIR /app/backend
CMD ["/tini", "node", "./dist/backend/src/index.js"]
