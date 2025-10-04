# DEVELOPMENT
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install python3, make, dan g++ sebelum npm install
RUN apk add --no-cache python3 make g++ && npm install

COPY . .

EXPOSE 5173 4173

CMD ["npm", "run", "dev"]