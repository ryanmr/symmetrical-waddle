import { visit } from 'unist-util-visit'
import type { Code, Paragraph, Root, Text } from 'mdast'

// reference documentation from material mkdocs on Content Tabs
// https://squidfunk.github.io/mkdocs-material/reference/content-tabs/

// reference documentation from starlight/astro on Tabs
// https://starlight.astro.build/components/tabs/

/**
 * AST transformer function that converts Material MkDocs content tabs to Starlight tabs.
 *
 * Transforms syntax from:
 * === "Tab Label"
 *     Content here
 *
 * === "Another Tab"
 *     More content
 *
 * To:
 * <Tabs>
 *   <TabItem label="Tab Label">Content here</TabItem>
 *   <TabItem label="Another Tab">More content</TabItem>
 * </Tabs>
 */
export function transformTabs(tree: Root): void {
  const tabGroups: Array<{
    startIndex: number
    endIndex: number
    parent: any
    tabs: Array<{ label: string; content: string }>
  }> = []

  // First pass: identify tab groups
  visit(
    tree,
    'paragraph',
    (paragraphNode: Paragraph, paragraphIndex, parent) => {
      if (!parent || paragraphIndex === undefined) return

      // Check if this paragraph starts a tab group
      const firstChild = paragraphNode.children[0]
      if (firstChild?.type !== 'text') return

      const text = firstChild.value.trim()
      const tabMatch = text.match(/^===\s+"([^"]*)"$/)

      if (!tabMatch) return

      // Found start of a tab group - collect all consecutive tabs
      const tabs: Array<{ label: string; content: string }> = []
      let currentIndex = paragraphIndex

      while (currentIndex < parent.children.length) {
        const currentNode = parent.children[currentIndex]

        if (currentNode.type !== 'paragraph') break

        const currentFirstChild = currentNode.children[0]
        if (currentFirstChild?.type !== 'text') break

        const currentText = currentFirstChild.value.trim()
        const currentTabMatch = currentText.match(/^===\s+"([^"]*)"$/)

        if (!currentTabMatch) break

        const [, tabLabel] = currentTabMatch

        // Look for the next code block (tab content)
        const nextNode = parent.children[currentIndex + 1]
        let content = ''

        if (nextNode?.type === 'code') {
          content = nextNode.value
          currentIndex += 2 // Skip both paragraph and code block
        } else {
          currentIndex += 1 // Skip just the paragraph
        }

        tabs.push({ label: tabLabel, content })
      }

      if (tabs.length > 0) {
        tabGroups.push({
          startIndex: paragraphIndex,
          endIndex: currentIndex, // This is the first index AFTER the tab group
          parent,
          tabs,
        })
      }
    },
  )

  // Second pass: apply transformations in reverse order
  tabGroups.reverse().forEach(({ startIndex, endIndex, parent, tabs }) => {
    // Build the Starlight tabs syntax
    const tabLines = [
      '<Tabs>',
      ...tabs.flatMap((tab) => [
        `  <TabItem label="${tab.label}">`,
        // Re-indent the content
        ...tab.content.split('\n').map((line) => line),
        '  </TabItem>',
      ]),
      '</Tabs>',
    ]

    // Create a new text node with the complete tabs content
    const newTextNode: Text = {
      type: 'text',
      value: tabLines.join('\n'),
    }

    // Create a new paragraph node
    const newParagraphNode: Paragraph = {
      type: 'paragraph',
      children: [newTextNode],
    }

    // Replace all the tab nodes with the new tabs content
    const nodesToReplace = endIndex - startIndex
    parent.children.splice(startIndex, nodesToReplace, newParagraphNode)
  })
}
