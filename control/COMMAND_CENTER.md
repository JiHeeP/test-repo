# COMMAND_CENTER.md

이 파일을 **전역 명령 허브**로 사용한다.
앞으로 "전역 md 편집" 요청은 기본적으로 이 파일에 먼저 반영한다.

## 0) 기본 원칙
- 단일 입력 원칙: 같은 규칙을 여러 md에 중복 작성하지 않는다.
- 실행 우선순위: `COMMAND_CENTER.md` > 개별 문서.
- 개별 문서는 상세 참고용(정책/철학/프로필/도구 메모).

## 1) 라우팅 규칙 (어디에 무엇을 줄지)
- 교차 도메인 자료(예: 트위터 AI 글) → `main`에 입력
  - 출력: teacher-aid / main / market-intel 3분기 적용안
- 경제/시장 실시간 브리핑 → `real-estate`
- 학생 기록/수업/평가 개선 → `teacher-aid` 또는 forfun
- 코드/구조/자동화 설계 → `coding`

## 2) 표준 출력 형식
- 공통 요약 3줄
- 영역별 적용점 3개
- 영역별 다음 행동 1개

## 3) 운영 시간 규칙
- 05:00 운영 브리핑
- 07:00 시장 브리핑(부동산 + 코인)
- 15:00 체크인 브리핑
- 22:00 evening log

## 4) 경계 규칙(요약)
- 자동 발신 금지(초안만)
- 학생 개인정보 외부 공유 금지
- 인간 최종판단: 전략, 민감정보, 최종 발신

## 5) 문서 역할 맵
- `SOUL.md`: 톤/태도
- `AGENTS.md`: 운영 규칙
- `DECISION_BOUNDARY.md`: 인간/에이전트 경계
- `AGENT_GUIDELINE.md`: 에이전트별 책임
- `TOOLS.md`: 로컬 환경 메모
- `USER.md`: 사용자 프로필

## 6) 업데이트 규칙
- 새 운영 규칙은 먼저 여기에 추가
- 필요 시 관련 상세 문서에 링크/요약만 반영

## Conversation-Derived Operating Rules (2026-03-08)

- After GitHub-ending commands (e.g., PR merge / push complete / 작업 끝), ask user: "개발모드 종료할까요?"
- If user says "개발모드 종료", check running dev processes and terminate, then confirm stopped state.
- Keep workspace focus strict: manage work in `~/.openclaw/workspace-*`; avoid editing `~/.openclaw/agents/*` unless explicitly needed.
- Keep daily policy memory split:
  - durable operating rules -> `control/COMMAND_CENTER.md`
  - daily agreement/event logs -> `memory/YYYY-MM-DD.md`

## 7) plna 실행 모드 지침 (성능/메모리)
- `dev` 모드(`npm run dev`)는 개발·수정 전용이다. 장시간 실행 시 메모리 사용량이 크게 증가할 수 있다.
- `start` 모드(`npm run build && npm run start`)는 운영/점검 전용이다. 안정성과 메모리 효율을 우선한다.
- 기본 원칙:
  - 수정할 때만 `dev` 실행
  - 작업 종료 시 `dev` 종료
  - 실제 사용/검증은 `start` 기준으로 판단
- GitHub 종료성 명령(PR merge / push 완료 / 작업 끝) 뒤에는 반드시 질문:
  - "개발모드 종료할까요?"
- 사용자가 "개발모드 종료"라고 하면:
  1) 실행 중인 dev 프로세스 확인
  2) 종료
  3) 종료 상태 재확인 후 보고

## 8) 자동기록 트리거 고정 규칙

### A) main → plna (night log)
- 트리거: 메시지가 `[22:00 로그]`로 시작하면 자동 intake 파이프라인을 우선 수행한다.
- 동작 우선순위:
  1) 로그 파싱/저장
  2) 필요 시 22:05 보완질문(최대 5개)
  3) 잡담/확장은 보완질문 종료 후에만
- 금지: 트리거 대화 중 주제 이탈(다른 일반 잡담으로 전환) 금지.

### B) teacher-aid → forfun (student observation)
- 트리거: 메시지가 `[학생기록]` 또는 `[관찰기록]`로 시작하면 forfun intake API(`POST /api/ops/intake-observation`)로 기록 처리한다.
- 우선 파싱 필드: 학생(번호/이름), 영역(카테고리), 내용, 관찰시각.
- 필수 필드 누락 시: 누락 항목만 짧게 재질문 후 저장.
