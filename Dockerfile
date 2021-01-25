FROM node:12-alpine

ENV NO_UPDATE_NOTIFIER true

RUN apk add git

WORKDIR /usr/app

COPY package.json .
COPY package-lock.json .

RUN npm install --no-optional

COPY . /usr/app

RUN npm run build

ENTRYPOINT ["npm", "start"]
