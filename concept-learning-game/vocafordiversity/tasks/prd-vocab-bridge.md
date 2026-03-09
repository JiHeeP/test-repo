# PRD: 어휘의 징검다리 — 다문화 학생 맞춤형 어휘 학습 플랫폼

> **참조 문서:**  
> - `proposal/proposal_v3.md` — 통합 기획·개발 명세서  
> - `proposal/student_report_design.md` — 리포트 시스템 설계서  
> - `proposal/Step1~5_세부계획서.md` — 단계별 상세 기획  
> - **현행 프로토타입:** `preview-react2/` (React 19 + Vite 7 + Tailwind CSS 4)

---

## 개요 (Introduction)

초등학교 다문화 학급(17명, 다문화·중도입국 학생 15명)을 위한 6단계 어휘 학습 플랫폼이다.  
Nation(2013)의 수용→산출 프레임워크에 근거하여 학습도구어를  
"소리·터치 기반 인식"부터 "문장 속 산출"까지 완전 학습 경로로 이어준다.

**퀴즈 사이클 구조:** 단어 10개를 1개 퀴즈 사이클로 묶어 Step 1 → Step 6까지 전체를 순회한다.  
교사가 단어를 계속 추가할 수 있으며, 단어 수에 따라 퀴즈 사이클이 자동으로 생성된다.  
(예: 단어 127개 → 12~13개 퀴즈 사이클)  
1차 출시에서는 개발자가 데이터를 세팅하고, 교사 단어 추가 UI는 2차에서 제공한다.

**현재 상태:** `preview-react2/`에 Step 1~6 UI가 프로토타입 수준으로 구현되어 있으나,  
최신 기획(Step별 세부계획서 v3.0, 채점 규칙, 다국어 지원, 어휘 데이터셋)이 반영되지 않았고,  
인증, 백엔드(Firebase), 리포트, 데이터 영속성이 전무하다.

**이 PRD의 목적:** 최신 기획을 코딩 에이전트(Cursor, Claude Code 등)가 바로 구현할 수 있도록  
기능 요구사항과 수용 기준을 명확히 정의한다.

---

## 목표 (Goals)

- 어휘 자유 산출율을 10% → 70%로 끌어올린다.
- 다문화-한국 학생 성취도 격차를 25%p → 10%p로 줄인다.
- 교사가 수업 중 Tier 2/3 위험 학생을 실시간으로 확인할 수 있게 한다.
- 학생별 주간 리포트와 월간 그룹 리포트를 PDF로 출력할 수 있게 한다.
- 타이핑을 전면 제거하고 터치·드래그 기반 UX로 진입 장벽을 최소화한다.

---

## 기술 스택 (Tech Stack)

- **Frontend:** React 19 + Vite 7 + Tailwind CSS 4 (현행 유지)
- **Backend:** Firebase (Auth, Firestore, Storage, Functions)
- **TTS:** Web Speech API (`ko-KR`)
- **배포:** Firebase Hosting 또는 Vercel

---

## 역할 (Roles)

- **교사(Teacher):** 학생 등록, 학급 관리, 대시보드 조회, 리포트 출력, 개입 로그 입력
- **학생(Student):** 1~6단계 학습, 자기평가, 점수 확인

---

## 사용자 스토리 (User Stories)

---

### [🚀 배포 및 호스팅] ← **최우선 구현**

#### US-D01: 프로덕션 빌드 설정
**Description:** 개발자로서 Vite 프로덕션 빌드가 오류 없이 완료되어 배포 가능한 정적 파일을 생성하고 싶다.

**Acceptance Criteria:**
- [ ] `npm run build` 실행 시 `dist/` 디렉토리에 빌드 결과물 생성
- [ ] 빌드 중 TypeScript/ESLint 오류 없음
- [ ] `dist/` 폴더 내 `index.html` + `assets/` 구조 확인
- [ ] `npm run preview`로 로컬에서 프로덕션 빌드 동작 확인

#### US-D02: 환경변수 분리 및 .env.example 제공
**Description:** 개발자로서 Firebase 설정값을 코드에서 분리하여 안전하게 관리하고, 팀원이 빠르게 셋업할 수 있게 하고 싶다.

**Acceptance Criteria:**
- [ ] `.env` 파일에 Firebase 설정값 분리 (`VITE_FIREBASE_API_KEY` 등 6개 변수)
- [ ] `.env` 파일에 학습 설정값 포함: `VITE_MIN_SAVE_STEP=3` (학습 기록 저장 최소 단계, 2~5 범위)
- [ ] `.env.example` 파일 제공 (실제 값 제외, 키 이름과 설명만 포함)
- [ ] `.gitignore`에 `.env` 추가 확인 (커밋 방지)
- [ ] 앱 실행 시 환경변수 누락이면 콘솔에 명확한 에러 메시지 표시
- [ ] `vite.config.ts`에서 `envPrefix: 'VITE_'` 설정 확인

#### US-D03: Firebase Hosting 배포 및 퍼블릭 URL 접근
**Description:** 교사 및 학생으로서 별도 설치 없이 웹 브라우저로 플랫폼에 접속하고 싶다.

**Acceptance Criteria:**
- [ ] Firebase CLI 초기화: `firebase init hosting` 설정 완료
- [ ] `firebase.json`에 SPA 라우팅 설정 포함: 모든 경로 → `index.html` 리다이렉트
- [ ] `firebase deploy` 실행 시 퍼블릭 URL(`https://<project-id>.web.app`) 발급
- [ ] 발급된 URL로 모바일/태블릿/PC 브라우저에서 접속 확인
- [ ] HTTPS 자동 적용 확인
- [ ] `/student/home`, `/teacher/dashboard` 등 직접 URL 입력 시 404 아닌 앱 로드 확인 (SPA 라우팅)

