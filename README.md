# LLD Practice Platform

A focused MVP that helps learners repeatedly practice Low-Level Design (LLD) problems and receive explainable, rubric-based feedback from a human evaluator.

Core loop: **Choose Problem → Think/Design → Submit → Get Feedback → Review → Try Again**

Built as a 2-day engineering assignment (CipherSchools Full Stack Development internship).

---

## Project Overview

Learners browse a small set of seeded LLD problems (Parking Lot, Elevator System, Vending Machine, Library Management System), start an attempt, fill out a structured design submission (assumptions, requirements, classes, relationships, patterns, edge cases, trade-offs, optional pseudocode), and submit it for review. An admin evaluates the submission against a fixed 100-point rubric and leaves criterion-level, explainable feedback. The learner sees the score breakdown, strengths, improvements, and focus areas, and can retry the same problem as a brand-new attempt while their history is preserved.

## Features

- Learner: browse problems, view problem details, start/save/submit a structured LLD attempt
- Admin: dashboard of pending/completed reviews, rubric-based evaluation form
- Fixed 8-criterion rubric (100 points total) with evidence/concern/suggestion per criterion
- Explainable feedback: score + rubric breakdown + strengths + improvements + next-attempt focus
- Attempt history with score-over-attempts comparison (delta vs previous attempt)
- Retry flow: creates a brand-new, independent attempt; previous attempts are immutable
- Explicit attempt state machine (`IN_PROGRESS → SUBMITTED → EVALUATING → COMPLETED/FAILED`)
- Evaluation failures never delete the learner's submission
- Evaluator abstraction (`Evaluator` interface + `HumanEvaluator`) ready for future AI/rule-based evaluators
- Role-based JWT authentication (`LEARNER` / `ADMIN`), no OAuth/MFA/email verification
- Centralized backend validation and error handling

## Tech Stack

- **Frontend:** React, JavaScript (no TypeScript), Vite, React Router, Tailwind CSS
- **Backend:** Node.js, Express, JavaScript (no TypeScript)
- **Database:** MongoDB, Mongoose
- **Auth:** JWT (jsonwebtoken), bcryptjs for password hashing
- **Validation:** Zod
- **Testing:** Vitest, mongodb-memory-server

## Architecture

```text
                    React Frontend
                          |
                       REST API
                          |
                          v
                  Express Backend
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
    ProblemService   AttemptService   EvaluationService
          |               |               |
          +---------------+---------------+
                          |
                          v
                       MongoDB
                          |
                          v
                    HumanEvaluator
```

Simple monolithic MERN app. No Kafka, Redis, microservices, or other distributed-systems infrastructure — see `DESIGN.md` for the reasoning.

## Setup

```bash
git clone <repository>
cd lld-platform

cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Backend (`backend/.env`, copy from `backend/.env.example`):

```env
MONGODB_URI=mongodb://localhost:27017/lld-practice
JWT_SECRET=change-this-secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

