FROM node:14
WORKDIR /src
EXPOSE 8080
#USER root
COPY . /src
RUN npm install
RUN npm run build
RUN npm prune --production
CMD ["npm", "start"]
