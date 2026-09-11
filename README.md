<div align="center">

# 📚 Korasa (كُرّاسة)

**A modern, open-source study revision and question organizer.**

Organize questions into folders, folders into subjects, generate custom practice exams, and schedule periodic lessons.

[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2057-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Live Web App](https://korasa.study) • [Features](#-features) • [Quickstart](#-quickstart) • [Architecture](#-architecture) • [API Overview](#-api-endpoints) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

**Korasa** is a study application designed to help students organize their revision materials, test themselves with custom-generated exams, and never forget their lessons' schedules.

---

## ✨ Features

- 📁 **Structured Study Hierarchy**: Organize notes and questions hierarchically (`Subject → Folder → Question`).
- 📸 **Rich Question Bank & Camera Capturing**: Upload screenshots and photos of practice problems.
- 🎯 **Dynamic Exam Engine**:
  - **Practice Mode**: Test yourself without time pressure.
  - **Timed Mode**: Simulate real exam conditions with strict time limits.
  - **Full Scope Mode**: Exhaustively cover all questions in a subject or folder.
  - **Attempt Analytics**: Review scoring history, correct answer distributions, and completion times.
- 📅 **Periodic Lesson Timetable**: Schedule recurring weekly lectures, tutorials, and study blocks with upcoming lesson tracking.

---

## 🏗 Architecture

```
Korasa Project/
├── backend/                  # High-performance Go REST API
│   ├── cmd/server/           # Application entrypoint & HTTP server
│   ├── config/               # Environment config & startup validation
│   ├── internal/             # Core business logic, DTOs, models & services
│   ├── migrations/           # PostgreSQL migration scripts (golang-migrate)
│   └── Dockerfile            # Container build definition
├── interface/                # Web Frontend
│   ├── app/                  # Next.js 16 App Router (pages & API routes)
│   ├── components/           # Modular React 19 UI components
│   └── public/               # Static assets & icons
└── application/              # Cross-Platform Mobile App
    ├── app/                  # Expo Router file-based navigation
    ├── context/              # Authentication & global application state
    └── components/           # Mobile UI primitives & screens
```

---

## 🚀 Quickstart

### Prerequisites
- **Go** `1.22+`
- **Node.js** `20+` & **Bun** `1.1+` (or npm/yarn)
- **PostgreSQL** `14+`
- **Cloudinary Account** (for image storage)
- **Resend Account** (for verification & password reset emails)

---

### 1. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your PostgreSQL database URL, Cloudinary, and Resend keys
# Ensure JWT_SECRET and JWT_REFRESH_SECRET are 32+ character random strings:
# openssl rand -hex 32

# Download dependencies & run migrations
go mod download

# Start the Go server (default: port 8080)
go run ./cmd/server
```

Health check:
```bash
curl http://localhost:8080/health
# {"status":"healthy"}
```

---

### 2. Web Interface Setup

```bash
cd ../interface

# Copy environment template
cp .env.example .env.local

# Install dependencies with bun (or npm)
bun install

# Start Next.js development server (default: port 3000)
bun dev
```

Visit [`http://localhost:3000`](http://localhost:3000) in your browser.

---

### 3. Mobile App Setup (React Native / Expo)

```bash
cd ../application

# Copy environment template
cp .env.example .env

# Install dependencies
bun install # or npm install

# Start Expo development server
npx expo start
```
Use the Expo Go app on your physical iOS/Android device or launch an emulator.

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `PORT` | HTTP server port | `8080` |
| `POSTGRES_DATABASE_URL` | PostgreSQL connection string | *Required* |
| `JWT_SECRET` | HMAC secret for access tokens (min 32 chars) | *Required* |
| `JWT_REFRESH_SECRET` | HMAC secret for refresh tokens (min 32 chars) | *Required* |
| `RESEND_API_KEY` | Resend API key for transactional emails | *Required for auth emails* |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier | *Required for image uploads* |
| `CLOUDINARY_API_KEY` | Cloudinary API access key | *Required for image uploads* |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | *Required for image uploads* |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `http://localhost:3000` |

### Web Interface (`interface/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Base URL of the Go backend API | `http://localhost:8080` |
| `NEXTAUTH_URL` | NextAuth canonical URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth session encryption secret | *Required* |

---

## 📡 API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` — Register a new account & receive email verification code
- `POST /auth/verify` — Verify 6-digit email code & finalize account
- `POST /auth/login` — Authenticate with email and password
- `POST /auth/refresh` — Refresh short-lived access token
- `POST /auth/forgot-password` — Initiate password reset code
- `POST /auth/verify-reset-code` — Validate password reset code
- `POST /auth/reset-password` — Set new password with verified code
- `PATCH /auth/onboarding-complete` — Mark user onboarding as finished (Auth required)

### Subjects & Folders (`/api/subjects`)
- `GET /api/subjects` — List all subjects with folder & question counts
- `GET /api/subjects/recent` — Fetch the most recently updated subject
- `POST /api/subjects` — Create a new subject
- `GET /api/subjects/:subjectID` — Retrieve subject details
- `PATCH /api/subjects/:subjectID` — Update subject name
- `DELETE /api/subjects/:subjectID` — Delete subject and cascade delete folders/questions
- `GET /api/subjects/:subjectID/folders` — List folders inside a subject
- `POST /api/subjects/:subjectID/folders` — Create a folder inside a subject
- `PUT /api/subjects/:subjectID/folders/:folderID` — Update a folder name
- `DELETE /api/subjects/:subjectID/folders/:folderID` — Delete a folder

### Questions (`/api/folders` & `/api/questions`)
- `GET /api/folders/:folderID/questions` — List questions in a folder
- `POST /api/folders/:folderID/questions` — Upload question image & create question (Multipart)
- `GET /api/questions/:questionID` — Retrieve single question
- `PUT /api/questions/:questionID` — Update question text, answer, difficulty, note
- `DELETE /api/questions/:questionID` — Delete question & Cloudinary image asset

### Custom Exams (`/api/exams`)
- `GET /api/exams` — List all user exams
- `POST /api/exams` — Generate exam from subject/folder question pool
- `GET /api/exams/eligible-count` — Count eligible questions by scope & difficulty
- `GET /api/exams/:examID` — Get exam details & past attempts summary
- `PATCH /api/exams/:examID` — Rename an exam
- `DELETE /api/exams/:examID` — Delete an exam and attempt history
- `POST /api/exams/:examID/attempts` — Start new shuffled exam attempt
- `PUT /api/exams/:examID/attempts/:attemptID/complete` — Submit answers & auto-grade attempt
- `GET /api/exams/:examID/attempts` — View attempt history for an exam
- `GET /api/exams/:examID/attempts/:attemptID` — View detailed attempt breakdown

### Timetable Lessons (`/api/lessons`)
- `GET /api/lessons` — List recurring weekly lessons (filterable by `day_of_week`, `subject_id`)
- `GET /api/lessons/upcoming` — List next upcoming lessons chronologically
- `POST /api/lessons` — Create single or batch recurring lessons across days
- `GET /api/lessons/:lessonID` — Get lesson details
- `PUT /api/lessons/:lessonID` / `PATCH /api/lessons/:lessonID` — Update lesson
- `DELETE /api/lessons/:lessonID` — Delete lesson

---

### Web Linting
```bash
cd interface
bun lint
```

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see our [**Contributing Guide**](CONTRIBUTING.md) and [**Code of Conduct**](CODE_OF_CONDUCT.md) for details on getting started, coding standards, and our pull request workflow.

---

## 🔒 Security & Vulnerability Reporting

If you discover a security vulnerability, please review our [**Security Policy**](SECURITY.md) and disclose it responsibly via [security@korasa.study](mailto:security@korasa.study).

---

## 📄 License

Distributed under the MIT License. See [**LICENSE**](LICENSE) for more information.

<div align="center">
  <sub>Built with ❤️ for learners worldwide by the Korasa Community.</sub>
</div>
