FROM node:16.17.0-bullseye-slim AS build
WORKDIR /app
COPY package*.json ./
RUN yarn global add @quasar/cli
COPY . .
RUN quasar build

FROM nginx:1.19.1
RUN mkdir /app
COPY --from=build /app/dist /app
COPY --from=build /app/dist/spa /app
COPY docker/nginx.conf /etc/nginx/nginx.conf
