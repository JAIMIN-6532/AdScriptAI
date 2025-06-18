FROM node:20-alpine

WORKDIR /usr/src/user-service

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]

