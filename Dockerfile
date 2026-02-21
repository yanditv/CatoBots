FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY server/package*.json ./server/
COPY frondend/package*.json ./frondend/

RUN npm install

COPY . .

WORKDIR /app/server
RUN npm run build

WORKDIR /app/frondend
RUN npm run build

WORKDIR /app

EXPOSE 3001 5173

CMD ["sh", "-c", "echo 'Use docker-compose for runtime'"]
