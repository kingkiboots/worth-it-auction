# 🏷️ 삶으로 쓰는 예배전 (실시간 경매 시스템)

> 현장에서 진행되는 특별한 오프라인 경매를 위한 **실시간 모바일 웹 경매 플랫폼**입니다.
> 참여자들이 자신의 스마트폰을 이용해 실시간으로 랭킹을 확인하고, 입찰 경쟁을 벌이며, 낙찰의 순간을 경험할 수 있도록 빠르고 직관적인 UX를 제공합니다.

<br/>

## 🛠 Tech Stack

**Frontend**

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Architecture:** FSD (Feature-Sliced Design) 기반의 폴더 구조 설계

**Backend & Database (BaaS)**

- **Database:** Supabase (PostgreSQL)
- **Realtime:** Supabase Realtime (WebSockets)
- **API:** Supabase RPC (Remote Procedure Call) for Transaction atomicity

<br/>

## 🏗 System Architecture

이 프로젝트는 오프라인 현장에서 수많은 유저가 동시에 접속하고 입찰하는 상황을 가정하여 설계되었습니다.

1. **Zero-JS 렌더링 최적화:** 첫 진입점인 랜딩(온보딩) 페이지는 무거운 JS 라이브러리를 배제하고, 순수 HTML과 CSS(Scroll-Snap, Object-Fit)만으로 모바일 네이티브 앱 수준의 뷰를 0.001초 만에 렌더링합니다.
2. **Optimistic UI & Realtime Sync:** 유저가 입찰을 시도할 때, 서버의 응답을 기다리지 않고 즉각적으로 클라이언트 상태를 먼저 업데이트(Optimistic Update)하여 지연 없는 쾌적한 UX를 제공합니다. 동시에 Supabase Realtime 채널을 통해 다른 모든 접속자에게 입찰 현황이 브로드캐스트됩니다.
3. **Transaction 안전성:** 동시 다발적인 입찰(Race Condition)을 방어하기 위해 DB 단에서 유효성을 검사하는 Supabase RPC(`place_bid`) 함수를 사용하여 안전하게 입찰 로직을 처리합니다.

<br/>

## ✨ Key Features

- **📱 앱 퀄리티의 랜딩 페이지 (Onboarding)**
  - 자바스크립트 상태 관리 없이 순수 CSS(Tailwind)로 구현된 플로팅 디바이스 Mockup UI.
  - 반응형 디자인이 적용되어 어떠한 모바일 기기에서도 핵심 정보가 잘리지 않고 100% 노출됩니다.
- **⚡ 실시간 입찰 현황판 (Realtime Dashboard)**
  - WebSocket을 활용한 실시간 랭킹 및 입찰가 변동 확인.
  - 내가 1등일 때, 남에게 1등을 뺏겼을 때(실시간 알림 및 버튼 노출)를 즉각적으로 시각화합니다.
- **🏆 직관적인 경매 마감 상태 (Auction Status)**
  - **낙찰 성공:** 금빛 엠비언트 글로우(Glow) 효과와 스케일 업 애니메이션으로 승리감을 극대화합니다.
  - **유찰(실패):** 카드 흑백화(Grayscale) 및 블러 오버레이 처리로 상태를 명확히 구분합니다.
- **🛡️ 사용자 친화적 에러 핸들링 (Error Feedback)**
  - 입찰 금액 부족, 1만 원 단위 미충족 등의 에러 발생 시, 0.4초간 입력창이 흔들리는(Shake) 애니메이션과 붉은색 테두리 포커싱으로 유저에게 명확하고 즉각적인 시각적 피드백을 제공합니다.
  - 모바일 환경을 고려한 퀵 버튼(+1만, +5만, +10만) 지원.

<br/>

## 🚀 Getting Started

### 1. Prerequisites

이 프로젝트를 실행하기 위해서는 Node.js와 Supabase 프로젝트가 필요합니다.

### 2. Installation

```bash
# 저장소 클론
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)

# 프로젝트 폴더로 이동
cd your-repo-name

# 의존성 설치 (사용하시는 패키지 매니저에 맞게 실행하세요)
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

프로젝트 루트 디렉토리에 .env.local 파일을 생성하고, Supabase 프로젝트 정보를 입력합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

브라우저를 열고 http://localhost:3000에 접속하여 프로젝트를 확인합니다.
