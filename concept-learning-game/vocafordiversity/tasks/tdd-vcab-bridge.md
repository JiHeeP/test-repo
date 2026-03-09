# TDD: 어휘의 징검다리 — Technical Design Document

> **문서 버전:** v1.0  
> **작성일:** 2026-03-09  
> **기준 문서:** `tasks/prd-vocab-bridge.md` (PRD), `tasks/prd-diff.md`, `tasks/design-principle.md`  
> **현행 코드베이스:** `preview-react2/` (React 19 + Vite 7 + Tailwind CSS 4)  
> **대상 독자:** 개발자(코딩 에이전트 포함), 기획자

---

## 1. Problem Statement

### 1.1 교육 현장의 문제

초등학교 다문화 학급(17명, 다문화·중도입국 학생 15명)에서 **학습도구어(Tier 2/3 Academic Vocabulary)**의 이해 부족이 전 과목 학업 성취도 저하의 근본 원인으로 작용하고 있다. 현재 이 학급의 어휘 자유 산출율은 10%에 불과하며, 다문화-한국 학생 간 성취도 격차는 25%p에 달한다.

기존 어휘 학습 도구들은 다음 한계를 갖는다:

- **타이핑 기반 입력:** 한국어 입력이 서투른 다문화·중도입국 학생에게 학습 진입 장벽이 높다.
- **단일 감각 의존:** 텍스트 중심 학습으로 소리·시각·촉각 기반의 다감각 어휘 인식 경로가 부재하다.
- **학습 과정 비가시성:** 교사가 수업 중 학생별 위험 수준(Tier)을 실시간 파악할 수 없어, 적시 개입이 불가하다.
- **진단-개입 사이클 단절:** 학습 기록이 체계적으로 축적·분석되지 않아, 주간/월간 단위의 데이터 기반 교수 의사결정이 어렵다.

### 1.2 기술적 문제

현행 프로토타입(`preview-react2/`)은 Step 1~6 UI가 단일 `App.jsx` + `games/Step0X.jsx` 구조로 존재하나, 다음이 전무하다:

- 인증 시스템 (교사/학생 분리)
- 백엔드 데이터 영속성 (Firebase 연동)
- 채점 로직 및 학습 기록 저장
- 리포트 시스템 (PDF 출력)
- 최신 기획 반영 (퀴즈 사이클 구조, 다국어 지원, Step별 세부 채점 규칙)

또한, 현행 코드는 모든 로직이 단일 레이어에 혼합되어 있어 독립적인 기능 단위의 개발·테스트·배포가 불가능하다.

---

## 2. Scope

### 2.1 PoC 범위 정의

본 TDD의 1차 범위는 **PoC(Proof of Concept)** 로, **단일 학급(1학급, 17명)**을 대상으로 한다.

| 구분 | PoC (1차) | 확장 (2차 이후) |
|------|-----------|----------------|
| 대상 학급 | 1개 학급 고정 | 복수 학급, 복수 학교 |
| 교사 계정 | 1명 (사전 등록) | 다수 교사, 학교 단위 관리 |
| 학생 수 | 최대 25명 | 학급당 40명, 학교당 수백 명 |
| 어휘 데이터 | 개발자가 JSON 세팅 | 교사 단어 추가/편집 UI |
| 퀴즈 사이클 | 1~2개 사이클 검증 | 수십 개 사이클, 자동 생성 |
| 저장 설정 | `.env` 파일 관리 | 교사 대시보드 UI |
| 리포트 캐싱 | 없음 (실시간 계산) | `reports_cache` 컬렉션 |
| 적응형 난이도 | 없음 (소프트 잠금만) | 자동 난이도 조정 |
| 사전/사후 총괄평가 | 제외 | 별도 모듈 |

### 2.2 PoC 성공 기준

- 학생 25명이 동시 학습 시 Step 1~6 주요 기능이 정상 동작한다.
- 1개 퀴즈 사이클(10개 단어)을 Step 1→6까지 완전 순회한다.
- 교사가 대시보드에서 Tier 2/3 학생을 실시간 확인한다.
- 주간 개인 리포트를 PDF로 출력한다.

---

## 3. Functional Requirements

PRD의 User Stories와 기능 요구사항을 기술 구현 관점에서 재정의한다. 우선순위는 PRD 기준(배포 → 인증 → 채점·저장 → 학습 게임 → 리포트 → 기타)을 따른다.

### 3.1 배포 및 호스팅 (Gate 0)

| ID | 요구사항 | 수용 기준 |
|----|----------|-----------|
| FR-D1 | Vite 프로덕션 빌드 | `npm run build` → `dist/` 생성, 빌드 에러 0건 |
| FR-D2 | 환경변수 분리 | Firebase 설정값 6개 + `VITE_MIN_SAVE_STEP` → `.env` 분리, `.env.example` 제공 |
| FR-D3 | Firebase Hosting 배포 | 퍼블릭 URL 발급, HTTPS 자동 적용 |
| FR-D4 | SPA 라우팅 | `firebase.json` rewrite 규칙, 직접 URL 접근 시 404 없음 |
| FR-D5 | 원커맨드 배포 | `npm run deploy` = build + firebase deploy |
| FR-D6 | 개발자 온보딩 | README에 로컬 셋업 ~ 배포 전 과정 문서화 |

### 3.2 인증 및 계정 관리

| ID | 요구사항 | 수용 기준 |
|----|----------|-----------|
| FR-A1 | 교사 로그인 | Firebase Auth 이메일/비밀번호, 로그인 실패 메시지, 로그아웃 |
| FR-A2 | 학생 코드 로그인 | `S + 5자리 숫자` 코드 입력 → Firebase Auth 커스텀 토큰 인증 |
| FR-A3 | 역할 기반 접근 제어 | 교사: 학생 등록/삭제/리포트 조회. 학생: 본인 학습 기록만 접근 |
| FR-A4 | 세션 유지 | 브라우저 새로고침 시에도 인증 상태 유지 (Firebase Auth persistence) |

### 3.3 학생 관리

| ID | 요구사항 | 수용 기준 |
|----|----------|-----------|
| FR-S1 | 학생 일괄 등록 | 이름 목록(쉼표/줄바꿈) 입력 → 미리보기 테이블 → Firestore batch write |
| FR-S2 | 학생 코드 자동 생성 | `S + 5자리 숫자`, 전체 고유성 보장 |
| FR-S3 | 다문화 여부 관리 | 반 전체 기본값 설정 + 행별 개별 수정 |
| FR-S4 | 학생 삭제 | 확인 다이얼로그 → `students` 문서 삭제, `learning_records` 보존 |
| FR-S5 | 중복 이름 감지 | 같은 학년/반 내 중복 시 경고 배지 (차단은 아님) |

### 3.4 어휘 데이터셋

