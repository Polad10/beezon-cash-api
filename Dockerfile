FROM node:18.18.2
WORKDIR /apps/beezon-cash-api
COPY package*.json ./
RUN apt-get update && apt-get install -y postgresql-client
RUN npm install
COPY . .
EXPOSE 3001

CMD ["npm", "start"]