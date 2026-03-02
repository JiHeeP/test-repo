# GITHUB_WORKFLOW.md

Discord에서 에이전트와 작업할 때 쓰는 간단 GitHub 체크리스트.

## 0) 처음 1회
- GitHub 인증 완료 (`gh auth login` 또는 PAT/credential)
- 기본 전략 선택
  - 빠른 방식: `main` 직푸시
  - 권장 방식: `작업 브랜치 -> PR -> merge`

## 1) 작업 시작 전
1. `git fetch origin`
2. `git switch main`
3. `git pull origin main`
4. 새 브랜치 생성
   - `git switch -c feat/<작업명>`

## 2) Discord에서 작업 진행
- 에이전트가 파일 수정/생성/이동 + 커밋 수행
- 중간중간 결과만 확인

## 3) 작업 종료 후 확인
1. `git status`
2. `git log --oneline -n 10`
3. 필요 시 변경점 확인
   - `git diff origin/main...HEAD`

## 4) 원격 푸시
- `git push -u origin feat/<작업명>`

## 5) PR 생성 및 머지
1. GitHub에서 PR 생성
   - base: `main`
   - compare: `feat/<작업명>`
2. `Able to merge` 확인
3. Merge pull request

## 6) 머지 후 로컬 정리
1. `git switch main`
2. `git pull origin main`
3. (선택) 브랜치 삭제
   - `git branch -d feat/<작업명>`

## 7) 충돌 줄이는 습관
- 한 브랜치에는 한 주제만
- 브랜치를 오래 끌지 말고 짧게 머지
- 파일 이동/이름변경은 한 번에 처리
- 큰 작업 전 `main` 최신화

## 빠른 명령 모음
```bash
git fetch origin
git switch main && git pull origin main
git switch -c feat/<task>
# 작업...
git push -u origin feat/<task>
# PR 생성/머지 후
git switch main && git pull origin main
```