#### US-D04: 배포 스크립트 및 README 작성
**Description:** 개발자로서 빌드→배포 절차를 한 번에 실행하고, 신규 기여자가 로컬 셋업을 빠르게 완료할 수 있게 하고 싶다.

**Acceptance Criteria:**
- [ ] `package.json`에 `"deploy": "npm run build && firebase deploy"` 스크립트 추가
- [ ] `README.md`에 아래 내용 포함:
  - 로컬 개발 셋업 절차 (`.env` 설정 포함)
  - `npm run dev` / `npm run build` / `npm run deploy` 명령 설명
  - Firebase 프로젝트 연결 방법
  - 배포된 퍼블릭 URL
- [ ] 신규 개발자가 README만 보고 로컬 실행 가능 여부 검토

---

### [인증 및 계정 관리]

#### US-001: 교사 로그인
**Description:** 교사로서 이메일/비밀번호로 로그인하여 내 학급 데이터에 접근하고 싶다.

**Acceptance Criteria:**
- [ ] Firebase Auth 이메일/비밀번호 로그인 구현
- [ ] 로그인 실패 시 "이메일 또는 비밀번호가 올바르지 않습니다" 메시지 표시
- [ ] 로그인 성공 시 교사 대시보드(`/teacher/dashboard`)로 이동
- [ ] 로그아웃 버튼 제공
- [ ] Typecheck 통과
- [ ] 브라우저에서 로그인/로그아웃 플로우 확인

#### US-002: 학생 코드 로그인
**Description:** 학생으로서 교사가 발급한 학생 코드(ID)로 간단히 로그인하고 싶다.

**Acceptance Criteria:**
- [ ] 학생 코드(student_id) 입력 → Firebase Auth 커스텀 토큰으로 인증
- [ ] 인증 실패 시 "등록되지 않은 학생 코드입니다" 메시지 표시
- [ ] 로그인 성공 시 학습 홈(`/student/home`)으로 이동
- [ ] 학생 코드는 6자리 숫자 형식 (예: S00001)
- [ ] Typecheck 통과
- [ ] 브라우저에서 확인

---

### [학생 관리]

#### US-003: 학생 일괄 등록
**Description:** 교사로서 같은 반 학생 여러 명을 한 번에 등록하여 매번 개별 입력하는 번거로움 없이 학습 데이터를 빠르게 세팅하고 싶다.

**Acceptance Criteria:**

_UI 폼 구성_
- [ ] 교사 대시보드에서 [학생 추가] 버튼 클릭 시 일괄 등록 모달 표시
- [ ] 모달 내 입력 필드:
  - **학년/반** (텍스트 입력, 예: `5-1`) — 이 반에 속한 모든 학생에게 공통 적용
  - **이름 목록** (텍스트 입력, 쉼표 또는 줄바꿈으로 구분, 예: `홍길동, 김민준, 이서연`)
  - **다문화 여부** (체크박스 — 이 반 전체 기본값, 개별 수정은 미리보기 테이블에서 가능)
- [ ] 이름 입력 시 실시간으로 **미리보기 테이블** 렌더링:
  ```
  | 이름     | 학년/반 | 다문화 | 학생코드(예정)  |
  |----------|---------|--------|----------------|
  | 홍길동   | 5-1     | ✅     | S00001 (자동)  |
  | 김민준   | 5-1     | ✅     | S00002 (자동)  |
  | 이서연   | 5-1     | ❌     | S00003 (자동)  |
  ```
- [ ] 미리보기 테이블에서 행별로 다문화 여부 개별 수정 가능
- [ ] 중복 이름(같은 학년/반 내) 감지 시 해당 행에 경고 배지 표시 (등록 차단은 아님)
- [ ] 이름이 비어 있거나 공백만 있는 항목은 미리보기에서 자동 제외

_저장 처리_
- [ ] [등록] 버튼 클릭 시 미리보기 테이블 기준으로 Firestore `students` 컬렉션에 일괄 저장 (batch write)
- [ ] 각 학생 문서 구조:
  ```json
  {
    "student_id": "자동 생성 (S + 5자리 숫자, 전체 고유)",
    "name": "홍길동",
    "grade_class": "5-1",
    "is_multicultural": true,
    "created_by": "교사 UID",
    "created_at": "ISO 타임스탬프"
  }
  ```
- [ ] 저장 완료 후 등록된 학생 목록을 대시보드에 즉시 반영
- [ ] 등록 완료 모달: 등록된 학생 수 표시 + 학생 코드 목록 표시 (행별 복사 버튼 + 전체 복사 버튼)
- [ ] 부분 실패 시 (일부 저장 오류) 성공/실패 건수를 구분하여 표시
- [ ] Typecheck 통과
- [ ] 브라우저에서 미리보기 테이블 실시간 렌더링 및 일괄 저장 확인

#### US-003-D: 학생 삭제
**Description:** 교사로서 잘못 등록된 학생을 삭제하고 재등록할 수 있어, 오입력을 빠르게 바로잡고 싶다.

> 💡 **프로토타입 방침:** 수정 기능은 제공하지 않는다. 오입력 시 삭제 후 US-003으로 재등록을 유도한다.

**Acceptance Criteria:**

_삭제 진입점_
- [ ] 학생 목록 각 행에 [삭제] 버튼(휴지통 아이콘) 표시
- [ ] [삭제] 버튼 클릭 시 확인 다이얼로그 표시:
  > "[홍길동] 학생을 삭제합니다. 삭제된 학습 기록은 복구되지 않습니다. 계속하시겠습니까?"
