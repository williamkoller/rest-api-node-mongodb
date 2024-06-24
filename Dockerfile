FROM node:20.14.0-alpine3.20

WORKDIR /app

COPY package.json /app/
COPY yarn.lock /app/

RUN yarn cache clean \
   rm -rf node_modules \
   yarn install --frozen-lockfile 

COPY . .

EXPOSE 3000

CMD ["yarn", "start:swc"]