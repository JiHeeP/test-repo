---
name: cbi-template-recorder
description: Record CBI session outputs into two persistent artifacts: (1) summary table and (2) detailed session markdown log under /cbi_logs. Use when user wants template accumulation. Do NOT generate pedagogy content; only format, append, and update files.
---

# 목표
세션 산출물을 파일로 누적 저장한다.
- 요약표: cbi_logs/cbi_summary_table.md
- 상세기록: cbi_logs/cbi_sessions.md

# 입력(필수)
- 이전 단계 결과(매칭/일반화/질문/focusing)
- Anchor Evidence 선택(없으면 기본: "개념 렌즈로 설명 3문장")

# 파일 규칙
- cbi_logs/ 폴더가 없으면 생성한다.
- 요약표는 "표 헤더가 없으면 헤더 생성 후 행 추가" 방식으로 업데이트한다.
- 상세기록은 세션 블록을 맨 아래 append 한다.
- 채팅 보고는 일반 텍스트로만 제시하며 코드블록은 사용하지 않는다.

# 요약표 포맷(고정)
| 날짜 | 학년 | 과목 | 내용체계 축 | 성취기준(요약) | 핵심개념 | 거시 일반화(점수) | 미시 일반화(점수들) | 3층 질문 완료 | focusing 완료 | Anchor Evidence |
|---|---|---|---|---|---|---|---|---|---|---|

# 상세기록 포맷(고정)
- [세션] YYYY-MM-DD / (학년)학년 (과목)
- 0) 랜덤 선정
- 1) 개념/기능
- 2) 일반화(초안/피드백/승인본/점수)
- 3) 3층 질문(최종본 + 코치노트)
- 4) focusing(오해/자극/연결질문 + 코치노트)
- 5) Anchor Evidence(선택 포맷 + 교사용 프롬프트 1개)

# 3회차 지원 규칙
- 사용자가 같은 저장 요청을 3번째 반복하면, 저장될 최종 텍스트 샘플을 1회 제시할 수 있다.
- 단, 새 교육 내용은 창작하지 않고 입력 결과를 재배열해 보여준다.

# 금지
- 교육적 내용의 새 창작(일반화/질문/활동 설계)은 하지 않는다.
- 받은 결과를 정리/저장만 한다.
