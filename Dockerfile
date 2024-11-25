FROM node:18.18.2
WORKDIR /apps/beezon-cash-api
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
RUN chmod +x prisma/seed.ts

CMD ["npm", "start"]