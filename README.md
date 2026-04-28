# MarginType

Self-hosted, minimalist writing app foundation for book authors.

## Stack
- Next.js App Router + React + TypeScript
- Tailwind CSS
- Tiptap editor
- PostgreSQL + Prisma
- Cookie/session auth (self-hostable)
- Docker Compose (+ Redis, optional Ollama)

## Setup (local)
1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Install deps:
   ```bash
   npm install
   ```
3. Prisma setup:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
   `npm run dev` now runs `prisma generate` first, so `@prisma/client` is always initialized before Next.js starts.
   It also runs an optional initial-admin bootstrap from `.env` (`INIT_ADMIN_*`).

## Setup (Docker)
```bash
docker compose up --build
```
The compose app command runs `prisma generate`, waits for DB readiness, and applies `prisma db push` before starting the dev server.
(`migrate deploy` requires migration files; this scaffold currently syncs from `schema.prisma` on first run.)
If you customize Docker build steps, keep `prisma/schema.prisma` available before any `npm install`/`postinstall` that triggers `prisma generate`.

## Optional initial user (from `.env`)
Set these variables in `.env`:

```env
INIT_ADMIN_EMAIL=admin@example.com
INIT_ADMIN_PASSWORD=changeme
INIT_ADMIN_NAME=Initial Admin
```

On startup (`npm run dev`), if the user does not exist yet, it will be created automatically. Existing users are not overwritten.
If tables are not migrated yet (or DB is still booting), bootstrap skips without crashing.

## Current foundation included
- Registration/login/logout/session handling
- Dashboard and project creation
- Role model (OWNER/AUTHOR/COLLABORATOR)
- Book workspace with:
  - chapter sidebar
  - manuscript area (book-like visual)
  - margin notes panel
- Tiptap essentials + autosave JSON document
- Planned chapter creation + chapter details modal
- Notes creation from selected text snapshot
- Project settings with export section + local AI placeholders
- i18n dictionary structure with German default

## Architecture notes
- Realtime collaboration hooks are intentionally TODO-marked for Yjs/Hocuspocus.
- Note anchoring currently stores selected-text snapshots; stable anchors are TODO.
- Export jobs and AI reports are modeled in Prisma for background-worker extension.

## Next recommended steps
1. Add robust server-side validation (zod schemas) for every server action.
2. Add member invitation/removal UI + enforcement in settings.
3. Add real export worker (Redis queue).
4. Add Yjs-backed collaboration for authors.
5. Add durable Tiptap mark-based note anchors.
