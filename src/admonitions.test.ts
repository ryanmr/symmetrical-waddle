import { fromMarkdown } from 'mdast-util-from-markdown'
import { describe, expect, test } from 'vitest'
import { transformAdmonitions } from './admonitions'
import { serializeTree } from './ast'

describe('admonitions2 (AST-based)', () => {
  test('basic note admonition', () => {
    const input = `!!! note

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.`

    const expected = `:::note

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et euismod
    nulla. Curabitur feugiat, tortor non consequat finibus, justo purus auctor
    massa, nec semper lorem quam in massa.
:::`

    const tree = fromMarkdown(input)
    transformAdmonitions(tree)
    const result = serializeTree(tree)

    expect(result.trim()).toEqual(expected)
  })

  test('admonition with title', () => {
    const input = `!!! warning "Be Careful"

    This is a warning with a custom title.`

    const expected = `:::caution[Be Careful]

    This is a warning with a custom title.
:::`

    const tree = fromMarkdown(input)
    transformAdmonitions(tree)
    const result = serializeTree(tree)
    expect(result.trim()).toEqual(expected)
  })

  test('collapsible admonition (initially collapsed)', () => {
    const input = `??? tip "Click to expand"

    This content is initially hidden.`

    const expected = `<!-- Material MkDocs collapsible block (initially collapsed) converted to regular aside -->
:::tip[Click to expand]

    This content is initially hidden.
:::`

    const tree = fromMarkdown(input)
    transformAdmonitions(tree)
    const result = serializeTree(tree)
    expect(result.trim()).toEqual(expected)
  })

  test('multiple admonitions in sequence', () => {
    const input = `!!! note "First"

    First note content.

!!! warning

    Warning content.

!!! abstract

    Abstract content converted to note.`

    const expected = `:::note[First]

    First note content.
:::

:::caution

    Warning content.
:::

:::note

    Abstract content converted to note.
:::`

    const tree = fromMarkdown(input)
    transformAdmonitions(tree)
    const result = serializeTree(tree)
    expect(result.trim()).toEqual(expected)
  })

  test('mixed content with admonitions', () => {
    const input = `# Documentation

This is regular content.

!!! tip "Pro Tip"

    This is a helpful tip.

More regular content here.

!!! danger

    This is dangerous!`

    const tree = fromMarkdown(input)
    transformAdmonitions(tree)
    const result = serializeTree(tree)

    expect(result).toContain('# Documentation')
    expect(result).toContain(':::tip[Pro Tip]')
    expect(result).toContain(':::danger')
    expect(result).toContain('This is regular content.')
    expect(result).toContain('More regular content here.')
  })

  test('preserves non-admonition content', () => {
    const input = `# Title

Regular paragraph.

- List item 1
- List item 2

\`\`\`javascript
code block
\`\`\`

!!! note

    Admonition content.

More content.`

    const tree = fromMarkdown(input)
    transformAdmonitions(tree)
    const result = serializeTree(tree)

    expect(result).toContain('# Title')
    expect(result).toContain('Regular paragraph.')
    expect(result).toContain('- List item 1')
    expect(result).toContain('```javascript')
    expect(result).toContain(':::note')
  })
})
