#!/usr/bin/env bash
# 다운로드한 이미지를 홈페이지에서 쓰는 이름으로 바꿉니다.
# 사용법: public/images/ 안의 현재 파일 이름을 아래에서 맞게 수정한 뒤 실행하세요.
#   cd mongoori-finds && bash scripts/rename-images.sh

set -e
cd "$(dirname "$0")/.."
IMGDIR="public/images"
mkdir -p "$IMGDIR"

# 여기 아래를 실제 파일 이름에 맞게 수정하세요. (없는 항목은 비워 두거나 줄을 지우세요.)
# 예: "다운로드한캐빈필터.jpg" -> cabin-filter.jpg

rename_if() {
  if [ -f "$IMGDIR/$1" ]; then
    mv "$IMGDIR/$1" "$IMGDIR/$2" && echo "  $1 -> $2"
  fi
}

echo "Renaming images in $IMGDIR ..."

# Cabin Air Filter
rename_if "캐빈필터.jpg"        "cabin-filter.jpg"
rename_if "cabin_filter.jpg"   "cabin-filter.jpg"
rename_if "cabin-filter-1.jpg" "cabin-filter.jpg"
rename_if "캐빈필터2.jpg"       "cabin-filter-2.jpg"
rename_if "cabin-filter-2.jpg" "cabin-filter-2.jpg"
rename_if "캐빈필터3.jpg"       "cabin-filter-3.jpg"
rename_if "cabin-filter-3.jpg"  "cabin-filter-3.jpg"

# Wiper Set
rename_if "와이퍼.jpg"          "wiper-set.jpg"
rename_if "wiper.jpg"          "wiper-set.jpg"
rename_if "wiper-set-1.jpg"    "wiper-set.jpg"
rename_if "와이퍼2.jpg"        "wiper-set-2.jpg"
rename_if "wiper-set-2.jpg"    "wiper-set-2.jpg"

# Key Card
rename_if "키카드.jpg"         "key-card.jpg"
rename_if "keycard.jpg"        "key-card.jpg"
rename_if "key_card.jpg"       "key-card.jpg"
rename_if "키카드2.jpg"        "key-card-2.jpg"
rename_if "key-card-2.jpg"     "key-card-2.jpg"

# Cleaning Kit
rename_if "클리닝키트.jpg"     "cleaning-kit.jpg"
rename_if "cleaning_kit.jpg"   "cleaning-kit.jpg"
rename_if "cleaning-kit-1.jpg" "cleaning-kit.jpg"
rename_if "클리닝키트2.jpg"    "cleaning-kit-2.jpg"
rename_if "cleaning-kit-2.jpg" "cleaning-kit-2.jpg"
rename_if "클리닝키트3.jpg"    "cleaning-kit-3.jpg"
rename_if "cleaning-kit-3.jpg" "cleaning-kit-3.jpg"

echo "Done. Required names: cabin-filter.jpg, wiper-set.jpg, key-card.jpg, cleaning-kit.jpg (+ -2, -3 for gallery)."
echo "If your files are .png, use .png in src/lib/products.ts instead of .jpg"
