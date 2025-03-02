FROM node:18.18.2
WORKDIR /apps/beezon-cash-api
COPY package*.json ./
RUN apt install -y postgresql-common
RUN /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
RUN apt install -y postgresql-client
RUN npm install
COPY . .
EXPOSE 3001

CMD ["npm", "start"]