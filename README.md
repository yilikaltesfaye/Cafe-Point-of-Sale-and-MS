# Café Point of Sale and Management System

A café point-of-sale and management system with a NestJS backend and a React frontend.
The backend provides authentication, session management, authorization, and employee management APIs.

## Tech stack

### `cafe-management`

- TypeScript
- NestJS
- Passport, `passport-local`, and `passport-jwt`
- JWT access and refresh tokens
- Prisma ORM
- PostgreSQL
- Argon2
- `class-validator` and `class-transformer`
- Docker Compose

### `cafeposMS`

- TypeScript
- React
- Vite
- React Router
- Axios
- TanStack React Query
- Zustand
- React Hook Form
- Zod
- ESLint and Prettier

## Features

- Employee login with phone number and PIN.
- Argon2 hashing for employee PINs and refresh tokens.
- Database-backed login sessions identified by session IDs.
- JWT access and refresh tokens.
- Refresh-token validation and rotation.
- Logout from the current session.
- Logout from all active sessions.
- JWT authentication applied to protected routes by default.
- Role-based access control for `OWNER`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`, and `DELIVERY`.
- Permission-based authorization guards.
- Administrator bypass for role and permission checks.
- Bootstrap endpoint for creating the first owner/administrator account.
- Create and update employee accounts.
- Terminate employees without deleting their records.
- Inactive or terminated employees are prevented from accessing the POS.
- Global request validation.
- Prisma database migrations.

The frontend currently contains the Vite React entry point and a minimal `App` component.

## Folder structure

```text
.
├── ReadMe/
│   └── Readme.auth.md
├── cafe-management/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   ├── employee/
│   │   └── prisma/
│   ├── docker-compose.yml
│   ├── package.json
│   └── prisma.config.ts
└── cafeposMS/
    ├── public/
    ├── src/
    ├── package.json
    └── vite.config.ts
```

## Prerequisites

- Node.js and npm
- Docker and Docker Compose, or an available PostgreSQL database
- A PostgreSQL connection string

## Environment variables

Create `cafe-management/.env` with these variable names:

```dotenv
DATABASE_URL=
PORT=
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=
PIN_MAX_ATTEMPTS=
PIN_LOCK_TIME_MINUTES=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
```

`POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` are used by the PostgreSQL service in `cafe-management/docker-compose.yml`.

The current frontend code does not reference any environment variables.

## Setup and run

### Backend

```bash
cd cafe-management
npm install
```

Start the development PostgreSQL database with Docker:

```bash
npm run dev:docker_create
```

Generate the Prisma client and apply development migrations:

```bash
npm run db:generate
npm run db:migrate
```

Start the backend in watch mode:

```bash
npm run start:dev
```

The backend uses `PORT` when provided and otherwise listens on port `3000`.

### Frontend

In a separate terminal:

```bash
cd cafeposMS
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Database migrations

Prisma migrations are stored in `cafe-management/prisma/migrations`.

For development:

```bash
cd cafe-management
npm run db:migrate
```

For applying existing migrations:

```bash
npm run db:deploy
```

Additional database commands available in the backend include:

```bash
npm run db:generate
npm run db:push
npm run db:pull
npm run db:format
npm run db:studio
npm run db:reset
```
