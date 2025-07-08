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
```

## Architecture

### API Integration
- API client: `src/lib/api.ts`
- Base URL: `https://maplestory.io/api`
- Default region: KMS (Korea MapleStory)
- Version: 284
- Endpoints: items, NPCs, mobs, jobs, skills
- data 는 maplestory.io 에서 가져온다.

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

### Item System
- List view with pagination at `/items`
- Search and filtering by category
- Icon rendering via maplestory.io API
- Error handling for missing items

### API Error Handling
- Timeout: 10 seconds
- Graceful fallbacks for missing data
- Console warnings instead of errors for better UX

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