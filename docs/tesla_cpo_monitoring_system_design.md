# Tesla 중고차 가격 모니터링 시스템 설계서

**작성자**: Fleet Operations
**작성일**: 2026-03-13
**상태**: 설계 단계
**우선순위**: 높음 (오너 구매 검토 중)

---

## 1. 개요

Tesla 중고차 매물을 정기적으로 모니터링하여 좋은 딜을 오너에게 자동으로 보고하는 시스템을 설계합니다.
**목표**: 2023 Tesla Model 3 ($21,500-$22,000 범위) Southern CA 지역 매물을 발견하고 주 1회 이상 리포트.

---

## 2. 요구사항

### 2.1 기능 요구사항
- Tesla CPO (중고) 및 Facebook Marketplace에서 정기적으로 매물 스캔
- "좋은 딜" 기준에 맞는 차량 필터링 (가격, 마일리지, 위치, 차종)
- 신규 매물 발견 시 이메일 + Paperclip 이슈로 오너에게 알림
- 최소 주 1회 이상 스캔 및 리포트

### 2.2 좋은 딜 기준
- **가격**: $22,000 이하
- **마일리지**: 30,000 miles 이하 (협의 가능)
- **차종**: Model 3 Standard / Long Range (rideshare 적합)
- **위치**: Southern California (LA/Orange County)
- **상태**: 중고 / CPO (2020-2024 모델)

### 2.3 리포트 형식
이메일 (contact@mongoori.com) 및 Paperclip 이슈로 다음 정보 포함:
- 차종 및 연식
- 마일리지
- 가격
- 직접 링크
- 추천 여부 (우선순위)
- 발견 시간 (UTC)

---

## 3. 타겟 데이터 소스 분석

### 3.1 Tesla Certified Pre-Owned (공식 사이트)

**URL**: https://www.tesla.com/inventory/used
**특징**:
- 공식 Tesla 인벤토리 (CPO 프로그램)
- 102포인트 검사 완료 차량만 등재
- 위치별 필터링 가능

**기술적 접근성**:
- ❌ **공식 API 없음**: Tesla는 CPO 데이터에 대한 공식 API를 제공하지 않음
- ⚠️ **Web Scraping**: Tesla는 자동화된 스크래핑을 적극적으로 차단 중
- ✅ **제3자 서비스**: EV-CPO.com, Tesla-info.com, EV-Inventory.com 등이 시간 단위로 aggregation

**권장 방식**:
- **1차 선택**: 제3자 aggregator 사이트 모니터링 (EV-CPO.com 등)
  - 공식 사이트 차단 회피
  - 자동 업데이트 제공 (대부분 1시간 주기)
  - 필터링 지원
- **2차 선택**: Apify 같은 상업용 스크래핑 서비스 이용
  - 안정적이나 비용 발생
  - 매월 $30-200 범위

### 3.2 Facebook Marketplace

**특징**:
- 개인 거래 매물 (CPO보다 가격이 저렴할 수 있음)
- Southern CA 지역에 매물 풍부
- 실시간 신규 등재

**기술적 접근성**:
- ❌ **공식 API 없음**: Facebook은 Marketplace API를 제공하지 않음
- ❌ **Web Scraping**: Facebook은 스크래핑에 매우 제한적
  - 자동화 탐지 시 계정 정지 위험
  - GDPR/CCPA 법적 이슈 가능
- ✅ **제3자 서비스**: Apify, RapidAPI 등 제공
  - 비용 높음 (매월 $100+)
  - 법적 책임은 제공자가 부담

**권장 방식**:
- **1차 선택**: 공개 Facebook Marketplace 웹사이트에서 URL 기반 직접 검색
  - API 대신 특정 검색 쿼리 URL 조합으로 매번 사용자 직접 방문
  - 시스템은 "확인할 URL" 형태로 제안만 제공
- **2차 선택**: Apify 스크래핑 서비스 (장기 운영 시)
  - 자동화 원할 경우에만 고려
- **3차 선택**: 사용자 알림 기반 (오너가 자율적으로 확인)

---

## 4. 시스템 아키텍처 설계

### 4.1 고수준 흐름

