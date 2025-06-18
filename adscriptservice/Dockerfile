FROM node:20-alpine

WORKDIR usr/src/adscript-service

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3002

CMD ["npm", "start"]