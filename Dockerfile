FROM keymetrics/pm2:8-alpine

WORKDIR /stapsher

COPY package*.json ./

RUN npm install --production

COPY . ./

EXPOSE 3000

CMD ["pm2-runtime", "configs/pm2.config.js"]
