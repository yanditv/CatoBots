FROM node:20-alpine

ARG VITE_API_URL=http://server:3001/api
ARG VITE_API_HOST=http://server:3001

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_HOST=$VITE_API_HOST

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY frondend/package*.json ./

RUN npm install

COPY frondend/ ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
