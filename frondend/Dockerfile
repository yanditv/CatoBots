FROM node:20-alpine

ARG VITE_API_TARGET=http://localhost:3001
ENV VITE_API_TARGET=$VITE_API_TARGET

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY frondend/package*.json ./

RUN npm install

COPY frondend/ ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
