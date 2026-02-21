FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY server/package*.json ./

RUN npm install

COPY server/ ./

RUN npm run build

EXPOSE 3001

CMD ["sh", "-c", "echo 'Waiting for database...' && sleep 30 && (npm run seed || true) && npm run start"]
