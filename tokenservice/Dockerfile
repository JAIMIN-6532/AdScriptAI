FROM node:20-alpine

WORKDIR /usr/src/token-service

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3003

CMD ["npm", "start"]