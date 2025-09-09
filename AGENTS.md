# Agent Guidelines for Hotlympics Website

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build with TypeScript check
- `npm run lint` - Run ESLint (use `lint:fix` for auto-fix)
- `npm run format` - Format with Prettier
- `./run-checks.sh` - Run all CI checks (install, format, lint, build)
- No test framework configured

## Code Style

- **Indentation**: 4 spaces, no indentation on blank lines
- **File naming**: kebab-case (e.g., `rating-arena.tsx`)
- **Components**: Functional components only, no class components
- **Imports**: Use `.js` extensions, organize with prettier-plugin-organize-imports
- **Types**: Strict TypeScript, prefix unused params with `_`
- **Path alias**: Use `@/*` for `./src/*`
- **Comments**: Conservative use only when necessary

## Project Structure

- Components in `/src/components/` by feature
- Pages in `/src/pages/`
- Hooks in `/src/hooks/` by feature
- Services in `/src/services/` by layer
- Types in `/src/utils/types/` by feature
