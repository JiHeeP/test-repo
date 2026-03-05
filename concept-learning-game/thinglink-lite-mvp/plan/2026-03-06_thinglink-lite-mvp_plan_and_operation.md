# ThingLink Lite MVP 계획 및 운영 문서

작성일: 2026-03-06  
대상 경로: `concept-learning-game/thinglink-lite-mvp`

---

## 1) 이 문서의 목적
이 문서는 아래를 한 번에 이해할 수 있도록 정리한다.

1. 이 프로젝트가 무엇인지
2. 현재 어디까지 구현되었는지
3. 앞으로 어떤 순서로 개선할지
4. 실제로 어떻게 실행/테스트/배포할지
5. 누가 봐도 바로 이어서 작업할 수 있는 운영 기준

---

## 2) 프로젝트 한 줄 설명
`thinglink-lite-mvp`는 **360 이미지 / 평면 이미지 / 3D 모델(GLB/GLTF)**을 장면(Scene)으로 구성하고,
장면 위에 태그(핫스팟)를 올려 **텍스트/카드/HTML/유튜브 콘텐츠**를 보여주는 인터랙티브 웹 MVP이다.

---

## 3) 현재 구현 상태 (완료 기능)

### A. 장면(Scene) 기능
- 장면 타입 지원
  - `360`
  - `flat` (평면)
  - `model` (3D 모델)
- 장면 CRUD
  - 추가 / 수정 / 삭제
- 장면 이동
  - 이전 / 다음 / 목록 클릭 이동

### B. 태그(Tag) 기능
- 태그 CRUD
- 태그 표시 방식
  - 카드(PPT 느낌)
  - 글씨만
  - HTML 콘텐츠
- 유튜브 임베드
- 태그 스타일 프리셋
  - 아이콘
  - 색상
  - 크기
  - 카드 테마
- 평면/3D 장면 태그 드래그 이동

### C. 미디어 입력
- URL 입력
- 로컬 파일 업로드
  - 이미지 파일
  - 3D 모델(.glb/.gltf)

### D. 안전/운영
- HTML sanitize(DOMPurify)
- 발표 모드 토글 + 단축키(F, ESC)
- localStorage 자동 저장/복원
- JSON 내보내기/가져오기
- 저장 초기화
- 상태바(성공/오류 안내)

### E. 자동 테스트
- `npm test` 스모크 테스트 추가
  - 필수 파일 존재
  - 핵심 DOM 요소 확인
  - JS 문법 검사
  - scenes.js 기본 구조 검사

---

## 4) 코드 구조(모듈)

- `index.html` : 화면 뼈대, 라이브러리 로드
- `styles.css` : 전체 스타일
- `scenes.js` : 기본 장면 데이터
- `js/main.js` : 앱 진입점, 이벤트/흐름 제어
- `js/render.js` : 360/overlay 렌더링 공통
- `js/storage.js` : 저장/복원/정규화
- `js/utils.js` : 공통 유틸(sanitize, 상태메시지 등)
- `js/validators.js` : 입력 검증
- `scripts/smoke-test.mjs` : 자동 스모크 테스트
- `package.json` : 테스트 스크립트 정의

---

## 5) 실행 방법 (로컬)

```bash
cd concept-learning-game/thinglink-lite-mvp
python3 -m http.server 8080
```
브라우저: `http://localhost:8080`

---

## 6) 테스트 방법

### 자동 테스트
```bash
cd concept-learning-game/thinglink-lite-mvp
npm test
```
성공 기준: `✅ smoke test passed`

### 수동 핵심 체크(최소)
1. 장면 타입 3개(360/flat/model) 생성 가능
2. 각 타입에서 태그 추가 가능
3. flat/model 태그 드래그 이동 가능
4. display mode(card/text/html) 반영
5. JSON export/import 정상
6. 발표 모드 토글(F/ESC) 정상

---

## 7) Git 운영 방식

### 작업 순서
1. 브랜치 생성
2. 기능 개발
3. `npm test`
4. 커밋
5. PR 생성
6. 리뷰/머지

### 권장 커밋 규칙
- 기능 단위 커밋
- 커밋 메시지에 동사 시작
  - 예: `Add 3D model upload support`
  - 예: `Refactor scene renderer into module`

---

## 8) 향후 개선 계획 (우선순위)

### P1 (가까운 다음 작업)
- 태그 위치 정밀 조정 UI(키보드/숫자 입력)
- 3D 모델 위 실제 3D 좌표 핫스팟(현재는 오버레이 방식)
- 장면 썸네일 목록

### P2
- 프로젝트 저장 파일(.json) 버전 마이그레이션 로직 강화
- 태그 템플릿(퀴즈형/영상형/설명형)
- 모바일 UI 최적화

### P3
- 백엔드 연동(다중 사용자 저장)
- 권한(편집자/뷰어)
- 협업 편집

---

## 9) 작업 인수인계 체크리스트
누가 이어받아도 아래만 확인하면 시작 가능:

- [ ] `npm test` 통과
- [ ] `http://localhost:8080` 접속 확인
- [ ] 장면 3타입 작동 확인
- [ ] 태그 저장/표시/드래그 확인
- [ ] JSON export/import 확인
- [ ] 최근 커밋 로그 확인

---

## 10) 요약
현재 `thinglink-lite-mvp`는 “기능 데모” 수준을 넘어,
교육/발표 맥락에서 바로 시연 가능한 인터랙티브 저작 MVP 상태다.

다음 핵심은 **3D 좌표 기반 핫스팟 고도화**와 **협업 저장 구조**다.
