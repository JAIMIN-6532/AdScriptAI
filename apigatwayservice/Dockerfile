FROM node:20-alpine

WORKDIR /usr/src/api-gateway-service

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm" , "start"]
