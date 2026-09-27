# RankPilot — Server

Express API for RankPilot — AI SEO analysis and Google keyword rank tracking.

## Tech Stack

- Node.js + Express 5
- MongoDB + Mongoose
- Browserbase + Playwright Core (cloud browser automation)
- Google Gemini (`@google/genai`)
- Nodemailer (Gmail SMTP for emails)
- JSON Web Tokens + bcrypt
- Express Rate Limit
- `@vercel/functions` (`waitUntil` for serverless email delivery)
- Node Cron (local deployments)

## Setup

```bash
npm install
npm run server    # or: npm start (production)
```

## Environment Variables

```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
BROWSERBASE_API_KEY=your_browserbase_api_key
GEMINI_API_KEY=your_gemini_api_key
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password
FRONTEND_URL=http://localhost:5173
CRON_SECRET=your_cron_secret
ALLOWED_ORIGINS=http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run server` | Start with nodemon (dev) |
| `npm start` | Start in production |

## Deployment (Vercel)

1. Push to a Vercel project
2. Set all environment variables in Vercel Dashboard
3. Cron scheduled at 6 AM UTC (Pro plan required):
   - Hits `GET /api/rank/run-scheduled` (protected by `CRON_SECRET`)
   - Processes active keyword trackings in batches of 2
4. Email sending uses `waitUntil()` to prevent Vercel from terminating the function before the SMTP handshake completes

## Services

| Service | File | Purpose |
|---------|------|---------|
| Scraper | `services/scraperService.js` | Browserbase + Playwright — scrapes any URL for SEO data |
| Rank Tracker | `services/rankTrackerService.js` | Browserbase + Playwright — searches Google SERPs for keyword positions |
| Keyword Tracking | `services/keywordTrackingService.js` | Retry logic around rank checks (3 attempts) |
| Gemini AI | `services/geminiService.js` | Google Gemini — analyzes scraped data, generates scores + issues |
| Email | `services/emailService.js` | Nodemailer — sends verification and password reset emails |

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/user` | Yes | Get current user |
| GET | `/api/auth/verify-email?token=` | No | Verify email |
| POST | `/api/auth/resend-verification` | Yes | Resend verification |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password |

### Analysis
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/analysis/analyze` | Yes | Start SEO analysis |
| GET | `/api/analysis/list?page=&limit=` | Yes | List analyses |
| GET | `/api/analysis/:id` | Yes | Get analysis |
| DELETE | `/api/analysis/:id` | Yes | Delete analysis |

### Rank Tracker
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/rank/add` | Yes | Track keyword |
| GET | `/api/rank/list` | Yes | List tracked keywords |
| GET | `/api/rank/:id` | Yes | Get keyword details |
| POST | `/api/rank/:id/refresh` | Yes | Manual rank check |
| PUT | `/api/rank/:id/toggle` | Yes | Pause/resume |
| DELETE | `/api/rank/:id` | Yes | Delete tracking |
| GET | `/api/rank/run-scheduled` | Cron | Batch daily check |
