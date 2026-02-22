# 학습 리포트 설계서
다문화 문해력 사다리 리포트 시스템 (개발 명세)

## 1. 문서 목적
이 문서는 리포트 기능을 개발자가 바로 구현할 수 있도록 정의한다.
- 어떤 리포트를 누구에게 제공할지
- 어떤 데이터로 계산할지
- 어떤 기준으로 위험군을 표시할지
- UI/PDF 출력 시 어떤 포맷을 유지할지

---

## 2. 리포트 구조
| 레벨 | 대상 | 주기 | 핵심 목적 | 필요정도 |
|---|---|---|---| --- |
| 레벨 1 | 교사 | 실시간 | 수업 중 위험 학생 즉시 파악 | 필수 아님 |
| 레벨 2 | 학생/교사 | 주 1회 | 개인 성취도 추적 + 맞춤 피드백 | 필수 |
| 레벨 3 | 교사 | 월 1회 | 다문화 그룹 격차 분석 + 개입 계획 | 필수 |

---

## 3. 표기 방식


---
4. 계산 규칙 (공통)
### 4.1 점수 규칙
- 1차 정답: 2점
- 힌트 후 정답: 1점
- 오답/재시도 실패: 0점

### 4.2 오류율 계산
- 오류율(%) = (1 - 획득점수 / 만점) * 100
- 단어 1개(5단계) 만점: 10점

### 4.3 오류율 구간
- 0 <= 오류율 <= 20: 습득 완료
- 20 < 오류율 <= 35: 발달 중
- 35 < 오류율 <= 50: Tier 2
- 50 < 오류율: Tier 3

### 4.4 경계값/표시 규칙
- 분류 판정: 원본 소수값 기준
- 화면 표시: 소수 1자리 반올림

---

## 5. 레벨 2: 개인 누적 리포트(레벨 1 삭제)
## 5.1 필수 섹션
- 종합 성취도
- 단계별 수행률
- 단어별 상세(오류율, 단계 점수)

## 5.2 레포트 표기 방식(요청에 따른 추가)
- 단어별 상세 표기 방식: 오류율 높은 단어 순서 정렬
- 주간 단위 종합 출력
- 중간 종료시 레포트 표기 단계: 3단계(1,2단계 종료시 무효)

## 5.3 예시 출력 필드
```json
{
  "student_id": "S001",
  "period": "2026-02-01~2026-02-07",
  "overall_score": 62,
  "tier2_words": 4,
  "tier3_words": 2,
  "avg_time_min": 12,
  "first_try_rate": 44
}
```

---

## 6. 레벨 3: 월간 그룹 리포트
## 6.1 정의
월 1회, "전체 학생 vs 다문화 학생" 비교 리포트

## 6.2 핵심 지표
- 단계별 평균 정답률
- 단계별 격차(%p)
- 공통 취약 유형(조사/어순/추상어)
- 개입 실행률(개입 로그 기반)

## 6.3 출력 목적
- 다음 달 Tier 2/3 운영 계획 수립
- 교사 회의용 근거 자료
- 학급 단위 성과 추적

---

## 7. PDF 출력 스펙
## 7.1 공통
- A4 세로, 한글 폰트 고정
- 헤더: 학교/학급/기간/생성일시
- 푸터: 페이지 번호, 버전

## 7.2 레벨별
- 레벨 2 PDF: 학생별 1~2페이지
- 레벨 3 PDF: 그룹 요약 + 단계별 표 + 개입 제안

## 7.3 색상 규칙
- 긴급: 빨강
- 주의: 주황
- 양호: 초록

---

## 8. 데이터 구조
## 8.1 learning_records
```json
{
  "record_id": "R001",
  "student_id": "S001",
  "word_id": "W001",
  "stage_results": [
    {"stage": 1, "score": 2, "time_spent": 20},
    {"stage": 2, "score": 1, "time_spent": 28},
    {"stage": 3, "score": 0, "time_spent": 41},
    {"stage": 4, "score": 1, "time_spent": 55},
    {"stage": 5, "score": 0, "time_spent": 63}
  ],
  "error_rate": 60.0,
  "tier": "tier3",
  "completed": true,
  "created_at": "2026-02-13T10:30:00"
}
```

## 8.2 intervention_logs
```json
{
  "intervention_id": "INT_20260213_S001_01",
  "student_id": "S001",
  "teacher_id": "T001",
  "intervention_type": "tier2_small_group",
  "focus_words": ["번갈다", "입자"],
  "duration_min": 10,
  "before_error_rate": 62.0,
  "after_error_rate": 44.0,
  "memo": "조사/어절 조립 집중",
  "created_at": "2026-02-13T14:20:00"
}
```

## 8.3 reports_cache (선택)
```json
{
  "report_id": "REP_L3_2026_02_3-2",
  "report_level": 3,
  "grade_class": "3-2",
  "period": "2026-02",
  "payload_ref": "gs://.../report.pdf",
  "generated_at": "2026-03-01T08:30:00"
}
```

---

## 9. 생성 로직 (개발 관점)
## 9.1 레벨 1
- `learning_records` 실시간 구독
- 학생별 최신 레코드 1건 기준으로 상태 계산
- 위험 점수 계산 후 정렬

## 9.2 레벨 2
- 주간 범위 필터
- 단어별/단계별 집계
- 오류율 구간 라벨링
- 피드백 템플릿 바인딩

## 9.3 레벨 3
- 같은 기간 내 그룹 분리 집계
- 격차 = 전체평균 - 다문화평균
- 취약유형 Top N 추출
- 월간 개입 제안 자동 텍스트 생성

---

## 10. 예시 쿼리
```javascript
// 주간 개인 리포트
const getWeeklyStudentReport = async (studentId, from, to) => {
  const records = await db.collection("learning_records")
    .where("student_id", "==", studentId)
    .where("created_at", ">=", from)
    .where("created_at", "<=", to)
    .get();
  return aggregateStudent(records);
};

// 월간 그룹 리포트
const getMonthlyGroupReport = async (gradeClass, month) => {
  const students = await db.collection("students")
    .where("grade_class", "==", gradeClass)
    .get();
  return aggregateGroup(students, month);
};
```

---

## 11. 1차 출시 포함/제외
### 포함
- 레벨 1~3 전부
- 실시간 대시보드
- PDF 출력
- 개입 로그 저장/조회

### 제외
- 사전/사후 총괄평가 리포트
- 자유 산출 자동 채점 리포트

---

## 12. 수용 기준
- [ ] 레벨 1: 실시간 위험군 정렬 정상 동작
- [ ] 레벨 2: 127개 단어 데이터에서 개인 주간 리포트 생성
- [ ] 레벨 3: 월간 그룹 격차 계산 정상
- [ ] PDF 생성 시간 5초 이내(평균)
- [ ] 오류율 분류 경계값 테스트 통과
- [ ] 개입 로그 입력 후 다음 리포트에 반영됨

---

## 문서 메타
- 작성일: 2026-02-11
- 최종 업데이트: 2026-02-13
- 버전: 2.0 (개발 실행형 재구성)