Frontend (`frontend/.env`, copy from `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

Do not commit `.env` files or real secrets.

## Seed Data

Seeds the 4 LLD problems and two demo users (a learner and an admin):

```bash
cd backend
npm run seed
```

Demo logins after seeding:

- Learner: `learner@demo.com` / `learner123`
- Admin: `admin@demo.com` / `admin123`

## Running Locally

Backend (from `backend/`):

```bash
npm run dev
```

Frontend (from `frontend/`):

```bash
npm run dev
```

Then open `http://localhost:5173` and log in with a demo account.

## Test Commands

Backend tests (Vitest + an in-memory MongoDB instance):

```bash
cd backend
npm test
```

> Note: `mongodb-memory-server` downloads a MongoDB binary the first time tests run. This requires outbound internet access to `fastdl.mongodb.org` (or a pre-cached binary / `MONGOMS_*` env vars pointing at a local MongoDB). In network-restricted environments, point `MONGODB_URI` at a real local MongoDB instance instead and adapt the test setup accordingly.

## Deployment

Designed to run on free/low-cost services:

- Backend: any Node host with MongoDB connectivity (e.g. Render, Railway, Fly.io, Vercel) + a free-tier MongoDB Atlas cluster
- Frontend: any static host (e.g. Vercel, Netlify) pointing `VITE_API_URL` at the deployed backend
- No LLM API key is required anywhere — the app is fully functional with human evaluation only
- If frontend and backend are deployed separately, set `CLIENT_URL` (backend) and `VITE_API_URL` (frontend) correctly and never expose `MONGODB_URI`/`JWT_SECRET` in frontend code

### Deploying both to Vercel

The repo is set up as two separate Vercel projects — one for `backend/`, one for `frontend/` — connected by an environment variable. Vercel doesn't run a long-lived Express server directly, so the backend is wrapped as a serverless function at `backend/api/index.js`; `backend/vercel.json` rewrites every request to it so Express's own `/api/*` routes still match unchanged.

**1. Set up MongoDB Atlas** (or any reachable MongoDB) and copy its connection string — you'll need it as `MONGODB_URI` below. Vercel's serverless functions can't reach a `localhost` database.

**2. Deploy the backend:**
- In Vercel, "Add New Project" → import the repo → set **Root Directory** to `backend`.
- Framework preset: "Other" (no build step needed, it's plain Node/Express).
- Add these Environment Variables (Project Settings → Environment Variables):
  - `MONGODB_URI` — your Atlas connection string
  - `JWT_SECRET` — a long random string
  - `CLIENT_URL` — your frontend's Vercel URL, e.g. `https://your-frontend.vercel.app` (comma-separate multiple origins, e.g. production + a preview URL, if needed)
- Deploy. Confirm it's up: `https://your-backend.vercel.app/api/health` should return `{"success":true,"message":"ok"}` (this endpoint doesn't touch the database, so it also verifies the deployment itself before you debug DB connectivity).
- Seed the database once, from your own machine, pointed at the same Atlas cluster: set `MONGODB_URI` in a local `backend/.env` to the Atlas string and run `npm run seed` from `backend/`. (Seeding isn't run automatically on deploy.)

**3. Deploy the frontend:**
- "Add New Project" → same repo → **Root Directory** set to `frontend`.
- Framework preset: Vite (auto-detected).
- Add Environment Variable: `VITE_API_URL` = `https://your-backend.vercel.app/api` (note the `/api` suffix — the frontend's API calls already assume it).
- Deploy. `frontend/vercel.json` adds an SPA rewrite so client-side routes (e.g. `/problems`, `/history`) work correctly on refresh/direct-link instead of 404ing.

**4. If you change the frontend's URL later** (e.g. after the first deploy gives you the real `*.vercel.app` domain), update `CLIENT_URL` on the backend project and redeploy the backend so CORS allows it.

## Limitations

Intentionally not included in this MVP:

- No AI/LLM-based evaluation (human evaluator only)
- No diagram/UML editor or code execution environment — submissions are structured text
- No OAuth, email verification, password reset, or MFA
- No admin UI for creating/editing problems (problems are seeded)
- No notifications, payments, social features, gamification, or analytics dashboards
- No Kafka/Redis/microservices/Kubernetes/queues/WebSockets — a simple monolith is sufficient at this scale

Human evaluation was intentionally chosen for the MVP because LLD problems can have multiple valid solutions and explainable expert feedback is important.

## Future Improvements

- `AIEvaluator` implementing the existing `Evaluator` interface, for automated first-pass feedback
- Optional diagram submission (e.g. a lightweight UML/ER canvas)
- Optional code submission and execution for problems that warrant it
- A background evaluation worker/queue if evaluation volume grows significantly
- Assigning specific evaluators/reviewers to submissions
- Richer analytics on learner improvement over time
