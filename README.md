# Swap - 중고 거래 플랫폼

Vue 3 + Vite 기반의 중고 거래 웹 애플리케이션입니다.

## 기술 스택

- **Vue 3** (Composition API)
- **Vue Router 5**
- **Pinia** (상태 관리)
- **Vite**

## 프로젝트 구조

```
src/
├── assets/               # 이미지, 폰트, 전역 CSS
├── components/
│   ├── common/           # 공통 재사용 컴포넌트
│   │   ├── NavBar.vue        # 상단 네비게이션 바
│   │   └── ProductCard.vue   # 상품 카드
│   └── layout/           # 레이아웃 컴포넌트
│   │    └── AppLayout.vue     # 전체 레이아웃 래퍼
│   │   
├── views/                # 페이지 컴포넌트
│   ├── auth/             # 인증 관련 페이지
│   │   
│   ├── product/          # 상품 관련 페이지
│   │   
│   ├── chat/             # 채팅 관련 페이지
│   │   
│   ├── board/            # 익명 게시판 관련 페이지
│   │   
│   └── mypage/           # 마이페이지
│
├── router/               # Vue Router 설정
│   └── index.js
├── stores/               # Pinia 전역 상태 관리
│   ├── auth.js           # 로그인/회원 상태
│   ├── product.js        # 상품 상태
│   ├── chat.js           # 채팅 상태
│   ├── board.js          # 게시판 상태
│   └── user.js           # 유저 정보 상태
├── api/                  # 백엔드 API 호출 함수
│   ├── auth.js           
│   ├── product.js        
│   ├── chat.js           
│   └── board.js          
├── utils/                
│   └── format.js         # 날짜/가격 포맷 함수
├── App.vue               
└── main.js               
```

## 브랜치 전략

```
main       ← 배포용 (직접 커밋 X)
develop    ← 통합 브랜치
feature/*  ← 기능 개발 브랜치
```

## 시작하기

```sh
npm install
npm run dev
```

## 빌드

```sh
npm run build
```
