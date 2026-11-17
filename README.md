# ViceAtlas

A community-powered discovery network for GTA VI. Unofficial fan project; not affiliated with Rockstar Games.

## Stack

- Next.js App Router + TypeScript
- PostgreSQL + Prisma
- Better Auth (email/password)
- MapLibre GL
- Tailwind CSS v4

## Requirements

- Node.js 20.9+
- pnpm 9+
- Docker (for local PostgreSQL)

## Local setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Open http://localhost:3000.

Set a strong `BETTER_AUTH_SECRET` in `.env` before deploying. Keep `.env` out of Git.

## First implementation

Included:
- Dark ViceAtlas landing page
- MapLibre map view (demo basemap; no API key required)
- Prisma data model for users, discoveries, evidence, votes, comments and tags
- Better Auth email/password API integration
- Sign-up and sign-in screens
- Discovery submission endpoint (authenticated)
- Discovery feed and detail pages

## API

- `GET /api/discoveries?category=MYSTERY&q=...&take=20`
- `POST /api/discoveries` (requires session)

Example POST body:

```json
{
  "title": "Unusual lights beneath the pier",
  "description": "At night, several lights can be seen beneath the pier. Return after sunset and look toward the water.",
  "category": "MYSTERY",
  "region": "Vice City",
  "latitude": 25.77,
  "longitude": -80.19
}
```

## Important product notes

- The demo map currently uses a generic MapLibre demo style and a Miami-area starting camera. It is not an official GTA VI map.
- Do not redistribute Rockstar assets, game files, extracted maps, audio or other copyrighted material without permission.
- Discovery verification is deliberately conservative. Community votes are signals, not proof.

## Next milestones

1. Add evidence upload with signed Cloudflare R2 URLs.
2. Add voting, comments and moderation endpoints.
3. Add map search, category filters and marker clustering.
4. Add rate limiting, spam protection and admin review.
5. Add OG image generation and public contributor profiles.
