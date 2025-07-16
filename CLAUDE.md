# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
MapleStory utility website built with Next.js 15 App Router, TypeScript, Ant Design, and Tailwind CSS. Integrates with the maplestory.io API to provide game data lookup functionality.

## Development Commands
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run generate-maps  # Generate static maps data (13,973 maps)
```

## Architecture

### API Integration
- API client: `src/lib/api.ts`
- Base URL: `https://maplestory.io/api`
- Default region: KMS (Korea MapleStory)
- Version: 389
- Endpoints: items, NPCs, mobs, jobs, skills
- Static data files: `public/maps.json` (13,973 maps), `public/jobs.json`, `public/skills.json`
- Data source: maplestory.io API + pre-generated static files for performance

### Key Directories
- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable React components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utilities and API client
- `src/types/` - TypeScript type definitions

### State Management
- React Query (@tanstack/react-query) for server state
- React Context for theme management

### Styling
- Tailwind CSS v4 with class-based dark mode
- Ant Design v5 component library
- Preflight disabled to avoid conflicts

## Key Implementation Details

### Map System (Optimized)
- **Static Data Approach**: Pre-generated `maps.json` with 13,973 maps to minimize API calls
- **Data Generation**: `npm run generate-maps` crawls all maps and creates static file
- **Performance**: Single file fetch vs thousands of API calls (99%+ faster)
- **Continental Classification**: 16 regions with color-coded UI
- **Live NPC Data**: Only individual NPC details fetched on-demand

### Item System
- List view with pagination at `/items`
- Search and filtering by category
- Icon rendering via maplestory.io API
- Error handling for missing items

### API Optimization Strategy
- **Hybrid Approach**: Static files for bulk data + API for details
- **Minimal API Calls**: Maps, jobs, skills use static JSON files
- **On-demand Loading**: NPCs, items fetched when needed
- **Aggressive Caching**: 24-hour cache for static data, shorter for dynamic

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017

## Current Development Focus
Working on feature/issue-5-item-list branch implementing:
- Item search and filtering improvements
- Category-based browsing
- Enhanced error handling
- UI/UX improvements for item lists

## Testing
No test framework currently configured. Would need Jest/Vitest + React Testing Library for testing.

## Development Notes
- port 3000 번사용 
- 서버는 내가 직접 켜