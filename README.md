# GwangJu-ICT-FE-project

---

# 🌐 Info Dashboard
하나의 화면에서 **날씨, GitHub 사용자 정보, 최신 뉴스**를 조회할 수 있는 웹 서비스

---

## 📌 프로젝트 소개
이 프로젝트는 **React + TypeScript**를 기반으로 제작된 간단한 대시보드형 웹 서비스입니다.  
사용자는 도시 이름을 입력해 날씨를 확인하고, GitHub 사용자명을 입력해 프로필과 레포지토리를 확인하며,  
키 없이 사용 가능한 뉴스 API를 활용해 최신 뉴스 헤드라인을 검색할 수 있습니다.

- **프론트엔드 프레임워크** : React 18 + TypeScript
- **스타일링** : CSS 모듈 및 간단한 커스텀 스타일
- **데이터 통신** : Fetch API
- **외부 API**
  - [OpenWeatherMap API](https://openweathermap.org/) – 날씨 정보
  - [GitHub REST API](https://docs.github.com/en/rest) – GitHub 유저 및 레포지토리 정보
  - [Hacker News Algolia API](https://hn.algolia.com/api) – 뉴스 검색 (API Key 불필요)

---

## ✨ 기능
- **날씨 조회**
  - 도시 이름 입력 후 해당 지역의 현재 날씨 정보 표시
  - 온도, 습도, 날씨 상태 아이콘 표시
- **GitHub 정보 조회**
  - 사용자명 입력 후 프로필 사진, bio, 팔로워/팔로잉 수 표시
  - 공개 레포지토리 목록 조회
- **뉴스 검색**
  - 키워드 입력 후 최신 뉴스 헤드라인 목록 표시
  - 뉴스 제목, 설명, 출처, 발행일 표시
  - 키 없이 바로 호출 가능 (Hacker News Algolia API)
- **반응형 UI**
  - 데스크톱/모바일 환경에 맞춰 자동 레이아웃 조정

---

## 🛠 설치 및 실행 방법

1. **저장소를 클론**
    ```bash
    git clone https://github.com/your-username/info-dashboard.git
    cd info-dashboard
    ```

2. **패키지 설치**
    ```bash
    npm install
    ```

3. **실행**
    ```bash
    npm start
    ```
    - 로컬 개발 서버가 자동 실행되며 기본 주소는 `http://localhost:3000`입니다.

---

## 📚 배운 점
- **React + TypeScript 환경 설정**
  - `useState`, `useEffect`와 같은 훅과 타입스크립트의 `interface`/`type` 활용법
- **API 호출 구조 설계**
  - API Key가 필요한 서비스(OpenWeatherMap)와 불필요한 서비스(GitHub, HN API)를 혼합 사용
  - API 호출 시 로딩 상태/에러 처리 패턴 적용
- **CORS 및 보안 이슈**
  - 일부 API 호출 시 발생하는 CORS 문제를 피하기 위한 API 선택 전략
- **UX 개선**
  - 뉴스 검색에서 API Key 없이도 사용자에게 결과를 보여줄 수 있도록 키 없는 API로 교체
  - 불필요한 드롭다운 제거 후 입력 필드 안내 문구로 대체하여 혼란 최소화

---

## 🚀 어려웠던 점과 해결 방법
- **문제** : 뉴스 API 사용 시 API Key 발급이 필요하고, 무료 사용량 제한이 존재  
  **해결** : API Key가 필요 없는 Hacker News Algolia API로 변경, 한글 검색 결과가 적은 문제는 UI 안내를 통해 해결
- **문제** : API 호출 시 데이터가 없는 경우 UI가 비어 보이는 현상  
  **해결** : "검색 결과 없음" 메시지 표시 및 입력값 가이드 제공

---

## 📷 실행 화면 예시
<img width="1340" height="880" alt="image" src="https://github.com/user-attachments/assets/4bc32333-dc04-4795-83b5-5b57978f886c" />
<img width="1343" height="906" alt="image" src="https://github.com/user-attachments/assets/723f9003-2cab-4600-b051-cd507cb590e3" />
<img width="1332" height="896" alt="image" src="https://github.com/user-attachments/assets/f3eec1f9-8a34-4a4b-bbb2-5c5ad504d51a" />

1. **날씨 조회 예시**
2. **GitHub 프로필 조회 예시**
3. **뉴스 검색 예시**

