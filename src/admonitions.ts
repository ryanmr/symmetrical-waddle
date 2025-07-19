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
 * Converts Material MkDocs admonitions to Starlight asides.
 *
 * Supports:
 * - Standard admonitions: !!! type "title"
 * - Collapsible blocks: ??? type "title" (initially collapsed)
 * - Expanded collapsible: ???+ type "title" (initially expanded)
 * - All Material MkDocs admonition types with appropriate mapping
 *
 * @param input - Raw markdown string with Material MkDocs admonitions
 * @returns Converted markdown with Starlight aside syntax
 */
export function convertAdmonitions(input: string): string {
  const lines = input.split('\n')
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Match standard (!!! type) and collapsible (??? or ???+ type) admonitions
    const admonitionMatch = line.match(
      /^(\?\?\?\+?|!!!)\s+(\w+)(?:\s+"([^"]*)")?/,
    )

    if (admonitionMatch) {
      const [, syntax, originalType, title] = admonitionMatch
      const isCollapsible = syntax.startsWith('???')
      const isExpandedCollapsible = syntax === '???+'

      // Map the type to Starlight equivalent
      const mappedType = ADMONITION_TYPE_MAP[originalType] || 'note' // Default to 'note' for unknown types

      // Handle collapsible blocks
      if (isCollapsible) {
        // Starlight doesn't support collapsible asides directly
        // Emit a comment and convert to regular aside
        const collapsibleType = isExpandedCollapsible ? 'expanded' : 'collapsed'
        result.push(
          `<!-- Material MkDocs collapsible block (initially ${collapsibleType}) converted to regular aside -->`,
        )
      }

      // Create the opening aside syntax
      let asideStart = `:::${mappedType}`
      if (title) {
        asideStart += `[${title}]`
      }

      result.push(asideStart)

      // Process subsequent lines that belong to this admonition
      i++ // Move past the admonition declaration line

      while (i < lines.length) {
        const contentLine = lines[i]

        // Break if we hit content that's not part of the admonition
        if (
          contentLine.trim() !== '' &&
          !contentLine.startsWith('    ') &&
          !contentLine.startsWith('\t')
        ) {
          i-- // Step back one line
          break
        }

        result.push(contentLine)
        i++
      }

      // Add closing aside syntax
      result.push(':::')
    } else {
      result.push(line)
    }
  }

  return result.join('\n')
}
