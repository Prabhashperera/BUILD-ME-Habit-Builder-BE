# BuildMe

A Habit Building Supportive Website with an AI Adviser — Personalized MERN + AI Web App.

BuildMe helps users develop and maintain healthy habits by combining habit tracking, habit analytics, reminders, and an AI Adviser that provides personalized suggestions and coaching tips based on user data and progress. This repository contains the backend (API) implementation written in TypeScript.

---

## Table of Contents

- [Technologies & Tools](#technologies--tools)
- [Main Features](#main-features)
- [Deployed URLs](#deployed-urls)
- [Backend — Setup & Run Instructions](#backend-—-setup--run-instructions)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Install & Run (Development)](#install--run-development)
  - [Build & Run (Production)](#build--run-production)
  - [Docker (optional)](#docker-optional)
- [API Overview (common endpoints)](#api-overview-common-endpoints)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License & Contact](#license--contact)

---

## Technologies & Tools

- Language: TypeScript (100%)
- Runtime: Node.js
- Frameworks & Libraries:
  - Express (HTTP API)
  - Mongoose (MongoDB ODM) or equivalent
  - JSON Web Tokens (JWT) for auth
  - bcrypt (password hashing)
  - OpenAI or other LLM client for AI Adviser
  - Validation: Joi/Zod or express-validator (depending on implementation)
  - ts-node-dev / Nodemon for development
- Dev & CI:
  - ESLint / Prettier
  - Jest (or preferred testing framework)
- Deployment:
  - Vercel (backend deployed at the URL below)
- Database:
  - MongoDB (Atlas or self-hosted)

---

## Main Features

- User authentication and authorization (register, login, secure JWT flows).
- Habit CRUD (create, read, update, delete) with scheduling metadata.
- Habit tracking: mark habit completions, maintain streaks.
- Reminders & notifications (email / push integration hooks).
- AI Adviser: personalized suggestions, habit-building tips, and adaptive coaching using an LLM (OpenAI or similar).
- Analytics & progress: streaks, completion rates, charts-friendly endpoints.
- Social & sharing primitives (profiles, friend/following metadata — optional).
- Secure API with role-based protections and rate-limiting considerations.

---

## Deployed URLs

- Frontend (deployed): https://build-me-habit-builder-fe.vercel.app/
- Backend (deployed): https://build-me-habit-builder-be.vercel.app/

---

## Backend — Setup & Run Instructions

### Prerequisites

- Node.js (v16+ recommended)
- npm (v8+) or yarn
- MongoDB instance / Atlas cluster
- (Optional) OpenAI API key or whichever LLM provider you use

### Environment Variables

Create a `.env` file in the project root (or use secrets in your hosting provider). Typical variables:

```
# .env (example)
PORT=4000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/buildme?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
FRONTEND_URL=https://build-me-habit-builder-fe.vercel.app
NODE_ENV=development
```

Replace values with your real secrets. Do not commit `.env` to version control.

### Install & Run (Development)

1. Clone the repo and change directory:

   ```bash
   git clone https://github.com/Prabhashperera/BUILD-ME-Habit-Builder-BE.git
   cd BUILD-ME-Habit-Builder-BE
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Create `.env` file as described above.

4. Run in development (auto-reload, TypeScript execution):

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Common `dev` script: `ts-node-dev --respawn --transpile-only src/index.ts` or similar. See `package.json` to confirm scripts.

5. The server should be available at http://localhost:4000 (or the PORT you set).

### Build & Run (Production)

1. Build TypeScript to JavaScript:

   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:

   ```bash
   npm run start
   # or
   yarn start
   ```

Production `start` commonly runs `node dist/index.js`. Confirm in `package.json`.

### Docker (optional)

A simple Docker workflow:

- Build image:

  ```bash
  docker build -t buildme-be .
  ```

- Run container (example):

  ```bash
  docker run -d \
    -e MONGO_URI="your_mongo_uri" \
    -e JWT_SECRET="your_jwt" \
    -e OPENAI_API_KEY="your_openai_key" \
    -p 4000:4000 \
    --name buildme-be \
    buildme-be
  ```

Add a `Dockerfile` and `.dockerignore` if not already present.

---

## API Overview (common endpoints)

Note: adjust paths to match your implementation. Protect sensitive routes (habits, user data) behind authentication (JWT).

- Auth
  - POST /api/auth/register — register a new user
  - POST /api/auth/login — authenticate, returns JWT
  - POST /api/auth/refresh — refresh token (if implemented)

- Users
  - GET /api/users/:id — get user profile
  - PATCH /api/users/:id — update user profile

- Habits
  - GET /api/habits — list habits for the authenticated user
  - POST /api/habits — create a new habit
  - GET /api/habits/:id — get habit details
  - PATCH /api/habits/:id — update a habit
  - DELETE /api/habits/:id — delete a habit

- Tracking & Completions
  - POST /api/habits/:id/complete — mark habit as completed for a date
  - GET /api/habits/:id/completions — fetch completion history

- AI Adviser
  - POST /api/advice — request personalized advice (body includes user/habit context)
  - GET /api/advice/history — fetch past advice responses (if stored)

- Analytics
  - GET /api/stats/overview — summary stats (streaks, completion rates)
  - GET /api/stats/habit/:id — habit-specific analytics

- Notifications
  - POST /api/notifications/schedule — schedule a reminder
  - GET /api/notifications — list scheduled notifications

If your project includes OpenAPI/Swagger or Postman collection, include a link here or to `/api/docs`.

---

## Contributing

Contributions are welcome! A suggested workflow:

1. Fork the repo.
2. Create a branch: `git checkout -b feat/your-feature`
3. Implement changes and add tests.
4. Run linting and tests locally.
5. Open a PR describing your changes.

Please follow existing code style and tests. Add or update API docs for any new endpoints.

---

## Troubleshooting

- Server fails to start: ensure `MONGO_URI` and `JWT_SECRET` are set.
- LLM / OpenAI calls failing: check your `OPENAI_API_KEY` and any provider quotas.
- CORS issues: ensure `FRONTEND_URL` is allowed in backend CORS configuration.
- Check logs (console or hosting provider logs) for stack traces.

---

---

Thank you for using BuildMe! If you'd like, I can:
- Add a sample .env.example file,
- Generate a Postman collection or OpenAPI spec from your routes,
- Or create a CONTRIBUTING.md and ISSUE / PR templates for the repo.