```
┌──────────────────┐
│  Scheduled Job   │  (매주 특정 요일/시간)
│  (Cron/Lambda)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ 1. 데이터 수집 (Scraper)     │
│    - EV-CPO.com 조회         │
│    - Facebook 검색 URL 생성   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 2. 필터링 & 비교             │
│    - 가격/마일리지 체크      │
│    - 신규 매물 감지 (DB)     │
│    - 중복 제거               │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 3. 리포트 생성               │
│    - Paperclip 이슈 생성     │
│    - 이메일 전송             │
└──────────────────────────────┘
```

### 4.2 구성 요소

#### A. 데이터 수집 모듈 (Scraper)

**Tesla CPO (EV-CPO.com 연동)**:
```python
# 접근 방식
1. EV-CPO.com API 또는 공개 데이터 조회 (HTTP)
2. 필터링: Model 3, 2020-2024, Southern CA, <$22k
3. 결과 저장
```

**Facebook Marketplace (검색 URL 생성)**:
```
# 수동 확인용 URL 패턴
https://www.facebook.com/marketplace/irvine/search
  ?query=tesla%20model%203
  &minPrice=15000
  &maxPrice=22000
  &categoryId=102
```

#### B. 데이터 비교 & 필터링 모듈

```python
def is_good_deal(listing):
    return (
        listing['price'] <= 22000 and
        listing['mileage'] <= 30000 and
        listing['model'] == 'Model 3' and
        listing['year'] >= 2020 and
        is_in_southern_california(listing['location'])
    )

def is_new(listing, db):
    return listing['id'] not in db.seen_listings
```

#### C. 리포트 & 알림 모듈

```python
# 이메일 발송
send_email(
    to='contact@mongoori.com',
    subject=f'[중고차] Tesla Model 3 좋은 매물 발견',
    body=format_report(listings)
)

# Paperclip 이슈 생성
create_paperclip_issue(
    title=f'[자동 모니터링] Model 3 매물 {len(listings)}건 발견',
    description=format_markdown_report(listings),
    assignee='CEO'
)
```

#### D. 저장소 (Database)

- **용도**: 이미 본 매물 ID 저장 (중복 방지)
- **선택지**:
  - PostgreSQL (mongoori-rides 기존 DB 연동)
  - Redis (빠른 조회, 임시 캐시)
  - SQLite (간단, 자체 호스팅)

---

## 5. 배포 아키텍처 (Automation)

### 5.1 옵션 비교

| 옵션 | 장점 | 단점 | 추천도 |
|------|------|------|--------|
| **AWS Lambda + CloudWatch** | 서버리스, 자유로운 스케일, 저비용 | AWS 계정 필요 | ⭐⭐⭐⭐ |
| **Google Cloud Functions + Scheduler** | 무료 3개 job, 간단 | 제한적 | ⭐⭐⭐ |
| **Scaleway Functions + Cron** | 저비용 유럽, 큐 기반 | 덜 알려짐 | ⭐⭐⭐ |
| **간단한 Linux Cron + VPS** | 기존 인프라 활용, 최소 비용 | 관리 부담 | ⭐⭐⭐ |
| **Python Schedule 라이브러리** | 가장 간단 | 항상 실행 필요 (VPS) | ⭐⭐ |

### 5.2 권장 구성 (AWS Lambda 기반)

```yaml
# 구조
Project: mongoori-finds
├── src/
│   ├── scraper.py         # 데이터 수집
│   ├── filter.py          # 필터링
│   ├── reporter.py        # 리포트 생성
│   └── db.py              # DB 연동
├── lambda_handler.py      # AWS Lambda 진입점
├── requirements.txt
├── serverless.yml         # Serverless Framework 설정
└── tests/

# Lambda 핸들러
def lambda_handler(event, context):
    listings = scrape_tesla_cpo()
    listings += generate_fb_marketplace_urls()
    good_deals = filter_listings(listings)
    if good_deals:
        send_report(good_deals)
    return {'statusCode': 200, 'count': len(good_deals)}

# CloudWatch 트리거
rate: cron(0 10 ? * MON-FRI *)  # 평일 아침 10시 UTC (PST 2시)
```

### 5.3 간편한 대안 (Linux Cron)

mongoori 서버에서 직접 실행:

