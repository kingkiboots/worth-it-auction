# 🏷️ 삶으로 쓰는 예배전 (실시간 경매 시스템)

> 현장에서 진행되는 특별한 오프라인 경매를 위한 **실시간 모바일 웹 경매 플랫폼**입니다.
> 참여자들이 자신의 스마트폰을 이용해 실시간으로 랭킹을 확인하고, 입찰 경쟁을 벌이며, 낙찰의 순간을 경험할 수 있도록 빠르고 직관적인 UX를 제공합니다.

<br/>

## 🛠 Tech Stack

**Frontend**

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** GSAP (실시간 랭킹 변동, 유효성 에러 Shake 애니메이션 등)
- **Architecture:** FSD (Feature-Sliced Design) 기반의 폴더 구조 설계

**Backend & Database (BaaS)**

- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Kakao 소셜 로그인)
- **Realtime:** Supabase Realtime (WebSockets)
- **API:** Supabase RPC (Remote Procedure Call) for Transaction atomicity

<br/>

## 🏗 System Architecture

이 프로젝트는 오프라인 현장에서 수많은 유저가 동시에 접속하고 입찰하는 상황을 가정하여 설계되었습니다.

1. **Zero-JS 렌더링 최적화:** 첫 진입점인 랜딩(온보딩) 페이지는 무거운 JS 라이브러리를 배제하고, 순수 HTML과 CSS(Scroll-Snap, Object-Fit)만으로 모바일 네이티브 앱 수준의 뷰를 0.001초 만에 렌더링합니다.
2. **Optimistic UI & Realtime Sync:** 유저가 입찰을 시도할 때, 서버의 응답을 기다리지 않고 즉각적으로 클라이언트 상태를 먼저 업데이트(Optimistic Update)하여 지연 없는 쾌적한 UX를 제공합니다. 동시에 Supabase Realtime 채널을 통해 다른 모든 접속자에게 입찰 현황이 브로드캐스트됩니다.
3. **Transaction 안전성:** 동시 다발적인 입찰(Race Condition)을 방어하기 위해 DB 단에서 유효성을 검사하는 Supabase RPC(`place_bid`) 함수를 사용하여 안전하게 입찰 로직을 처리합니다.

<br/>

## Database Schema

