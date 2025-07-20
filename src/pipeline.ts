import { fromMarkdown } from 'mdast-util-from-markdown'
import { transformAdmonitions } from './admonitions'
import { serializeTree } from './ast'
import { transformTabs } from './tabs'

/**
 * Conversion pipeline (unified, re-family of packages).
 *
 * Converts material mkdocs markdown syntax into starlight/astro mdx syntax.
 *
 * Conceptually, each file would run through this pipeline.
 */
export function pipeline(input: string): string {
  // Parse markdown to AST once
  const tree = fromMarkdown(input)

  // Apply all AST transformations to the same tree
  // Order matters: admonitions first, then tabs
  transformAdmonitions(tree)
  transformTabs(tree)

  // Future AST transformers will be added here:
  // transformCodeFences(tree);
  // transformDefinitionLists(tree);
  // transformLinks(tree);

  // Serialize back to markdown once
  return serializeTree(tree)
}
