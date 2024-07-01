FROM node:16.20.2
RUN apt-get install openssl

COPY . /api
WORKDIR /api

RUN npm install
RUN npm run build

CMD echo "Hello, world"

