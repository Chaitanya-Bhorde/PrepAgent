FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000
EXPOSE 50051

CMD ["npm", "run", "dev"]
