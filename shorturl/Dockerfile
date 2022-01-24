FROM node:14 as build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

#stage 2

FROM node:14.15.0-alpine

COPY --from=build /app /
EXPOSE 3000
CMD ["npm", "start"]



