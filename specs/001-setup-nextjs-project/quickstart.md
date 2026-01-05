# Quickstart

## Prerequisites
- Node.js 18+
- pnpm
- Expo Go (on mobile device) or Simulator (Xcode/Android Studio)

## Setup

1.  **Install Dependencies**
    ```bash
    pnpm install
    ```

2.  **Run Web Development Server**
    ```bash
    pnpm --filter web dev
    # or if root script configured:
    pnpm dev:web
    ```
    Open [http://localhost:3000](http://localhost:3000).

3.  **Run Mobile Development Server**
    ```bash
    pnpm --filter mobile start
    # or if root script configured:
    pnpm dev:mobile
    ```
    Scan QR code with Expo Go.

4.  **Run Tests**
    ```bash
    pnpm test
    ```
