import { expect, test } from 'vitest'
import { pipeline } from '../src'

test('pipeline converts admonitions', () => {
  const input = `# Test Document

!!! note

    This is a test admonition with some content.

Some other content.`

  const expected = `# Test Document

:::note

    This is a test admonition with some content.

:::
Some other content.`

  expect(pipeline(input)).toBe(expected)
})

test('pipeline handles multiple admonitions', () => {
  const input = `!!! warning "Be careful"

    This is a warning.

!!! info

    This is just info.`

  const expected = `:::caution[Be careful]

    This is a warning.

:::
:::note

    This is just info.
:::`

  expect(pipeline(input)).toBe(expected)
})

test('pipeline converts tabs', () => {
  const input = `# Getting Started

Choose your language:

=== "Python"

    \`\`\`python
    print("Hello World")
    \`\`\`

=== "JavaScript"

    \`\`\`javascript
    console.log("Hello World");
    \`\`\``

  const expected = `# Getting Started

Choose your language:

<Tabs>
  <TabItem label="Python">

\`\`\`python
print("Hello World")
\`\`\`

  </TabItem>
  <TabItem label="JavaScript">

\`\`\`javascript
console.log("Hello World");
\`\`\`
  </TabItem>
</Tabs>`

  expect(pipeline(input)).toBe(expected)
})

test('pipeline handles admonitions and tabs together', () => {
  const input = `!!! tip "Choose your option"

    Pick one of these approaches:

=== "Option A"

    Use this for simple cases.

=== "Option B"

    Use this for complex cases.`

  const expected = `:::tip[Choose your option]

    Pick one of these approaches:

:::
<Tabs>
  <TabItem label="Option A">

Use this for simple cases.

  </TabItem>
  <TabItem label="Option B">

Use this for complex cases.
  </TabItem>
</Tabs>`

  expect(pipeline(input)).toBe(expected)
})
