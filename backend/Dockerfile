FROM node:16.9.0

WORKDIR /app

COPY package*.json ./

RUN npm install --verbose

COPY . .

CMD ["npm", "start"]
