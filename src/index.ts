#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { defaultConfig, validateConfig, type ConversionConfig } from './config'
import { convert } from './converter'

// Export all main functionality
export { pipeline } from './pipeline'
export { transformAdmonitions } from './admonitions'
export { transformTabs } from './tabs'
export { serializeTree } from './ast'
export {
  convert,
  convertSection,
  type FileProcessingResult,
  type ProcessedFile,
} from './converter'
export type { ConversionConfig, SectionConfig } from './config'

interface CliArguments {
  config: string
  verbose: boolean
  'dry-run': boolean
}

/**
 * Load and validate configuration from a JSON file
 */
async function loadConfig(configPath: string): Promise<ConversionConfig> {
  try {
    const configFile = resolve(configPath)
    const configContent = await readFile(configFile, 'utf-8')
    const rawConfig = JSON.parse(configContent)

    // Validate using zod schema
    return validateConfig(rawConfig)
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as any).code === 'ENOENT'
    ) {
      throw new Error(`Configuration file not found: ${configPath}`)
    }
    if (error instanceof SyntaxError) {
      throw new TypeError(
        `Invalid JSON in configuration file: ${error.message}`,
      )
    }
    throw error
  }
}

/**
 * Format processing results for display
 */
function formatResults(
  results: Awaited<ReturnType<typeof convert>>,
  verbose: boolean,
): boolean {
  let totalProcessed = 0
  let totalMarkdown = 0
  let totalAssets = 0
  let totalErrors = 0

  for (const [index, result] of results.entries()) {
    totalProcessed += result.processed
    totalMarkdown += result.markdownFiles
    totalAssets += result.assetFiles
    totalErrors += result.errors.length

    if (verbose) {
      console.info(`\nSection ${index + 1}:`)
      console.info(`  Processed: ${result.processed} files`)
      console.info(`  Markdown: ${result.markdownFiles} files`)
      console.info(`  Assets: ${result.assetFiles} files`)

      if (result.errors.length > 0) {
        console.info(`  Errors: ${result.errors.length}`)
        for (const error of result.errors) {
          console.info(`    - ${error}`)
        }
      }
    }
  }

  console.info(`\n📊 Summary:`)
  console.info(`  Total files processed: ${totalProcessed}`)
  console.info(`  Markdown files: ${totalMarkdown}`)
  console.info(`  Asset files: ${totalAssets}`)
  console.info(`  Sections: ${results.length}`)

  if (totalErrors > 0) {
    console.info(`  Errors: ${totalErrors}`)
    return false
  } else {
    console.info(`  ✅ No errors`)
    return true
  }
}

/**
 * CLI implementation using yargs
 */
export async function cli(): Promise<void> {
  // eslint-disable-next-line node/prefer-global/process
  const argv = (await yargs(hideBin(process.argv))
    .scriptName('mkdocs-to-starlight')
    .usage(
      '$0 [options]',
      'Convert Material MkDocs markdown files to Starlight/Astro format',
    )
    .option('config', {
      alias: 'c',
      type: 'string',
      default: './converter.config.json',
      description: 'Path to configuration file',
      normalize: true,
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      default: false,
      description: 'Enable verbose output',
    })
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      default: false,
      description: 'Show what would be converted without making changes',
    })
    .example([
      ['$0', 'Run conversion with default configuration'],
      ['$0 --config ./my-config.json', 'Use custom configuration file'],
      ['$0 --dry-run --verbose', 'Preview changes with detailed output'],
      ['$0 -c ./config.json -v', 'Verbose mode with custom config'],
    ])
    .help()
    .version()
    .strict()
    .parse()) as CliArguments

  try {
    let config: ConversionConfig

    // Try to load config file, fallback to default if not found
    try {
      config = await loadConfig(argv.config)
      if (argv.verbose) {
        console.info(`📋 Loaded configuration from: ${argv.config}`)
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        console.info(
          `📋 Configuration file not found, using default configuration`,
        )
        config = defaultConfig
        console.info(
          `💡 Tip: Create a ${argv.config} file to customize conversion settings`,
        )
      } else {
        throw error
      }
    }

    if (argv.verbose) {
      console.info(`🔧 Configuration:`)
      console.info(`  Sections: ${config.sections.length}`)
      for (const [index, section] of config.sections.entries()) {
        console.info(`  ${index + 1}. ${section.sectionName} (${section.slug})`)
        console.info(`     Input: ${section.originalPath}`)
        console.info(`     Output: ${section.contentPath}`)
      }
    }

    if (argv['dry-run']) {
      console.info(`🏃 Dry run mode - no files will be modified`)
      console.info(`📁 Would process ${config.sections.length} section(s):`)
      for (const section of config.sections) {
        console.info(
          `  - ${section.sectionName}: ${section.originalPath} → ${section.contentPath}`,
        )
      }
      return
    }

    console.info(`🚀 Starting conversion...`)
    const startTime = Date.now()

    const results = await convert(config)

    const duration = Date.now() - startTime
    const success = formatResults(results, argv.verbose)

    console.info(`⏱️  Completed in ${duration}ms`)

    if (!success) {
      // eslint-disable-next-line node/prefer-global/process
      process.exit(1)
    }
  } catch (error) {
    console.error(
      `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
    )
    // eslint-disable-next-line node/prefer-global/process
    process.exit(1)
  }
}

/**
 * Application entrypoint
 */
export async function main(): Promise<void> {
  await cli()
}

// Only run CLI if this file is executed directly
main()
  .then(() => {
    console.info(`😺 All done!`)
  })
  .catch((error) => {
    console.warn(`🙀 There was an error`)
    console.error(error)
    // eslint-disable-next-line node/prefer-global/process
    process.exit(1)
  })
