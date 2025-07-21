# Material MkDocs to Starlight Converter

A TypeScript CLI tool that converts Material MkDocs markdown files to Starlight/Astro-compatible MDX files using AST manipulation.

## Features

- **Syntax Transformation**: Converts Material MkDocs admonitions and content tabs to Starlight equivalents
- **Asset Management**: Intelligently categorizes and moves assets (images, documents, etc.) to appropriate directories
- **URL Rewriting**: Updates local file references and removes Material MkDocs-specific attributes
- **Bulk Processing**: Handles multiple sections concurrently for efficient conversion
- **Configuration-Driven**: JSON-based configuration for flexible project setups

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd symmetrical-waddle

# Install dependencies
pnpm install

# Build the project
pnpm build
```

## Usage

### CLI Commands

```bash
# Show help
pnpm run convert -- --help

# Run with default configuration (dry-run mode)
pnpm run convert:dry-run

# Run conversion with custom config
pnpm run convert -- --config ./my-config.json

# Run in verbose mode
pnpm run convert -- --verbose

# Dry run with custom config
pnpm run convert -- --config ./my-config.json --dry-run --verbose
```

### Configuration

Create a `converter.config.json` file in your project root:

```json
{
  "sections": [
    {
      "slug": "docs",
      "sectionName": "Documentation",
      "contentPath": "./output/content/docs",
      "publicAssetsPath": "/assets/docs/",
      "optimizedAssetsPath": "./output/assets/docs",
      "originalPath": "./input/docs"
    }
  ]
}
```

### Configuration Options

- **slug**: Unique identifier for the section
- **sectionName**: Display name for the section
- **contentPath**: Output directory for converted markdown files
- **publicAssetsPath**: Public URL path for assets (used in rewritten URLs)
- **optimizedAssetsPath**: Directory for optimizable assets (images that can be processed)
- **originalPath**: Input directory containing Material MkDocs files

## Transformations

### Admonitions

Converts Material MkDocs admonitions to Starlight format:

```markdown
<!-- Material MkDocs -->
!!! note "Custom Title"
    Content here

<!-- Starlight -->
:::note[Custom Title]
    Content here
:::
```

### Content Tabs

Transforms Material MkDocs content tabs to Starlight tabs:

```markdown
<!-- Material MkDocs -->
=== "Tab 1"
    Content for tab 1

=== "Tab 2"
    Content for tab 2

<!-- Starlight -->
<Tabs>
  <TabItem label="Tab 1">
    Content for tab 1
  </TabItem>
  <TabItem label="Tab 2">
    Content for tab 2
  </TabItem>
</Tabs>
```

### URL Rewriting

- Removes Material MkDocs link attributes: `{:target="_blank"}`
- Updates local file references to point to new asset locations
- Handles both markdown and HTML image syntax

## Development

### Project Structure

```
src/
├── index.ts              # CLI entry point and exports
├── converter.ts          # Main file processing logic
├── pipeline.ts           # Transformation pipeline
├── admonitions.ts        # Admonitions transformer
├── tabs.ts               # Tabs transformer
└── ast.ts                # AST utilities
```

### Key Scripts

```bash
# Development
pnpm dev                  # Watch mode development
pnpm test                 # Run test suite
pnpm typecheck           # TypeScript type checking
pnpm lint                # Code linting
pnpm lint:fix            # Auto-fix linting issues

# Building and Running
pnpm build               # Build distribution
pnpm start               # Build and run
pnpm convert             # Run converter
pnpm convert:dry-run     # Run in dry-run mode
```

### Testing

The project includes comprehensive tests for:
- AST-based admonition transformation
- Tabs transformation with multi-group support
- Pipeline integration
- Content preservation and URL rewriting

```bash
pnpm test                # Run all tests
pnpm test -- --watch     # Watch mode testing
```

## Architecture

- **AST-driven conversion**: Uses unified/remark ecosystem for reliable markdown parsing
- **Single parse cycle**: Parse once → multiple transformations → serialize once
- **Modular transformers**: Individual functions for each syntax type
- **Type safety**: Full TypeScript support with comprehensive type definitions
- **Error handling**: Detailed error collection and reporting

## License

MIT