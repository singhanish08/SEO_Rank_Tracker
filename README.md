# RankPilot — SEO Rank Tracker

AI-powered SEO analysis and Google keyword rank tracking tool. Analyzes any website for SEO issues using real browser rendering and Gemini AI, and tracks your keyword positions on Google SERPs daily.

## Features

### SEO Analysis
- Scrapes any public URL via Browserbase (real Chromium browser)
- Extracts meta tags, headings, links, images, page structure
- AI analysis via Google Gemini — scores SEO, Performance, Accessibility, Best Practices
- Identifies issues (critical/warning/info) with actionable recommendations
- Keyword extraction and density analysis
- Daily analysis limit (5/day for free users)

### Rank Tracker
- Tracks keyword positions on Google search results (up to page 5)
- Daily automated rank checking via Vercel Cron (6 AM UTC)
- Rank history chart and position change tracking
- Competitor identification for each keyword
- Manual refresh with rate limiting

### Auth & User Management
- Email/password registration with JWT auth
- Email verification and password reset (via Nodemailer + Gmail SMTP)
- Free plan with usage limits

## Tech Stack

### Server
| Technology | Purpose |
|------------|---------|
| Node.js / Express | API server |
| MongoDB / Mongoose | Database |
| Browserbase + Playwright | Cloud browser automation |
| Google Gemini (`@google/genai`) | AI SEO analysis |
| Nodemailer | Email (verification, password reset) |
| `@vercel/functions` | Serverless function lifecycle |
| jsonwebtoken | JWT auth |
| bcrypt | Password hashing |
| express-rate-limit | Rate limiting |
| node-cron | Local cron scheduling |

### Client
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| React Router v7 | Routing |
| Axios | HTTP client |
| Lucide React | Icons |
| react-hot-toast | Notifications |

## Project Structure

```
SEO_Rank_Tracker/
├── client/                     # React frontend
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Analyze.tsx
│   │   │   ├── Report.tsx
│   │   │   ├── History.tsx
│   │   │   ├── RankTracker.tsx
│   │   │   ├── RankDetail.tsx
│   │   │   ├── VerifyEmail.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── ScoreGauge.tsx
│   │   │   ├── IssueCard.tsx
│   │   │   ├── AnalysesCard.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── VerificationBanner.tsx
│   │   │   └── home/           # Landing page components
│   │   ├── context/
│   │   │   ├── AppContext.tsx   # Auth + API state
│   │   │   └── ThemeContext.tsx # Dark/light theme
│   │   ├── assets/assets.tsx   # Dummy data, icons
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   └── vercel.json
├── server/                     # Express backend
│   ├── server.js               # Entry point
│   ├── config/db.js            # MongoDB connection
│   ├── middleware/auth.js       # JWT auth middleware
│   ├── controllers/
│   │   ├── authController.js   # Register, login, email flow
│   │   ├── analysisController.js # SEO analysis CRUD
│   │   └── rankController.js   # Keyword rank tracking CRUD
│   ├── models/
│   │   ├── User.js
│   │   ├── Analysis.js
│   │   └── keywordTracking.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── analysisRoutes.js
│   │   └── rankRoutes.js
│   ├── services/
│   │   ├── scraperService.js       # Browserbase page scraping
│   │   ├── rankTrackerService.js   # Google SERP scraping
│   │   ├── keywordTrackingService.js # Rank logic + retries
│   │   ├── geminiService.js        # AI analysis
│   │   └── emailService.js         # Nodemailer Gmail SMTP
│   ├── cron/rankTrackingCron.js    # Local daily cron
│   └── vercel.json
└── .gitignore
```

## Setup

### Prerequisites
- Node.js 20+
- MongoDB Atlas (or local MongoDB)
- A Gmail account with 2FA + App Password

### Environment Variables

**`server/.env`**

```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
BROWSERBASE_API_KEY=your_browserbase_api_key
GEMINI_API_KEY=your_gemini_api_key
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
FRONTEND_URL=http://localhost:5173
CRON_SECRET=your_cron_secret
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.vercel.app
```

**`client/.env`**

```env
VITE_BACKEND_URL=http://localhost:5000
```

### Install & Run

```bash
# Server
cd server
npm install
npm run server    # or: npm start

# Client (separate terminal)
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:5000`.

## Deployment

Both client and server deploy independently on Vercel.

### Server (Vercel)
1. Push server to a Vercel project
2. Set all environment variables in Vercel Dashboard
3. Vercel Cron (Pro plan) runs daily rank checks at 6 AM UTC
4. `@vercel/functions` `waitUntil()` keeps the function alive for email delivery

### Client (Vercel)
1. Push client to a separate Vercel project
2. Set `VITE_BACKEND_URL` to the deployed server URL
3. Configure `FRONTEND_URL` on the server to point to the deployed client URL

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/user` | Yes | Get current user |
| GET | `/api/auth/verify-email?token=` | No | Verify email |
| POST | `/api/auth/resend-verification` | Yes | Resend verification email |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password |

### Analysis
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/analysis/analyze` | Yes | Start SEO analysis |
| GET | `/api/analysis/list` | Yes | List analyses (paginated) |
| GET | `/api/analysis/:id` | Yes | Get analysis details |
| DELETE | `/api/analysis/:id` | Yes | Delete analysis |

### Rank Tracker
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/rank/add` | Yes | Track a keyword |
| GET | `/api/rank/list` | Yes | List tracked keywords |
| GET | `/api/rank/:id` | Yes | Get keyword details |
| POST | `/api/rank/:id/refresh` | Yes | Manual rank check |
| PUT | `/api/rank/:id/toggle` | Yes | Pause/resume tracking |
| DELETE | `/api/rank/:id` | Yes | Delete keyword tracking |
| GET | `/api/rank/run-scheduled` | Cron | Cron-triggered batch check |
