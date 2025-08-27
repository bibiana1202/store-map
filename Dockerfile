FROM node:20-alpine

WORKDIR /app

# 패키지 사전 복사/설치
COPY package*.json ./
RUN npm install && npm install -g nodemon

# # 소스/환경 복사
# COPY ./src ./src
# COPY .env ./

# 소스만 복사 (.env는 이미지에 넣지 않음)
COPY ./src ./src
COPY ./models ./models
COPY ./migrations ./migrations
COPY ./seeders ./seeders
COPY ./config ./config
COPY .sequelizerc ./

EXPOSE 3000
CMD ["nodemon", "src/index.js"]
