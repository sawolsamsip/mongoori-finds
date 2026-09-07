#!/usr/bin/env python3
"""
Tesla Model 3 CPO 모니터링 — AI ROI 분석 v2
소스: ev-inventory.com
분석: 과거 구매 내역 기반 ROI 계산 + Claude AI 추천 등급
알림: 이메일 (business 채널)
소스 API: ev-inventory.com/lib/get_stock_23.php (POST, 2026-03 이후)
실행: 매일 PST 오전 2시 (cron: 0 2 * * *)
"""

import requests
from bs4 import BeautifulSoup
import json, os, re, subprocess, sys
from datetime import datetime, timezone

# ── 설정 ────────────────────────────────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_FILE   = os.path.join(SCRIPT_DIR, 'tesla_seen_vins.json')
EMAIL_SCRIPT = os.path.expanduser('~/.local/bin/mongoori-send-email.py')
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
if not ANTHROPIC_API_KEY:
    sys.exit(
        'ANTHROPIC_API_KEY is not set. This script runs from cron at 02:00 PST; export it in\n'
        'the crontab entry or the shell profile cron sources. It used to carry a key inline and\n'
        'no longer does.'
    )

# ── 필터 (AI 분석 전 1차 광역 필터) ─────────────────────────
MAX_PRICE    = 28000   # 목표 $22K, 상한 $28K (AI가 추가 판단)
MAX_MILEAGE  = 90000   # 9만 마일 이상은 제외 (가격 낮아도 리스크)
MIN_YEAR     = 2021    # 2021년 이상

# ── 과거 구매 내역 (ROI 베이스라인) ─────────────────────────
PAST_PURCHASES = [
    {"id": "CAR-001", "price": 26956.34, "mileage": 10304,  "year": 2023, "date": "2025-10-04"},
    {"id": "CAR-003", "price": 18785.14, "mileage": 75746,  "year": 2023, "date": "2026-02-08"},
    {"id": "CAR-004", "price": 23882.75, "mileage": 43943,  "year": 2023, "date": "2026-03-17"},
    {"id": "CAR-005", "price": 24099.25, "mileage": 36900,  "year": 2023, "date": "2026-03-23"},
    {"id": "CAR-006", "price": 22251.20, "mileage": 56627,  "year": 2023, "date": "upcoming"},
]

# ── Zevo 사업성 가정 ─────────────────────────────────────────
ZEVO_MONTHLY_INCOME   = 1400   # 예상 월 렌트 수익 (USD)
TNC_INSURANCE_MONTHLY = 380    # TNC 보험 (USD/월)
MAINTENANCE_MONTHLY   = 60     # 유지비 (USD/월)
LOAN_RATE_ANNUAL      = 0.08   # 연이자율 8%
LOAN_MONTHS           = 60     # 60개월 할부

# ── SoCal 지역 키워드 ────────────────────────────────────────
# CA 전체 + NV/AZ 검색 범위
NV_AZ_CITIES = [
    'Las Vegas','Henderson','North Las Vegas','Reno','Sparks','Boulder City',
    'Phoenix','Scottsdale','Tempe','Mesa','Chandler','Gilbert','Glendale',
    'Peoria','Surprise','Tucson','Flagstaff','Yuma',
]
SOCAL_KEYWORDS = [  # kept for reference only
    'Los Angeles','LA','Burbank','Glendale','Pasadena','Long Beach',
    'Torrance','Compton','Inglewood','El Monte','West Covina','Pomona',
    'Santa Monica','Hollywood','Van Nuys','Thousand Oaks','Hawthorne',
    'Carson','Gardena','Norwalk','Downey','Whittier','Alhambra',
    'Culver City','Redondo Beach','Hermosa Beach','Manhattan Beach',
    'Cerritos','Lakewood','Signal Hill','Montebello','Pico Rivera',
    'Azusa','Covina','Baldwin Park','Arcadia','Monrovia','Duarte',
    'Glendora','San Bernardino','Ontario','Chino','Upland',
    'Rancho Cucamonga','Fontana','Rialto','Redlands','Riverside','Corona',
    'Anaheim','Santa Ana','Irvine','Orange','Fullerton','Garden Grove',
    'Huntington Beach','Costa Mesa','Mission Viejo','Westminster',
    'Newport Beach','Buena Park','Tustin','Lake Forest','Laguna Niguel',
    'Yorba Linda','Placentia','Cypress','La Habra','Brea','Aliso Viejo',
    'San Clemente','Dana Point','Laguna Beach','Fountain Valley',
    'Murrieta','Temecula','Menifee','Perris','Hemet',
    'Thousand Oaks','Ventura','Oxnard','Camarillo','Simi Valley',
]

