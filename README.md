# WSD Assignment 02 - WSDflix

## 📌 프로젝트 소개
넷플릭스 스타일의 영화 추천 데모 사이트입니다.  
Vue 3, TypeScript, TMDB API를 사용하여 SPA 형태로 구현했습니다.

## 🧩 Git Flow 브랜치 전략

이 프로젝트는 Git Flow 브랜치 전략을 간단히 적용하여 관리했습니다.

- **main**: 제품 배포용 브랜치
- **develop**: 개발 통합 브랜치
- **feature/***: 기능 단위 개발 브랜치
- 기능 개발 후 `feature/*` → `develop` 으로 Pull Request를 통해 병합했습니다.

## 🛠 기술 스택
- Vue 3 (Composition API, TypeScript)
- Vite
- Vue Router
- Pinia
- Axios
- GitHub Pages (정적 배포)

## 🚀 실행 방법

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
