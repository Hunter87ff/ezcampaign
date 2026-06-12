# Project Agent Guide - EzCampaign B2B Client

Welcome to the B2B WhatsApp Campaign Management client. This document serves as the guide for the architectural rules, practices, UI designs, and state models implemented in this repository.

---

## 1. Project Objectives
- **Enterprise-Grade Utility**: A high-efficiency B2B SaaS dashboard tailored for high-volume lead capture, WhatsApp templates messaging, and Twilio voice calls.
- **Calm Productivity**: Clean, modern aesthetics using generous whitespace, structured bento cards, and high-visibility status indicators over neutral Slate colors to prevent cognitive overload.
- **Complete Responsiveness**: Fluid grids capping at 1440px wide on large displays, resizing smoothly to 4 columns on tablet, and sliding sidebar layouts on mobile.
- **Dark Mode Excellence**: Synchronized light and dark themes using semantic Tailwind colors derived from global CSS variables.

---

## 2. Coding Practices & Rules
- **Strict TypeScript Typing**: No usage of implicit `any` types. All entities (`Lead`, `Template`, `Log`, `Message`) must be fully defined inside `src/types/index.ts` and exported.
- **Modularized Layouts**: Visual structures must be separated into reusable components:
  - `Header`: Handles global searches, profile displays, and light/dark theme switches.
  - `Sidebar`: Handles application navigation tabs and mobile navigation drawers.
  - `Footer`: Subtle diagnostic and status information.
  - `ui/`: Empty folder reserved for primitive components (Buttons, Inputs, Badges, Modals).
- **No Heavy External Dependencies**: Pure React state, hooks, and clean native CSS structures (like `conic-gradient`) represent dynamic indicators instead of importing heavy, third-party libraries.
- **State Seeding**: Initialize a persistent mock store inside the client's `localStorage` to allow a fully stateful demo experience including message sending, logs, call initiation, template updates, and lead management.

---

## 3. Design System Parameters
All layouts use the HSL / hex values specified in `DESIGN.md`:
- **Primary Green**: `#006d2f` (Light) / `#25d366` (Dark) — primary buttons and action flows.
- **Teal Accent**: `#006b5f` (Secondary) — secondary badges and highlights.
- **Status Colors**:
  - `New`: `#3B82F6` (Blue)
  - `Contacted`: `#8B5CF6` (Purple)
  - `Responded`: `#F59E0B` (Amber)
  - `Converted`: `#22C55E` (Green)
  - `Closed`: `#64748B` (Slate)
- **Base Spacing Scale**: Strict 8px increment bounds (padding-24, gap-16, space-8).
- **Rounding Bounds**: Buttons & cards: `0.5rem` (8px); Status badges & pills: `9999px` (Full).

---

## 4. State & Screen Routing Flow
A simple state router controls the visible components via:
```typescript
type Page = 'login' | 'dashboard' | 'leads' | 'lead-detail' | 'templates' | 'call-logs' | 'settings';
```
When changing the page:
1. Verify if the admin `User` is logged in; if not, enforce the `'login'` screen.
2. Route the corresponding viewport inside `<main>` next to the sidebar.
3. Sync URL hashes or state triggers to allow deep-linking where required.
