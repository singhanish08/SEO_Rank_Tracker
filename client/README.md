# RankPilot — Client

React frontend for RankPilot, an AI-powered SEO analysis and keyword rank tracking tool.

## Tech Stack

- React 19 + TypeScript
- React Router 7
- Vite 8
- Tailwind CSS 4
- Axios
- Lucide React + React Simple Icons
- React Hot Toast

## Setup

```bash
npm install
npm run dev
```

Defaults to `http://localhost:5173`.

## Environment Variables

```env
VITE_BACKEND_URL=http://localhost:5000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |

## Deployment

Deploy as a Vercel project. Set `VITE_BACKEND_URL` to the deployed API URL.
