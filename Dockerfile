FROM node:18.18.2
WORKDIR /apps/beezon-cash-api
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
RUN npm run build
CMD /bin/sh -c "npx prisma generate && npx prisma migrate deploy && npm start"