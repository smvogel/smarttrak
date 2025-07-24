# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth with SSR
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel (configured)

### Core Structure

**Frontend Architecture:**
- App Router pattern in `/app` directory
- Server-side rendering with Supabase SSR integration
- Component structure: `/app/components/[category]/[component].tsx`
- Global navigation component in all layouts
- Custom auth forms with server actions

**Authentication Flow:**
- Supabase Auth with email/password and OAuth
- SSR configuration via `/utils/supabase/server.ts`
- Middleware handles session refresh at `/middlewareTEMP.ts`
- Auth actions in `/app/auth/actions.ts`
- Protected routes via middleware matcher

**Database Schema (Prisma):**
- Comprehensive service tracking system for repair shops
- Core entities: User, ServiceTask, StatusUpdate, ActivityLog
- Support for label printing, attachments, and analytics
- Enum-driven status workflow: FUTURE → IN_SHOP → IN_PROGRESS → COMPLETED → CLOSED

### Key Directories

- `/app` - Next.js app router pages and components
- `/lib` - Shared utilities (auth, prisma, supabase clients)
- `/utils` - Supabase client configurations (client, server, middleware)
- `/types` - TypeScript type definitions for auth and supabase
- `/contexts` - React context providers (AuthContext placeholder)
- `/prisma` - Database schema and migrations

### Environment Variables Required

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Business Domain

This is a workflow management system for service businesses (bike shops, repair services). The core workflow moves service tasks through status stages with role-based user management, activity logging, and label printing capabilities.

### Code Patterns

- Use TypeScript path mapping (`@/*` imports)
- Server components by default, client components when needed
- Supabase client creation pattern varies by context (server vs client vs middleware)
- Prisma client instantiation in `/lib/prisma.ts`
- Form submissions use Server Actions pattern