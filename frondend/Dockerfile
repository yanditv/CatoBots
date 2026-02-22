FROM node:20-alpine

ARG VITE_API_TARGET=http://server:3001

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY frondend/package*.json ./

RUN npm install

COPY frondend/ ./

ENV VITE_API_TARGET=$VITE_API_TARGET

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
