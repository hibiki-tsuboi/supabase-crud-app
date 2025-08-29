# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (Next.js app available at http://localhost:3000)
- `npm run build` - Build application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality and style

## Architecture Overview

This is a Next.js 15.3.3 application with Supabase integration for user management CRUD operations. The app uses the App Router architecture with TypeScript and Tailwind CSS.

### Key Components:

**Frontend (App Router):**
- `src/app/page.tsx` - Main UI component with user management interface (create/read operations)
- `src/app/layout.tsx` - Root layout with Geist fonts
- Uses React 19 with client-side state management

**API Layer (Pages Router):**
- `pages/api/users.ts` - REST API handler for user operations (GET/POST)
- Handles user listing and creation with Supabase integration

**Database Integration:**
- `lib/supabaseClient.ts` - Supabase client configuration
- Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables
- Uses 'users' table with columns: id, name, email, created_at

### Tech Stack:
- **Framework:** Next.js 15.3.3 with App Router and Pages Router (hybrid)
- **Database:** Supabase with `@supabase/supabase-js`
- **Styling:** Tailwind CSS v4 
- **Icons:** Lucide React
- **TypeScript:** Strict mode enabled
- **Path Aliases:** `@/*` maps to `./src/*`

### Current Implementation Status:
- ✅ User listing (GET /api/users)
- ✅ User creation (POST /api/users) 
- ❌ User update (PUT/PATCH) - planned
- ❌ User deletion (DELETE) - planned
- ❌ User detail view - planned
- ❌ Authentication - planned

### Environment Setup:
Requires Supabase environment variables to be configured for database operations.

### API Testing:
```bash
npm run dev
curl http://localhost:3000/api/users
```

Deployed at: https://supabase-crud-app-61cu.vercel.app/