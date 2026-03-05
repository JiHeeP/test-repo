# 07:00 Daily News Automation (real-estate)

## 목적
매일 아침 부동산 뉴스 브리핑을 자동 생성/전달한다.

## 현재 설정
- Job name: `07:30 real-estate news briefing` (name 그대로, 실행 시각은 07:00으로 수정됨)
- Job id: `9650510f-ba78-49ef-b80a-558aa94c38be`
- Agent: `real-estate`
- Schedule: `30 7 * * *` (Asia/Seoul)
- Session: `isolated`
- Delivery: `announce` to `discord channel:1473675886590169168`

## 동작 내용
- real-estate-news-briefing skill 실행
- MOLIT > 매일경제 > 한국경제 우선순위 수집
- 기사별: URL + 3줄 요약 + 1줄 시장 영향
- 파일 저장:
  - `exports/news/daily/YYYY/MM/DD.md`
  - `exports/news/latest.md`
  - `exports/news/diff/YYYY/MM/DD.md`

## 운영 명령어
```bash
openclaw cron list
openclaw cron runs --id 9650510f-ba78-49ef-b80a-558aa94c38be
openclaw cron run 9650510f-ba78-49ef-b80a-558aa94c38be
openclaw cron disable 9650510f-ba78-49ef-b80a-558aa94c38be
openclaw cron enable 9650510f-ba78-49ef-b80a-558aa94c38be
```

## 시간 변경(예: 07:00)
```bash
openclaw cron edit 9650510f-ba78-49ef-b80a-558aa94c38be --cron "0 7 * * *" --tz "Asia/Seoul"
```
