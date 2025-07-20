import { visit } from 'unist-util-visit'
import type { Code, Paragraph, Root, Text } from 'mdast'

// reference documentation from material mkdocs on Admonitions
// https://squidfunk.github.io/mkdocs-material/reference/admonitions/

// reference documentation from starlight/astro on Asides
// https://starlight.astro.build/components/asides/

/**
 * Maps Material MkDocs admonition types to Starlight aside types.
 * All types are mapped to valid Starlight types for simplicity.
 */
const ADMONITION_TYPE_MAP: Record<string, string> = {
  // Direct mappings to Starlight types
  note: 'note',
  tip: 'tip',
  warning: 'caution',
  danger: 'danger',

  // Reasonable approximations
  info: 'note',
  success: 'tip',
  question: 'note',
  failure: 'danger',
  bug: 'danger',

  // Types without direct equivalents - map to note for simplicity
  abstract: 'note',
  example: 'note',
  quote: 'note',
}

/**
 * AST transformer function that converts Material MkDocs admonitions to Starlight asides.
 * Inspired by Cloudflare's approach using mdast-util-* libraries for bulk processing.
 */
export function transformAdmonitions(tree: Root): void {
  const transformations: Array<{
    paragraphIndex: number
    codeIndex: number
    parent: any
    admonitionData: {
      syntax: string
      type: string
      title?: string
    }
  }> = []

  // First pass: identify admonition patterns (paragraph followed by code block)
  visit(
    tree,
    'paragraph',
    (paragraphNode: Paragraph, paragraphIndex, parent) => {
      if (!parent || paragraphIndex === undefined) return

      // Check if this paragraph contains an admonition marker
      const firstChild = paragraphNode.children[0]
      if (firstChild?.type !== 'text') return

      const text = firstChild.value.trim()
      const admonitionMatch = text.match(
        /^(\?\?\?\+?|!!!)\s+(\w+)(?:\s+"([^"]*)")?$/,
      )

      if (!admonitionMatch) return

      const [, syntax, originalType, title] = admonitionMatch

      // Look for the next code block (which should contain the admonition content)
      const nextNodeIndex = paragraphIndex + 1
      const nextNode = parent.children[nextNodeIndex]

      if (nextNode?.type === 'code') {
        transformations.push({
          paragraphIndex,
          codeIndex: nextNodeIndex,
          parent,
          admonitionData: {
            syntax,
            type: originalType,
            title,
          },
        })
      }
    },
  )

  // Second pass: apply transformations in reverse order to avoid index shifting
  transformations
    .reverse()
    .forEach(({ paragraphIndex, codeIndex, parent, admonitionData }) => {
      const { syntax, type: originalType, title } = admonitionData
      const isCollapsible = syntax.startsWith('???')
      const isExpandedCollapsible = syntax === '???+'

      // Map the type to Starlight equivalent
      const mappedType = ADMONITION_TYPE_MAP[originalType] || 'note'

      // Get the code block content
      const codeNode = parent.children[codeIndex] as Code
      const contentLines = codeNode.value.split('\n')

      // Create the aside opening
      let asideStart = `:::${mappedType}`
      if (title) {
        asideStart += `[${title}]`
      }

      // Handle collapsible blocks with a comment
      const collapsibleComment = isCollapsible
        ? `<!-- Material MkDocs collapsible block (initially ${isExpandedCollapsible ? 'expanded' : 'collapsed'}) converted to regular aside -->`
        : ''

      // Build the complete aside content
      const asideLines = [
        ...(collapsibleComment ? [collapsibleComment] : []),
        asideStart,
        '', // Empty line after opening
        ...contentLines.map((line: string) => (line ? `    ${line}` : line)), // Re-indent content
        ':::',
      ]

      // Create a new text node with the complete aside
      const newTextNode: Text = {
        type: 'text',
        value: asideLines.join('\n'),
      }

      // Replace the paragraph with the new content
      const newParagraphNode: Paragraph = {
        type: 'paragraph',
        children: [newTextNode],
      }

      // Replace both the paragraph and code nodes with the new aside
      parent.children.splice(paragraphIndex, 2, newParagraphNode)
    })
}