| ID | 요구사항 | 수용 기준 |
|----|----------|-----------|
| FR-V1 | 퀴즈 사이클 구조 | `vocabData.json` — `cycles[].words[]` 구조, 1사이클 = 10단어 |
| FR-V2 | 단어 객체 스키마 | `id`, `word`, `zh`, `ru`, `meaning`, `examples`, `icon`, `color`, `relatedWords`, `unrelatedWords`, `step4`, `step5` 필드 |
| FR-V3 | JSON 직접 import | Vite의 JSON import 지원, `JSON.parse` 불필요 |
| FR-V4 | 스키마 유효성 | 모든 사이클에 `cycle_id` + 10개 단어, 단어 필수 필드 `id/word/meaning` |

### 3.5 채점 및 학습 기록 저장

| ID | 요구사항 | 수용 기준 |
|----|----------|-----------|
| FR-R1 | 메모리 누적 → threshold flush | `min_save_step` 미만: 메모리 누적. 도달 시: Firestore `setDoc` 일괄 flush |
| FR-R2 | 이후 누적 업데이트 | threshold 이후 각 Step 완료 시 `updateDoc` + `arrayUnion`으로 `stage_results` 추가 |
| FR-R3 | Step 1 채점 | `score = (totalWords - unknownWords.length) / totalWords * 만점`, `additional_datapoint.unknownWords` 저장 |
| FR-R4 | Step 2~5 공통 채점 | 힌트 없이 정답 2점 / 힌트 후 정답 1점 / 최종 오답 0점 |
| FR-R5 | Step 6 채점 | Canvas 기반, 80초 제한, 콤보 시스템, 총점만 기록 |
| FR-R6 | 오류율 계산 | `(1 - 획득점수/만점) × 100`, 소수 원본값 기준 판정, 화면은 소수 1자리 반올림 |
| FR-R7 | Tier 자동 분류 | 0~20% mastered / 20~35% development / 35~50% tier2 / 50%+ tier3 |
| FR-R8 | time_spent 기록 | 각 `stage_results` 항목에 초 단위 소요 시간 |
| FR-R9 | historical_results 기록 | Step 2~5에 `[{trial_index, result}]` 저장 → `first_try_rate` 사후 산출 |
| FR-R10 | min_save_step 설정 | `.env`의 `VITE_MIN_SAVE_STEP` (기본값 3, 범위 2~5) |
| FR-R11 | Stage 채점 설정 관리 | `src/config/stageConfig.json`에서 Stage별 `wordCount`, `maxScore`, `scorePerCorrect` 등 관리. 교사가 코드 도구로 직접 편집 가능. 앱 초기화 시 스키마 검증 |
| FR-R12 | 채점 맥락 스냅샷 | 각 `stage_results`에 `scoring_context { word_count, max_score }`를 기록 시점 Config 값으로 캡처·저장 (Write-time Snapshot) |

### 3.6 학습 게임 (Step 1~6)

| ID | Step | 핵심 요구사항 |
|----|------|--------------|
| FR-G1 | Step 1 | 언어 선택(한/중/러) → 멀티모달 카드(앞면 아이콘+TTS, 뒷면 뜻·예문·번역) → 자기평가 루프(unknownDeck 반복) |
| FR-G2 | Step 2 | 5라운드 N+2 매칭 (슬롯 4 + 카드 6), 탭-투-무브 필수 + 드래그 옵션, 오답 몬스터 버리기 |
| FR-G3 | Step 3 | 9라운드 8지선다(관련어 4개 선택), 힌트 1회, 초기화, 채점(최대 18점) |
| FR-G4 | Step 4 | 8문항 음절 블록 조립, Easy(ghost text)/Hard(방해 블록) 토글, 힌트 모달(최대 16점) |
| FR-G5 | Step 5 | Stage 1: 블라인드 어휘 퀴즈 2지선다 10문항 + Stage 2: 문장 어절 조립 10문항(함정 제거 1회, 부분 정답 지원, 최대 30점) |
| FR-G6 | Step 6 | Canvas 낙하 게임, 9주제, 관련 단어 4개 수집 → 다음 주제, 80초, 콤보 보너스 |
| FR-G7 | 공통 | TTS `ko-KR`, 번역어 텍스트만, 터치/탭 기반 UX(타이핑 배제), TTS 중복 방지(`cancel()`) |
| FR-G8 | 순차 진행 | Step 1→6 순차 원칙, 1차는 소프트 잠금(경고만, 강제 차단 없음) |
| FR-G9 | 사이클 라우팅 | 학생 홈에서 사이클 목록 → 선택 → Step 1부터 순차. 사이클 완료 후 다음 사이클 진행 |

### 3.7 교사 대시보드 및 리포트

| ID | 요구사항 | 수용 기준 |
|----|----------|-----------|
| FR-T1 | 실시간 학급 현황 | Firestore `onSnapshot` 구독, 오류율 높은 순 정렬, Tier 색상 구분, 다문화 배지 |
| FR-T2 | 개인 주간 리포트 | 주간 필터, 종합 성취도/단계별 수행률/단어별 상세/평균 소요 시간/1차 정답률, PDF A4 |
| FR-T3 | 월간 그룹 리포트 | 전체/다문화 그룹 분리 집계, 격차(%p), 취약 유형 Top 3 자동 텍스트 |
| FR-T4 | 개입 로그 | 개입 유형/집중 단어/소요 시간/전후 오류율/메모 입력 → `intervention_logs` 저장 |
| FR-T5 | PDF 생성 | `jsPDF` + `html2canvas`, 한글 폰트(Noto Sans KR), 헤더/푸터, 5초 이내 |

---

## 4. Non-Functional Requirements

### 4.1 모듈러 아키텍처 (Modular Development)

본 시스템은 **독립 개발·테스트·배포가 가능한 모듈 단위**로 설계한다. 각 모듈은 명확한 인터페이스(contract)를 통해서만 상호작용하며, 내부 구현은 다른 모듈에 영향을 주지 않아야 한다.

#### 4.1.1 모듈 분류

```
vocabridge/
├── modules/
│   ├── core/                    # 🔵 코어 인프라
│   │   ├── auth/                #   인증 모듈 (Firebase Auth 래퍼)
│   │   ├── config/              #   환경 설정 모듈 (.env 파싱, StageConfig JSON 로딩·검증)
│   │   │   ├── stageConfig.json #     ← 교사가 코드 도구로 직접 편집하는 채점 설정
│   │   │   └── stageConfig.ts   #     JSON 로더 + 스키마 검증 + 타입 안전 조회
│   │   └── firebase/            #   Firebase 초기화 및 공통 유틸
│   │
│   ├── data/                    # 🟢 데이터 레이어
│   │   ├── students/            #   학생 CRUD (등록, 삭제, 조회)
│   │   ├── vocab/               #   어휘 데이터셋 (vocabData.json 로딩, 사이클 관리)
│   │   ├── learning-records/    #   학습 기록 저장·조회 (메모리 누적 → Firestore flush)
│   │   ├── intervention-logs/   #   개입 로그 저장·조회
│   │   └── cache/               #   클라이언트 측 임시 저장 (in-memory stage_results 버퍼)
│   │
│   ├── games/                   # 🟡 게임 모듈 (Step별 독립)
│   │   ├── shared/              #   게임 공통 모듈 (아래 4.1.2 참조)
│   │   ├── step1-multimodal/    #   멀티모달 카드
│   │   ├── step2-matching/      #   N+2 매칭 게임
│   │   ├── step3-related/       #   관련어 고르기
│   │   ├── step4-syllable/      #   음절 블록 조립
│   │   ├── step5-blind-quiz/    #   블라인드 퀴즈 + 어절 조립
│   │   └── step6-shower/        #   어휘 소나기 (Canvas)
│   │
│   ├── dashboard/               # 🔴 교사 대시보드
│   │   ├── realtime-monitor/    #   실시간 학급 현황
│   │   ├── student-management/  #   학생 관리 UI
│   │   └── intervention/        #   개입 로그 UI
│   │
│   └── reports/                 # 🟣 리포트 모듈
│       ├── weekly-personal/     #   개인 주간 리포트
│       ├── monthly-group/       #   월간 그룹 리포트
│       └── pdf-engine/          #   PDF 생성 엔진 (jsPDF + html2canvas)
```

