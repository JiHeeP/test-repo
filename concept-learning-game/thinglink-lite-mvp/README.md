# thinglink-lite-mvp

간단한 ThingLink 유사 MVP:
- 360 파노라마 뷰
- 태그(핫스팟) 클릭 팝업
- 슬라이드(장면) 이동
- 유튜브 임베드

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
- `태그 추가 모드`를 ON으로 바꾼 뒤 360 화면 클릭 -> 새 태그 생성
- 기존 태그 클릭 -> 제목/본문/유튜브 수정 또는 삭제
- `JSON 내보내기`로 현재 장면/태그 데이터 저장
