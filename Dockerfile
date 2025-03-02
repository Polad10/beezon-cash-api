FROM node:18.18.2
WORKDIR /apps/beezon-cash-api
COPY package*.json ./

RUN apt update && apt install -y \
  wget \
  gnupg \
  lsb-release \
  sudo \
  && rm -rf /var/lib/apt/lists/*

RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-archive-keyring.gpg

RUN echo "deb [signed-by=/usr/share/keyrings/postgresql-archive-keyring.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

RUN apt update && apt install -y \
  postgresql-client-17 \
  && rm -rf /var/lib/apt/lists/*

RUN npm install
COPY . .
EXPOSE 3001

CMD ["npm", "start"]