- [ ] 다이얼로그에 학생 이름, 학년/반, 학생 코드를 표시하여 대상 재확인 가능하게
- [ ] [취소] 클릭 시 삭제 없이 모달 닫힘

_삭제 처리_
- [ ] [삭제 확인] 클릭 시 Firestore `students` 문서 삭제
- [ ] 해당 학생의 `learning_records`는 삭제하지 않음 (고아 데이터로 보존 — 2차에서 정리 예정)
- [ ] 삭제 완료 후 학생 목록에서 즉시 제거
- [ ] 삭제 완료 토스트 메시지: "[홍길동] 학생이 삭제되었습니다. 재등록이 필요하면 [학생 추가]를 이용하세요."
- [ ] 삭제 중 오류 발생 시 에러 토스트 표시, 목록 상태 유지

_접근 제한_
- [ ] 삭제 버튼은 교사 계정에서만 노출 (학생 화면에서는 미표시)
- [ ] Typecheck 통과
- [ ] 브라우저에서 삭제 확인 다이얼로그 → 삭제 완료 → 목록 갱신 흐름 확인

---

### [어휘 데이터셋]

#### US-004: 퀴즈 사이클 기반 어휘 데이터 파일
**Description:** 개발자로서 어휘 데이터를 **10개 단어 = 1 퀴즈 사이클** 구조로 관리하여, 각 사이클이 Step 1~6 전체를 순회하는 학습 단위가 되도록 하고 싶다. 교사가 단어를 계속 추가할 수 있는 확장 구조를 전제로 설계한다.

**Acceptance Criteria:**
- [ ] `src/data/vocabData.json` 파일에 단어 데이터 정의
- [ ] 최상위 구조는 퀴즈 사이클 배열:
  ```json
  {
    "cycles": [
      {
        "cycle_id": "C001",
        "cycle_name": "과학 탐구 기초",
        "words": [ { ...단어 객체 }, ... ]
      },
      {
        "cycle_id": "C002",
        "cycle_name": "생각하고 표현하기",
        "words": [ { ...단어 객체 }, ... ]
      }
    ]
  }
  ```
- [ ] 1개 퀴즈 사이클은 **정확히 10개 단어**로 구성
- [ ] 학생은 1개 사이클 내에서 Step 1 → Step 6까지 전체를 순회한 뒤, 다음 사이클로 진행
- [ ] 각 단어 객체는 아래 필드를 포함:
  ```json
  {
    "id": "W001",
    "word": "설명",
    "zh": "说明",
    "ru": "Объяснение",
    "meaning": "어떤 내용을 알기 쉽게 풀어 말함",
    "examples": ["선생님이 규칙을 설명해 주셨어요.", "..."],
    "icon": "BookOpen",
    "color": "#dbeafe",
    "relatedWords": [],
    "unrelatedWords": [],
    "step4": {
      "dictionaryForm": "설명",
      "targetWord": "설명",
      "syllables": ["설", "명"],
      "sentencePre": "선생님이 규칙을",
      "sentencePost": "해 주셨어요.",
      "distractors": ["서", "면"]
    },
    "step5": {
      "chunks": ["우리는", "친구들에게", "해결 방식을", "설명했다."],
      "targetIndex": 2,
      "vocabDistractor": "해결 방법을",
      "hints": ["누가?", "누구에게?", "무엇을?", "어찌했나?"],
      "fullDistractors": ["오늘도", "재미있게"]
    }
  }
  ```
- [ ] Step 1~6 모두 `import vocabData from '@/data/vocabData.json'`으로 참조 (Vite의 JSON import 기본 지원 활용)
- [ ] 각 Step 컴포넌트는 현재 활성 사이클의 `words` 배열을 받아 동작
- [ ] JSON 파일은 `JSON.parse` 없이 직접 import 가능해야 함 (`vite.config.ts` 별도 설정 불필요 확인)
- [ ] JSON 스키마 유효성: 모든 사이클이 `cycle_id`, `words`(10개)를 포함, 모든 단어 객체가 `id`, `word`, `meaning` 필드를 반드시 포함
- [ ] Typecheck 통과 (필요 시 `src/types/vocab.ts`에 `QuizCycle`, `VocabWord` 타입 정의 후 참조)
- [ ] 1차 출시: 개발자가 세부계획서 기준 단어를 사이클로 구성하여 세팅 (교사 단어 추가 UI는 2차)

---

### [채점 및 학습 기록 저장] ← **Step 게임보다 우선 구현**

#### US-015: 학습 기록 저장 기준 단계 설정
**Description:** 개발자로서 몇 단계 이상 완료해야 학습 기록이 저장되는지 기준을 환경 설정 파일에서 관리하여, 불완전한 학습 데이터가 리포트에 섞이지 않게 하고 싶다.

**Acceptance Criteria:**
- [ ] `.env` 파일에 `VITE_MIN_SAVE_STEP=3` 환경 변수로 최소 저장 단계를 설정 (기본값: 3, 범위: 2~5)
- [ ] `.env.example`에 해당 변수와 설명 포함: `VITE_MIN_SAVE_STEP=3  # 학습 기록 저장 최소 단계 (2~5)`
- [ ] 앱 초기화 시 `import.meta.env.VITE_MIN_SAVE_STEP`을 파싱하여 앱 전역에서 참조
- [ ] 값이 2~5 범위를 벗어나면 콘솔에 경고 메시지 표시 후 기본값 3 적용
- [ ] Typecheck 통과

#### US-015-S: 학습 기록 Firestore 저장
**Description:** 개발자로서 최소 단계 도달 후 각 Step이 완료될 때마다 채점 결과를 Firestore에 저장하여 리포트 근거 데이터를 쌓고 싶다.

