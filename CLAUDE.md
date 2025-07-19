# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript CLI tool that converts Material MkDocs markdown files to Starlight/Astro-compatible MDX files using AST manipulation. The tool focuses on transforming MkDocs-specific syntax elements (primarily admonitions, code fences, and tabs) to their Starlight equivalents.

## Development Commands

### Package Manager
This project uses **pnpm** as the package manager.

### Core Development Commands
- `pnpm install` - Install dependencies
- `pnpm run dev` - Development mode with watch (tsdown --watch)
- `pnpm run start` - Run the CLI tool (builds and executes)
- `pnpm run build` - Build the distribution using tsdown
- `pnpm run test` - Run vitest test suite
- `pnpm run typecheck` - TypeScript type checking
- `pnpm run lint` - ESLint with cache
- `pnpm run lint:fix` - Auto-fix linting issues
- `pnpm run format` - Format code with Prettier

### Testing Commands
- `pnpm test` - Run all tests with vitest
- Test files are located in both `src/` (co-located) and `tests/` directory

## Architecture & Key Components

### Build System
- **tsdown**: Primary build tool (replaces traditional TypeScript compilation)
- **TypeScript**: Strict configuration with ES2023 target
- **ESLint**: Uses @sxzz/eslint-config for code linting
- **Prettier**: Uses @sxzz/prettier-config for code formatting

### Core Dependencies
- **unified/remark ecosystem**: AST parsing and manipulation
  - `remark` - Core markdown processor
  - `remark-gfm` - GitHub Flavored Markdown support
  - `remark-parse` / `remark-stringify` - Parsing and stringifying
  - `unist-util-visit` - AST traversal
  - `mdast-util-to-string` - Extract strings from AST nodes

### Project Structure
```
src/
├── index.ts              # CLI entry point (currently placeholder)
├── admonitions.ts        # Material MkDocs → Starlight admonition converter
└── admonitions.test.ts   # Co-located test for admonitions
```

### Development Philosophy
1. **String-based testing first**: Direct syntax transformation testing before file I/O
2. **AST-driven conversion**: Uses unified/remark for reliable markdown parsing
3. **Modular converters**: Individual modules for each syntax type
4. **Test-driven development**: Write failing tests before implementation

### Current Implementation Status
- ✅ Project infrastructure and build setup complete
- ✅ Testing framework (vitest) configured
- 🚧 Converter implementations needed (admonitions stub exists)
- ⏳ CLI argument handling (future)
- ⏳ File I/O operations (future)

## Testing Strategy

### Test Organization
- Co-located tests in `src/` for component-specific testing
- Integration tests in `tests/` directory
- Focus on string-to-string conversion validation
- Use vitest as the testing framework

### Test Examples
The admonitions test demonstrates the expected conversion pattern:
```typescript
// Material MkDocs syntax
`!!! note

    Content here`

// Should convert to Starlight syntax  
`:::note

    Content here`
```

## Type Safety
- Strict TypeScript configuration
- Target ES2023 with ESNext modules
- Declaration files generated automatically
- Uses `moduleResolution: "bundler"` for modern module resolution

## Output & Distribution
- Built files output to `dist/` directory
- Main entry point: `./dist/index.js`
- Type definitions: `./dist/index.d.ts`
- Package configured for ES modules only (`"type": "module"`)