TOKEN = 4 + 65536 + 131072  # M3 + Used + CPO
SORT_PRICE_ASC = 256

# ── 헬퍼 함수 ────────────────────────────────────────────────
def load_seen_vins():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE) as f:
            return json.load(f)
    return {}

def save_seen_vins(seen):
    with open(DATA_FILE, 'w') as f:
        json.dump(seen, f, indent=2, ensure_ascii=False)

def is_target_region(location_text):
    if not location_text:
        return True
    loc = location_text.lower()
    if ', ca' in loc or 'california' in loc or loc.endswith(' ca'):
        return True
    if (', nv' in loc or 'nevada' in loc or ', az' in loc or 'arizona' in loc):
        return any(city.lower() in loc for city in NV_AZ_CITIES)
    return False

def is_socal(location_text):
    return is_target_region(location_text)

def fetch_listings(offset=0):
    # ev-inventory.com migrated from GET /cars to POST /lib/get_stock_23.php (2026-03)
    url = 'https://ev-inventory.com/lib/get_stock_23.php'
    data = {
        'country':  'US',
        'state':    'CA,NV,AZ',
        'token':    TOKEN,
        'sortsale': SORT_PRICE_ASC,
        'spec':     0,
        'advanced': 0,
        'miles':    MAX_MILEAGE,
        'max':      MAX_PRICE,
        'minyear':  MIN_YEAR,
        'maxyear':  '',
        'minrange': '',
        'offset':   offset,
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://ev-inventory.com',
        'Referer': 'https://ev-inventory.com/for-sale/US/M3/CPO/',
        'X-Requested-With': 'XMLHttpRequest',
    }
    resp = requests.post(url, data=data, headers=headers, timeout=30)
    resp.raise_for_status()
    html = resp.text
    if 'No results were found' in html:
        return ''
    return html

def parse_listings(html):
    soup = BeautifulSoup(html, 'html.parser')
    cars = soup.find_all('div', class_=lambda x: x and 'card' in x)
    listings = []
    for car in cars:
        try:
            title_tag = car.find('h5') or car.find('h4') or car.find('h3')
            if not title_tag:
                continue
            title = title_tag.get_text(strip=True)
            if 'Model 3' not in title:
                continue

            link_tag = car.find('a', href=True)
            link = 'https://ev-inventory.com' + link_tag['href'] if link_tag and link_tag['href'].startswith('/') else (link_tag['href'] if link_tag else '')

            vin_match = re.search(r'5YJ3[A-Z0-9]{13}', title + link + car.get_text())
            vin = vin_match.group(0) if vin_match else None

            year_tag = title_tag.find('small')
            year_text = year_tag.get_text(strip=True) if year_tag else ''
            year_match = re.search(r'(20\d{2})', year_text + title)
            year = int(year_match.group(1)) if year_match else 0

            specs = [li.get_text(strip=True) for li in car.find_all('li')]

            mileage = None
            for spec in specs:
                if re.search(r'range', spec, re.IGNORECASE):
                    continue
                m = re.search(r'([\d,]+)\s*miles?', spec, re.IGNORECASE)
                if m:
                    mileage = int(m.group(1).replace(',', ''))
                    break

            location = None
            for spec in specs:
                if re.search(r'\b[A-Z]{2}\b', spec) and not re.search(r'miles|Range|seats|Made|Paint|wheel|FWD|RWD|AWD', spec, re.IGNORECASE):
                    location = spec
                    break

            price_tag = car.find('p', class_=lambda x: x and 'text-center' in x)
            price = None
            if price_tag:
                price_link = price_tag.find('a')
                if price_link:
                    price_m = re.search(r'\$([\d,]+)', price_link.get_text(strip=True))
                    price = int(price_m.group(1).replace(',', '')) if price_m else None

            listings.append({
                'vin': vin, 'title': title.replace('\n', ' ').strip(),
                'year': year, 'mileage': mileage, 'price': price,
                'location': location, 'link': link, 'specs': specs,
            })
        except Exception as e:
            print(f'  [parse warning] {e}', file=sys.stderr)
    return listings

