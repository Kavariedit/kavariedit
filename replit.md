# Kavariedit

## Overview

Kavariedit is a SaaS platform that helps anyone create and sell their first digital products without design skills, camera confidence, or marketing expertise. It combines ready-to-customize templates, AI-powered avatar and voice cloning tools, and a guided sprint system.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/kavariedit)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Replit Auth (OIDC/PKCE)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/     # Express API server with all routes
│   └── kavariedit/     # React + Vite frontend (mounted at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # Replit Auth browser hook (useAuth)
├── scripts/
└── ...
```

## Features

1. **Brand DNA Extractor** - Paste an Instagram or Etsy URL, get a color palette + style profile
2. **Template Library** - Browse/filter templates by category, edit with Fabric.js canvas editor
3. **AI Voice Studio** - Record voice sample, create AI clone, generate voiceovers
4. **Social Content Templates** - Instagram, Pinterest, TikTok templates with caption suggestions
5. **Trending Niche Radar** - 10 weekly-updated niches with demand scores and product ideas
6. **14-Day Sprint Tracker** - Guided task system from idea to first sale with confetti celebrations
7. **Profit Calculator** - Compare Etsy, Gumroad, Shopify, Stan Store fee structures
8. **Dashboard** - Sprint progress, usage stats, niche previews, quick actions

## Pages

- `/` - Landing page (public)
- `/pricing` - Pricing page (Free/Pro tiers)
- `/dashboard` - Authenticated home with stats
- `/brand-dna` - Brand DNA Extractor
- `/templates` - Template Library
- `/template-editor/:id` - Fabric.js canvas editor
- `/voice-studio` - AI Voice Studio
- `/social-templates` - Social content templates
- `/niche-radar` - Trending niche radar
- `/sprint` - 14-Day Sprint Tracker
- `/calculator` - Profit Calculator
- `/settings` - Account Settings

## API Routes

All routes under `/api`:
- `GET /auth/user` — Current user
- `GET/POST /brand-dna` — Brand DNA profiles
- `DELETE /brand-dna/:id` — Delete profile
- `POST /brand-dna/:id/set-default` — Set default
- `GET /templates` — Template library (filterable by category)
- `GET /templates/:id` — Single template
- `POST /templates/:id/customize` — Track customization
- `GET /social-templates` — Social templates (filterable by platform)
- `GET /voice/status` — Voice clone status + usage
- `POST /voice/create` — Create voice clone
- `POST /voice/generate` — Generate voiceover
- `GET /voice/history` — Voiceover history
- `GET /niches` — Trending niches list
- `GET /niches/:id` — Niche detail with product ideas
- `GET/POST /sprint` — Sprint status / start sprint
- `POST /sprint/tasks/:day/complete` — Complete a sprint day
- `POST /sprint/restart` — Restart sprint
- `POST /calculator/calculate` — Calculate profits per platform
- `GET/PATCH /user/profile` — User profile
- `GET /user/stats` — Usage stats

## Database Tables

- `users` — Replit Auth users
- `sessions` — Auth sessions
- `user_profiles` — Extended user data (subscription tier, voice clone ID, usage counts)
- `brand_dna_profiles` — Extracted brand DNA profiles
- `templates` — Design templates (14 seeded)
- `social_templates` — Social content templates (6 seeded)
- `user_template_customizations` — Template usage tracking
- `voiceover_history` — Generated voiceover records
- `trending_niches` — Trending niches (10 seeded)
- `sprint_progress` — Per-user sprint tracking

## Pricing Model

- **Free**: 5 voiceovers/month, access to all templates and features
- **Pro**: $19/month or $149/year — unlimited voiceovers

## Key Dependencies

- `fabric` — Canvas-based template editor
- `framer-motion` — Page animations
- `react-confetti` — Sprint celebration animations
- `openid-client` — OIDC authentication
- `drizzle-orm` — Database ORM