#### 4.1.2 게임 공통 모듈 (`games/shared/`)

`design-principle.md`의 디자인 원칙을 코드 레벨에서 강제하기 위한 공유 모듈이다.

| 공유 항목 | 설명 | design-principle 근거 |
|-----------|------|----------------------|
| `Layout` | 고정 UI 레이아웃 (다음/뒤로/힌트 버튼 위치) | §1. "버튼은 항상 같은 자리" |
| `ProgressBar` | 진행 상황 시각화 | §2. "끝이 보인다는 희망" |
| `FeedbackSound` | 정답/오답 사운드 통합 | §1. "피드백 사운드 통일" |
| `FeedbackMessage` | 긍정적 피드백 텍스트 | §3. "틀려도 격려 문구" |
| `MicroAnimation` | 버튼 반응 애니메이션 | §3. "마이크로 애니메이션" |
| `TTSEngine` | TTS 재생/취소/큐 관리 | PRD FR-10, FR-15 |
| `ScoringEngine` | 공통 채점 로직 (Config의 StageScoreRule 기반) | PRD FR-4, Write-time Snapshot |
| `TimerComponent` | 시간 측정 (time_spent 기록용) | PRD FR-R8 |
| `ThemeProvider` | Step별 배경 테마/컬러 변주 | §2. "배경 테마와 컬러 변주" |
| `StageResultBuffer` | 메모리 기반 stage_results 누적기 | PRD FR-R1 |
| `StageConfigProvider` | Config JSON에서 StageScoreRule 조회 → ScoringContext 생성 | §6.2 StageConfig JSON |

#### 4.1.3 모듈 독립성 규칙

- **의존 방향은 단방향이다.** `games/*` → `games/shared/`, `data/*` 방향만 허용. 역방향 의존 금지.
- **모듈 간 통신은 인터페이스(타입)로만 한다.** 각 모듈은 `types.ts`에 공개 인터페이스를 정의하고, 소비자는 이 타입만 참조한다.
- **게임 모듈은 데이터 레이어에 직접 접근하지 않는다.** `onComplete(stageResult)` 콜백을 통해 결과를 상위로 전달하고, 저장 책임은 데이터 레이어가 갖는다.
- **모듈별 독립 테스트가 가능하다.** 각 모듈은 자체 단위 테스트를 갖고, 의존 모듈은 mock으로 대체한다.
- **모듈별 독립 빌드가 가능하다.** 추후 monorepo(Turborepo 등) 전환 시 각 모듈이 독립 패키지로 분리 가능한 구조를 유지한다.

### 4.2 성능 (Performance)

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 초기 로딩 | First Contentful Paint ≤ 2초 (4G 기준) | Lighthouse |
| 학습 화면 전환 | Step 간 전환 ≤ 300ms | 사용자 체감, Performance API |
| Firestore 저장 | 쓰기 응답 ≤ 1초 | 네트워크 탭 모니터링 |
| PDF 생성 | A4 1~2페이지 리포트 ≤ 5초 | console.time 측정 |
| 동시 사용자 | 25명 동시 학습 시 성능 저하 없음 | 부하 테스트 (PoC 범위) |
| Step 6 Canvas | 60fps 유지 (버블 20개 동시 렌더링) | requestAnimationFrame 측정 |

### 4.3 보안 (Security)

| 항목 | 요구사항 |
|------|----------|
| 인증 분리 | 교사: Firebase Auth 이메일/비밀번호. 학생: 커스텀 토큰 (서버 사이드 발급) |
| Firestore 규칙 | 학생: 본인 `student_id` 일치 문서만 read/write. 교사: 본인 학급 전체 read/write |
| 환경변수 | Firebase 키는 `.env`에 분리, `.gitignore` 등록, 코드에 하드코딩 금지 |
| HTTPS | Firebase Hosting 자동 HTTPS. HTTP 자동 리다이렉트 |
| 학생 코드 보안 | 학생 코드는 추측 불가능한 패턴(S + 5자리), 커스텀 토큰 만료 관리 |

### 4.4 접근성 및 UX (Accessibility & UX)

| 항목 | 요구사항 |
|------|----------|
| 터치 타깃 | 최소 44px × 44px (모바일/태블릿 우선) |
| 타이핑 배제 | 학습 과정 전체에서 키보드 타이핑 제거. 터치/탭/드래그만 사용 |
| 반응형 | 태블릿(1024px) 기준 설계, 모바일(375px~) / PC도 지원 |
| 폰트 | `Noto Sans KR`(본문) + `Gaegu`(타이틀). 최소 16px |
| 다국어 | 한국어 UI 기본. 학습 내 번역어(중국어, 러시아어) 텍스트 표시 |
| 색상 대비 | WCAG AA 기준 (4.5:1 이상) |
| TTS | 모든 학습 카드/문항에 `ko-KR` TTS 제공. 중복 방지(`cancel()`) |

### 4.5 신뢰성 (Reliability)

| 항목 | 요구사항 |
|------|----------|
| 오프라인 내성 | 학습 중 일시적 네트워크 끊김 시, 메모리 버퍼의 stage_results가 유실되지 않아야 한다. 네트워크 복구 후 자동 재시도 (최대 3회) |
| Firestore 쓰기 실패 | 실패 시 로컬 메모리에 보존 + 사용자에게 경고 토스트 + 자동 재시도 |
| 부분 실패 처리 | 학생 일괄 등록 시 일부 실패해도 성공 건은 저장. 실패 건수 구분 표시 |
| 에러 바운더리 | 게임 모듈 크래시 시 전체 앱이 죽지 않도록 React Error Boundary 적용 |
| 데이터 정합성 | `learning_records`의 `stage_results` 누적 시 중복 방지 (동일 stage 재전송 감지) |

### 4.6 유지보수성 (Maintainability)

