# QFlow Queue Management System

QFlow is a queue management system for barbershops with a public customer interface and an admin dashboard.

## Current Workspace

- `client/` - React + TypeScript + Tailwind + Vite
- `server/` - Node.js + Express + TypeScript + Prisma
- `shared/` - shared types, schemas, constants
- `docs/` - design system and wireframes
- `docker/` - deployment placeholders for later phases

## Prerequisites

- Node.js 18.18.0 or newer
- npm 9.0.0 or newer
- PostgreSQL for later backend phases

## Project Structure

```text
qflow-queue-management-system/
├── client-mobile/
├── client-web/
├── server/
├── shared/
├── package.json
└── README.md
```

## Quick Start

```powershell
npm install --workspaces
npm run prisma:generate
npm run typecheck
npm run build
```

Run the development servers:

```powershell
npm run dev:client
npm run dev:server
```

## Notes

- Older prototype folders remain in the repository for reference, but the active Phase 2 workspace is now `client`, `server`, and `shared`.
- The current phase focuses on project skeleton, TypeScript setup, Tailwind tokens, Prisma schema, and placeholder routes/components.

## Active Phase 2 Structure

```text
qflow-queue-management-system/
|-- client/
|-- server/
|-- shared/
|-- docs/
`-- docker/
```
