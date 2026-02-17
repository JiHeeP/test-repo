---
name: cbi-daily-recorder
description: Record all 3 daily routine session outputs (evidence sentences + design rule, activity card, CBI set + unit one-pager) into markdown logs under cbi_logs/ and update a one-line daily index table. Formatting/filing only—do NOT generate pedagogy content.
---

# 목표
하루 3세션(0:00-1:10 / 1:10-2:10 / 2:10-3:00)의 산출물을 **가독성 좋은 Markdown**으로 파일에 남긴다.

# 원칙(중요)
- 새로운 교육내용을 “창작”하지 않는다. 사용자가 만든 산출물을 **정리/저장/링크**만 한다.
- 파일이 없으면 생성, 있으면 해당 날짜 섹션에 추가/갱신한다.

# 입력(필수)
- 날짜(YYYY-MM-DD)
- 학년(기본: 초5)
- 교과/단원(없으면 “미정”)
- 세션1 산출물: 근거 문장 3 + 설계 규칙 1
- 세션2 산출물: 활동 카드 1장(+정렬 문장)
- 세션3 산출물: CBI 1세트 + 단원 전체 수업 설계 1안

# 저장 위치(권장)
- 일일 로그: `cbi_logs/daily/YYYY-MM-DD.md`
- 인덱스: `cbi_logs/daily_index.md`

# 일일 로그 포맷(고정)
- 헤더: 날짜/학년/교과/단원
- 섹션 1) 0:00-1:10 근거 문장/설계 규칙
- 섹션 2) 1:10-2:10 활동 카드
- 섹션 3) 2:10-3:00 CBI 1세트 + 단원 설계 1안
- 섹션 4) 매일 체크인(오늘 만든 것/내일 Top1/막힌 점)

# 인덱스 포맷(고정)
`cbi_logs/daily_index.md`에 아래 헤더를 유지한다(없으면 생성).
| 날짜 | 학년 | 교과/단원 | 근거문장 | 설계규칙 | 활동카드 | CBI 1세트 | 단원설계 | 링크 |
|---|---|---|---|---|---|---|---|---|

# 실행(파일 작업)
1) `cbi_logs/daily/` 폴더가 없으면 만든다.
2) `cbi_logs/daily/YYYY-MM-DD.md`를 생성/갱신한다.
3) `cbi_logs/daily_index.md`에 해당 날짜 행이 없으면 추가(있으면 링크/단원명만 갱신).

