# store-map

백년가게(및 기타 상점) 데이터를 **지도에 표시**하기 위한 백엔드 API 프로젝트입니다.  
**Docker + Node.js(Express) + Sequelize + MariaDB + Redis** 구성으로 개발 환경을 분리하고,  
읽기 트래픽이 많은 지도 특성상 **캐시(Redis)** 를 적용하여 응답 속도와 부하를 개선합니다.

## 기술 스택
- Node.js 20, Express
- Sequelize ORM (MariaDB/MySQL)
- Redis (캐시/레이트리밋 예정)
- Docker / docker compose
- (개발 편의) nodemon, morgan

## 폴더 구조(요약)
store-map/
├─ src/
│ ├─ index.js # 서버 엔트리 (헬스체크 등)
│ ├─ routes/
│ │ └─ stores.js # /api/stores 목록 API
│ ├─ lib/ # (redis, db 유틸 등 — 필요 시)
│ └─ utils/ # (지오 유틸 등 — 필요 시)
├─ models/ # Sequelize 모델들
├─ migrations/ # Sequelize 마이그레이션
├─ config/
│ └─ config.js # Sequelize 환경 설정(.env 기반)
├─ Dockerfile
├─ docker-compose.yml
├─ .env # (커밋 금지)
└─ README.md


## 사전 준비
- Docker Desktop
- Node.js 20+
- (선택) RedisInsight, DBeaver

## 환경 변수(.env 예시) — 커밋 금지
- PORT=3000
- REDIS_URL=redis://redis:6379
- DB_HOST=db
- DB_PORT=3306
- DB_USER=storeuser
- DB_PASS=storepw
- DB_NAME=storedb

## 실행 방법 (개발: Docker)
- docker compose up -d --build
- docker compose logs -f app
- 앱: http://localhost:3000
- 헬스체크: GET /health (Redis 가동 시 PONG)

## DB 마이그레이션
- docker compose exec app npx sequelize-cli db:migrate

## 기본 API
- GET /api/stores?limit=50 : 상점 목록(최신순)
- (예정) GET /api/nearby?lat=&lng=&radius=&category= : 반경 검색 + Redis 캐시
- (예정) POST /api/geocode : 주소 → 위/경도(카카오/네이버)

## 테스트 예시
- curl "http://localhost:3000/api/stores?limit=5"

## 개발 메모
- .env는 이미지에 포함하지 않음. compose의 env_file로 주입
- Sequelize 설정은 config/config.js에서 .env를 읽어 사용
- MariaDB 드라이버는 mariadb(dialect: mariadb)

## 라이선스
Private (TBD)
