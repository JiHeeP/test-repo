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
