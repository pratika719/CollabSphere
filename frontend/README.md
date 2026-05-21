# CollabSphere Frontend - Production Grade MERN Architecture

This repository contains the frontend implementation of **CollabSphere**, a modern collaborative workspace platform. The project is built with a focus on scalability, maintainability, and production-grade security patterns.

---

## 🏗️ Project Architecture

The frontend follows a **Feature-Based Modular Architecture**. This approach ensures that the codebase remains organized as the application grows.

### Directory Structure
- `src/api`: Centralized Axios configuration and interceptors.
- `src/app`: Global application setup, including routing and providers.
- `src/components`: Shared UI components and layout wrappers.
- `src/features`: Domain-specific logic and pages (e.g., `auth`).
- `src/hooks`: Custom React hooks for business logic and data fetching.
- `src/services`: API abstraction layer for backend communication.
- `src/store`: Global state management using Zustand.
- `src/utils`: Reusable helper functions and utilities.

---

## 🔐 Authentication Flow (Production Standard)

We implement a **Silent Refresh Authentication Pattern** using HttpOnly Cookies. This is the industry standard for preventing XSS attacks while maintaining a seamless user experience.

### 1. The Flow
1. **Initial Check**: On application load, `Providers.jsx` triggers `checkAuth()`. It calls `/auth/me` to verify if a valid session exists via cookies.
2. **Login/Register**: Users submit credentials; the server sets a `refreshToken` in an HttpOnly cookie and returns an `accessToken` (or sets it as a cookie as well).
3. **Automatic Interception**: `src/api/axios.js` monitors every response.
4. **401 Unauthorized**: If a request fails with a 401, the interceptor pauses all outgoing requests, attempts to call `/auth/refresh`, and then retries the failed requests once the token is renewed.
5. **Decoupled State Management**: To prevent circular dependencies between the Axios instance and the Zustand store, we use a custom `EventEmitter` (`src/utils/eventEmitter.js`). If a refresh fails, an event is emitted to clear the global auth state.

---

## 🚀 Recent Improvements & Fixes

During the production hardening phase, the following critical updates were made:

### 1. Circular Dependency Resolution
- **Problem**: `axios.js` imported `auth.store.js` to clear user data on failure, while `auth.store.js` imported API services that used `axios.js`. This created a dependency loop that caused Vite build warnings and potential runtime issues.
- **Solution**: Implemented an **Event-Driven Architecture**. Axios now emits an `auth:clear` event, which the store listens for. This completely decouples the network layer from the state layer.

### 2. UI/UX Consistency (Auth Layout)
- **Problem**: The authentication layout used a default light theme, while the login and registration forms were designed with a modern "Dark Glassmorphism" aesthetic.
- **Solution**: Refactored `AuthLayout.jsx` to use a consistent `slate-950` background with backdrop blurs and purple/indigo gradients, matching the high-fidelity design of the dashboard.

### 3. Route Guard Stability
- **Fixed**: A critical bug in `ProtectedRoute.jsx` where the store was not properly imported, causing the application to crash on navigation to private routes.

---

## 🛠️ Tech Stack
- **Framework**: React 19 (Vite)
- **State Management**: Zustand (Minimal, fast, and scalable)
- **Data Fetching**: TanStack Query v5 (Caching, synchronization, and optimistic updates)
- **Styling**: Tailwind CSS 4.0
- **Routing**: React Router 7 (Data APIs)
- **API Client**: Axios with interceptors

---

## 📦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Linting**:
   ```bash
   npm run lint
   ```

---

## 💡 Engineering Principles Used
- **DRY (Don't Repeat Yourself)**: Abstracted API calls into service layers.
- **SoC (Separation of Concerns)**: Divided logic between hooks (logic), services (network), and components (UI).
- **Security First**: No sensitive data (like tokens) is stored in `localStorage`. Everything is handled via secure cookies and memory state.
- **Resilience**: Implemented request queuing in Axios to handle simultaneous token refresh attempts.
