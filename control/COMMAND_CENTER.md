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
