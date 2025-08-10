# Multi-API Dashboard (React + TypeScript)

여러 공개 API를 한 화면에서 탐색하는 반응형 대시보드입니다.

- **GitHub**: 사용자 프로필 + 레포 목록(정렬/CSV 내보내기)
- **Weather (Open-Meteo)**: 도시 검색 → 현재/시간대별 기온
- **News (선택, NewsAPI)**: 키워드 뉴스 목록
- 고급 UI: 다크/라이트 테마, 로더/토스트, 카드·그리드, 반응형
- 안정성: 타임아웃/Abort/세션 캐시, 에러 메시지, 로컬 스토리지로 검색값/설정 유지

## 1) 시작하기

```bash
pnpm i   # or npm i / yarn
pnpm dev # http://localhost:5173
