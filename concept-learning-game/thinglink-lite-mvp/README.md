# thinglink-lite-mvp

간단한 ThingLink 유사 MVP:
- 360/평면 장면 모두 지원
- 태그(핫스팟) 클릭 팝업
- 장면 이동
- 유튜브 임베드 + HTML 콘텐츠 표시

## 실행
```bash
cd concept-learning-game/thinglink-lite-mvp
python3 -m http.server 8080
```
브라우저에서 `http://localhost:8080` 접속.

## 커스터마이징
- `scenes.js`에서 장면/태그/유튜브 ID 수정
- 실제 360 이미지 URL로 `panorama` 교체


## 편집 모드
- `태그 추가 모드`를 ON으로 바꾼 뒤 화면 클릭 -> 새 태그 생성 (360/평면 공통)
- 기존 태그 클릭 -> 제목/본문/유튜브/HTML 수정 또는 삭제
- 태그 표시 방식 선택: 카드(PPT 느낌) / 글씨만 / HTML
- 장면 추가/수정/삭제
- 장면 편집 창에서 **이미지 파일 업로드** 가능 (자동으로 URL 입력란에 반영)
- `JSON 내보내기`로 현재 장면/태그 데이터 저장