| 항목 | 요구사항 |
|------|----------|
| TypeScript | 전체 코드베이스 TypeScript 적용. `strict: true`. 타입 정의는 모듈별 `types.ts` |
| 린팅 | ESLint + Prettier 통합. CI에서 lint 통과 필수 |
| 코드 구조 | 모듈별 `index.ts` barrel export. 순환 의존 금지 |
| 테스트 | 모듈별 단위 테스트 필수 (채점 로직, 데이터 레이어, 환경변수 파싱). E2E는 PoC 이후 |
| 문서화 | 각 모듈 `README.md`에 역할/인터페이스/사용법 기술 |
| 버전 관리 | Git flow. `main` (배포), `develop` (통합), `feature/*` (기능 브랜치) |

### 4.7 확장성 (Scalability)

PoC는 단일 학급 대상이나, 2차 확장을 가로막지 않는 구조여야 한다.

| 항목 | PoC 전략 | 2차 확장 경로 |
|------|----------|--------------|
| 어휘 데이터 | `vocabData.json` 정적 파일 | Firestore `words` 컬렉션 마이그레이션 + 교사 UI |
| 저장 설정 | `.env` 환경변수 | 교사 대시보드 설정 UI |
| 리포트 캐싱 | 실시간 계산 | `reports_cache` 컬렉션 |
| 인증 | 단일 학급, 교사 1명 | 학교 단위, 복수 교사 |
| 게임 추가 | Step 1~6 고정 | 플러그인 방식으로 신규 Step 추가 가능한 인터페이스 |
| Stage 채점 규칙 | `stageConfig.json` 파일 (교사가 코드 도구로 편집, 재배포) | Firestore 저장 → 교사 대시보드 UI에서 실시간 수정 (재배포 불필요) |

### 4.8 배포 및 운영 (Deployment & Operations)

| 항목 | 요구사항 |
|------|----------|
| 호스팅 | Firebase Hosting (1차). Vercel 전환 가능 |
| CI/CD | `npm run deploy` 원커맨드. 추후 GitHub Actions 자동화 |
| 환경 분리 | `.env.development` / `.env.production` |
| 모니터링 | 콘솔 에러 로깅 (1차). 추후 Firebase Crashlytics / Analytics |
| 롤백 | Firebase Hosting 버전 관리로 이전 배포 즉시 롤백 |

---

## 5. 데이터 모델 요약

PoC에서 사용하는 핵심 데이터 구조를 정리한다. (상세 스키마는 PRD US-003, US-004, US-015-S, US-019 참조)

### 5.1 Firestore 컬렉션

```
firestore/
├── students/                    # 학생 마스터 데이터
│   └── {student_id}             # S00001 ~ S99999
│       ├── student_id
│       ├── name
│       ├── grade_class
│       ├── is_multicultural
│       ├── created_by
│       └── created_at
│
├── learning_records/            # 학습 기록 (1 attempt = 1 document)
│   └── {record_id}             # "{studentId}_{cycleId}_{attempt}" (예: S00001_C001_1)
│       ├── student_id
│       ├── cycle_id
│       ├── attempt              # 시도 횟수 (PoC: 항상 1, 2차: 1, 2, 3...)
│       ├── stage_results[]      # 각 항목: {stage, score, scoring_context{word_count, max_score}, time_spent, additional_datapoint?}
│       ├── error_rate
│       ├── tier
│       ├── started_at
│       └── completed_at
│
└── intervention_logs/           # 개입 로그
    └── {intervention_id}        # INT_날짜_학생ID_순번
        ├── student_id
        ├── teacher_id
        ├── intervention_type
        ├── focus_words[]
        ├── duration_min
        ├── before_error_rate
        ├── after_error_rate
        ├── memo
        └── created_at
```

### 5.2 클라이언트 측 데이터

```
client/
├── vocabData.json               # 정적 어휘 데이터 (Vite JSON import)
│   └── cycles[]
│       ├── cycle_id
│       ├── cycle_name
│       └── words[]              # 10개 단어 객체
│
├── StageResultBuffer            # 인메모리 (데이터 레이어 cache 모듈)
│   ├── student_id
│   ├── cycle_id
│   ├── buffered_results[]       # min_save_step 도달 전 임시 저장
│   └── flushed: boolean
│
└── Session                      # 인메모리 (auth 모듈)
    ├── user (Firebase Auth User)
    ├── role ('teacher' | 'student')
    └── selectedLanguage ('ko' | 'zh' | 'ru')
```

---

## 6. 모듈 간 인터페이스 정의

모듈 독립성의 핵심인 주요 인터페이스를 정의한다.
모든 data 모듈은 **인터페이스(contract) → 구현체(impl)** 분리를 원칙으로 하며, 소비자는 인터페이스만 참조한다.

### 인터페이스 커버리지 검증

| 모듈 경로 | 인터페이스 | 정의 위치 |
|-----------|-----------|-----------|
| `core/auth` | `AuthService` | §6.1 |
| `core/config` | `StageConfig`, `AppConfig` | §6.2 |
| `data/students` | `StudentService` | §6.3 |
| `data/vocab` | `VocabDataService` | §6.4 |
| `data/learning-records` | `LearningRecordService` | §6.5 |
| `data/intervention-logs` | `InterventionLogService` | §6.6 |
| `data/cache` | — (LearningRecordService에 내부 흡수) | §6.5 참조 |
| `games/shared` | `StageResult`, `GameStepProps` | §6.7 |
| `games/shared/scoring` | `ScoringEngine` | §6.8 |

---

### 6.1 코어: `AuthService` 인터페이스

```typescript
// core/auth/types.ts

type UserRole = 'teacher' | 'student';

interface AuthUser {
  uid: string;
  role: UserRole;
  displayName: string;
  /** role === 'student'일 때만 존재 */
  studentId?: string;              // "S00001"
  /** role === 'teacher'일 때만 존재 */
  email?: string;
}

interface AuthService {
  // ── 교사 인증 ──
  
  /** 이메일/비밀번호 로그인 → AuthUser 반환 */
  loginTeacher(email: string, password: string): Promise<AuthUser>;
  
  // ── 학생 인증 ──
  
  /** 학생 코드 → 커스텀 토큰 인증 → AuthUser 반환 */
  loginStudent(studentCode: string): Promise<AuthUser>;
  
  // ── 공통 ──
  
  /** 로그아웃 */
  logout(): Promise<void>;
  
  /** 현재 인증 사용자 조회 (null이면 미인증) */
  getCurrentUser(): AuthUser | null;
  
  /** 인증 상태 변경 리스너 (Firebase onAuthStateChanged 래퍼) */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;  // → unsubscribe 함수 반환
  
  /** 역할 기반 접근 검증 */
  requireRole(role: UserRole): AuthUser;  // 역할 불일치 시 throw
}
```

> **PoC 범위:** 교사 1명 사전 등록 (Firebase Console에서 수동 생성). 학생 커스텀 토큰은 Cloud Functions를 통해 발급.

---

### 6.2 코어: `StageConfig` 및 `AppConfig` (Config 모듈)

각 Stage의 단어 수와 만점은 **JSON 설정 파일이 원천(source of truth)**이다.
교사가 Claude 등 코딩 도구로 JSON 파일만 수정하면 게임·채점·리포트 모듈에 자동 반영된다.
TypeScript 코드를 건드릴 필요가 없다.

