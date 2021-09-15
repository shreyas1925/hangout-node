FROM node:alpine

WORKDIR /usr/nodehangout

COPY ./package.json ./

RUN npm install

COPY ./ ./

CMD ["npm","start"]