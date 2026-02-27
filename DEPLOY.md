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

## 2. Coolify 설정

### 2-1. Coolify에서 새 리소스
1. **Project** 생성 (또는 기존 프로젝트 선택)
2. **+ Add Resource** → **Application**
3. **Source**: GitHub 선택 후 저장소 연결
   - Repository: `YOUR_USERNAME/mongoori-finds`
   - Branch: `main`
4. **Build Pack**: **Dockerfile** 선택
   - Dockerfile 경로: `Dockerfile` (프로젝트 루트)

### 2-2. 환경 변수 (선택)
- **Stripe**: Coolify Application → Environment Variables
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- 필요 시 `NEXT_PUBLIC_SITE_URL` (예: `https://finds.yourdomain.com`)

### 2-3. 도메인 & 배포
- **Domains**: 원하는 도메인 추가 (예: `shop.mongoori.com` 또는 Coolify가 준 URL)
- **Deploy** 실행

### 2-4. 참고
- 이 프로젝트는 **Next.js standalone** + **Dockerfile**로 빌드됩니다.
- Coolify가 GitHub 푸시 시 자동 배포하도록 하려면 **Webhook** 또는 **Auto Deploy**를 켜두면 됩니다.
