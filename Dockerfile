FROM zenika/alpine-chrome:124-with-node

USER root

ENV NODE_ENV=production

ENV HEADLESS=1

WORKDIR /app

COPY .output/chrome-mv3 chrome-extension

COPY server .

RUN npm install --registry https://registry.npmmirror.com/

EXPOSE 3000

CMD ["npm","run","start"]