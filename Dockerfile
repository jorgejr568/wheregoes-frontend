FROM node:lts-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --production --silent

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