**Acceptance Criteria:**
- [ ] 학생이 `min_save_step` 이상의 Step을 완료하는 순간 최초 저장 실행 (i.e. technical approach: accumulate stage results to memory, then flush to Firestore when min_save_step threshold is reached)
- [ ] 이후 Step이 완료될 때마다 해당 결과를 기존 `learning_records` 문서에 누적 업데이트
- [ ] 저장 문서 구조:
  ```json
  {
    "record_id": "자동 생성",
    "student_id": "S001",
    "cycle_id": "C001",
    "word_id": "W001",
    "stage_results": [
      {
        "stage": 1,
        "score": 8,
        "time_spent": 45,
        "additional_datapoint": {
          "unknownWords": ["용액", "입자"],
          "historical_results": [
            {"trial_index": 1, "result": true},
            {"trial_index": 2, "result": false}
          ]
        }
      },
      {
        "stage": 3,
        "score": 1,
        "time_spent": 32,
        "additional_datapoint": {
          "historical_results": [
            {"trial_index": 1, "result": false},
            {"trial_index": 2, "result": true}
          ]
        }
      },
      {
        "stage": 4,
        "score": 2,
        "time_spent": 28
      }
    ],
    "error_rate": 30.0,
    "tier": "development",
    "completed_at": "ISO 타임스탬프"
  }
  ```
- [ ] 각 `stage_results` 항목에 `time_spent` (초 단위) 포함 — 해당 Step 소요 시간 기록
- [ ] 각 `stage_results` 항목에 선택적 `additional_datapoint` 포함:
  - Step 1: `unknownWords` (몰랐던 단어 목록) + `historical_results`
  - Step 2~5: `historical_results` (각 시도별 정오답 이력, `first_try_rate` 산출 근거)
  - Step 6: 총점만 기록 (additional_datapoint 없음)
- [ ] `historical_results`: `[{"trial_index": 1, "result": boolean}, ...]` — 1차 시도 정답 여부로 `first_try_rate` 사후 산출 가능
- [ ] `error_rate = (1 - 획득점수 / 만점) * 100`으로 계산
- [ ] tier 자동 분류: 0~20% → "mastered" / 20~35% → "development" / 35~50% → "tier2" / 50% 초과 → "tier3"
- [ ] Step 1: 다른 stage와 동일하게 점수 산출. `score = (totalWords - unknownWords.length) / totalWords * 만점`으로 계산. 부가 데이터로 `additional_datapoint: { unknownWords: [...] }`를 해당 stage_results 항목에 포함하여 교사가 어떤 단어를 몰랐는지 확인 가능
- [ ] Step 6: 총점만 기록
- [ ] Firestore에 실제 저장 확인

---

### [Step 1: 멀티모달 카드]

#### US-005: 언어 선택 온보딩
**Description:** 학생으로서 내 모국어를 선택하여 번역 도움을 받으며 카드를 학습하고 싶다.

**Acceptance Criteria:**
- [ ] Step 1 진입 시 언어 선택 화면 표시: [한국어] [중국어] [러시아어] 3개 버튼
- [ ] 선택한 언어는 세션 동안 유지
- [ ] 브라우저에서 언어 선택 → 카드 전환 확인

#### US-006: 카드 앞면 — 소리와 그림
**Description:** 학생으로서 카드를 보면서 한국어 발음을 먼저 들어 형태-소리를 연결하고 싶다.

**Acceptance Criteria:**
- [ ] 앞면: 아이콘(lucide-react) + 한국어 표제어 대형 표시
- [ ] 카드 진입 시 TTS 자동 재생 (`ko-KR`, rate: 0.7, 단어 단독)
- [ ] 수동 재생 버튼 별도 제공
- [ ] 카드 탭/클릭 시 뒷면으로 전환
- [ ] 브라우저에서 확인

#### US-007: 카드 뒷면 — 뜻·예문·번역
**Description:** 학생으로서 카드 뒷면에서 뜻, 예문, 번역어를 보고 의미를 이해하고 싶다.

**Acceptance Criteria:**
- [ ] 뒷면 레이아웃 (위→아래): 표제어+오디오 버튼 → 번역어(조건부) → 뜻풀이 박스 → 예문 박스(핵심어 하이라이트) → 아이콘 재확인
- [ ] 번역어: `language === 'ko'`면 숨김, `zh`/`ru`면 해당 필드 표시
- [ ] 뒷면 진입 시 TTS 자동 재생: 단어 + 뜻 + 예문 순서 (rate: 0.85)
- [ ] 하단 고정: [몰라요] / [알아요] 버튼
- [ ] 브라우저에서 번역어 노출/숨김 확인

#### US-008: 자기평가 루프
**Description:** 학생으로서 모르는 단어를 표시하면 자동으로 다시 나오게 하고 싶다.

**Acceptance Criteria:**
- [ ] [몰라요] 클릭: 해당 단어를 unknownDeck에 추가, 다음 카드로 이동
- [ ] [알아요] 클릭: 다음 카드로 이동
- [ ] 전체 덱 1회 완료 후 unknownDeck.length > 0이면 "틀린 단어 복습하기" 모달 표시
- [ ] unknownDeck.length === 0이면 Step 1 완료 → onComplete() 호출
- [ ] 복습 라운드는 횟수 제한 없음 (완전 학습 유도)
- [ ] 브라우저에서 확인

---

### [Step 2: N+2 매칭 게임]

#### US-009: 5라운드 N+2 매칭
**Description:** 학생으로서 그림 슬롯에 단어를 매칭하며 형태-의미를 능동적으로 연결하고 싶다.

