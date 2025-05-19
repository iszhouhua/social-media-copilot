FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY . .

RUN npm install --registry https://registry.npmmirror.com/

EXPOSE 3000

CMD ["npm","run","start"]