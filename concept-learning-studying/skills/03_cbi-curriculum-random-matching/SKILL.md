---
name: cbi-curriculum-random-matching
description: Extract and match curriculum structure (content system table + achievement standards narrative) from pre-extracted curriculum data, then randomly select a topic bundle within a subject. Use only when user provided grade+subject. Do NOT use to write generalizations or questions.
---

# 목표
사전 추출된 교육과정 데이터(JSON + 원문 TXT)에서
- 내용체계(표)에서 "축(영역/핵심요소 등)"을 잡고
- 성취기준(서술)에서 관련 기준을 1~3개 연결하여
- 과목 내에서 "랜덤 묶음" 1개를 선정한다.

# 교육과정 데이터 위치(고정)
아래 경로에 국어·과학·수학·사회 교육과정이 이미 추출되어 있다.
PDF/hwpx 업로드 불필요 — 이 파일들에서 바로 출발한다.

- 마스터 인덱스: `0216_test/cbi_logs/curriculum_index/index.json`
- 과목별 구조화 JSON (단원 목록 + 성취기준):
  - 국어: `0216_test/cbi_logs/curriculum_index/korean.json`
  - 과학: `0216_test/cbi_logs/curriculum_index/science.json`
  - 수학: `0216_test/cbi_logs/curriculum_index/math.json`
  - 사회: `0216_test/cbi_logs/curriculum_index/society.json`
- 과목별 원문 TXT (내용체계·핵심아이디어·성취기준 해설 포함):
  - 국어: `0216_test/cbi_logs/curriculum_raw/korean.txt`
  - 과학: `0216_test/cbi_logs/curriculum_raw/science.txt`
  - 수학: `0216_test/cbi_logs/curriculum_raw/math.txt`
  - 사회: `0216_test/cbi_logs/curriculum_raw/society.txt`

## JSON 구조 요약
```
{
  "subject_guess": "과학",
  "units": [ { "no": 1, "title": "힘과 우리 생활" }, ... ],
  "standards": [
    { "code": "4과01-01", "text": "...", "grade_hint": "4",
      "unit_no": 1, "unit_title": "힘과 우리 생활" }, ...
  ]
}
```
- `grade_hint`: 학년군 숫자(2=1~2학년, 4=3~4학년, 6=5~6학년)
- `unit_no` + `unit_title`: 해당 성취기준이 속한 단원

# 입력
- 학년, 과목 (필수)
- 교육과정 파일 업로드 불필요. 위 경로의 JSON/TXT를 자동으로 읽는다.
- 과목명이 "국어/과학/수학/사회" 중 하나가 아니면, 지원 과목 목록을 안내하고 중단.

# 진행
1) 사용자가 준 학년·과목으로 해당 JSON 파일을 읽는다.
2) `grade_hint`로 학년군을 필터링한다 (예: 5학년 → grade_hint "6").
3) 필터된 성취기준 중에서 랜덤으로 unit 1개를 골라, 그 unit 안의 성취기준 1~3개를 묶는다.
4) 원문 TXT에서 해당 단원의 핵심아이디어·내용체계 축 정보를 찾아 보충한다.

# 학년 → grade_hint 매핑
| 학년 | grade_hint |
|------|-----------|
| 1~2학년 | "2" |
| 3~4학년 | "4" |
| 5~6학년 | "6" |

# 운영 규칙
- 같은 요청에서 3번째 재시도에 도달하면, 이해를 돕기 위한 모범 매칭 예시 1개를 제시할 수 있다.
- 모범 예시를 제시하더라도 실제 선정 결과와 예시는 구분해서 명시한다.

# 출력(다음 단계가 바로 쓸 수 있게)
- 아래 키를 가진 JSON 형식 텍스트를 코드블록 없이 출력한다.
- 필수 키: grade, subject, content_system_axis, matched_standards, topic_focus, concept_lens_candidates

# 출력 예시 형식(코드블록 금지)
{ "grade": "", "subject": "", "content_system_axis": "", "matched_standards": ["", ""], "topic_focus": "", "concept_lens_candidates": ["", "", "", ""] }
