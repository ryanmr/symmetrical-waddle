// reference documentation from material mkdocs on Content Tabs
// https://squidfunk.github.io/mkdocs-material/reference/content-tabs/

// reference documentation from starlight/astro on Tabs
// https://starlight.astro.build/components/tabs/

/**
 * Converts Material MkDocs content tabs to Starlight tabs.
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
 *
 * @param input - Raw markdown string with Material MkDocs tabs
 * @returns Converted markdown with Starlight tab syntax
 */
export function convertTabs(input: string): string {
  const lines = input.split('\n')
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if this line starts a tab group
    const tabMatch = line.match(/^===\s+"([^"]*)"/)

    if (tabMatch) {
      // Found start of a tab group
      const tabItems: Array<{ label: string; content: string[] }> = []

      // Process this tab and any subsequent tabs in the group
      while (i < lines.length) {
        const currentLine = lines[i]
        const currentTabMatch = currentLine.match(/^===\s+"([^"]*)"/)

        if (!currentTabMatch) {
          break // No more tabs in this group
        }

        const [, tabLabel] = currentTabMatch
        const tabContent: string[] = []

        i++ // Move past the tab declaration line

        // Collect content for this tab until we hit another tab or end
        while (i < lines.length) {
          const contentLine = lines[i]

          // Check if we hit another tab declaration
          if (/^===\s+"[^"]*"/.test(contentLine)) {
            break // Next tab found, don't increment i
          }

          // Check if we hit content that's not part of the tab (not indented)
          if (
            contentLine.trim() !== '' &&
            !contentLine.startsWith('    ') &&
            !contentLine.startsWith('\t')
          ) {
            break // End of tab group
          }

          tabContent.push(contentLine)
          i++
        }

        tabItems.push({ label: tabLabel, content: tabContent })
      }

      // Generate Starlight tabs syntax
      if (tabItems.length > 0) {
        result.push('<Tabs>')

        for (const tab of tabItems) {
          // Start TabItem with label
          result.push(`  <TabItem label="${tab.label}">`)

          // Add tab content (preserve indentation by removing 4 spaces or 1 tab)
          for (const contentLine of tab.content) {
            if (contentLine.startsWith('    ')) {
              result.push(contentLine.slice(4)) // Remove 4 spaces
            } else if (contentLine.startsWith('\t')) {
              result.push(contentLine.slice(1)) // Remove 1 tab
            } else {
              result.push(contentLine) // Keep empty lines and other content as-is
            }
          }

          // Close TabItem
          result.push('  </TabItem>')
        }

        result.push('</Tabs>')
      }

      // Adjust i since we've processed multiple lines
      i-- // Will be incremented by for loop
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}
