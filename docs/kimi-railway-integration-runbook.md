# Kimi ↔ Railway 연동 런북 (vocab-bridge-builders)

이 문서는 `external/vocab-bridge-builders`에서 Kimi API 연동 시 반복되는 장애(401/모델 불일치/환경변수 혼선)를 빠르게 해결하기 위한 **팀 공용 체크리스트**다.

## 0) 핵심 결론 (요약)
- 401 `Invalid Authentication`이 나와도, 원인은 코드가 아니라 **키/베이스URL/모델ID 조합 불일치**인 경우가 많다.
- 실제 검증 성공 베이스: `https://api.moonshot.ai/v1`
- 모델명은 제품명("Kimi 2.5")이 아니라 **계정에서 허용된 model id**를 써야 한다.

## 1) 필수 환경변수 (Railway)
- `KIMI_API_KEY` = Moonshot API key
- `MOONSHOT_API_KEY` = 동일 키 (백업 경로)
- `KIMI_BASE_URL` = `https://api.moonshot.ai`
- `KIMI_MODEL` = 계정에서 허용된 모델 ID
  - 예: `kimi-k2-0711-preview` (계정 응답 기준)

> 값 입력 시 따옴표 없이, 앞뒤 공백 없이 넣는다.

## 2) 절대 순서 (반드시 이 순서)
1. Railway Variables 입력/수정
2. **Redeploy**
3. 진단 API 호출:
   - `GET /api/vocab/ai-auth-check`
4. 응답에서 `ok/status/base/modelsTried/keyPreview` 확인

## 3) 진단 API 해석법
- `ok: true` + `status: 200` → 인증/베이스 정상
- `ok: false` + `status: 401` → 키/권한/베이스 불일치
- `base`가 `.ai`인지 확인 (권장)

## 4) 실무 장애 패턴과 조치
### 패턴 A: `Invalid Authentication`
- 조치:
  1) 키 재발급
  2) `KIMI_API_KEY`, `MOONSHOT_API_KEY` 동시 갱신
  3) Redeploy
  4) `ai-auth-check` 재검증

### 패턴 B: 모델명 헷갈림
- 제품명("Kimi 2.5")을 그대로 모델ID로 넣지 말 것.
- `/api/vocab/ai-auth-check` body 내 모델 목록/콘솔 문서 기준 model id 사용.

### 패턴 C: AI 생성 실패로 운영 중단
- 현재 서버는 fallback이 있어 운영 중단은 방지됨.
- 하지만 fallback 품질은 보조용이므로, 운영 안정화 후 AI 경로 복구를 우선.

## 5) 코드 기준 참고 지점
- 인증/모델/베이스 처리: `server/services/aiGenerationService.ts`
- 진단 API: `server/routes/vocab.ts` (`/api/vocab/ai-auth-check`)
- AI 생성 엔드포인트: `/api/vocab/ai-generate-full`

## 6) 운영팀용 빠른 체크리스트 (1분)
- [ ] Variables 최신 반영됨
- [ ] Redeploy 완료됨
- [ ] `ai-auth-check`가 `ok:true`
- [ ] `base`가 `https://api.moonshot.ai/v1`
- [ ] `KIMI_MODEL`이 허용 ID
- [ ] 샘플 3단어 AI 생성 테스트 통과

## 7) 이번 사건에서 확정된 교훈
- "키는 맞다"라는 감각보다 `ai-auth-check` 결과를 우선한다.
- 제품명과 API model id를 혼동하면 연동 장애가 반복된다.
- 배포 환경에서는 변수 변경 후 **재배포**를 습관화한다.
