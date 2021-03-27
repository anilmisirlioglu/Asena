FROM node:14.16.0-alpine

RUN apk add git

WORKDIR /usr/app

COPY package.json .

RUN npm install && npm install tsc -g

COPY . /usr/app

RUN npm run build

ENTRYPOINT ["npm", "start"]