def calc_monthly_payment(price):
    """원리금 균등상환 월납입금"""
    r = LOAN_RATE_ANNUAL / 12
    n = LOAN_MONTHS
    return price * (r * (1 + r)**n) / ((1 + r)**n - 1)

def calc_roi(price, mileage):
    """
    ROI 지표 계산
    반환: dict with monthly_profit, annual_roi_pct, payback_months, score
    """
    if not price:
        return None
    monthly_payment = calc_monthly_payment(price)
    monthly_profit  = ZEVO_MONTHLY_INCOME - monthly_payment - TNC_INSURANCE_MONTHLY - MAINTENANCE_MONTHLY
    annual_roi      = (monthly_profit * 12) / price * 100
    payback_months  = price / max(monthly_profit, 0.01) if monthly_profit > 0 else 9999

    # 점수: 0~100 (이상적 딜: $22K / 50K마일 기준)
    # 베이스라인: 평균 구매가 $23,681, 평균 마일 41,673
    baseline_roi = ((ZEVO_MONTHLY_INCOME - calc_monthly_payment(23681) - TNC_INSURANCE_MONTHLY - MAINTENANCE_MONTHLY) * 12) / 23681 * 100
    score = min(100, max(0, 50 + (annual_roi - baseline_roi) * 5))

    # ─ price-per-mile 핵심 지표 ─
    # 이상적 기준: $22,000 / 50,000mi = $0.44/mi
    # 좋은 딜: $0.30~0.50/mi, 나쁜 딜: $0.60+/mi
    if mileage and mileage > 0:
        ppm = price / mileage  # $/mile
        if ppm < 0.30:
            score += 15  # 매우 좋은 가격 대비 마일
        elif ppm < 0.40:
            score += 10  # 좋은 딜
        elif ppm < 0.50:
            score += 5   # 양호 (이상적 기준 근처)
        elif ppm < 0.60:
            score -= 0   # 보통
        elif ppm < 0.75:
            score -= 10  # 다소 비쌈
        else:
            score -= 20  # 비싼 딜 (낮은 마일만 비싼 경우)

    # 마일리지 절대값 패널티 (9만 가까우면 감점)
    if mileage:
        if mileage > 75000:
            score -= 10
        elif mileage > 60000:
            score -= 5
        elif mileage < 20000:
            score += 5  # 저마일 보너스

    # 가격 보너스 (이상적 $22K 기준)
    if price < 20000:
        score += 12
    elif price < 22000:
        score += 7
    elif price < 24000:
        score += 3
    elif price > 26000:
        score -= 10

    score = min(100, max(0, score))
    return {
        'monthly_payment':   round(monthly_payment),
        'monthly_profit':    round(monthly_profit),
        'annual_roi_pct':    round(annual_roi, 1),
        'payback_months':    round(payback_months, 1),
        'score':             round(score),
    }

