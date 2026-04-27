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

## Setup (Docker)
```bash
docker compose up --build
```
Then run migrations inside app container:
```bash
docker compose exec app npx prisma migrate deploy
```
The compose app command also runs `npx prisma generate` before starting the dev server to prevent first-boot Prisma client errors.
If you customize Docker build steps, keep `prisma/schema.prisma` available before any `npm install`/`postinstall` that triggers `prisma generate`.

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