#### 설정 파일: `src/config/stageConfig.json`

교사가 직접 편집하는 파일이다. 주석이 없는 순수 JSON이므로 어떤 도구로든 안전하게 수정 가능하다.

```json
{
  "_description": "Stage별 채점 규칙. 교사가 직접 수정 가능. 변경 후 재배포 필요.",
  "_guide": {
    "wordCount": "해당 Stage가 다루는 단어 수",
    "maxScore": "만점 (보통 wordCount × scorePerCorrect)",
    "scorePerCorrect": "힌트 미사용 정답 시 점수",
    "scorePerHintedCorrect": "힌트 사용 정답 시 점수",
    "scorePerWrong": "최종 오답 시 점수 (보통 0, Step 6은 -10)"
  },
  "stages": {
    "1": { "wordCount": 10, "maxScore": 10, "scorePerCorrect": 1,  "scorePerHintedCorrect": 1,  "scorePerWrong": 0 },
    "2": { "wordCount": 10, "maxScore": 20, "scorePerCorrect": 2,  "scorePerHintedCorrect": 1,  "scorePerWrong": 0 },
    "3": { "wordCount":  9, "maxScore": 18, "scorePerCorrect": 2,  "scorePerHintedCorrect": 1,  "scorePerWrong": 0 },
    "4": { "wordCount":  8, "maxScore": 16, "scorePerCorrect": 2,  "scorePerHintedCorrect": 1,  "scorePerWrong": 0 },
    "5": { "wordCount": 10, "maxScore": 30, "scorePerCorrect": 2,  "scorePerHintedCorrect": 1,  "scorePerWrong": 0 },
    "6": { "wordCount":  9, "maxScore": 90, "scorePerCorrect": 10, "scorePerHintedCorrect": 10, "scorePerWrong": -10 }
  }
}
```

> **교사 편집 시나리오:** "Step 3 단어를 9개에서 12개로 늘리고 싶어" → Claude에게 `stageConfig.json`을 열어서 `"3": { "wordCount": 12, "maxScore": 24, ... }`로 수정 요청 → `vocabData.json`의 해당 사이클에 단어 3개 추가 → 재배포. 코드 변경 없음.

#### TypeScript 로더: `src/config/stageConfig.ts`

JSON 파일을 로딩하고, 스키마 검증 후 타입 안전한 객체로 제공한다.

```typescript
// core/config/stageConfig.ts
import rawConfig from './stageConfig.json';

/** 1개 Stage의 채점 규칙 (타입 정의) */
interface StageScoreRule {
  stage: number;                     // 런타임에 key에서 자동 주입
  wordCount: number;
  maxScore: number;
  scorePerCorrect: number;
  scorePerHintedCorrect: number;
  scorePerWrong: number;
}

/** 
 * JSON 로딩 + 검증 + stage 필드 자동 주입.
 * 앱 초기화 시 1회 실행. 검증 실패 시 콘솔 에러 + fallback 없이 throw.
 * → 교사가 잘못 수정했을 때 배포 전에 빌드에서 잡히도록.
 */
function loadStageConfigs(): Record<number, StageScoreRule>;

/** 검증 규칙:
 *  - stages 키가 "1"~"6" 모두 존재
 *  - 각 항목에 wordCount, maxScore, scorePerCorrect, scorePerHintedCorrect, scorePerWrong 존재
 *  - wordCount > 0, maxScore > 0
 *  - maxScore >= wordCount × scorePerCorrect (논리적 상한 검증)
 */
function validateStageConfig(raw: unknown): { valid: boolean; errors: string[] };

/** 조회 함수 — 검증 완료된 캐싱된 결과 반환 */
function getStageConfig(stage: number): StageScoreRule;
function getAllStageConfigs(): Record<number, StageScoreRule>;
```

**JSON 파일을 선택한 이유:**

| 대안 | 문제 |
|------|------|
| `.ts` 상수 | 교사가 TypeScript 문법을 알아야 함. 콤마, 타입 등 실수 시 빌드 에러 |
| `.env` | 중첩 구조 표현 불가. Stage 6개 × 필드 5개 = 30개 변수가 되어 관리 불가 |
| Firestore | PoC에서는 과도. 2차 확장 경로로 남겨둠 |
| **`.json`** | ✅ 구조화된 데이터. 어떤 코드 도구로든 안전하게 편집. Vite가 빌드 시 번들에 포함 |

```typescript
// core/config/appConfig.ts

/** 앱 전역 환경 설정 (.env 파싱 결과) */
interface AppConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  minSaveStep: number;               // VITE_MIN_SAVE_STEP (기본값 3, 범위 2~5)
}

function getAppConfig(): AppConfig;
```

> **설계 원칙 — Write-time Snapshot:** Config(JSON)는 "현재 규칙"을 제공한다. 그러나 학습 기록은 "그 시점의 규칙"을 `scoring_context`로 함께 저장하므로, 교사가 JSON을 수정·재배포해도 이미 저장된 과거 기록의 error_rate는 왜곡되지 않는다.

> **설정 파일 위치 정리:**
> | 파일 | 편집 주체 | 내용 |
> |------|-----------|------|
> | `src/config/stageConfig.json` | 교사 (코드 도구) | Stage별 단어 수, 만점, 점수 규칙 |
> | `src/data/vocabData.json` | 교사 (코드 도구) | 퀴즈 사이클, 단어 데이터 |
> | `.env` | 개발자 | Firebase 설정, `VITE_MIN_SAVE_STEP` |

---

### 6.3 데이터 레이어: `StudentService` 인터페이스

```typescript
// data/students/types.ts

interface Student {
  student_id: string;               // "S00001" ~ "S99999"
  name: string;
  grade_class: string;              // "5-1"
  is_multicultural: boolean;
  created_by: string;               // 교사 UID
  created_at: string;               // ISO 타임스탬프
}

/** 일괄 등록 시 단일 입력 행 */
interface StudentRegistrationInput {
  name: string;
  is_multicultural: boolean;
}

/** 일괄 등록 결과 */
interface BatchRegistrationResult {
  succeeded: Student[];             // 등록 성공한 학생 목록 (발급된 student_id 포함)
  failed: Array<{
    input: StudentRegistrationInput;
    error: string;
  }>;
}

interface StudentService {
  // ── 등록 ──
  
  /**
   * 학생 일괄 등록.
   * student_id는 내부에서 자동 생성 (S + 5자리, 전체 고유).
   * Firestore batch write 사용.
   */
  registerBatch(
    gradeClass: string,
    students: StudentRegistrationInput[],
    teacherUid: string
  ): Promise<BatchRegistrationResult>;
  
  /**
   * 다음 사용 가능한 student_id 채번.
   * 전체 students 컬렉션에서 max(student_id) + 1 기반.
   */
  generateNextStudentId(): Promise<string>;
  
  // ── 삭제 ──
  
  /**
   * 학생 삭제.
   * students 문서만 삭제. learning_records는 보존 (고아 데이터, 2차 정리).
   */
  deleteStudent(studentId: string): Promise<void>;
  
  // ── 조회 ──
  
  /** 학생 코드로 단일 조회 */
  getByStudentId(studentId: string): Promise<Student | null>;
  
  /** 학급별 학생 목록 조회 */
  getByGradeClass(gradeClass: string): Promise<Student[]>;
  
  /** 교사가 등록한 전체 학생 목록 */
  getByTeacher(teacherUid: string): Promise<Student[]>;
  
  /** 
   * 같은 학급 내 이름 중복 검사.
   * 차단은 아님 — UI에서 경고 배지 표시용.
   */
  checkDuplicateNames(gradeClass: string, names: string[]): Promise<string[]>;  // → 중복된 이름 배열
  
  /**
   * 학생 코드 유효성 검증 (로그인 시 사용).
   * 존재 여부 + 활성 상태 확인.
   */
  validateStudentCode(studentCode: string): Promise<Student | null>;
}
```

