# Library Management System

Full-stack library app (React + Node/Express + MongoDB) with three modules — **Maintenance**, **Reports**, **Transactions** — and role-based access (Admin / User).

---

## Features

| Module | Feature | Admin | User |
|---|---|:-:|:-:|
| Maintenance | User Management (New / Existing) | ✅ | ❌ |
| Maintenance | Add / Update Membership (6m / 1y / 2y, extend / cancel) | ✅ | ❌ |
| Maintenance | Add / Update Book or Movie | ✅ | ❌ |
| Reports | Book Availability Search | ✅ | ✅ |
| Transactions | Book Issue (max 15-day loan) | ✅ | ✅ |
| Transactions | Return Book → Fine Payment (₹5 / day late, configurable) | ✅ | ✅ |

All forms enforce required-field and date validations on **both** client and server. Errors render inline without reload.

---

## Tech Stack

- **Backend**: Node.js 18+, Express, Mongoose, JWT, bcryptjs, express-validator
- **Frontend**: React 18 (Vite), react-router-dom v6, axios
- **Database**: MongoDB (local or Atlas)

---

## Project Structure

```
Library-management-system/
├── backend/
│   ├── src/
│   │   ├── config/        Mongo connection
│   │   ├── models/        Mongoose schemas
│   │   ├── controllers/   Business logic
│   │   ├── routes/        Express routers
│   │   ├── middleware/    auth / validation / error handler
│   │   ├── utils/         dates, fine calculation
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/seed.js    Demo data
│   └── .env.example
├── frontend/
│   └── src/
│       ├── api/           Axios client
│       ├── auth/          AuthContext + ProtectedRoute
│       ├── components/    Layout, FormError
│       ├── pages/
│       │   ├── maintenance/
│       │   ├── reports/
│       │   └── transactions/
│       ├── App.jsx        Route table
│       └── main.jsx
└── package.json           Root (concurrently runs both servers)
```

---

## Setup & Run

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (default URI `mongodb://127.0.0.1:27017/library_mgmt`) **or** a MongoDB Atlas connection string.

### 1. Install dependencies

```bash
# From the project root
npm run install:all
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set MONGODB_URI and JWT_SECRET.
```

### 3. Seed demo data

```bash
npm run seed
```

Seeded accounts:

| Username | Password | Role | Notes |
|---|---|---|---|
| `admin` | `admin123` | admin | Full access |
| `john`  | `user123`  | user  | Linked to membership **M0001**; has 1 overdue issue of *Sapiens* (`B004`) to demo the fine flow |

### 4. Start dev servers

```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173  (Vite proxies `/api` → backend)

---

## API Endpoints

All routes below (except `POST /api/auth/login`) require `Authorization: Bearer <token>`.

| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET / POST / PUT | `/api/users` | Admin |
| GET | `/api/users/by-username/:username` | Admin |
| POST | `/api/memberships` | Admin |
| GET | `/api/memberships/:no` | Admin |
| PUT | `/api/memberships/:no/extend` | Admin |
| PUT | `/api/memberships/:no/cancel` | Admin |
| GET | `/api/books`, `/api/books/:id` | Authenticated |
| POST / PUT | `/api/books` | Admin |
| GET | `/api/reports/books?title=&author=&type=&category=&serialNo=` | Authenticated |
| POST | `/api/transactions/issue` | Authenticated |
| POST | `/api/transactions/return` | Authenticated |
| POST | `/api/transactions/:id/fine` | Authenticated |
| GET | `/api/transactions/:id` | Authenticated |

**Error shape** — either `{ message: "..." }` (top-level) or `{ errors: [{ field, msg }] }` (field-level).

---

## Database Schema (Mongoose)

- **User** — `username` (unique), `passwordHash`, `name`, `email`, `phone`, `role` ∈ {`admin`, `user`}
- **Membership** — `membershipNo` (M0001…), `userId`, `startDate`, `endDate`, `status` ∈ {`active`, `cancelled`, `expired`}
- **Book** — `serialNo` (unique), `title`, `author`, `type` ∈ {`Book`, `Movie`}, `category`, `publisher`, `copiesTotal`, `copiesAvailable`
- **Transaction** — `bookId`, `membershipId`, `issueDate`, `returnDate`, `actualReturnDate`, `fine`, `finePaid`, `remarks`, `status` ∈ {`issued`, `returned`, `closed`}

---

## Validation Highlights

- **Login** — both fields required; password uses `<input type="password">`.
- **Add User** — `name` mandatory (spec); new/existing radio defaults to **new**.
- **Membership** — all fields mandatory; duration radio defaults to **6 months**.
- **Add / Update Book** — every field mandatory (client + server); Book/Movie radio defaults to **Book**.
- **Report Search** — at least one filter must be non-empty; if empty, error is shown on the same page.
- **Book Issue** — `issueDate ≥ today`; `returnDate ≤ issueDate + 15` days; `returnDate ≥ issueDate`.
- **Return → Fine** — `serialNo` required; on submit, redirect to Fine Payment. If fine > 0, the "Fine Paid" checkbox must be ticked before completion.

---

## Verification Walkthrough

1. Login as `admin/admin123`. Confirm **Maintenance** is in the nav.
2. Login as `john/user123`. Confirm **Maintenance** is **not** shown; visiting `/maintenance` redirects to the dashboard.
3. **Maintenance**:
   - Add a new user → leave Name empty → inline error.
   - Create a membership (6 months default) → confirm `endDate` is +6 months.
   - Look up `M0001` → extend → confirm `endDate` pushes out by 6 months.
   - Add a book → submit empty form → inline errors for every required field.
4. **Reports** — empty search → "Please fill at least one search field" error. Search by title "clean" → table with radio-selectable rows.
5. **Transactions**:
   - Issue: pick `The Pragmatic Programmer` for `M0001`, change Return Date to >15 days → error. Happy path → success; `copiesAvailable` decrements.
   - Return: serial `B004`, membership `M0001` → redirected to Fine Payment with non-zero fine (seeded overdue). Try submitting without checking "Fine Paid" → error. Check it → "Transaction completed" and book returns to shelf.
   - Fine = 0 path: issue a book today, return immediately → Fine Payment allows direct completion with the checkbox disabled.

---

## Assumptions

1. **Fine rate** = ₹5 / day late (configurable via `FINE_PER_DAY` in `backend/.env`).
2. **Book picker for Issue / Return** is a searchable dropdown from the catalog rather than free text — avoids typos and lets us auto-fill the author reliably (spec calls for non-editable author).
3. **Serial number** uniqueness is at the catalog level; multiple physical copies of the same title are tracked via `copiesTotal` / `copiesAvailable` counters on one `Book` document.
4. **"Existing User"** radio switches the User Management form into lookup-then-edit mode (by username); "New User" creates.
5. Authentication is **JWT** (stateless) — simpler than sessions for a React SPA.
6. Dates stored as UTC ISO strings; client formats to the user's locale.
7. A cancelled membership cannot be extended (must be re-created).

---

## Scripts Reference

| From | Command | What it does |
|---|---|---|
| root | `npm run install:all` | Install root + backend + frontend deps |
| root | `npm run seed` | Wipe DB and load demo data |
| root | `npm run dev` | Run backend and frontend concurrently |
| backend/ | `npm run dev` | Nodemon server on :5000 |
| frontend/ | `npm run dev` | Vite on :5173 |
