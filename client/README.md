# RankPilot

RankPilot is a full-stack SEO analysis and keyword rank-tracking application. It renders target pages in a managed browser, uses Gemini to produce SEO recommendations, and tracks Google positions and competitors over time.

## Features

- AI-assisted SEO audits with category scores and actionable issues
- Rendered-page metadata, heading, link, image, content, and performance analysis
- Google keyword position tracking across the first five result pages
- Ranking history, position changes, and competitor discovery
- Email verification and password-reset authentication flows
- Responsive light and dark interfaces

## Tech stack

### Client

- React 19 and TypeScript
- React Router 7
- Vite 8
- Tailwind CSS 4
- Axios
- Lucide React and React Simple Icons
- React Hot Toast

### Server

- Node.js and Express 5
- MongoDB and Mongoose
- JSON Web Tokens and bcrypt
- Browserbase with Playwright Core
- Google Gemini via `@google/genai`
- Resend transactional email
- Express Rate Limit
- Node Cron for long-running Node deployments

### Deployment

The client and API have separate Vercel configurations. The client is a Vite single-page application; the server runs as a Vercel Node function. Manual rank checks run inside the API request so Vercel does not terminate them immediately after an early response.

> Continuously running Node deployments use the in-process cron. On Vercel, `vercel.json` schedules the protected `/api/rank/run-scheduled` endpoint each day at 06:00 UTC.

## Project structure

```text
RankPilot/
├── client/   React/Vite application
└── server/   Express API, MongoDB models, browser automation, and AI services
```

## Environment variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=replace-with-a-long-random-secret
BROWSERBASE_API_KEY=...
GEMINI_API_KEY=...
RESEND_API_KEY=...
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
CRON_SECRET=replace-with-another-long-random-secret
```

Create `client/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Use the deployed client URL for `FRONTEND_URL` and `ALLOWED_ORIGINS` in production. Multiple allowed origins may be supplied as a comma-separated list.

## Local development

Requirements: Node.js 20 or newer, npm, and a MongoDB database.

Install and run the API:

```bash
cd server
npm install
npm run server
```

In another terminal, install and run the client:

```bash
cd client
npm install
npm run dev
```

The client defaults to `http://localhost:5173` and the API defaults to `http://localhost:5000`.

## Validation and production builds

```bash
cd client
npm run lint
npm run build
```

Start the production API with:

```bash
cd server
npm start
```

## Deployment notes

1. Deploy `client` and `server` as separate Vercel projects.
2. Add the environment variables above to the correct project.
3. Set `VITE_BACKEND_URL` to the deployed API URL.
4. Set `FRONTEND_URL` and `ALLOWED_ORIGINS` to the deployed client URL.
5. Redeploy both projects after changing environment variables.

Google result markup and anti-automation behavior can change. RankPilot retries transient failures, but production monitoring should alert on repeated failed checks.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) and [LICENSE.md](LICENSE.md).