---

### 6.4 데이터 레이어: `VocabDataService` 인터페이스

```typescript
// data/vocab/types.ts

interface VocabWord {
  id: string;                       // "W001"
  word: string;                     // "설명"
  zh: string;                       // 중국어 번역
  ru: string;                       // 러시아어 번역
  meaning: string;                  // 뜻풀이
  examples: string[];               // 예문
  icon: string;                     // lucide-react 아이콘명
  color: string;                    // 카드 배경 색상 hex
  relatedWords: string[];           // Step 3, 6용 관련어
  unrelatedWords: string[];         // Step 3, 6용 비관련어
  step4: {
    dictionaryForm: string;
    targetWord: string;
    syllables: string[];
    sentencePre: string;
    sentencePost: string;
    distractors: string[];
  };
  step5: {
    chunks: string[];
    targetIndex: number;
    vocabDistractor: string;
    hints: string[];
    fullDistractors: string[];
  };
}

interface QuizCycle {
  cycle_id: string;                 // "C001"
  cycle_name: string;               // "과학 탐구 기초"
  words: VocabWord[];               // 정확히 10개
}

interface VocabData {
  cycles: QuizCycle[];
}

interface VocabDataService {
  // ── 사이클 조회 ──
  
  /** 전체 사이클 목록 (학생 홈 화면용) */
  getAllCycles(): QuizCycle[];
  
  /** 특정 사이클 조회 */
  getCycleById(cycleId: string): QuizCycle | null;
  
  /** 사이클 내 단어 배열 조회 (게임 컴포넌트에 전달) */
  getWordsByCycle(cycleId: string): VocabWord[];
  
  // ── 단어 조회 ──
  
  /** 단일 단어 조회 */
  getWordById(wordId: string): VocabWord | null;
  
  /** 
   * Step별 필터링된 단어 조회.
   * Step마다 대상 단어 수가 다를 수 있으므로 (예: Step 3은 9개, Step 4는 8개),
   * StageConfig의 wordCount와 데이터 매핑을 처리.
   */
  getWordsForStage(cycleId: string, stage: number): VocabWord[];
  
  // ── 데이터 유효성 ──
  
  /** vocabData.json 스키마 검증 (앱 초기화 시 1회) */
  validateSchema(): { valid: boolean; errors: string[] };
  
  /** 사이클 수 조회 */
  getCycleCount(): number;
}
```

> **PoC:** `vocabData.json`에서 정적 로딩 (Vite JSON import). 2차에서 Firestore `words` 컬렉션으로 마이그레이션 시, 이 인터페이스는 유지하고 구현체만 교체한다.

---

### 6.5 데이터 레이어: `LearningRecordService` 인터페이스

#### 핵심 설계 결정: `attempt` 모델

같은 (student, cycle)에 대해 여러 번 학습할 수 있다. 각 학습 시도를 `attempt`라 한다.

- **PoC (1차):** 항상 최신 attempt만 유효. 재도전 시 이전 attempt를 덮어쓴다.
- **2차 이후:** 모든 attempt를 보존. 학생의 성장 추이 분석, 시도별 비교 리포트 가능.

이 전환을 인터페이스 변경 없이 지원하려면, **record_id에 attempt를 인코딩**하고 **조회 인터페이스에 attempt 필터**를 두면 된다.

```typescript
// data/learning-records/types.ts

/** 단일 학습 기록 — 1 attempt = 1 record */
interface LearningRecord {
  record_id: string;               // "{studentId}_{cycleId}_{attempt}" (예: "S00001_C001_1")
  student_id: string;
  cycle_id: string;
  attempt: number;                 // 시도 횟수 (1부터 시작)
  stage_results: StageResult[];
  error_rate: number;
  tier: 'mastered' | 'development' | 'tier2' | 'tier3';
  started_at: string;              // ISO — 이 attempt 시작 시각
  completed_at: string | null;     // ISO — 전 Stage 완료 시 기록, 미완료면 null
}

/** 조회 필터 */
type AttemptFilter = 'latest' | 'all' | number;  // number: 특정 attempt 번호

interface LearningRecordService {
  // ── 쓰기 (버퍼 → Firestore) ──
  
  /** 메모리 버퍼에 StageResult 누적 */
  bufferStageResult(studentId: string, cycleId: string, result: StageResult): void;
  
  /** min_save_step 도달 여부 확인 */
  shouldFlush(studentId: string, cycleId: string): boolean;
  
  /** 
   * 버퍼를 Firestore에 flush.
   * PoC: 기존 latest attempt를 덮어쓴다 (setDoc).
   * 2차: 새 attempt 번호를 발급하여 새 문서로 저장 (addDoc).
   * → 내부 구현만 바꾸면 됨. 호출 측 코드 변경 없음.
   */
  flushToFirestore(studentId: string, cycleId: string): Promise<string>;  // → record_id 반환
  
  /** threshold 이후 Stage 완료 시 기존 record에 누적 */
  appendStageResult(recordId: string, result: StageResult): Promise<void>;
  
  // ── 읽기 ──
  
  /** 
   * 특정 사이클의 학습 기록 조회.
   * @param attempt - 'latest'(기본값, PoC), 'all'(2차 확장), 또는 특정 attempt 번호
   */
  getRecordsByCycle(
    studentId: string, 
    cycleId: string, 
    attempt?: AttemptFilter         // 기본값: 'latest'
  ): Promise<LearningRecord[]>;     // ⭐ 항상 배열 반환 (latest면 0~1개, all이면 N개)
  
  /** 학생의 전체 학습 기록 조회 */
  getRecordsByStudent(
    studentId: string, 
    options?: {
      dateRange?: DateRange;
      attempt?: AttemptFilter;      // 기본값: 'latest'
    }
  ): Promise<LearningRecord[]>;
  
  /** 
   * 현재 진행 중인 attempt 번호 조회.
   * PoC: 항상 1 반환 (덮어쓰기).
   * 2차: 해당 (student, cycle)의 max(attempt) + 1 반환.
   */
  getCurrentAttempt(studentId: string, cycleId: string): Promise<number>;
  
  // ── 실시간 구독 (대시보드용) ──
  
  /**
   * 학급 전체의 최신 학습 기록을 실시간 구독.
   * Firestore onSnapshot 기반. 교사 대시보드에서 사용.
   * @returns unsubscribe 함수
   */
  subscribeByTeacher(
    teacherUid: string,
    callback: (records: LearningRecord[]) => void
  ): () => void;
}
```

