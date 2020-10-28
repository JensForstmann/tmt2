FROM node:14.15.0
WORKDIR /src
EXPOSE 8080
ENTRYPOINT ["npm", "start"]
USER root
COPY . /src
RUN npm install
RUN npm run build
