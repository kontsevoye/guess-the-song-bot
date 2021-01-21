FROM node:slim

ENV NODE_ENV=production

WORKDIR /app

COPY . .

RUN apt-get update \
    && apt-get install -y python3 make gcc g++ \
    && npm ci

CMD ["node", "dist/index.js"]
