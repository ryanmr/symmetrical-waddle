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
