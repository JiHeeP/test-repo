---
name: real-estate-news-briefing
description: Create daily Korean real-estate news briefings with source priority (MOLIT first, then Maeil Business and Hankyung), topic filtering (supply/presale, rates/loans, policy/regulation), duplicate removal, impact analysis, and day-over-day comparison. Use when user asks for daily real-estate news summary/report/briefing automation.
---

# Real Estate News Briefing

Generate a daily briefing at **07:30 KST** with this priority and structure:
1. Source priority: MOLIT press releases > Maeil Business > Hankyung
2. Scope: nationwide
3. Topics: supply/presale, rates/loans, policy/regulation
4. Output: detailed markdown report
5. Deduplicate near-identical articles
6. Compare with previous day and report changes

## Output paths
- Daily report: `exports/news/daily/YYYY/MM/DD.md`
- Latest pointer copy: `exports/news/latest.md`
- Diff report: `exports/news/diff/YYYY/MM/DD.md`

## Run workflow
1. Collect candidate articles from prioritized sources.
2. Filter by target topics.
3. Deduplicate by title + core sentence similarity.
4. Score impact (`HIGH|MEDIUM|LOW`) with one-line reason.
5. Write detailed markdown report.
6. Compare with previous day and write diff section/report.
7. Ask user if they want git steps (commit/PR/merge) now.

## Dedup rules
- Treat as duplicate when title is highly similar and key facts overlap.
- Keep higher-priority source when duplicates collide.
- If same priority, keep more concrete article (numbers/dates/policy name).

## Impact rules
- HIGH: expected immediate pricing/transaction/supply impact.
- MEDIUM: meaningful but indirect/lagged market impact.
- LOW: informational with limited direct market movement.

Always include: `Impact: <level> - <why>`.

## Markdown format
Follow template in `references/report-template.md`.

## User interaction rules
- First send briefing summary in chat.
- Then ask: `MD 파일 저장 + GitHub(브랜치/커밋/PR)까지 진행할까요? (예/아니오)`
- If user says yes, save files and proceed with git flow they requested.

## Git flow (when requested)
1. Create/switch branch:
   - Skill development: `news_briefing_skill_making`
   - Daily report: `daily_briefing_YYYYMMDD`
2. Add and commit report files.
3. Open PR and merge.
4. Switch back to `main`.

## Failure handling
- If one source fails, continue with remaining sources and note the gap.
- If no valid article found, create report with `No major updates` and reasons.
- If previous-day report missing, skip diff with explicit note.
