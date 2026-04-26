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
│   ├── common/           # 재사용 컴포넌트
│   │   ├── NavBar.vue
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   └── ProductCard.vue
│   └── layout/           # 레이아웃 컴포넌트
│       └── AppLayout.vue
├── views/                # 페이지 컴포넌트
│   ├── auth/
│   │   ├── LoginView.vue
│   │   └── SignupView.vue
│   ├── product/
│   │   ├── ProductListView.vue
│   │   ├── ProductDetailView.vue
│   │   └── ProductRegisterView.vue
│   ├── chat/
│   │   ├── ChatListView.vue
│   │   └── ChatRoomView.vue
│   ├── board/
│   │   ├── BoardListView.vue
│   │   ├── BoardDetailView.vue
│   │   └── BoardWriteView.vue
│   └── mypage/
│       └── MyPageView.vue
├── router/
│   └── index.js
├── stores/               # Pinia store
│   ├── auth.js
│   ├── product.js
│   ├── chat.js
│   ├── board.js
│   └── user.js
├── api/                  # API 호출 함수
│   ├── auth.js
│   ├── product.js
│   ├── chat.js
│   └── board.js
├── utils/
│   └── format.js
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
