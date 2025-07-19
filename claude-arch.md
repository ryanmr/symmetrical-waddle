# Material MkDocs to Starlight Converter

A TypeScript CLI tool that parses Material MkDocs markdown files using AST manipulation and converts them to Starlight/Astro-compatible MDX files.

## Resources

[Material MkDocs](https://squidfunk.github.io/mkdocs-material/)

[Startlight by Astro](https://starlight.astro.build/)

## Project Overview

This tool converts Material MkDocs syntax to Starlight syntax by:

1. Parsing markdown files using the unified/remark ecosystem
2. Transforming Material MkDocs-specific syntax elements via AST manipulation
3. Outputting clean Starlight/Astro MDX files

## Architecture

### Core Components

- **CLI Entry Point** (`src/index.ts`): Initializes the CLI interface and orchestrates the conversion pipeline
- **Converter Modules** (`src/converters/`): Individual modules for each syntax type transformation
- **Parser Core**: Uses unified/remark for AST parsing and manipulation
- **Output Generation**: Produces Starlight-compatible MDX files

### Converter Priority

1. **Admonitions** - Most complex logical unit with multiple variants (note, warning, info, etc.)
2. **Code Fences** - Language-specific code blocks with potential highlighting
3. **Tabs** - Material MkDocs tab syntax to Starlight equivalents
4. Additional Material MkDocs syntax as discovered

## Development Setup

### Prerequisites

- Node.js with pnpm package manager
- TypeScript knowledge
- Familiarity with unified/remark AST manipulation

### Key Dependencies

```json
{
  "remark": "unified ecosystem for markdown parsing",
  "typescript": "^5.8.3",
  "vitest": "^3.1.3 (testing framework)",
  "tsdown": "^0.11.9 (build tool)",
  "tsx": "^4.19.4"
}
```

### Scripts

- `pnpm run start [flags]` - Run the CLI tool
- `pnpm run dev` - Development mode with watch
- `pnpm run test` - Run test suite
- `pnpm run build` - Build distribution
- `pnpm run typecheck` - Type checking

## File Structure

```
src/
├── index.ts              # CLI entry point
├── converters/           # Syntax-specific converter modules
│   ├── admonitions.ts   # Material MkDocs admonitions → Starlight
│   ├── code-fences.ts   # Code block conversions
│   ├── tabs.ts          # Tab syntax conversions
│   └── index.ts         # Converter orchestration
├── parser/              # AST parsing utilities
├── types/               # TypeScript type definitions
└── utils/               # Shared utilities
```

## Testing Strategy

### Test Structure

- **Unit Tests**: Individual syntax conversion functions
- **Integration Tests**: Full pipeline conversions
- **String-based Testing**: Direct syntax transformation testing (primary)
- **File-based Testing**: Complete file conversion validation (secondary)

### Test Organization

```
tests/
├── converters/          # Converter-specific tests
│   ├── admonitions.test.ts
│   ├── code-fences.test.ts
│   └── tabs.test.ts
├── fixtures/            # Test input/output examples
│   ├── input/          # Material MkDocs samples
│   └── expected/       # Expected Starlight output
└── integration/        # Full pipeline tests
```

### Testing Philosophy

- Tests should NOT require CLI invocation
- Direct module testing for faster iteration
- String-based assertions before file I/O testing
- Incremental validation as features are implemented

## Input/Output

### Input

- Material MkDocs markdown files with specific syntax elements
- Focus on parsing AST rather than file locations initially

### Output

- `.out/` directory for converted files (gitignored)
- Starlight-compatible MDX files
- Internal string-based conversion for testing

## Current State

- ✅ Project infrastructure and build setup
- ✅ Testing framework configuration
- ✅ Basic converter stubs (admonitions scaffolded)
- 🚧 AST parsing implementation needed
- 🚧 Converter module implementations needed
- ⏳ CLI argument handling (future)
- ⏳ File I/O operations (future)

## Development Workflow

1. **Start with string-based conversions**: Focus on AST transformation logic
2. **Test individual converters**: Validate each syntax type independently
3. **Build pipeline integration**: Connect converters through main orchestration
4. **Add file I/O**: Implement actual file reading/writing
5. **Enhance CLI**: Add command-line options and directory handling

## Technical Notes

- Uses unified/remark for consistent AST manipulation
- Prioritizes correctness over performance initially
- Modular design allows independent converter development
- String-first approach enables rapid testing and iteration

## Contributing Guidelines

When working on this codebase:

1. **Start with tests**: Write failing tests for desired behavior first
2. **Focus on AST**: Understand the remark AST structure for both input and output
3. **Incremental development**: Build one converter at a time completely
4. **String testing**: Validate conversions with string inputs/outputs before files
5. **Type safety**: Leverage TypeScript for AST node type safety

## AST / Parsing

```
pnpm add unified remark remark-parse remark-stringify remark-gfm unist-util-visit mdast-util-to-string
pnpm add -D @types/mdast @types/unist
```

This gives you:

- Core unified processing pipeline
- Markdown parsing/stringifying
- GitHub Flavored Markdown support
- AST traversal capabilities
- String extraction from nodes
- TypeScript types for AST nodes

Rely on these packages for baseline markdown parsing.