```bash
# /etc/cron.d/mongoori-tesla-monitor
0 10 * * 1-5 bosgame /home/bosgame/mongoori/scripts/run-tesla-monitor.sh
```

```python
# scripts/run-tesla-monitor.sh
#!/bin/bash
cd /home/bosgame/mongoori/mongoori-finds
python3 -m src.main
```

---

## 6. 구현 계획

### Phase 1: 기본 Scraper (2주)
- [ ] EV-CPO.com 데이터 수집 코드 구현
- [ ] 필터링 로직 작성
- [ ] SQLite 또는 PostgreSQL 연동
- [ ] 로컬 테스트

### Phase 2: 리포트 & 알림 (1주)
- [ ] 이메일 템플릿 설계
- [ ] Paperclip API 통합
- [ ] 알림 전송 로직

### Phase 3: 자동화 배포 (1주)
- [ ] AWS Lambda 또는 Cron 설정
- [ ] 스케줄링 테스트 (주 3-5회 실행 with dry-run)
- [ ] 모니터링 & 에러 로깅

### Phase 4: 개선 & 확장 (진행 중)
- [ ] Facebook Marketplace 자동 스크래핑 추가 (비용 평가 후)
- [ ] 추가 소스 통합 (CarGurus, AutoTrader)
- [ ] 대시보드 UI (mongoori-finds 웹앱)
- [ ] 머신러닝 기반 우선순위 (추후)

---

## 7. 비용 추정

| 항목 | 월 비용 | 비고 |
|------|--------|------|
| **AWS Lambda** | $0-5 | 무료 범위 내 (월 100만 호출까지) |
| **AWS RDS/Aurora** | $0-20 | 기존 mongoori-rides DB 재사용 시 $0 |
| **EV-CPO.com 접근** | $0 | 공개 사이트 (스크래핑 요청 응답 기반) |
| **Facebook Marketplace 스크래핑** | $0-200 | 선택사항 (수동 확인 또는 Apify 사용) |
| **이메일 서비스** | $0-20 | SendGrid/Mailgun (기존 서비스 활용) |
| **합계** | **$0-25** | 최소한의 확장성 있는 구성 |

---

## 8. 법적 & 기술 고려사항

### 8.1 Web Scraping 위험성
- **Tesla.com**: 자동화 탐지 및 차단 중 → EV-CPO.com 대신 사용 권장
- **Facebook**: 계정 정지 위험 → 공개 검색 URL 또는 사용자 수동 확인 권장

### 8.2 준수사항
- 약관 확인: 스크래핑 서비스 이용 시 규약 준수
- 이메일 스팸: CAN-SPAM 준수 (구독 해제 링크 포함)
- 데이터 보호: 수집 데이터 암호화 저장

---

## 9. 성공 지표

| 지표 | 목표 |
|------|------|
| **스캔 빈도** | 주 5회 (평일 매일) |
| **리포트 지연** | 매물 발견 후 1시간 이내 |
| **정확도** | 필터 기준 충족률 95% 이상 |
| **중복 제거율** | 100% (DB 기반) |
| **오너 만족도** | "좋은 매물을 놓치지 않음" |

---

## 10. 다음 단계

1. **CEO 검토 & 승인** (이 문서)
2. **개발 환경 준비** (mongoori-finds 프로젝트 설정)
3. **Phase 1 시작** (EV-CPO.com Scraper 구현)
4. **주간 진행 보고** (Paperclip 이슈로)

---

## 11. 참고 자료

- [Tesla Used Cars Inventory](https://www.tesla.com/inventory/used)
- [EV-CPO.com - Global Tesla Inventory](https://ev-cpo.com/)
- [Web Scraping 현황 2026](https://use-apify.com/blog/scrapling-python-web-scraping-framework)
- [AWS Lambda + Serverless](https://www.serverless.com/)
- [Paperclip API](http://127.0.0.1:3100/api)

---

**결론**: Tesla CPO는 제3자 aggregator (EV-CPO.com) 모니터링, Facebook은 공개 검색 URL 생성으로 접근하면 **법적 리스크 최소화**하면서도 **자동화 가능**합니다. AWS Lambda 또는 간단한 Linux Cron으로 저비용 운영 가능합니다.
