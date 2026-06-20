FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

# Mặc định chạy monitor; override bằng -e ACTION=daily-report
ENV ACTION=monitor

CMD ["npm", "start"]