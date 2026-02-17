---
name: cbi-curriculum-random-matching
description: Extract and match curriculum structure (content system table + achievement standards narrative) from an uploaded curriculum file, then randomly select a topic bundle within a subject. Use only when curriculum file is available and user provided grade+subject. Do NOT use to write generalizations or questions.
---

# 목표
업로드된 교육과정 파일에서
- 내용체계(표)에서 "축(영역/핵심요소 등)"을 잡고
- 성취기준(서술)에서 관련 기준을 1~3개 연결하여
- 과목 내에서 "랜덤 묶음" 1개를 선정한다.

# 입력
- 학년, 과목
- 교육과정 파일(필수). 없으면 중단.

# 운영 규칙
- 같은 요청에서 3번째 재시도에 도달하면, 이해를 돕기 위한 모범 매칭 예시 1개를 제시할 수 있다.
- 모범 예시를 제시하더라도 실제 선정 결과와 예시는 구분해서 명시한다.

# 출력(다음 단계가 바로 쓸 수 있게)
- 아래 키를 가진 JSON 형식 텍스트를 코드블록 없이 출력한다.
- 필수 키: grade, subject, content_system_axis, matched_standards, topic_focus, concept_lens_candidates

# 출력 예시 형식(코드블록 금지)
{ "grade": "", "subject": "", "content_system_axis": "", "matched_standards": ["", ""], "topic_focus": "", "concept_lens_candidates": ["", "", "", ""] }
