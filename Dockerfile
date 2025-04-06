FROM node:22-alpine3.18

WORKDIR /app

COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 8000

CMD ["npm", "run", "start", "--silent"]
