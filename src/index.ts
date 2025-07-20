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

main()
  .then(() => {
    console.info(`😺 all done`)
  })
  .catch((error) => {
    console.warn(`🙀 there was an error`)
    console.error(error)
  })
