# 🏪 백년가게 Store Map API

> 전통 가게 위치 정보 관리 및 검색 API 서비스

## ✨ Features

- 📊 **CSV Import & DB 업서트** - 대량 데이터 일괄 처리
- 🗺️ **Geocoding** - 카카오/네이버 API 지원 (배치/단건)
- 📍 **Nearby Search** - 하버사인 공식 기반 반경 검색
- ⚡ **Redis 캐싱** - 빠른 응답속도 및 API 부하 감소
- 📝 **Swagger UI** - 인터랙티브 API 문서
- 🔍 **RedisInsight** - 캐시 상태 실시간 모니터링

---

## 📡 API Endpoints

### 🏪 Store 목록 조회
```http
GET /api/stores
```
**Query Parameters:**
- `limit`: 조회할 가게 수 (기본값: 50, 최대: 200)

**Response:**
```json
{
  "status": "success",
  "result": [
    {
      "id": 1,
      "name": "전통찻집",
      "address": "서울 종로구 인사동길 12",
      "category": "음식점",
      "latitude": 37.5703,
      "longitude": 126.9850
    }
  ]
}
```

### 🗺️ 주소 → 좌표 변환
```http
POST /api/geocode
```
**Request Body:**
```json
{
  "address": "서울 강남구 테헤란로 152"
}
```

**Response:**
```json
{
  "status": "success",
  "result": {
    "latitude": 37.5048,
    "longitude": 127.0406,
    "formatted_address": "서울 강남구 테헤란로 152"
  }
}
```

### 📍 주변 가게 검색
```http
GET /api/nearby
```
**Query Parameters:**
- `lat`: 위도 (필수)
- `lng`: 경도 (필수)
- `radius`: 검색 반경 (km, 기본값: 1)
- `category`: 카테고리 필터 (선택)

**Response:**
```json
{
  "status": "success",
  "cached": true,
  "result": [
    {
      "id": 1,
      "name": "전통찻집",
      "address": "서울 종로구 인사동길 12",
      "category": "음식점",
      "latitude": 37.5703,
      "longitude": 126.9850,
      "distance_km": 0.8
    }
  ]
}
```

> 💡 **캐시 정보**: Redis TTL = 120초, `cached: true/false`로 캐시 히트 여부 확인

---

## 🛠️ 관리 Scripts

### 📊 CSV 데이터 Import

대용량 CSV 파일을 데이터베이스에 일괄 업로드합니다.

```bash
docker exec -it store_map_app sh -lc \
"CSV_ENCODING=cp949 node scripts/import_csv.js ./data/stores.csv"
```

**지원 형식:**
- 인코딩: `cp949`, `utf8`
- 필드: `name`, `address`, `category`, `phone` 등

### 🗺️ 좌표 일괄 변환 (Geocoding Batch)

주소 정보만 있는 데이터에 위도/경도를 일괄 추가합니다.

```bash
docker exec -it store_map_app sh -lc \
"GEOCODE_DELAY=120 node scripts/geocode_batch.js"
```

**설정 옵션:**
- `GEOCODE_DELAY`: API 호출 간격 (밀리초)
- 카카오/네이버 API 순차 시도

---

## 📚 문서 & 모니터링

### 📝 Swagger UI
인터랙티브 API 문서를 통해 실시간으로 API를 테스트할 수 있습니다.

- **Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **OpenAPI Spec**: [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json)

### 🔍 RedisInsight
Redis 캐시 상태를 실시간으로 모니터링할 수 있습니다.

- **접속 URL**: [http://localhost:5540](http://localhost:5540)
- **모니터링 키**: `geo:*` 패턴으로 캐시된 검색 결과 확인
- **TTL 확인**: 캐시 만료시간 실시간 추적

---

## 🚀 Quick Start

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd store-map-api
```

### 2. 환경 설정
```bash
# 환경변수 설정
cp .env.example .env

# Docker 컨테이너 실행
docker-compose up -d
```

### 3. 데이터 Import
```bash
# CSV 데이터 업로드
docker exec -it store_map_app sh -lc \
"CSV_ENCODING=cp949 node scripts/import_csv.js ./data/stores.csv"

# 좌표 정보 생성
docker exec -it store_map_app sh -lc \
"GEOCODE_DELAY=120 node scripts/geocode_batch.js"
```

### 4. API 테스트
- Swagger UI: http://localhost:3000/docs
- RedisInsight: http://localhost:5540

---

## 🔧 Git 배포

```bash
# 변경사항 확인
git status

# 모든 변경사항 스테이징
git add .

# 커밋 메시지 작성
git commit -m "docs: update README and project notes (CSV import, geocoding, nearby, swagger, redis cache)"

# 원격 저장소에 푸시
git push origin main
```

---

## 🏗️ 기술 스택

- **Backend**: Node.js, Express
- **Database**: MariaDB 11
- **ORM** : Sequelize ORM
- **Cache**: Redis 7
- **Geocoding**: 카카오맵 API, 네이버맵 API
- **Documentation**: Swagger/OpenAPI
- **Monitoring**: RedisInsight
- **Deployment**: Docker, Docker Compose

---

## 📞 Support

프로젝트 관련 문의사항이 있으시면 Issues를 통해 연락해주세요.

- 🐛 **Bug Report**: [Issues](https://github.com/your-repo/issues)
- 💡 **Feature Request**: [Discussions](https://github.com/your-repo/discussions)
- 📖 **Documentation**: [Wiki](https://github.com/your-repo/wiki)