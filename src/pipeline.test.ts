import { describe, expect, test } from 'vitest'
import { pipeline } from './pipeline'

describe('pipeline', () => {
  test('transforms admonitions and tabs together efficiently', () => {
    const input = `# Documentation

!!! tip "Choose your option"

    Pick the best approach:

=== "Option A"

    Use this for simple cases.

=== "Option B"

    Use this for complex cases.

!!! warning

    Be careful with your choice.`

    const result = pipeline(input)

    // Should convert admonitions
    expect(result).toContain(':::tip[Choose your option]')
    expect(result).toContain(':::caution') // warning maps to caution

    // Should convert tabs
    expect(result).toContain('<Tabs>')
    expect(result).toContain('<TabItem label="Option A">')
    expect(result).toContain('<TabItem label="Option B">')
    expect(result).toContain('</Tabs>')

    // Should preserve other content
    expect(result).toContain('# Documentation')
  })

  test('minimal reproduction of missing warning', () => {
    const input = `=== "Tab"

    Content.

!!! warning

    Warning.`

    const result = pipeline(input)
    console.log('MINIMAL RESULT:')
    console.log(result)

    expect(result).toContain(':::caution')
  })

  test('handles mixed content with proper ordering', () => {
    const input = `!!! note

    This is a note.

=== "Tab 1"

    Tab content.

Regular paragraph.

!!! danger

    Dangerous content.`

    const result = pipeline(input)

    expect(result).toContain(':::note')
    expect(result).toContain('<TabItem label="Tab 1">')
    expect(result).toContain('Regular paragraph.')
    expect(result).toContain(':::danger')
  })

  test('preserves content that does not need transformation', () => {
    const input = `# Title

Regular paragraph with **bold** and *italic*.

- List item 1
- List item 2

\`\`\`javascript
const code = 'preserved';
\`\`\`

> Blockquote is preserved too.`

    const result = pipeline(input)

    expect(result).toContain('# Title')
    expect(result).toContain('**bold**')
    expect(result).toContain('*italic*')
    expect(result).toContain('- List item 1')
    expect(result).toContain('```javascript')
    expect(result).toContain('> Blockquote')
  })

  test('handles empty input gracefully', () => {
    const result = pipeline('')
    expect(result.trim()).toBe('')
  })

  test('handles input with only whitespace', () => {
    const input = '\n\n   \n\n'
    const result = pipeline(input)
    expect(result.trim()).toBe('')
  })
})
