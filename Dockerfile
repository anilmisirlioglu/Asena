FROM node:14.16.0-alpine

RUN apk add git

WORKDIR /usr/app

COPY package.json package-lock.json ./

RUN npm install

COPY . /usr/app

RUN npm run build

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
