import { describe, expect, test } from 'vitest'

import { convertTabs } from './tabs'

// reference documentation from material mkdocs on Content Tabs
// https://squidfunk.github.io/mkdocs-material/reference/content-tabs/

// reference documentation from starlight/astro on Tabs
// https://starlight.astro.build/components/tabs/

describe('tabs', () => {
  test('basic two-tab conversion', () => {
    const input = `=== "Tab 1"

    Content for tab 1

=== "Tab 2"

    Content for tab 2`

    const expected = `<Tabs>
  <TabItem label="Tab 1">

Content for tab 1

  </TabItem>
  <TabItem label="Tab 2">

Content for tab 2
  </TabItem>
</Tabs>`

    expect(convertTabs(input)).toEqual(expected)
  })

  test('single tab conversion', () => {
    const input = `=== "Only Tab"

    Single tab content`

    const expected = `<Tabs>
  <TabItem label="Only Tab">

Single tab content
  </TabItem>
</Tabs>`

    expect(convertTabs(input)).toEqual(expected)
  })

  test('tabs with code blocks', () => {
    const input = `=== "Python"

    \`\`\`python
    def hello():
        print("Hello from Python")
    \`\`\`

=== "JavaScript"

    \`\`\`javascript
    function hello() {
        console.log("Hello from JavaScript");
    }
    \`\`\``

    const expected = `<Tabs>
  <TabItem label="Python">

\`\`\`python
def hello():
    print("Hello from Python")
\`\`\`

  </TabItem>
  <TabItem label="JavaScript">

\`\`\`javascript
function hello() {
    console.log("Hello from JavaScript");
}
\`\`\`
  </TabItem>
</Tabs>`

    expect(convertTabs(input)).toEqual(expected)
  })

  test('tabs with mixed content', () => {
    const input = `=== "Instructions"

    Follow these steps:

    1. First step
    2. Second step

=== "Code Example"

    Here's the code:

    \`\`\`bash
    npm install package
    \`\`\``

    const expected = `<Tabs>
  <TabItem label="Instructions">

Follow these steps:

1. First step
2. Second step

  </TabItem>
  <TabItem label="Code Example">

Here's the code:

\`\`\`bash
npm install package
\`\`\`
  </TabItem>
</Tabs>`

    expect(convertTabs(input)).toEqual(expected)
  })

  test('tabs with no content', () => {
    const input = `=== "Empty Tab 1"

=== "Empty Tab 2"`

    const expected = `<Tabs>
  <TabItem label="Empty Tab 1">

  </TabItem>
  <TabItem label="Empty Tab 2">
  </TabItem>
</Tabs>`

    expect(convertTabs(input)).toEqual(expected)
  })

  test('multiple tab groups in same document', () => {
    const input = `First tab group:

=== "Tab A"

    Content A

=== "Tab B"

    Content B

Some text between groups.

=== "Tab X"

    Content X

=== "Tab Y"

    Content Y`

    const expected = `First tab group:

<Tabs>
  <TabItem label="Tab A">

Content A

  </TabItem>
  <TabItem label="Tab B">

Content B

  </TabItem>
</Tabs>
Some text between groups.

<Tabs>
  <TabItem label="Tab X">

Content X

  </TabItem>
  <TabItem label="Tab Y">

Content Y
  </TabItem>
</Tabs>`

    expect(convertTabs(input)).toEqual(expected)
  })

  test('tabs mixed with other content', () => {
    const input = `# Documentation

Some introduction text.

=== "Option 1"

    Choose this option if...

=== "Option 2"

    Choose this option if...

## Next Section

More content here.`

    const expected = `# Documentation

Some introduction text.

<Tabs>
  <TabItem label="Option 1">

Choose this option if...

  </TabItem>
  <TabItem label="Option 2">

Choose this option if...

  </TabItem>
</Tabs>
## Next Section

More content here.`

    expect(convertTabs(input)).toEqual(expected)
  })

  test('tabs with complex indented content', () => {
    const input = `=== "Configuration"

    Edit your config:

    \`\`\`yaml
    site_name: My Site
    theme:
      name: material
    \`\`\`

    Then run:

    \`\`\`bash
    mkdocs serve
    \`\`\`

=== "Alternative"

    Use the alternative method:

    - Step 1
    - Step 2
      - Substep A
      - Substep B`

    const expected = `<Tabs>
  <TabItem label="Configuration">

Edit your config:

\`\`\`yaml
site_name: My Site
theme:
  name: material
\`\`\`

Then run:

\`\`\`bash
mkdocs serve
\`\`\`

  </TabItem>
  <TabItem label="Alternative">

Use the alternative method:

- Step 1
- Step 2
  - Substep A
  - Substep B
  </TabItem>
</Tabs>`

    expect(convertTabs(input)).toEqual(expected)
  })

  test('preserve non-tab content unchanged', () => {
    const input = `# Regular Markdown

This is normal content.

- List item 1
- List item 2

Some code:

\`\`\`python
print("hello")
\`\`\`

More text.`

    const expected = `# Regular Markdown

This is normal content.

- List item 1
- List item 2

Some code:

\`\`\`python
print("hello")
\`\`\`

More text.`

    expect(convertTabs(input)).toEqual(expected)
  })
})
