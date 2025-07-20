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
  - `mdast-util-from-markdown` / `mdast-util-to-markdown` - Low-level AST parsing/serialization
  - `@types/mdast` - TypeScript types for AST nodes

### Project Structure
```
src/
├── index.ts              # Main entry point with pipeline functions
├── admonitions.ts        # AST-based Material MkDocs → Starlight admonition transformer
├── admonitions.test.ts   # Tests for admonitions transformer
├── tabs.ts               # AST-based Material MkDocs → Starlight tabs transformer
├── tabs2.test.ts         # Tests for AST-based tabs transformer
├── ast.ts                # Shared AST utilities (serializeTree function)
└── ast-pipeline.test.ts  # Tests for AST-based pipeline
```

### Architecture Approach

#### AST-Based Processing (Current)
- Follows Cloudflare documentation migration pattern
- Parse once → multiple AST transformations → serialize once
- Optimized for bulk document processing
- Better composability and type safety
- Uses unified/remark ecosystem for reliable markdown manipulation

### Development Philosophy
1. **AST-driven conversion**: Uses unified/remark for reliable markdown parsing
2. **Bulk processing optimization**: Single parse/serialize cycle for multiple transformations
3. **Modular transformers**: Individual transformer functions for each syntax type
4. **Test-driven development**: Comprehensive test coverage with isolated transformer testing
5. **Type safety**: Full TypeScript support with proper AST node types

### Current Implementation Status
- ✅ Project infrastructure and build setup complete
- ✅ Testing framework (vitest) configured
- ✅ AST-based admonitions transformer (working)
- ✅ AST-based pipeline with bulk processing
- 🚧 AST-based tabs transformer (has bug with content preservation)
- ⏳ CLI argument handling (future)
- ⏳ File I/O operations (future)

## API Functions

### Pipeline Functions (index.ts)
- `astPipeline(input: string)` - AST-based single-parse transformations (main function)
- `bulkTransform(files)` - Process multiple files efficiently using AST pipeline

### Individual Transformers
- `transformAdmonitions(tree: Root)` - AST-based admonition transformation
- `transformTabs(tree: Root)` - AST-based tabs transformation (currently has bugs)

### Utilities
- `serializeTree(tree: Root)` - Convert AST back to markdown with proper formatting

## Testing Strategy

### Test Organization
- Co-located tests in `src/` for component-specific testing
- Integration tests for AST pipeline
- Focus on AST transformation validation
- Use vitest as the testing framework

### Test Coverage
- `admonitions.test.ts` - AST-based admonition transformer tests
- `tabs2.test.ts` - AST-based tabs transformer tests (reveals current bugs)
- `ast-pipeline.test.ts` - Integration tests for AST pipeline

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

## Known Issues

### AST-Based Tabs Transformer Bug
The `transformTabs` function in `tabs.ts` has a bug where it incorrectly calculates node boundaries and removes content that should be preserved after tab groups. This affects:
- Content immediately following tab groups (paragraphs, admonitions)
- The AST pipeline when tabs and admonitions are used together
- Multiple tab groups with content between them

**Symptoms:** Warning admonitions and other content after tabs disappear from output.
**Location:** `src/tabs.ts` line ~83 (endIndex calculation)
**Tests:** `tabs2.test.ts` demonstrates the issue with detailed debug output

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