**Acceptance Criteria:**
- [ ] 1라운드 구성: 그림(아이콘) 슬롯 4개 + 단어 카드 6개(정답 4 + 오답 2)
- [ ] 총 5라운드, 라운드별 단어 구성은 `proposal/Step2_세부계획서.md` 표 참조
- [ ] 조작: 탭-투-무브(카드 탭→선택→빈 슬롯 탭으로 배치) 필수, 드래그 옵션 추가
- [ ] 빈 슬롯 탭 시 해당 단어의 문맥 힌트 문장을 TTS로 재생
- [ ] 오답 매칭 시 슬롯 흔들림 애니메이션 + 즉시 되돌림
- [ ] 정답 4개 완료 시 오답 2장 "버리기" UI(몬스터 아이콘)로 라운드 클리어
- [ ] 채점: 힌트 없이 정답 2점, TTS 힌트 후 정답 1점, 오답 0점
- [ ] 5라운드 완료 시 onComplete() 호출, 총점 저장
- [ ] 브라우저에서 확인

---

### [Step 3: 관련어 고르기]

#### US-010: 8지선다 관련어 고르기
**Description:** 학생으로서 핵심어와 관련 있는 단어 4개를 8개 보기 중에서 골라 의미 연결망을 강화하고 싶다.

**Acceptance Criteria:**
- [ ] 9개 핵심어 각 1문항 (총 9라운드): 재다, 표시, 측정, 정확히, 추측, 의미, 단서, 상황, 짐작
- [ ] 보기: Good Pool 관련어 4개 + Bad Pool 비관련어 4개 = 총 8개 랜덤 샘플링
- [ ] 최대 4개까지 선택 가능 (초과 시 경고: "4개까지만 고를 수 있어요")
- [ ] "단어 듣기" 버튼: 핵심어 TTS 후 8개 보기를 화면 배치 순서대로 읽어줌
- [ ] [힌트] 버튼 1회: 미선택 정답 1개 자동 선택+잠금, 해당 라운드 최대 1점
- [ ] [초기화] 버튼: 잠긴 카드 유지, 나머지 선택 해제
- [ ] [채점] 버튼: 4개 선택 시에만 활성화
- [ ] 채점: 힌트 없이 정답 2점, 힌트 사용 1점. 오답 시 재시도 1회 → 실패 시 0점
- [ ] 9라운드 완료 시 onComplete() 호출, 총점(최대 18점) 저장
- [ ] 브라우저에서 확인

---

### [Step 4: 음절 블록 조립]

#### US-011: Easy/Hard 음절 블록 조립
**Description:** 학생으로서 문장 빈칸에 들어갈 단어를 음절 블록으로 조립하여 단어 구조를 익히고 싶다.

**Acceptance Criteria:**
- [ ] 8개 단어 문항 (`Step4_세부계획서.md` 표 참조): 움직임, 번갈다, 방식, 설명, 영향, 관찰, 환경, 주제
- [ ] 화면: [상황 아이콘] + [빈칸 포함 문장] + [음절 블록 풀]
- [ ] 진입 시 TTS로 빈칸 문장 읽기 (빈칸 위치에서 "무엇" 발화)
- [ ] Easy 모드: 슬롯에 ghost text(흐린 힌트) 표시, 방해 블록 없음
- [ ] Hard 모드: 슬롯 공란, 방해 음절 블록 추가
- [ ] 난이도 토글 버튼(EASY↔HARD) 제공
- [ ] 모든 슬롯 채워질 때만 자동 채점 (Delayed Feedback)
- [ ] 정답: "참 잘했어요" + 완성 문장 전체 TTS + 다음 문제 버튼
- [ ] 오답: 슬롯 흔들림 + 오류 메시지 + 재시도(블록 재셔플)
- [ ] [?] 힌트 모달: 아이콘 + 뜻풀이만 표시 (정답 텍스트 숨김)
- [ ] 슬롯 클릭 시 블록 되돌리기 (채점 전만)
- [ ] 채점: 힌트 없이 정답 2점, 힌트 후 정답 1점, 재시도 실패 0점
- [ ] 8문항 완료 시 onComplete() 호출, 총점(최대 16점) 저장
- [ ] 브라우저에서 Easy/Hard 전환 및 채점 동작 확인

---

### [Step 5: 블라인드 어휘 퀴즈 + 문장 어절 조립]

#### US-012: Stage 1 — 블라인드 어휘 퀴즈
**Description:** 학생으로서 단어가 숨겨진 상태에서 뜻만 보고 정답 어구를 골라 의미 기반 산출력을 키우고 싶다.

**Acceptance Criteria:**
- [ ] 10개 핵심어 문항 (`Step5_세부계획서.md` 표 참조)
- [ ] 핵심 단어는 `?????`로 숨김, 뜻(meaning)은 강조 표시
- [ ] 2지선다: 정답 어구 vs 유사어/유사음 방해 선지 (예: 방식/방석, 영향/영양)
- [ ] 빈칸은 반드시 핵심 단어(또는 활용형)가 들어가는 위치여야 함
- [ ] 정답 1점, 오답 0점
- [ ] 10문항 완료 시 점수 표시 + Stage 2 진입 버튼
- [ ] 브라우저에서 확인

#### US-013: Stage 2 — 문장 어절 조립
**Description:** 학생으로서 어절 카드를 올바른 순서로 배치하여 문장 속 단어 사용을 완성하고 싶다.

