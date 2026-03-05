# thinglink-lite-mvp

간단한 ThingLink 유사 MVP:
- 360/평면/3D 모델 장면 지원
- 태그(핫스팟) 클릭 팝업
- 장면 이동
- 유튜브 임베드 + HTML 콘텐츠 표시
- 태그 스타일 프리셋(아이콘/색상/크기/카드테마)
- 발표 모드 + 로컬 저장(localStorage)

## 실행
```bash
cd concept-learning-game/thinglink-lite-mvp
python3 -m http.server 8080
```
브라우저에서 `http://localhost:8080` 접속.

## 자동 테스트(스모크)
```bash
cd concept-learning-game/thinglink-lite-mvp
npm test
```
검사 항목:
- 필수 파일 존재 여부
- index.html 핵심 요소/스크립트 포함 여부
- JS 문법 체크
- scenes.js 기본 구조 체크

## 커스터마이징
- `scenes.js`에서 장면/태그/유튜브 ID 수정
- 실제 360 이미지 URL 또는 3D 모델(.glb/.gltf) URL로 `panorama` 교체
- 메인 로직: `js/main.js`
- 렌더 공통: `js/render.js`
- 저장/복원: `js/storage.js`


## 편집 모드
- `태그 추가 모드`를 ON으로 바꾼 뒤 화면 클릭 -> 새 태그 생성 (360/평면/3D 공통)
- 기존 태그 클릭 -> 제목/본문/유튜브/HTML 수정 또는 삭제
- 태그 표시 방식 선택: 카드(PPT 느낌) / 글씨만 / HTML
- 태그 스타일: 아이콘/색상/크기/카드테마 선택
- 평면/3D 장면 태그는 드래그 이동 지원
- 장면 추가/수정/삭제
- 장면 편집 창에서 **이미지 파일 업로드** 가능 (자동으로 URL 입력란에 반영)
- `JSON 내보내기`로 현재 장면/태그 데이터 저장
- 로컬 저장(localStorage) 자동 반영 + 초기화 버튼 제공

## 보안
- `displayMode=html` 렌더링은 DOMPurify로 sanitize 처리합니다.
