FROM node:18-alpine

ARG ENV_FILE=.env

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY package*.json ./
USER node
RUN npm ci
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./.sequelizerc ./.sequelizerc
EXPOSE 3000

CMD ["npm", "start"]
