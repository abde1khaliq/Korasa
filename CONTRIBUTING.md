# Contributing to Korasa

Thank you for your interest in contributing to Korasa! Korasa is an open-source study revision and question organizer built to help learners master subjects through structured organization, periodic scheduling, and active exam practice.

This guide will help you set up your local development environment and submit high-quality contributions.

---

## Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

---

## Monorepo Architecture

Korasa is organized as a monorepo with three core workspaces:

```
Korasa Project/
├── backend/       # Go REST API (Gin, GORM, PostgreSQL)
├── interface/     # Web Frontend (Next.js 16 App Router, TypeScript, TailwindCSS v4)
└── application/   # Mobile App (Expo 54, React Native, NativeWind, TypeScript)
```

---

## Getting Started

### Prerequisites
- **Go**: `1.22+` (or latest stable)
- **Node.js**: `20+` & **Bun**: `1.1+`
- **PostgreSQL**: `14+`
- **Expo CLI** (for mobile development): `npm install -g expo-cli`

---

### Local Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/abde1khaliq/korasa.git
cd korasa
```

#### 2. Configure & Run the Backend
```bash
cd backend
cp .env.example .env

# Edit .env with your local PostgreSQL credentials and test JWT secrets
# Run database migrations (using golang-migrate or CLI)
go mod download
go run ./cmd/server
```
The backend API will start on `http://localhost:8080` (with a health check at `http://localhost:8080/health`).

#### 3. Configure & Run the Web Frontend
```bash
cd ../interface
cp .env.example .env.local

# Install dependencies and start development server
bun install
bun dev
```
The web application will be accessible at `http://localhost:3000`.

#### 4. Configure & Run the Mobile App (Optional)
```bash
cd ../application
cp .env.example .env

# Install dependencies and launch Expo
bun install # or npm install
npx expo start
```

---

## Development Workflow

1. **Create an Issue**: Before starting substantial work, open an issue or check existing ones to discuss the proposed change.
2. **Branching**: Create a branch off `main` with a descriptive name:
   - `feature/add-dark-mode`
   - `fix/question-upload-validation`
   - `docs/update-api-reference`
3. **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(exam): add timer countdown alert`
   - `fix(auth): prevent token exposure in logs`
   - `docs: update setup guide in README`
   - `test(backend): add ownership isolation test`
4. **API Contracts**: If modifying a Go request/response DTO, ensure the corresponding TypeScript types in `interface/` and `application/` are kept in sync.

---

## Code Quality & Standards

### Go (Backend)
- Keep handlers thin: parse/validate input, invoke services, format response.
- Always validate inputs using `validator/v10` struct tags.
- Enforce tenant isolation at the query level (`WHERE subjects.user_id = ?`).
- Run all tests before submitting:
  ```bash
  cd backend
  go test -v ./...
  ```

### TypeScript / React (Web & Mobile)
- Use functional components with TypeScript interfaces.
- One component per file; avoid inline business logic in component bodies.
- Run linting and formatting:
  ```bash
  cd interface
  bun lint
  ```

---

## Submitting a Pull Request

1. Push your branch to your fork.
2. Open a Pull Request against the `main` branch.
3. Fill out the PR template completely with a summary of changes, rationale, and testing steps.
4. Ensure all automated checks and tests pass.
5. Respond to any code review comments. Once approved, your PR will be merged!

---

## Questions or Need Help?
- Open a GitHub Discussion or Issue.
- Reach out to the maintainers at [support@korasa.study](mailto:support@korasa.study).
