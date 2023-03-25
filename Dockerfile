FROM node:18-alpine

ARG ENV_FILE=.env

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY package*.json ./
RUN npm ci
COPY  ./src ./src
COPY  ./.sequelizerc ./.sequelizerc
COPY  ./entrypoint.sh ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
CMD ["npm", "start"]
