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
- ✅ AST-based tabs transformer (working - bug fixed)
- ⏳ Content rewriting transformers (next priority)
- ⏳ CLI argument handling (future)
- ⏳ File I/O operations (future)

## API Functions

### Pipeline Functions (index.ts)
- `astPipeline(input: string)` - AST-based single-parse transformations (main function)
- `bulkTransform(files)` - Process multiple files efficiently using AST pipeline

### Individual Transformers
- `transformAdmonitions(tree: Root)` - AST-based admonition transformation
- `transformTabs(tree: Root)` - AST-based tabs transformation with multi-group support

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
- `tabs.test.ts` - AST-based tabs transformer tests with multi-group scenarios
- `pipeline.test.ts` - Integration tests for AST pipeline (currently skipped)

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

## Recent Fixes

### Tabs Transformer Multi-Group Support (Fixed)
**Problem:** The `transformTabs` function had a bug where multiple tab groups would consume content between them, causing content loss.

**Solution:** Added overlap detection logic in `src/tabs.ts:51-54` to prevent the `visit` function from processing paragraphs that are already part of detected tab groups.

**Impact:** Now correctly handles:
- Multiple separate tab groups with content between them
- Content immediately following tab groups (paragraphs, admonitions)
- Mixed content scenarios with tabs and other elements

## Next Development Phase

### Content Rewriting Transformers
The next set of changes will focus on content rewriting rather than complex markdown parsing. These transformers will be more subtle but expansive, handling:

1. **Link Attribute Cleanup**: Remove Material MkDocs-specific link attributes like `{:target="_blank"}`
2. **Image Path Updates**: Transform image paths to match new directory structures or CDN locations
3. **Reference Link Cleanup**: Update or remove deprecated reference patterns
4. **Content Sanitization**: Remove other MkDocs-specific annotations and attributes

These transformers will likely operate on text content within AST nodes rather than restructuring the AST itself, making them conceptually simpler but potentially affecting more content across documents.

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