**PoC → 2차 전환 시 변경 범위:**

| 항목 | PoC | 2차 | 변경 위치 |
|------|-----|-----|-----------|
| `flushToFirestore` 내부 | `setDoc` (덮어쓰기) | `addDoc` (새 문서) | Service 구현체만 |
| `getCurrentAttempt` 내부 | `return 1` | Firestore query `max(attempt) + 1` | Service 구현체만 |
| `getRecordsByCycle` 호출 | `attempt` 파라미터 생략 (기본 'latest') | `'all'` 전달 | 리포트 모듈 호출부만 |
| record_id 패턴 | `S00001_C001_1` (항상 _1) | `S00001_C001_3` (시도별 증가) | 자동 |

> **핵심:** 호출 측(게임 모듈, 리포트 모듈)의 코드는 변경 없이, `LearningRecordService` 구현체의 내부 전략만 바꾸면 latest → historical 전환이 완료된다.

> **error_rate 계산:** `LearningRecordService`는 각 `stage_results[].scoring_context.max_score`를 사용한다. Config를 직접 조회하지 않는다 — StageResult에 이미 스냅샷이 포함되어 있으므로.

> **data/cache 모듈:** `bufferStageResult` / `shouldFlush`가 내부적으로 in-memory 버퍼를 관리한다. 별도 CacheService 인터페이스를 두지 않고 LearningRecordService 구현체 내부에 캡슐화한다.

---

### 6.6 데이터 레이어: `InterventionLogService` 인터페이스

```typescript
// data/intervention-logs/types.ts

type InterventionType = 'tier2_small_group' | 'tier3_one_on_one';

interface InterventionLog {
  intervention_id: string;          // "INT_{YYYYMMDD}_{studentId}_{seq}" (예: "INT_20260309_S00001_01")
  student_id: string;
  teacher_id: string;               // 교사 UID
  intervention_type: InterventionType;
  focus_words: string[];            // 집중 단어 목록 (예: ["번갈다", "입자"])
  duration_min: number;             // 소요 시간 (분)
  before_error_rate: number;        // 개입 전 오류율 (자동 조회)
  after_error_rate: number | null;  // 개입 후 오류율 (교사 입력, 미입력 시 null)
  memo: string;                     // 자유 메모
  created_at: string;               // ISO 타임스탬프
}

interface InterventionLogInput {
  student_id: string;
  intervention_type: InterventionType;
  focus_words: string[];
  duration_min: number;
  after_error_rate: number | null;
  memo: string;
}

interface InterventionLogService {
  // ── 쓰기 ──
  
  /**
   * 개입 로그 저장.
   * intervention_id 자동 생성.
   * before_error_rate는 해당 학생의 최신 learning_record에서 자동 조회.
   */
  create(input: InterventionLogInput, teacherUid: string): Promise<InterventionLog>;
  
  // ── 읽기 ──
  
  /** 학생별 개입 이력 조회 */
  getByStudent(studentId: string): Promise<InterventionLog[]>;
  
  /** 교사별 전체 개입 이력 (기간 필터 가능) */
  getByTeacher(teacherUid: string, dateRange?: DateRange): Promise<InterventionLog[]>;
  
  /** 주간 리포트용: 특정 기간 내 특정 학생의 개입 기록 */
  getByStudentAndDateRange(studentId: string, dateRange: DateRange): Promise<InterventionLog[]>;
}
```

> **의존 관계:** `InterventionLogService.create()`는 내부적으로 `LearningRecordService.getRecordsByStudent()`를 호출하여 `before_error_rate`를 자동 채운다. 교사가 직접 입력하지 않아도 된다.

---

### 6.7 게임 → 데이터 레이어: `StageResult` 인터페이스

게임 모듈은 Stage 시작 시 Config에서 `StageScoreRule`을 읽고, 완료 시 해당 맥락을 `StageResult`에 스냅샷으로 포함시킨다.

```typescript
// games/shared/types.ts

/** 채점 맥락 스냅샷 — Config로부터 캡처한 "그 시점의 규칙" */
interface ScoringContext {
  word_count: number;              // Config에서 캡처: 해당 Stage 단어 수
  max_score: number;               // Config에서 캡처: 해당 Stage 만점
}

interface StageResult {
  stage: number;                   // 1~6
  score: number;                   // 실제 획득 점수
  scoring_context: ScoringContext; // ⭐ 채점 맥락 스냅샷 (Config write-time capture)
  time_spent: number;              // 초 단위
  additional_datapoint?: {
    unknownWords?: string[];       // Step 1 전용
    historical_results?: Array<{   // Step 2~5
      trial_index: number;
      result: boolean;
    }>;
  };
}

// 각 Step 게임 컴포넌트의 공통 Props
interface GameStepProps {
  words: VocabWord[];              // 현재 사이클의 단어 배열
  cycleId: string;
  stageConfig: StageScoreRule;     // ⭐ Config에서 주입받은 해당 Stage 규칙
  onComplete: (result: StageResult) => void;
}
```

**데이터 흐름 예시:**
```
1. 학생이 Step 3 진입
2. GameOrchestrator가 getStageConfig(3) 호출 → { wordCount: 9, maxScore: 18, ... }
3. Step3 컴포넌트에 stageConfig props로 전달
4. 학생 학습 완료 → Step3가 onComplete({
     stage: 3,
     score: 14,
     scoring_context: { word_count: 9, max_score: 18 },  // Config 스냅샷
     time_spent: 45,
     ...
   }) 호출
5. LearningRecordService가 error_rate를 scoring_context.max_score 기준으로 계산
   → (1 - 14/18) × 100 = 22.2%
6. Firestore에 scoring_context 포함하여 저장 → 이후 Config가 변경되어도 이 기록은 불변
```

---

### 6.8 게임 공통 모듈: `ScoringEngine` 인터페이스

```typescript
// games/shared/scoring/types.ts
interface ScoringEngine {
  // StageScoreRule 기반 채점 — Config에서 받은 규칙으로 점수 산출
  scoreItem(config: StageScoreRule, isCorrect: boolean, hintUsed: boolean): number;
  
  // Step 1 자기평가 채점
  scoreSelfAssessment(config: StageScoreRule, unknownCount: number): number;
  
  // 오류율 계산 — StageResult의 scoring_context 사용
  calculateErrorRate(score: number, maxScore: number): number;
  
  // Tier 분류
  classifyTier(errorRate: number): 'mastered' | 'development' | 'tier2' | 'tier3';
  
  // 편의: StageResult에 포함할 ScoringContext 생성
  createScoringContext(config: StageScoreRule): ScoringContext;
}
```

---

### 6.9 공통 타입

