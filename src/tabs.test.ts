import { fromMarkdown } from 'mdast-util-from-markdown'
import { describe, expect, test } from 'vitest'
import { serializeTree } from './ast'
import { transformTabs } from './tabs'

describe('tabs', () => {
  test('basic tab conversion', () => {
    const input = `=== "Tab 1"

    Content for tab 1.

=== "Tab 2"

    Content for tab 2.`

    const tree = fromMarkdown(input)
    transformTabs(tree)
    const result = serializeTree(tree)

    expect(result).toContain('<Tabs>')
    expect(result).toContain('<TabItem label="Tab 1">')
    expect(result).toContain('Content for tab 1.')
    expect(result).toContain('<TabItem label="Tab 2">')
    expect(result).toContain('Content for tab 2.')
    expect(result).toContain('</TabItem>')
    expect(result).toContain('</Tabs>')
  })

  test('single tab', () => {
    const input = `=== "Only Tab"

    Single tab content.`

    const tree = fromMarkdown(input)
    transformTabs(tree)
    const result = serializeTree(tree)

    expect(result).toContain('<Tabs>')
    expect(result).toContain('<TabItem label="Only Tab">')
    expect(result).toContain('Single tab content.')
    expect(result).toContain('</TabItem>')
    expect(result).toContain('</Tabs>')
  })

  test('single tab with long internal content', () => {
    const input = `=== "Only Tab"

    Long arbitrary content internally. Long arbitrary content internally. Long arbitrary content internally. Long arbitrary content internally, deeply nested. Long arbitrary content internally. Long arbitrary content internally. Long arbitrary content internally.
    
    Last line.`

    const tree = fromMarkdown(input)
    transformTabs(tree)
    const result = serializeTree(tree)

    expect(result).toContain('<Tabs>')
    expect(result).toContain('<TabItem label="Only Tab">')
    expect(result).toContain(
      'Long arbitrary content internally, deeply nested.',
    )
    expect(result).toContain('</TabItem>')
    expect(result).toContain('</Tabs>')
  })

  test('tabs with content after', () => {
    const input = `=== "Tab A"

    Tab content.

=== "Tab B"

    More content.

Regular paragraph after tabs.`

    const tree = fromMarkdown(input)
    transformTabs(tree)
    const result = serializeTree(tree)

    console.log(result)

    expect(result).toContain('<Tabs>')
    expect(result).toContain('<TabItem label="Tab A">')
    expect(result).toContain('<TabItem label="Tab B">')
    expect(result).toContain('</Tabs>')
    expect(result).toContain('Regular paragraph after tabs.')
  })

  test.skip('tabs followed by admonition syntax', () => {
    const input = `=== "Option A"

    Use this for simple cases.

=== "Option B"

    Use this for complex cases.

!!! warning

    Be careful with your choice.`

    const tree = fromMarkdown(input)
    console.log('Before transformation - AST structure:')
    tree.children.forEach((child, index) => {
      console.log(`${index}: ${child.type}`)
      if (child.type === 'paragraph' && child.children[0]?.type === 'text') {
        console.log(`  Content: "${child.children[0].value.trim()}"`)
      } else if (child.type === 'code') {
        console.log(`  Code: "${child.value.trim()}"`)
      }
    })

    // Manually inspect what the tabs transformer should detect
    console.log('Expected tab detection:')
    console.log('- Start at index 0 (=== "Option A")')
    console.log('- Include index 1 (code block)')
    console.log('- Include index 2 (=== "Option B")')
    console.log('- Include index 3 (code block)')
    console.log('- Stop at index 4 (!!! warning - not a tab)')
    console.log('- So endIndex should be 4')
    console.log('- Replace indices 0,1,2,3 with tabs block')
    console.log('- Preserve indices 4,5 (warning + code)')

    transformTabs(tree)

    console.log('After transformation - AST structure:')
    tree.children.forEach((child, index) => {
      console.log(`${index}: ${child.type}`)
      if (child.type === 'paragraph' && child.children[0]?.type === 'text') {
        const text = child.children[0].value.trim()
        console.log(
          `  Content: "${text.length > 50 ? `${text.slice(0, 50)}...` : text}"`,
        )
      } else if (child.type === 'code') {
        console.log(`  Code: "${child.value.trim()}"`)
      }
    })

    const result = serializeTree(tree)
    console.log('Final result:')
    console.log(result)

    // Should contain tabs
    expect(result).toContain('<Tabs>')
    expect(result).toContain('<TabItem label="Option A">')
    expect(result).toContain('<TabItem label="Option B">')
    expect(result).toContain('</Tabs>')

    // Should preserve the admonition syntax
    expect(result).toContain('!!! warning')
    expect(result).toContain('Be careful with your choice.')
  })

  test('tabs with mixed content', () => {
    const input = `# Getting Started

Choose your language:

=== "JavaScript"

    npm install my-package

=== "Python"

    pip install my-package

=== "Go"

    go get my-package

That's it! You're ready to go.`

    const tree = fromMarkdown(input)
    transformTabs(tree)
    const result = serializeTree(tree)

    expect(result).toContain('# Getting Started')
    expect(result).toContain('Choose your language:')
    expect(result).toContain('<Tabs>')
    expect(result).toContain('<TabItem label="JavaScript">')
    expect(result).toContain('<TabItem label="Python">')
    expect(result).toContain('<TabItem label="Go">')
    expect(result).toContain('npm install my-package')
    expect(result).toContain('pip install my-package')
    expect(result).toContain('go get my-package')
    expect(result).toContain('</Tabs>')
    expect(result).toContain("That's it! You're ready to go.")
  })

  test('multiple separate tab groups', () => {
    const input = `=== "Group 1 Tab A"

    First group content.

=== "Group 1 Tab B"

    More first group content.

Some text between groups.
Some text between groups.
Some text between groups.

=== "Group 2 Tab X"

    Second group content.

=== "Group 2 Tab Y"

    More second group content.`

    const tree = fromMarkdown(input)
    transformTabs(tree)
    const result = serializeTree(tree)

    console.log('before', input)
    console.log('after', result)

    // Should have two separate tab groups
    const tabsMatches = result.match(/<Tabs>/g)
    expect(tabsMatches).toHaveLength(2)
    expect(result).toContain('<TabItem label="Group 1 Tab A">')
    expect(result).toContain('<TabItem label="Group 1 Tab B">')
    expect(result).toContain('<TabItem label="Group 2 Tab X">')
    expect(result).toContain('<TabItem label="Group 2 Tab Y">')
    expect(result).toContain('Some text between groups.')
  })

  test('tabs without content (empty code blocks)', () => {
    const input = `=== "Empty Tab 1"

=== "Empty Tab 2"`

    const tree = fromMarkdown(input)
    transformTabs(tree)
    const result = serializeTree(tree)

    expect(result).toContain('<Tabs>')
    expect(result).toContain('<TabItem label="Empty Tab 1">')
    expect(result).toContain('<TabItem label="Empty Tab 2">')
    expect(result).toContain('</TabItem>')
    expect(result).toContain('</Tabs>')
  })

  test('preserves non-tab content', () => {
    const input = `# Documentation

Regular paragraph.

- List item
- Another item

\`\`\`javascript
const code = 'block';
\`\`\`

> Blockquote

=== "Tab"

    Tab content.

Final paragraph.`

    const tree = fromMarkdown(input)
    transformTabs(tree)
    const result = serializeTree(tree)

    expect(result).toContain('# Documentation')
    expect(result).toContain('Regular paragraph.')
    expect(result).toContain('- List item')
    expect(result).toContain('```javascript')
    expect(result).toContain('> Blockquote')
    expect(result).toContain('<TabItem label="Tab">')
    expect(result).toContain('Final paragraph.')
  })
})
