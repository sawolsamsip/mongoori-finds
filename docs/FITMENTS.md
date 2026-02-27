# 호환 데이터 업데이트 가이드 (모델/연도)

Tesla가 새 연식이나 모델을 출시할 때, **한 곳만 수정**하면 됩니다.

---

## 1. 수정하는 파일

- **`src/lib/products.ts`**  
  각 상품의 `fitments` 배열을 편집합니다.
- **`src/types/vehicle.ts`**  
  새 모델(예: 차세대 모델)이 나오면 `TeslaModel` 타입과 `TESLA_MODELS` 목록에 추가합니다.

---

## 2. 상품별 fitments 추가/수정

`fitments`는 **모델 + 연도 범위**(필요 시 생산월)로 “이 상품이 어떤 차에 맞는지” 정의합니다.

```ts
fitments: [
  { model: "3", yearFrom: 2017 },                    // Model 3, 2017년~
  { model: "Y", yearFrom: 2020 },                   // Model Y, 2020년~
  { model: "3", yearFrom: 2025, productionFrom: "2025-06" },  // 2025년 6월 생산분부터 다른 파트
  { model: "3", yearFrom: 2024, yearTo: 2025, productionBefore: "2025-06" }, // 2025년 6월 이전
],
```

| 필드 | 의미 |
|------|------|
| `model` | "3" \| "Y" \| "S" \| "X" \| "Cybertruck" |
| `yearFrom` | 해당 연도부터 적용 |
| `yearTo` | (선택) 이 연도까지. 없으면 “현재까지” |
| `productionFrom` | (선택) YYYY-MM. 이 달 **이후** 생산분만 적용 |
| `productionBefore` | (선택) YYYY-MM. 이 달 **이전** 생산분만 적용 |
| `note` | (선택) "2024 refresh" 등 메모 |

**연식만 바뀌는 경우**  
- 기존 `yearFrom`/`yearTo` 유지하고, 새 연도가 들어오면 `yearTo`를 늘리거나 새 항목 추가.

**연중에 파트가 바뀌는 경우**  
- `productionFrom` / `productionBefore`로 “몇 월 이전/이후” 구분해서 두 개의 fitment를 넣습니다.

---

## 3. 새 모델 추가 (예: 차세대 모델)

1. **`src/types/vehicle.ts`**
   - `TeslaModel` 타입에 새 값 추가:  
     `export type TeslaModel = "3" | "Y" | "S" | "X" | "Cybertruck" | "2";`
   - `TESLA_MODELS` 배열에 추가:  
     `{ value: "2", label: "Model 2" }`
2. **`src/lib/products.ts`**
   - 해당 상품의 `fitments`에 `{ model: "2", yearFrom: 2026 }` 같은 규칙 추가.

---

## 4. 자동화에 대해

- **Tesla 공식 API**로 “어떤 파트가 어떤 연식/생산월에 적용되는지”를 받는 건 어렵습니다.  
  → 호환 정보는 **수동으로 한 파일에서 관리**하는 방식이 현실적입니다.
- **VIN 입력**으로 연도(·가능하면 모델)를 자동 인식하는 건 이미 구현되어 있습니다.  
  → 새 모델이 VIN에 반영되면, 필요 시 `src/lib/fitments.ts`의 `getModelFromVIN` 매핑만 보완하면 됩니다.

정리하면: **상품 개수는 4개로 유지**하고, **상세/리스트에서 “내 차에 맞는지”만 모델·연도(·VIN)로 보여주는 구조**라서, 새 연식/모델이 나와도 `products.ts`와 `vehicle.ts`만 가끔 갱신하면 됩니다.