```typescript
// shared/types.ts

/** 날짜 범위 필터 (리포트, 조회에서 공통 사용) */
interface DateRange {
  from: string;                    // ISO date string (예: "2026-03-01")
  to: string;                      // ISO date string (예: "2026-03-07")
}
```

---

### 6.10 모듈 간 의존 관계 요약

```
┌─────────────────────────────────────────────────────────┐
│                    games/* (Step 1~6)                     │
│  GameStepProps ← words, stageConfig                      │
│  onComplete → StageResult                                │
└──────────┬───────────────────────────────────┬───────────┘
           │ StageResult                        │ VocabWord[]
           ▼                                    ▼
┌─────────────────────┐            ┌─────────────────────┐
│ LearningRecordService│            │  VocabDataService    │
│ (data/learning-      │            │  (data/vocab/)       │
│  records/)           │            └─────────────────────┘
└──────────┬───────────┘
           │ before_error_rate 자동 조회
           ▼
┌─────────────────────┐
│InterventionLogService│
│ (data/intervention-  │
│  logs/)              │
└──────────────────────┘

┌─────────────────────┐            ┌─────────────────────┐
│    AuthService       │──validate──▶│   StudentService     │
│   (core/auth/)       │            │  (data/students/)    │
└──────────────────────┘            └──────────────────────┘

┌─────────────────────┐
│  Config (core/)      │── StageScoreRule ──▶ games/shared, LearningRecordService
│  StageConfig         │
│  AppConfig           │
└──────────────────────┘
```

**의존 방향 규칙 (재확인):**
- `games/*` → `games/shared/`, `data/*`, `core/config` (읽기만)
- `data/*` → `core/firebase` (Firestore 접근)
- `data/intervention-logs` → `data/learning-records` (before_error_rate 조회)
- `dashboard/*` → `data/*` (읽기 + 구독), `core/auth` (역할 검증)
- `reports/*` → `data/*` (읽기만)
- **역방향 의존 금지:** `data/*` → `games/*` ❌, `core/*` → `data/*` ❌
```

---

## 7. 기술 스택 확정

| 레이어 | 기술 | 비고 |
|--------|------|------|
| Frontend Framework | React 19 | 현행 유지 |
| Build Tool | Vite 7 | 현행 유지 |
| Styling | Tailwind CSS 4 | 현행 유지 |
| Language | TypeScript (strict) | 현행 JSX → TSX 마이그레이션 |
| Backend | Firebase (Auth, Firestore, Hosting) | PoC 범위 |
| TTS | Web Speech API (`ko-KR`) | 브라우저 내장 |
| PDF | jsPDF + html2canvas | 한글 폰트 base64 임베드 |
| Canvas | HTML5 Canvas API | Step 6 전용 |
| 아이콘 | lucide-react | 현행 유지 |
| 폰트 | Noto Sans KR + Gaegu | 현행 유지 |
| 테스트 | Vitest + Testing Library | 단위 테스트 |
| 린팅 | ESLint + Prettier | 현행 확장 |

---

## 8. 미결 사항 (Inherited from PRD + 신규)

아래 항목은 구현 착수 전 결정이 필요하다.

### PRD 계승

| # | 항목 | 영향 범위 |
|---|------|-----------|
| 0 | 호스팅 선택: Firebase Hosting vs Vercel | FR-D3, 배포 스크립트 |
| 1 | 퀴즈 사이클 내 단어 통일 방안 (Step별 대상 단어 수 불일치) | FR-V1, 게임 모듈 전체 |
| 2 | Step 2 TTS 힌트 문장 — `vocabData`에 `step2Hint` 필드 추가 필요 | FR-V2, Step 2 모듈 |
| 3 | 학생 코드 배포 방식 (인쇄 vs 화면 공유) | 교사 UX |
| 5 | PDF 한글 폰트 라이선스 확인 | FR-T5 |

### prd-diff 계승 (리뷰 미진행 항목)

| # | 항목 | 우선순위 |
|---|------|---------|
| 12 | 오류율 만점 기준 단위 (단어 기준 vs Step 기준) → 의사결정 필요 | 높음 |
| 14 | Step 2 슬롯 TTS의 힌트 판정 여부 → UX 관점 검토 필요 | 높음 |
| 13 | Step 2 사운드 디자인 상세 → PoC에서는 공통 사운드로 대체 가능 | 중간 |
| 15 | Step 1 핵심 어휘 10개 명시 → vocabData.json 세팅 시 반영 | 중간 |
| 18 | 관련어/비관련어 풀 크기 규정 | 중간 |

### 신규 기술 결정 사항

| # | 항목 | 영향 범위 |
|---|------|-----------|
| N1 | Firebase 커스텀 토큰 발급 방식 — Cloud Functions vs Admin SDK 직접 호출 | FR-A2, 인증 모듈 |
| N2 | Firestore 컬렉션 구조 최적화 — `learning_records`를 루트 컬렉션(현재 설계)으로 유지할지, `students/{id}/learning_records` 서브컬렉션으로 변경할지. PoC에서는 루트 컬렉션으로 시작하되, 2차 확장 시 historical attempt 데이터 증가에 따른 쿼리 성능 검토 필요 | 데이터 레이어 전체 |
| N3 | 현행 JSX → TSX 마이그레이션 전략 — 점진적 전환 vs 일괄 전환 | 전체 코드베이스 |
| N4 | 테스트 커버리지 목표 — PoC 수준에서 채점 로직/데이터 레이어 80% 이상 | 품질 기준 |

---

## Appendix A: design-principle.md와 모듈 매핑

| 디자인 원칙 | 구현 모듈 | 적용 방법 |
|-------------|-----------|-----------|
| UI 레이아웃 고정 (버튼 위치) | `games/shared/Layout` | 공통 레이아웃 컴포넌트로 버튼 위치 강제 |
| 가이드 캐릭터 | `games/shared/MascotCharacter` | 공통 마스코트 컴포넌트 (2차에서 커스텀 가능) |
| 서체 통일 | `core/config/theme.ts` + Tailwind config | `Noto Sans KR` + `Gaegu` 전역 설정 |
| 피드백 사운드 통일 | `games/shared/FeedbackSound` | 정답/오답 사운드 파일 중앙 관리 |
| 배경 테마 변주 | `games/shared/ThemeProvider` | Step별 테마 색상 매핑 |
| 상호작용 변주 | 각 Step 게임 모듈 내부 | Step별 고유 인터랙션 (탭/드래그/Canvas) |
| 진행 바 | `games/shared/ProgressBar` | 전 Step 공통 상단 진행 표시 |
| 마이크로 애니메이션 | `games/shared/MicroAnimation` | 버튼 반응, 슬롯 흔들림 등 공통 애니메이션 |
| 즉각적 보상 | `games/shared/RewardBadge` | 클리어 시 스티커/배지 (PoC: 심플) |
| 긍정적 피드백 | `games/shared/FeedbackMessage` | 오답 시 격려 문구 풀 |

---

> **다음 단계:** Problem Statement, Scope, Requirements 확정 후, Architecture Design (모듈별 상세 설계), API 설계, Firestore 보안 규칙, 그리고 구현 Phase 계획을 진행한다.