**Acceptance Criteria:**
- [ ] Stage 1과 동일 핵심어 순서로 10문항 진행
- [ ] 핵심 단어 공개 표시
- [ ] 카드 뱅크: 정답 어절 + 방해 어절 혼합 (랜덤 순서)
- [ ] 각 슬롯에 문법 힌트 라벨 표시 ("누가?", "언제?", "무엇을?", "어찌했나?" 등)
- [ ] 채점 시 맞은 슬롯은 초록 잠금, 틀린 슬롯만 반환 (부분 정답 지원)
- [ ] [함정 제거] 버튼 1회: 방해 카드 1개 제거, 해당 라운드 최대 1점
- [ ] [리셋] 버튼: 잠긴 카드 유지, 나머지 초기화
- [ ] 채점: 힌트 없이 정답 2점, 힌트 사용 1점, 최종 실패 0점
- [ ] 10문항 완료 시 Stage 1+2 합산 점수 표시 + onComplete() 호출 (최대 30점)
- [ ] 브라우저에서 부분 정답(슬롯 잠금) 동작 확인

---

### [Step 6: 어휘 소나기]

#### US-014: 낙하 게임 — 의미 자동화
**Description:** 학생으로서 시간 제한 속에 관련 단어 버블을 터치하며 어휘 인출을 빠르게 훈련하고 싶다.

**Acceptance Criteria:**
- [ ] Canvas 기반 낙하 게임
- [ ] 화면 상단: 현재 핵심 단어 표시
- [ ] 버블: 관련 단어(터치 시 +10점) + 비관련 단어(터치 시 -10점) 혼합 낙하
- [ ] 관련 단어 4개 수집 시 다음 핵심 단어로 전환 (총 9개 주제)
- [ ] 연속 정답 콤보 보너스, 콤보 증가 시 낙하 속도 증가
- [ ] 제한 시간 80초, 종료 시 결과 화면 + onComplete() 호출
- [ ] 모바일 touchstart/touchend 이벤트 처리
- [ ] 브라우저에서 타이머 및 콤보 동작 확인

---

### [교사 대시보드]

#### US-016: 실시간 학급 현황 대시보드
**Description:** 교사로서 수업 중 위험 학생(Tier 3 → Tier 2 순)을 즉시 확인하고 싶다.

**Acceptance Criteria:**
- [ ] Firestore `learning_records` 실시간 구독 (onSnapshot)
- [ ] 학생별 최신 오류율 표시, Tier 기준 색상 구분:
  - Tier 3 (> 50%): 빨강(`red-500`)
  - Tier 2 (35~50%): 주황(`orange-400`)
  - 발달 중 (20~35%): 노랑(`yellow-400`)
  - 습득 완료 (≤ 20%): 초록(`green-500`)
- [ ] 오류율 높은 순으로 자동 정렬
- [ ] 다문화 학생 배지 표시 (is_multicultural: true)
- [ ] 브라우저에서 Firestore 업데이트 → 화면 자동 반영 확인

---

### [리포트]

#### US-017: 개인 주간 리포트 (레벨 2)
**Description:** 교사로서 학생의 주간 성취를 단어별 오류율과 함께 확인하고 PDF로 출력하고 싶다.

**Acceptance Criteria:**
- [ ] 주간 범위 필터로 `learning_records` 집계
- [ ] 섹션: 종합 성취도 / 단계별 수행률 / 단어별 상세(오류율 높은 순 정렬) / 평균 소요 시간(`time_spent` 기반) / 1차 정답률(`historical_results` 기반)
- [ ] Step 3 이상 완료 기록만 유효 (Step 1~2만 완료 시 "학습 중" 표시)
- [ ] 화면 출력 + PDF 다운로드 버튼
- [ ] PDF: A4 세로, 한글 폰트, 헤더(학교/학급/기간/생성일시), 푸터(페이지 번호)
- [ ] PDF 생성 5초 이내 (평균)
- [ ] 브라우저에서 PDF 다운로드 확인

#### US-018: 월간 그룹 리포트 (레벨 3)
**Description:** 교사로서 전체 학생 vs 다문화 학생의 월간 격차를 분석하여 개입 계획을 세우고 싶다.

**Acceptance Criteria:**
- [ ] 월 단위 필터, 그룹 분리 집계 (전체 / 다문화)
- [ ] 지표: 단계별 평균 정답률 / 단계별 격차(%p) / 공통 취약 유형 Top 3 / 개입 실행률
- [ ] 격차 = 전체평균 - 다문화평균
- [ ] 공통 취약 유형 자동 텍스트 생성 (예: "Step 5 어절 조립 오류 집중")
- [ ] 화면 출력 + PDF 다운로드
- [ ] 브라우저에서 확인

---

### [개입 로그]

#### US-019: 개입 이력 저장
**Description:** 교사로서 Tier 2/3 학생에게 보충 지도 후 개입 기록을 저장하고 싶다.

**Acceptance Criteria:**
- [ ] 학생 상세 화면에서 [개입 기록 추가] 버튼
- [ ] 입력 필드: 개입 유형(소그룹/1:1), 집중 단어(다중 선택), 소요 시간(분), 개입 전 오류율(자동), 개입 후 오류율, 메모
- [ ] 저장 시 Firestore `intervention_logs`에 저장:
  ```json
  {
    "intervention_id": "INT_날짜_학생ID_순번",
    "student_id": "S001",
    "teacher_id": "교사 UID",
    "intervention_type": "tier2_small_group",
    "focus_words": ["번갈다", "입자"],
    "duration_min": 10,
    "before_error_rate": 62.0,
    "after_error_rate": 44.0,
    "memo": "조사/어절 조립 집중",
    "created_at": "ISO 타임스탬프"
  }
  ```
- [ ] 저장 후 다음 주간 리포트에 반영 확인
- [ ] 브라우저에서 확인

