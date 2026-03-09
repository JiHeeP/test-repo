# eng-preview-react3 — 어휘의 징검다리 PoC

> TDD (`tasks/tdd-vcab-bridge.md`) 기반 naive test bed.  
> Step 1(멀티모달 카드) + 로컬 JSON 저장소.

## 빠른 시작

```bash
cd eng-preview-react3
npm install
npm run dev
```

## 로그인 정보

| 역할 | 입력 | 비고 |
|------|------|------|
| 교사 | `teacherA` / `4908` | 대시보드 진입 |
| 학생 | `S00001` ~ `S00005` | 학습 화면 진입 |

## 디렉토리 구조 (TDD §4.1 기반)

```
src/
├── App.jsx                      # 인증 상태별 라우팅
├── main.jsx                     # 엔트리포인트 (AuthProvider 래핑)
├── modules/
│   ├── core/
│   │   ├── auth/
│   │   │   ├── types.ts                # AuthService 인터페이스
│   │   │   ├── LocalAuthService.js     # PoC 구현체 (하드코딩)
│   │   │   ├── AuthContext.jsx         # React Context
│   │   │   └── index.js
│   │   └── config/
│   │       ├── stageConfig.json        # Stage별 채점 규칙 (교사 편집 가능)
│   │       ├── stageConfig.js          # JSON 로더 + 검증
│   │       └── index.js
│   ├── data/
│   │   ├── students/
│   │   │   ├── types.ts                # StudentService 인터페이스
│   │   │   ├── studentsData.json       # 학생 시드 데이터
│   │   │   ├── LocalStudentService.js  # PoC 구현체
│   │   │   └── index.js
│   │   ├── vocab/
│   │   │   ├── types.ts                # VocabDataService 인터페이스
│   │   │   ├── vocabData.json          # 어휘 데이터 (cycles/words)
│   │   │   ├── LocalVocabDataService.js
│   │   │   └── index.js
│   │   └── learning-records/
│   │       ├── types.ts                # LearningRecordService 인터페이스
│   │       ├── LocalLearningRecordService.js  # in-memory + localStorage
│   │       └── index.js
│   └── games/
│       ├── shared/
│       │   ├── types.ts                # StageResult, GameStepProps
│       │   ├── ScoringEngine.js        # 공통 채점 로직
│       │   ├── iconMap.js              # 아이콘 문자열 → 컴포넌트 매핑
│       │   └── index.js
│       └── step1-multimodal/
│           ├── Step01.jsx              # 멀티모달 카드 게임
│           └── index.js
└── pages/
    ├── LoginPage.jsx
    ├── StudentHome.jsx
    └── TeacherDashboard.jsx
```

## 구현체 교체 가이드

모든 서비스는 **인터페이스(types.ts) → 구현체(Local*Service.js)** 분리 원칙을 따릅니다.

| 모듈 | 현재 (PoC) | 차후 교체 |
|------|-----------|----------|
| Auth | `LocalAuthService` (하드코딩) | `FirebaseAuthService` or `GoogleAuthService` |
| Students | `LocalStudentService` (JSON) | `FirebaseStudentService` (Firestore) |
| Vocab | `LocalVocabDataService` (JSON) | `FirebaseVocabDataService` (Firestore) |
| LearningRecords | `LocalLearningRecordService` (localStorage) | `FirebaseLearningRecordService` (Firestore) |

교체 방법: 각 모듈의 `index.js`에서 import를 새 구현체로 변경하면 됩니다.

## 데이터 저장

- **학습 기록:** `localStorage` key = `vocabridge_learning_records`
- **학생/어휘 데이터:** JSON 파일 (정적 import)
- 브라우저 개발자 도구 → Application → Local Storage 에서 확인 가능
