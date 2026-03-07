# AGENT_GUIDELINE.md

이 문서는 현재 4개 에이전트(디스코드 봇 1:1 매핑)의 역할과 작업 규칙을 정의한다.

## 공통 원칙

- `forfun` 작업은 반드시 `external/forfun` 내부에서 수행한다.
- `plna` 작업은 반드시 `external/plna` 내부에서 수행한다.
- 코드 변경 결과 요약은 `hubs/*/reports/`에 Markdown으로 기록한다.
- 학생 개인정보는 외부 공유/커밋/PR 본문에 직접 노출하지 않는다.

---

## Agent-1 (Teacher Core)

- **주 레포:** `external/forfun`
- **주 역할:** teacher-aid 학생 기록/평가/리포트 기능 개선
- **보조 역할:** main 관련 운영 문서 연결

### 작업 절차
1. 시작 전
   - `cd external/forfun`
   - `git checkout main && git pull origin main`
2. 브랜치 규칙
   - `feat/teacher-*`, `fix/teacher-*`
3. 필수 검증
   - `npm test`
   - `npm run build`
4. 결과 기록
   - `hubs/teacher-aid/reports/YYYY-MM-DD.md`에 5줄 요약

---

## Agent-2 (Market/Research Support)

- **주 레포:** 코드 변경보다 분석/리서치 지원 중심
- **주 역할:** teacher-aid/market-intel 의사결정 지원
- **보조 역할:** 개선안 근거 정리

### 작업 절차
1. 제안 형식
   - `근거 → 위험 → 대안` 3단 구조
2. teacher-aid 이슈 대응 시
   - 운영/백업 정책 우선 검토
3. 결과 기록
   - `hubs/teacher-aid/reports/` 또는 `hubs/market-intel/reports/`에 인사이트 저장

---

## Agent-3 (Coding Ops)

- **주 레포:** `external/forfun`, `external/plna` (공통 품질 게이트)
- **주 역할:** 브랜치/검증/PR 표준화
- **보조 역할:** 장애/재현성 문서화

### 작업 절차
1. PR 전 체크리스트
   - build / test / lint(가능 레포)
2. 브랜치/커밋 컨벤션 준수
3. 금지 사항
   - 루트 워크스페이스와 external 코드 혼합 커밋 금지
4. 결과 기록
   - `hubs/coding/changelogs/`에 실패 로그/재현법 기록

---

## Agent-4 (Main Concierge)

- **주 레포:** `external/plna`
- **주 역할:** main 개인 계획/회고/주간 관리 UX 개선
- **보조 역할:** 허브 간 결과 통합

### 작업 절차
1. 시작 전
   - `cd external/plna`
   - `git checkout main && git pull origin main`
2. 브랜치 규칙
   - `feat/main-*`, `fix/main-*`
3. 필수 검증
   - `npm run build`
   - `npm run lint` (가능 시)
4. 결과 기록
   - `hubs/main/reports/YYYY-MM-DD.md`에 요약 저장

---

## 용도 매핑 (확정)

- `forfun` → teacher-aid 학생 기록/관리
- `plna` → main 개인 계획/주간 대시보드

## 운영 요약 한 줄

> 각 레포는 각 디렉토리에서 독립적으로 개발하고, 허브에는 결과 요약만 기록한다.