---

## 기능 요구사항 (Functional Requirements)

> **우선순위 순서:** 배포·호스팅(FR-D*) → 인증(FR-1~2) → 채점·저장(FR-3~7) → 학습 게임(FR-11~16) → 리포트(FR-9) → 기타

### 배포·호스팅 (최우선)
- FR-D1: `npm run build` 시 Vite가 `dist/` 에 정적 파일을 생성하며, 빌드 에러가 없어야 한다.
- FR-D2: Firebase 설정값은 `.env` 파일로 분리하고, `VITE_` 접두사를 사용한다. `.env.example`을 함께 제공한다.
- FR-D3: Firebase Hosting에 배포하여 `https://<project-id>.web.app` URL로 퍼블릭 접근이 가능해야 한다.
- FR-D4: `firebase.json`에 SPA 리다이렉트 규칙(`"rewrites": [{"source": "**", "destination": "/index.html"}]`)을 설정한다.
- FR-D5: `npm run deploy` 한 명령으로 빌드와 배포가 순차적으로 실행된다.
- FR-D6: 배포된 서비스는 HTTPS로만 접근 가능하며, HTTP 요청은 자동으로 HTTPS로 리다이렉트된다.

### 인증 및 데이터
- FR-1: Firebase Auth로 교사(이메일/비밀번호)와 학생(코드 기반 커스텀 토큰) 인증을 분리 관리한다.
- FR-2: 교사만 학생 등록/삭제/리포트 조회가 가능하다. 학생은 자신의 학습 기록만 접근한다.
- FR-2a: 학생 정보 수정 기능은 프로토타입 범위에서 제외한다. 오입력 수정은 학생 삭제(US-003-D) 후 재등록(US-003)으로 수행한다.
- FR-2b: 학생 삭제 시 Firestore `students` 문서만 제거하며, `learning_records`는 보존한다 (2차 정리 예정).
- FR-2c: 삭제 작업은 반드시 확인 다이얼로그를 거쳐야 하며, 단번에 되돌릴 수 없다.

### 채점 및 학습 기록 (Step 게임보다 우선)
- FR-3: Step 1은 자기평가(알아요/몰라요) 방식으로 unknownDeck 반복 루프를 제공한다. 채점은 `(totalWords - unknownWords.length) / totalWords * 만점`으로 다른 stage와 동일하게 점수를 산출하며, unknownWords 목록은 `additional_datapoint`로 stage_results에 부가 저장한다.
- FR-4: Step 2~5는 공통 채점 규칙을 적용한다: 힌트 없이 정답 2점, 힌트 후 정답 1점, 최종 오답 0점.
- FR-5: Step 6은 Canvas 기반 낙하 게임, 제한 시간 80초, 콤보 시스템을 유지한다.
- FR-6: 오류율 계산: `(1 - 획득점수 / 만점) * 100`. 판정은 소수 원본값 기준, 화면 표시는 소수 1자리 반올림.
- FR-7: Tier 분류: 0~20% 습득완료, 20~35% 발달중, 35~50% Tier 2, 50% 초과 Tier 3.
- FR-12: 학습 기록은 `.env`의 `VITE_MIN_SAVE_STEP` 값 이상의 Step이 완료된 시점부터 Firestore에 저장하며, 이후 각 Step 완료 시마다 동일 문서에 누적 업데이트한다. min_save_step 미달 시에는 메모리에 stage_results를 누적하다가 threshold 도달 시 일괄 flush한다.
- FR-12a: `VITE_MIN_SAVE_STEP` 기본값은 3이며, `.env` 파일에서 2~5 범위로 설정 가능하다. (교사 대시보드 UI 설정은 2차 이관)
- FR-12b: `min_save_step` 미만 단계만 완료한 학습은 Firestore에 저장하지 않으며, 리포트에서 "학습 중"으로 표시한다.
- FR-12c: 각 stage_results 항목에 `time_spent`(초 단위)를 기록한다. Step 2~5는 선택적으로 `additional_datapoint.historical_results`에 시도별 정오답 이력을 저장하여 `first_try_rate` 사후 산출을 지원한다.

### 학습 게임
- FR-8: 실시간 대시보드는 Firestore onSnapshot으로 구독하여 자동 갱신한다.
- FR-9: 리포트 PDF는 A4 세로, 한글 폰트, 헤더/푸터 포함, 생성 5초 이내를 만족한다.
- FR-10: TTS는 항상 `ko-KR`로 재생한다. 번역어는 텍스트 표시만 제공한다 (번역 TTS 없음).
- FR-11: 모든 학습 입력은 터치/탭 기반으로 설계하며, 키보드 타이핑을 학습 과정에서 배제한다.
- FR-13: Step 1~6 순차 진행 원칙. 1차 출시는 소프트 잠금 (이전 미완료 시 경고만, 강제 차단 없음).
- FR-14: Step 3 미만 완료 중간 종료 시 해당 주 리포트에서 "학습 중"으로 표시한다.
- FR-15: TTS 중복 방지: 카드 전환 시 기존 `speechSynthesis.cancel()` 후 새 발화를 시작한다.
- FR-16: 어휘 데이터는 **퀴즈 사이클(10개 단어 = 1 사이클)** 단위로 구성한다. 학생은 1개 사이클 내에서 Step 1→6을 모두 순회한 뒤 다음 사이클로 진행한다.
- FR-16a: 1차 출시에서는 개발자가 데이터를 세팅한다. 교사 단어 추가 UI는 2차에서 제공한다.

---

## 제외 범위 (Non-Goals)

