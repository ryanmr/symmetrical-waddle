import { toMarkdown } from 'mdast-util-to-markdown'
import type { Root } from 'mdast'

/**
 * Serializes an AST tree back to markdown string with proper formatting.
 * This function is designed to be shared by the pipeline for consistent output.
 *
 * @param tree - The AST tree to serialize
 * @returns Markdown string
 */
export function serializeTree(tree: Root): string {
  const output = toMarkdown(tree, {
    // Preserve formatting as much as possible
    bullet: '-',
    fences: true,
    incrementListMarker: false,
    // Disable HTML encoding to preserve our syntax
    handlers: {
      text(node) {
        return node.value
      },
    },
  })

  return (
    output
      // Post-process to fix any remaining encoding issues
      .replaceAll('&#x20;', ' ')
      .replaceAll(String.raw`\[`, '[')
      .replaceAll(String.raw`\]`, ']')
  )
}
