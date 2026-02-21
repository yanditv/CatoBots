FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY frondend/package*.json ./

RUN npm install

COPY frondend/ ./

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