- 사전/사후 총괄평가 모듈 (2차 이관)
- 자유 산출 자동 채점 (2차 이관)
- 적응형 난이도 자동 조정 (2차 이관)
- 학생 스스로 계정 생성 (교사 수동 등록만 지원)
- 교사 단어 추가/편집 UI (2차 이관 — 1차는 개발자가 `vocabData.json`에 직접 세팅)
- 교사 대시보드에서 `min_save_step` 설정 UI (2차 이관 — 1차는 `.env` 파일에서 설정)
- 번역어 TTS
- 소셜 로그인

---

## 설계 고려사항 (Design Considerations)

- **모바일/태블릿 우선:** 터치 타깃 최소 44px
- **아이콘:** lucide-react (실제 이미지 교체 가능하도록 icon 필드명 추상화)
- **Tier 색상:** Tier 3=red-500 / Tier 2=orange-400 / 발달중=yellow-400 / 완료=green-500
- **폰트:** `Noto Sans KR` (본문), `Gaegu` (타이틀) — 현행 프로토타입 유지
- **기존 `preview-react2/`의 App.jsx STEPS 배열 및 Step 1~6 컴포넌트 구조를 기반으로 확장한다.**

---

## 기술 고려사항 (Technical Considerations)

- **Firebase 보안 규칙:** 학생은 자신의 student_id와 일치하는 learning_records만 write. 교사는 자신 학급 전체 read/write.
- **Canvas (Step 6):** touchstart/touchend + mousedown 이벤트 모두 처리.
- **PDF:** `jsPDF` + `html2canvas` 조합 권장. 한글 폰트 base64 임베드 필요.
- **Firestore onSnapshot:** 컴포넌트 unmount 시 반드시 unsubscribe() 호출.
- **학습 저장 트리거:** 각 Step `onComplete()` 시점에 stage_results를 메모리에 누적한다. `min_save_step` 도달 시 `setDoc`으로 레코드 생성(메모리 누적분 일괄 flush), 이후는 `updateDoc` + `arrayUnion`으로 `stage_results`에 누적한다.
- **어휘 데이터 1차:** `src/data/vocabData.json`으로 퀴즈 사이클 구조를 관리한다. 추후 Firestore `words` 컬렉션으로 마이그레이션하여 교사 단어 추가 UI를 지원할 예정.
- **퀴즈 사이클 라우팅:** 학생 홈(`/student/home`)에서 사이클 목록을 표시하고, 사이클 선택 시 Step 1부터 순차 진행. 각 Step 컴포넌트는 현재 사이클의 `words` 배열을 props로 받는다.
- **환경 변수:** Firebase 설정값 + `VITE_MIN_SAVE_STEP`은 `.env`에 분리.

---

## 1차 출시 수용 기준

### 배포 (Gate 0 — 이 항목 통과 후 나머지 진행)
- [ ] `npm run build` 오류 없이 완료
- [ ] Firebase Hosting 배포 후 퍼블릭 URL로 접속 가능
- [ ] 직접 URL 입력 시 SPA 라우팅 정상 동작 (404 없음)
- [ ] HTTPS 자동 적용 확인
- [ ] `.env.example` 및 README 배포 절차 포함 확인

### 학습 기능
- [ ] 학생 25명 동시 학습 시 Step 1~6 주요 기능 정상 동작
- [ ] **퀴즈 사이클 단위 학습 정상 동작:** 1개 사이클(10개 단어) 내에서 Step 1→6 전체 순회 완료
- [ ] **복수 사이클 전환:** 사이클 완료 후 다음 사이클로 정상 진행
- [ ] Step 1: 언어 선택 3종 + 자기평가 루프(unknownDeck 반복) 정상 동작
- [ ] Step 2~5: 공통 채점 규칙(2/1/0점) 정확히 적용
- [ ] Step 6: Canvas 낙하 게임 + 80초 타이머 + 콤보 정상 동작
- [ ] Step 완료 시 Firestore `learning_records` 저장 및 오류율 자동 계산 확인
- [ ] `time_spent` 및 `historical_results` 정상 기록 확인
- [ ] Tier 분류 경계값 테스트 통과 (20%, 35%, 50% 경계 포함)
- [ ] Tier 2/3 학생이 교사 대시보드 상단에 자동 노출
- [ ] 학생 개인 주간 리포트 PDF 출력 정상 (생성 5초 이내)
- [ ] 월간 그룹 리포트 격차 계산 정상
- [ ] 개입 로그 저장 및 다음 주간 리포트에 반영 확인
- [ ] Firebase 보안 규칙: 학생 간 데이터 접근 차단 확인

---

## 미결 질문 (Open Questions)

0. **배포 대상 호스팅:** Firebase Hosting vs Vercel 중 선택. Firebase를 기본으로 하되, Vercel을 선호하면 `vercel.json`에 SPA rewrite 규칙 추가 필요.
1. **1차 퀴즈 사이클 구성:** Step별 세부계획서의 단어들을 어떤 기준으로 사이클에 배분할지 결정 필요. (Step 1~2: 10개, Step 3: 9개, Step 4: 8개, Step 5: 10개로 대상 단어가 Step마다 다름 → 사이클 내 단어 통일 방안 필요)
2. **Step 2 TTS 힌트 문장:** 단어별 문맥 힌트 문장이 현재 명세에 없음 → vocabData에 `step2Hint` 필드 추가 필요.
3. **학생 코드 배포 방식:** 자동 생성 코드를 인쇄 배포할지, 화면 공유할지 결정 필요.
4. **Firebase 프로젝트 설정:** `.env` 환경 변수 및 Firestore 초기화는 별도 수행.
5. **PDF 한글 폰트 라이선스:** `Noto Sans KR` 사용 시 확인 필요.
