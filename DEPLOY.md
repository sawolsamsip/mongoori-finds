# Mongoori Finds — 배포 (GitHub + Coolify)

## 1. GitHub 버전 업데이트 & 푸시

### 1) GitHub에 새 저장소 만들기
- https://github.com/new
- Repository name: `mongoori-finds` (또는 원하는 이름)
- Public, **Add a README file** 체크 해제 (이미 로컬에 있음)
- Create repository

### 2) 로컬에서 remote 추가 후 푸시
```bash
cd /path/to/mongoori-finds

git remote add origin https://github.com/YOUR_USERNAME/mongoori-finds.git
# 또는 SSH: git remote add origin git@github.com:YOUR_USERNAME/mongoori-finds.git

git branch -M main
git push -u origin main
```

이후 버전 올릴 때:
```bash
# package.json version 수정 후
git add .
git commit -m "chore: v1.x.x — 설명"
git push
```

---

## 2. Coolify에서 배포하기 (단계별)

### Step 1. 프로젝트 준비
1. Coolify 대시보드 접속
2. 왼쪽에서 **Projects** 클릭
3. **+ Add** 로 새 프로젝트 만들거나, 기존 프로젝트 선택

---

### Step 2. 애플리케이션 추가
1. 해당 프로젝트 안에서 **+ Add Resource** (또는 **Add Application**) 클릭
2. **Application** 타입 선택 후 **Continue** / **Next**

---

### Step 3. GitHub 저장소 연결
1. **Source**에서 **GitHub** 선택
2. **Connect** 또는 **Configure**로 GitHub 로그인/연동 (처음이면 OAuth 허용)
3. 연결 후:
   - **Repository**: `sawolsamsip/mongoori-finds` 선택
   - **Branch**: `main`
4. **Continue** / **Next**

---

### Step 4. 빌드 방식 설정 (Dockerfile)
1. **Build Pack** 또는 **Build Type**에서 **Dockerfile** 선택
2. **Dockerfile Location** / **Dockerfile path**:  
   - 비워두거나 **`Dockerfile`** 입력 (프로젝트 **루트**에 있음)
3. **Dockerfile**이 루트에 하나만 있으면 보통 자동 인식됨
4. **Save** 또는 **Continue**

---

### Step 5. 환경 변수 (Stripe 등)
1. 애플리케이션 상세 화면에서 **Environment Variables** / **Env** 탭으로 이동
2. **+ Add** 로 아래 변수 추가 (Stripe 쓰는 경우):

   | Name | Value |
   |------|--------|
   | `STRIPE_SECRET_KEY` | Stripe 대시보드 시크릿 키 |
   | `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 시크릿 (나중에 URL 알면 설정) |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 퍼블릭 키 |
   | `ADMIN_PASSWORD` | 관리자 페이지(/admin) 로그인 비밀번호 (주문·배송·환불 관리) |

3. 도메인 쓰는 경우 (선택):
   - `NEXT_PUBLIC_SITE_URL` = `https://사용할도메인.com`
4. **Save**

---

### Step 6. 도메인 설정
1. **Domains** / **Domain** 섹션으로 이동
2. **+ Add Domain** 후 사용할 도메인 입력 (예: `shop.mongoori.com`)
3. Coolify가 준 임시 URL만 쓸 거면 그대로 두어도 됨
4. **Save**

---

### Step 7. 배포 실행
1. **Deploy** / **Start Deployment** 버튼 클릭
2. 빌드 로그에서 **Dockerfile**로 빌드되는지 확인
3. 완료되면 **Open** / **Visit** 로 접속 테스트

---

### Step 8. (선택) 푸시 시 자동 배포
1. 애플리케이션 설정에서 **Webhooks** 또는 **Auto Deploy** 찾기
2. **Deploy on push** / **Auto Deploy** 켜기
3. GitHub 저장소에 푸시할 때마다 자동으로 재배포됨

---

---

### 도메인 `https://finds.mongoori.com` 설정

1. **DNS 설정** (도메인 관리하는 곳에서)
   - `finds.mongoori.com` → **A 레코드**로 Coolify 서버 IP 지정  
     (예: Coolify가 `192.168.1.188`에서 돌면 그 IP, 외부에서 접속하려면 공인 IP)
   - 전파까지 수 분~몇 시간 걸릴 수 있음

2. **Coolify — General 탭**
   - **Domains** 입력란에 기존 sslip.io 주소 지우고 **`finds.mongoori.com`** 만 입력
   - **Set Direction** / 저장 후 **Deploy** 한 번 실행
   - Coolify(Traefik)가 80/443 받아서 컨테이너 3000으로 넘겨 줌 → **포트는 3000 그대로**

3. **포트 매핑 (Network 탭)**
   - **Ports Exposes**: `3000` (앱이 컨테이너 안에서 듣는 포트)
   - **Port Mappings**: `3000:3000` 유지
   - 외부 80/443은 Coolify가 처리하므로 여기서 바꿀 필요 없음

4. **HTTPS**
   - 도메인만 `finds.mongoori.com`으로 넣으면 Coolify가 Let's Encrypt로 HTTPS 발급 시도
   - 실패하면: 서버 80/443이 외부에 열려 있는지, DNS가 해당 서버 IP로 가는지 확인

---

### 문제 해결
- **Build 실패**: Coolify 빌드 로그에서 에러 라인 확인. `Dockerfile` 경로가 `Dockerfile`(루트) 맞는지 확인.
- **이미지 없음**: `public/hero/*.avif`, `public/images/*` 가 Git에 포함돼 있는지 확인 (`git status`).
- **Stripe 결제 안 됨**: 배포 URL을 Stripe Dashboard → Webhooks에 등록하고 `STRIPE_WEBHOOK_SECRET` 다시 넣기.
