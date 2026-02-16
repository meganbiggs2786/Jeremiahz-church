# Tuath Coir Owner Portal (Mobile)

This is the mobile application for Tuath Coir owners (**Megan** and **One Lucky Lady**) to collaborate and manage the shop.

## 🛠 Features

- **Collaboration**: Real-time shared notes and activity logs.
- **Sales Monitoring**: Track revenue, profit, and order counts.
- **Order Management**: View and track customer orders.
- **Member Directory**: See who has taken the "Oath" and joined the tribe.

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo Go app on your iOS/Android device

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the backend URL:
   Open `app/_layout.tsx` and set the `url` in `httpBatchLink` to your Cloudflare Worker URL.

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Open the app:
   Scan the QR code in your terminal with the Expo Go app.

## 🔐 Authentication

Access is restricted to owners using a shared **Owner Secret Key**.
- **Default Dev Key**: `tc_owner_secret_2024`
- **Owner Names**: Use "Megan" or "Lucky Lady" to identify yourself in notes.

## 🏗 Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router (File-based)
- **API**: tRPC (Type-safe client/server)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: TanStack Query (React Query)
