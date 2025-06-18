FROM node:20-alpine

WORKDIR /usr/src/payment-service

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3004

CMD ["npm", "start"]