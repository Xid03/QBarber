# Smart Queue Management System

## Overview

This repository contains a monorepo scaffold for a smart queue management system for barbershops. The stack is split into:

- `client-mobile`: Expo React Native app for customers
- `client-web`: React + Tailwind admin dashboard
- `server`: Node.js + Express + Socket.io backend
- `shared`: shared constants and cross-app helpers

Phase 0 focuses on folder structure, package manifests, environment templates, and baseline linting so the UI work can start cleanly in Phase 1.

## Prerequisites

- Node.js 18.18.0 or newer
- npm 9.0.0 or newer
- MongoDB Community Server or MongoDB Atlas (used starting in Phase 2)
- Expo Go app or Android/iOS emulator (used starting in Phase 1)

## Project Structure

```text
smart-queue-system/
├── client-mobile/
├── client-web/
├── server/
├── shared/
├── package.json
└── README.md
```

## Install Dependencies

Install per package:

```bash
cd client-mobile && npm install
cd ../client-web && npm install
cd ../server && npm install
cd ../shared && npm install
```

Or from the repo root with npm workspaces:

```bash
npm install --workspaces
```

## Planned Run Commands

```bash
npm run dev:mobile
npm run dev:web
npm run dev:server
```

Direct package commands:

```bash
cd client-mobile && npx expo start
cd client-web && npm start
cd server && npm run dev
```

## Environment Files

Each app includes its own `.env.example` file:

- `client-mobile/.env.example`
- `client-web/.env.example`
- `server/.env.example`

Copy each file to `.env` in the same folder and update the values before running the app in later phases.

## Notes

- The backend logic is intentionally not implemented in Phase 0 to respect the UI-first workflow.
- Stripe and Firebase are scaffolded as configuration placeholders and can be mocked in early development.
- Shared business constants will be added under `shared/` as the app grows.
