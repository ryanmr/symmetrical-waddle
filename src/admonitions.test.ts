import { describe, expect, test } from 'vitest'

import { convertAdmonitions } from './admonitions'

// reference documentation from material mkdocs on Admonitions
// https://squidfunk.github.io/mkdocs-material/reference/admonitions/

// reference documentation from starlight/astro on Asides
// https://starlight.astro.build/components/asides/

describe('admonitions', () => {
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

    expect(convertAdmonitions(input)).toEqual(expected)
  })

  test('admonition with title', () => {
    const input = `!!! warning "Be Careful"

    This is a warning with a custom title.`

    const expected = `:::caution[Be Careful]

    This is a warning with a custom title.
:::`

    expect(convertAdmonitions(input)).toEqual(expected)
  })

  test('collapsible admonition (initially collapsed)', () => {
    const input = `??? tip "Click to expand"

    This content is initially hidden.`

    const expected = `<!-- Material MkDocs collapsible block (initially collapsed) converted to regular aside -->
:::tip[Click to expand]

    This content is initially hidden.
:::`

    expect(convertAdmonitions(input)).toEqual(expected)
  })

  test('collapsible admonition (initially expanded)', () => {
    const input = `???+ info "Details"

    This content is initially visible but collapsible.`

    const expected = `<!-- Material MkDocs collapsible block (initially expanded) converted to regular aside -->
:::note[Details]

    This content is initially visible but collapsible.
:::`

    expect(convertAdmonitions(input)).toEqual(expected)
  })

  describe('supported type mappings', () => {
    test('direct mappings', () => {
      expect(convertAdmonitions('!!! note\n\n    Content')).toContain(':::note')
      expect(convertAdmonitions('!!! tip\n\n    Content')).toContain(':::tip')
      expect(convertAdmonitions('!!! warning\n\n    Content')).toContain(
        ':::caution',
      )
      expect(convertAdmonitions('!!! danger\n\n    Content')).toContain(
        ':::danger',
      )
    })

    test('approximate mappings', () => {
      expect(convertAdmonitions('!!! info\n\n    Content')).toContain(':::note')
      expect(convertAdmonitions('!!! success\n\n    Content')).toContain(
        ':::tip',
      )
      expect(convertAdmonitions('!!! question\n\n    Content')).toContain(
        ':::note',
      )
      expect(convertAdmonitions('!!! failure\n\n    Content')).toContain(
        ':::danger',
      )
      expect(convertAdmonitions('!!! bug\n\n    Content')).toContain(
        ':::danger',
      )
    })

    test('fallback mappings to note', () => {
      expect(convertAdmonitions('!!! abstract\n\n    Content')).toContain(
        ':::note',
      )
      expect(convertAdmonitions('!!! example\n\n    Content')).toContain(
        ':::note',
      )
      expect(convertAdmonitions('!!! quote\n\n    Content')).toContain(
        ':::note',
      )
    })
  })

  describe('fallback type mappings', () => {
    test('abstract admonition converts to note', () => {
      const input = `!!! abstract "Summary"

    This is an abstract section.`

      const expected = `:::note[Summary]

    This is an abstract section.
:::`

      expect(convertAdmonitions(input)).toEqual(expected)
    })

    test('example admonition converts to note', () => {
      const input = `!!! example

    This is an example.`

      const expected = `:::note

    This is an example.
:::`

      expect(convertAdmonitions(input)).toEqual(expected)
    })

    test('quote admonition converts to note', () => {
      const input = `!!! quote "Famous Quote"

    To be or not to be.`

      const expected = `:::note[Famous Quote]

    To be or not to be.
:::`

      expect(convertAdmonitions(input)).toEqual(expected)
    })
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

    expect(convertAdmonitions(input)).toEqual(expected)
  })

  test('admonition with no content', () => {
    const input = `!!! tip "Empty"`

    const expected = `:::tip[Empty]
:::`

    expect(convertAdmonitions(input)).toEqual(expected)
  })

  test('nested content preservation', () => {
    const input = `!!! note

    This is a note with:

    - List item 1
    - List item 2

    And a code block:

        def hello():
            print("world")`

    const expected = `:::note

    This is a note with:

    - List item 1
    - List item 2

    And a code block:

        def hello():
            print("world")
:::`

    expect(convertAdmonitions(input)).toEqual(expected)
  })
})