![ERD 이미지](https://github.com/user-attachments/assets/2eabd77b-060a-40eb-bd9e-9c0d5a0695cf)

데이터베이스는 Supabase(PostgreSQL)를 기반으로 설계되었으며, 주요 테이블 간의 관계는 다음과 같습니다.

### Tables Overview

| Table                 | Description                                                                       |
| :-------------------- | :-------------------------------------------------------------------------------- |
| **`auction_items`**   | 경매에 올라온 물품들의 정보와 현재 입찰 상태, 낙찰자 정보를 관리합니다.           |
| **`bids`**            | 유저의 모든 입찰 이력을 기록하며, `auction_items`와 `users`를 연결합니다.         |
| **`users`**           | 경매 서비스의 사용자 프로필 및 크레딧 정보를 관리하며 Supabase Auth와 연동됩니다. |
| **`global_settings`** | 경매 종료 시간 등 시스템 전체의 설정값을 관리하는 키-밸류 저장소입니다.           |

### Key Relationships

- **Auction & Bids**: `auction_items`는 여러 개의 `bids`를 가질 수 있습니다 (1:N 관계).
- **Users & Bids**: `users`는 여러 개의 `bids`를 생성할 수 있습니다 (1:N 관계).
- **Winner Link**: `auction_items`의 `winner_id`는 `users` 테이블을 참조하여 현재 낙찰자를 식별합니다.

<br/>

## ✨ Key Features

- **📱 앱 퀄리티의 랜딩 페이지 (Onboarding)**
  - 자바스크립트 상태 관리 없이 순수 CSS(Tailwind)로 구현된 플로팅 디바이스 Mockup UI.
  - 반응형 디자인이 적용되어 어떠한 모바일 기기에서도 핵심 정보가 잘리지 않고 100% 노출됩니다.
- **🔑 카카오 소셜 로그인 & 프로필 설정**
  - Supabase Auth 기반의 카카오 OAuth 로그인으로 별도 회원가입 절차 없이 빠르게 입장합니다.
  - 최초 로그인 시 자동 생성된 닉네임을 확인/수정하는 프로필 설정(Setup Profile) 단계를 거칩니다.
- **⚡ 실시간 입찰 현황판 (Realtime Dashboard)**
  - WebSocket을 활용한 실시간 랭킹 및 입찰가 변동 확인.
  - 내가 1등일 때, 남에게 1등을 뺏겼을 때(실시간 알림 및 버튼 노출)를 즉각적으로 시각화합니다.
- **🏆 직관적인 경매 마감 상태 (Auction Status)**
  - **낙찰 성공:** 금빛 엠비언트 글로우(Glow) 효과와 스케일 업 애니메이션으로 승리감을 극대화합니다.
  - **유찰(실패):** 카드 흑백화(Grayscale) 및 블러 오버레이 처리로 상태를 명확히 구분합니다.
- **🛡️ 사용자 친화적 에러 핸들링 (Error Feedback)**
  - 입찰 금액 부족, 1만 원 단위 미충족 등의 에러 발생 시, 0.4초간 입력창이 흔들리는(Shake) 애니메이션과 붉은색 테두리 포커싱으로 유저에게 명확하고 즉각적인 시각적 피드백을 제공합니다.
  - 모바일 환경을 고려한 퀵 버튼(+1만, +5만, +10만) 지원.
- **📋 나의 입찰 내역 (My Values)**
  - 내가 참여한 모든 입찰 항목과 현재 상태(진행 중/낙찰/유찰)를 한 번에 모아 확인합니다.
- **🛠️ 마스터 전용 경매 통제실 (Admin Panel)**
  - `master` 권한을 가진 계정만 접근 가능한 관리자 페이지에서 경매 시작/즉시 종료/상태 초기화를 제어합니다.

<br/>

## 📂 Project Structure

FSD(Feature-Sliced Design)를 따라 계층별로 폴더를 분리했습니다.

```
src/
├── app/        # Next.js App Router 페이지 및 라우트 (/, /login, /setup-profile, /auction, /my-values, /admin, /api/health)
├── widgets/    # 여러 feature/entity를 조합한 화면 단위 UI (header, auction 목록, my-values 위젯 등)
├── features/   # 사용자 행동 단위 기능 (입찰하기, 카카오 로그인, 관리자 경매 제어 등)
├── entities/   # 도메인 모델 및 관련 UI (auction 등)
└── shared/     # 공통 UI, Supabase 클라이언트(db), 유틸, 타입, 라우트 상수 등
```

<br/>

## 🚀 Getting Started

### 1. Prerequisites

이 프로젝트를 실행하기 위해서는 Node.js(LTS)와 pnpm, 그리고 Supabase 프로젝트가 필요합니다.

Supabase 프로젝트에는 다음 스키마가 사전에 구성되어 있어야 합니다 (현재 마이그레이션 SQL은 레포에 포함되어 있지 않으므로, 기존 프로젝트를 공유받거나 동일한 스키마를 직접 구성해야 합니다).

- 테이블: `users`(role 컬럼 포함), `auction_items`, `bids`, `global_settings`
- RPC 함수: `place_bid` (동시 입찰 Race Condition 방지용)
- Auth Provider: Kakao OAuth 활성화

### 2. Installation

```bash
# 저장소 클론
git clone https://github.com/kingkiboots/worth-it-auction.git

# 프로젝트 폴더로 이동
cd worth-it-auction

# 의존성 설치 (pnpm 사용을 권장합니다)
pnpm install
```

### 3. Environment Variables

프로젝트 루트 디렉토리에 .env.local 파일을 생성하고, Supabase 프로젝트 정보를 입력합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 4. Run Development Server

```bash
pnpm dev
```

브라우저를 열고 http://localhost:3000에 접속하여 프로젝트를 확인합니다.

### 5. (Optional) Generate Supabase Types

Supabase 스키마가 변경되었다면, 아래 명령어로 `src/shared/db/database.types.ts`를 최신 상태로 갱신할 수 있습니다.

```bash
pnpm gen:db-types
```