def get_ai_recommendation(listings_summary):
    """Claude API로 매물 추천 등급 분석"""
    past_summary = "\n".join([
        f"- {p['id']}: ${p['price']:,} / {p['mileage']:,}mi / {p['year']}"
        for p in PAST_PURCHASES
    ])

    prompt = f"""You are a Tesla fleet ROI advisor for a Zevo rideshare business in Southern California.

## Past Vehicle Purchases (reference for "good deal" baseline):
{past_summary}
→ Best deal was CAR-003 ($18,785 / 75,746mi) — low price offset high mileage
→ Most expensive was CAR-001 ($26,956 / 10,304mi) — premium for low mileage

## Business Model:
- Zevo monthly rental income: ~${ZEVO_MONTHLY_INCOME:,}/month per car
- TNC insurance: ~${TNC_INSURANCE_MONTHLY}/month
- Maintenance: ~${MAINTENANCE_MONTHLY}/month
- Loan: 8% annual, 60 months

## New CPO Listings to Evaluate:
{listings_summary}

For each listing, provide:
1. Rating: 🟢 Buy Now / 🟡 Consider / 🔴 Pass
2. One-line reason (Korean or English ok)
3. Compared to our past deals, is this better/worse/similar?

Be concise. Format as:
VIN: [rating] [reason] | vs past: [comparison]"""

    try:
        resp = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            json={
                'model': 'claude-haiku-4-5',
                'max_tokens': 1024,
                'messages': [{'role': 'user', 'content': prompt}],
            },
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()['content'][0]['text']
    except Exception as e:
        print(f'  [AI warning] Claude API 실패: {e}', file=sys.stderr)
        return None

def grade_from_score(score):
    if score >= 75:  return '🟢 Buy Now'
    if score >= 50:  return '🟡 Consider'
    return '🔴 Pass'

def format_email_body(new_listings, ai_analysis):
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    lines = [
        f'# Tesla Model 3 CPO 신규 매물 — AI ROI 분석',
        f'**{now}** | {len(new_listings)}건 신규 발견',
        '',
        '## 📊 AI 추천 요약',
        '',
        ai_analysis if ai_analysis else '*(AI 분석 불가 — 수동 검토 필요)*',
        '',
        '---',
        '',
        '## 매물 상세 + ROI 계산',
        '',
    ]

    for i, car in enumerate(new_listings, 1):
        roi  = car.get('roi') or {}
        score = roi.get('score', 0)
        grade = grade_from_score(score)

        price_str    = f"${car['price']:,}" if car.get('price') else 'N/A'
        mileage_str  = f"{car['mileage']:,} mi" if car.get('mileage') else 'N/A'
        payment_str  = f"${roi.get('monthly_payment','?')}/mo" if roi else 'N/A'
        profit_str   = f"${roi.get('monthly_profit','?')}/mo" if roi else 'N/A'
        roi_str      = f"{roi.get('annual_roi_pct','?')}%" if roi else 'N/A'
        payback_str  = f"{roi.get('payback_months','?')} months" if roi else 'N/A'

        lines += [
            f'### {i}. {car["title"]} {grade} (Score: {score}/100)',
            '',
            f'| 항목 | 값 |',
            f'|------|-----|',
            f'| 가격 | **{price_str}** |',
            f'| 주행거리 | {mileage_str} |',
            f'| 연식 | {car.get("year", "N/A")} |',
            f'| 위치 | {car.get("location", "N/A")} |',
            f'| VIN | `{car.get("vin", "N/A")}` |',
            f'| 월 할부 (60mo @ 8%) | {payment_str} |',
            f'| 예상 월 수익 | **{profit_str}** ← Zevo ${ZEVO_MONTHLY_INCOME} - 할부 - 보험 - 유지비 |',
            f'| 연간 ROI | **{roi_str}** |',
            f'| 원금 회수 | {payback_str} |',
            f'| 링크 | [{car["link"]}]({car["link"]}) |',
            '',
        ]

    # 과거 구매 베이스라인 비교
    lines += [
        '---',
        '',
        '## 📋 과거 구매 내역 (베이스라인)',
        '',
        '| ID | 가격 | 마일리지 | 구매일 | 월 할부 | 예상 ROI |',
        '|----|------|---------|--------|---------|---------|',
    ]
    for p in PAST_PURCHASES:
        roi_p = calc_roi(p['price'], p['mileage'])
        lines.append(
            f"| {p['id']} | ${p['price']:,.0f} | {p['mileage']:,}mi | {p['date']} | ${roi_p['monthly_payment']:,}/mo | {roi_p['annual_roi_pct']}%/yr |"
        )

    lines += [
        '',
        '---',
        f'> 자동 생성 — Tesla CPO Monitor v2 (AI ROI 분석)',
        f'> 가정: Zevo 수익 ${ZEVO_MONTHLY_INCOME}/mo, 보험 ${TNC_INSURANCE_MONTHLY}/mo, 유지비 ${MAINTENANCE_MONTHLY}/mo',
    ]
    return '\n'.join(lines)

