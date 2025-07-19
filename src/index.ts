import { convertAdmonitions } from './admonitions'

/**
 * Application entrypoint (triggered at the end of this file)
 */
export async function main() {
  // TODO
}

/**
 * CLI entrypoint.
 */
export async function cli() {
  // TODO cli impl
}

/**
 * Conversion pipeline (unified, re-family of packages).
 *
 * Converts material mkdocs markdown syntax into starlight/astro mdx syntax.
 */
export function pipeline(input: string): string {
  let result = input

  // Apply all conversions in sequence
  result = convertAdmonitions(result)

  // Future converters will be added here:
  // result = convertCodeFences(result)
  // result = convertTabs(result)

  return result
}

main()
  .then(() => {
    console.info(`😺 all done`)
  })
  .catch((error) => {
    console.warn(`🙀 there was an error`)
    console.error(error)
  })