def send_email(subject, body):
    result = subprocess.run(
        [sys.executable, EMAIL_SCRIPT, '--subject', subject, '--body', body],
        capture_output=True, text=True, timeout=30,
    )
    if result.returncode != 0:
        raise RuntimeError(f'Email failed: {result.stderr}')
    print(result.stdout.strip())

def main():
    print(f'[{datetime.now().isoformat()}] Tesla CPO 모니터 v2 시작 (AI ROI 분석)')

    seen = load_seen_vins()
    print(f'  기존 seen VINs: {len(seen)}개')

    all_listings = []
    for offset in [0, 12, 24]:
        try:
            html = fetch_listings(offset=offset)
            page_listings = parse_listings(html)
            print(f'  offset={offset}: {len(page_listings)}건 파싱')
            all_listings.extend(page_listings)
            if len(page_listings) < 12:
                break
        except Exception as e:
            print(f'  [ERROR] offset={offset}: {e}', file=sys.stderr)
            if offset == 0:
                raise

    print(f'  총 파싱: {len(all_listings)}건')

    # 1차 광역 필터 (너무 비싸거나, 너무 오래된 차만 제외)
    new_listings = []
    for car in all_listings:
        vin = car.get('vin')
        if not vin or vin in seen:
            continue
        if car.get('location') and not is_socal(car['location']):
            continue
        if car.get('price') and car['price'] > MAX_PRICE:
            continue
        if car.get('mileage') and car['mileage'] > MAX_MILEAGE:
            continue
        if car.get('year') and car['year'] < MIN_YEAR:
            continue

        # ROI 계산
        roi = calc_roi(car.get('price'), car.get('mileage'))
        car['roi'] = roi

        new_listings.append(car)

    print(f'  신규 필터 통과: {len(new_listings)}건')

    # Score 기준 정렬 (높은 것부터)
    new_listings.sort(key=lambda c: (c.get('roi') or {}).get('score', 0), reverse=True)

    if new_listings:
        # AI 분석 (상위 10개만)
        listings_for_ai = new_listings[:10]
        ai_lines = []
        for car in listings_for_ai:
            roi = car.get('roi') or {}
            ai_lines.append(
                f"VIN {car.get('vin','N/A')}: ${car.get('price','?'):,} / "
                f"{car.get('mileage','?'):,}mi / {car.get('year','?')} / "
                f"ROI {roi.get('annual_roi_pct','?')}%/yr / {car.get('location','?')}"
            )
        ai_analysis = get_ai_recommendation('\n'.join(ai_lines))

        body    = format_email_body(new_listings, ai_analysis)
        subject = f'[Tesla CPO] 신규 Model 3 {len(new_listings)}건 — AI ROI 분석 완료'
        send_email(subject, body)
        print(f'  이메일 발송: {subject}')

        now_str = datetime.now(timezone.utc).isoformat()
        for car in new_listings:
            if car.get('vin'):
                seen[car['vin']] = {
                    'first_seen': now_str,
                    'price': car.get('price'),
                    'title': car.get('title'),
                    'location': car.get('location'),
                    'roi_score': (car.get('roi') or {}).get('score'),
                }
        save_seen_vins(seen)
        print(f'  seen VINs 저장: {len(seen)}개')
    else:
        print('  신규 매물 없음')

    print(f'[{datetime.now().isoformat()}] 완료')

if __name__ == '__main__':
    main()
