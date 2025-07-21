import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import { pipeline } from './pipeline'
import type { ConversionConfig, SectionConfig } from './config'

export type FileProcessingResult = {
  processed: number
  markdownFiles: number
  assetFiles: number
  errors: string[]
}

export type ProcessedFile = {
  originalPath: string
  newPath: string
  type: 'markdown' | 'asset'
  urlMappings?: Map<string, string>
}

/**
 * Entrypoint.
 *
 * In our material mkdocs system, the docs are assembled based on multiple
 * repositories. This should run in parallel, on each section.
 */
export async function convert(
  config: ConversionConfig,
): Promise<FileProcessingResult[]> {
  const results = await Promise.all(
    config.sections.map((section) => convertSection(section)),
  )
  return results
}

/**
 * Convert a single section by reading all files, categorizing them,
 * moving assets, and applying the pipeline to markdown files.
 */
export async function convertSection(
  config: SectionConfig,
): Promise<FileProcessingResult> {
  const result: FileProcessingResult = {
    processed: 0,
    markdownFiles: 0,
    assetFiles: 0,
    errors: [],
  }

  try {
    // Ensure output directories exist
    await ensureDirectories(config)

    // Get all files from the original path
    const allFiles = await getAllFiles(config.originalPath)

    // Categorize files into markdown and assets
    const { markdownFiles, assetFiles } = categorizeFiles(allFiles)

    // Create URL mapping for assets first (needed for markdown processing)
    const urlMappings = await processAssetFiles(assetFiles, config, result)

    // Process markdown files with URL rewriting
    await processMarkdownFiles(markdownFiles, config, result, urlMappings)

    result.processed = markdownFiles.length + assetFiles.length
  } catch (error) {
    result.errors.push(
      `Section conversion failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return result
}

/**
 * Recursively get all files from a directory
 */
async function getAllFiles(dirPath: string): Promise<string[]> {
  const files: string[] = []

  try {
    const entries = await readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name)

      if (entry.isDirectory()) {
        // Skip hidden directories and common non-content directories
        if (
          !entry.name.startsWith('.') &&
          !['node_modules', 'dist', 'build'].includes(entry.name)
        ) {
          const subFiles = await getAllFiles(fullPath)
          files.push(...subFiles)
        }
      } else if (
        entry.isFile() && // Skip hidden files and common non-content files
        !entry.name.startsWith('.') &&
        !entry.name.endsWith('.pyc')
      ) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to read directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return files
}

/**
 * Categorize files into markdown and asset files
 */
function categorizeFiles(files: string[]): {
  markdownFiles: string[]
  assetFiles: string[]
} {
  const markdownExtensions = new Set(['.md', '.markdown', '.mdx'])
  const assetExtensions = new Set([
    // Images
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.webp',
    '.ico',
    // Documents
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    // Videos
    '.mp4',
    '.webm',
    '.mov',
    '.avi',
    // Audio
    '.mp3',
    '.wav',
    '.ogg',
    // Archives
    '.zip',
    '.tar',
    '.gz',
    '.7z',
    // Fonts
    '.woff',
    '.woff2',
    '.ttf',
    '.otf',
    // Data
    '.json',
    '.xml',
    '.csv',
    '.yaml',
    '.yml',
  ])

  const markdownFiles: string[] = []
  const assetFiles: string[] = []

  for (const file of files) {
    const ext = extname(file).toLowerCase()

    if (markdownExtensions.has(ext)) {
      markdownFiles.push(file)
    } else if (assetExtensions.has(ext)) {
      assetFiles.push(file)
    }
    // Skip other file types (e.g., .py, .js config files, etc.)
  }

  return { markdownFiles, assetFiles }
}

/**
 * Ensure output directories exist
 */
async function ensureDirectories(config: SectionConfig): Promise<void> {
  await mkdir(config.contentPath, { recursive: true })
  await mkdir(config.optimizedAssetsPath, { recursive: true })

  // Create public assets path if it's a local path
  if (
    config.publicAssetsPath.startsWith('./') ||
    config.publicAssetsPath.startsWith('/')
  ) {
    const publicPath = config.publicAssetsPath.replace(/^\//, '')
    await mkdir(publicPath, { recursive: true })
  }
}

/**
 * Process asset files by copying them to appropriate locations
 */
async function processAssetFiles(
  assetFiles: string[],
  config: SectionConfig,
  result: FileProcessingResult,
): Promise<Map<string, string>> {
  const urlMappings = new Map<string, string>()

  for (const assetFile of assetFiles) {
    try {
      const relativePath = relative(config.originalPath, assetFile)
      const filename = basename(assetFile)

      // Determine destination based on file type
      const ext = extname(assetFile).toLowerCase()
      const isOptimizable = [
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.svg',
        '.webp',
      ].includes(ext)

      let destinationPath: string
      let publicUrl: string

      if (isOptimizable) {
        // Optimizable assets go to the assets folder
        destinationPath = join(config.optimizedAssetsPath, relativePath)
        publicUrl = `${config.publicAssetsPath}${relativePath}`.replaceAll(
          '\\',
          '/',
        )
      } else {
        // Non-optimizable assets go directly to public
        const publicPath = config.publicAssetsPath.replace(/^\//, '')
        destinationPath = join(publicPath, relativePath)
        publicUrl = `${config.publicAssetsPath}${relativePath}`.replaceAll(
          '\\',
          '/',
        )
      }

      // Ensure destination directory exists
      await mkdir(dirname(destinationPath), { recursive: true })

      // Copy the file
      await copyFile(assetFile, destinationPath)

      // Store URL mapping for later use in markdown processing
      urlMappings.set(assetFile, publicUrl)
      urlMappings.set(relativePath, publicUrl)
      urlMappings.set(filename, publicUrl)

      result.assetFiles++
    } catch (error) {
      result.errors.push(
        `Failed to process asset ${assetFile}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  return urlMappings
}

/**
 * Process markdown files by applying the pipeline and rewriting URLs
 */
async function processMarkdownFiles(
  markdownFiles: string[],
  config: SectionConfig,
  result: FileProcessingResult,
  urlMappings: Map<string, string>,
): Promise<void> {
  for (const markdownFile of markdownFiles) {
    try {
      // Read the original markdown file
      const originalContent = await readFile(markdownFile, 'utf-8')

      // Apply the conversion pipeline
      let convertedContent = pipeline(originalContent)

      // Apply URL rewriting for local file references
      convertedContent = rewriteUrls(
        convertedContent,
        markdownFile,
        config,
        urlMappings,
      )

      // Determine output path
      const relativePath = relative(config.originalPath, markdownFile)
      const outputPath = join(config.contentPath, relativePath)

      // Ensure output directory exists
      await mkdir(dirname(outputPath), { recursive: true })

      // Write the converted markdown
      await writeFile(outputPath, convertedContent, 'utf-8')

      result.markdownFiles++
    } catch (error) {
      result.errors.push(
        `Failed to process markdown ${markdownFile}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }
}

/**
 * Rewrite URLs in markdown content to point to new asset locations
 */
function rewriteUrls(
  content: string,
  markdownFilePath: string,
  config: SectionConfig,
  urlMappings: Map<string, string>,
): string {
  let rewrittenContent = content

  // Remove Material MkDocs specific link attributes
  rewrittenContent = rewrittenContent.replaceAll('{:target="_blank"}', '')
  rewrittenContent = rewrittenContent.replaceAll("{:target='_blank'}", '')

  // Rewrite image references: ![alt](path) and ![alt](path "title")
  rewrittenContent = rewrittenContent.replaceAll(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
    (match, alt, imagePath) => {
      const newUrl = resolveAssetUrl(
        imagePath.trim(),
        markdownFilePath,
        config,
        urlMappings,
      )
      return newUrl ? `![${alt}](${newUrl})` : match
    },
  )

  // Rewrite link references: [text](path) - but only for local files
  rewrittenContent = rewrittenContent.replaceAll(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, linkText, linkPath) => {
      const trimmedPath = linkPath.trim()

      // Skip external links (http, https, mailto, etc.)
      if (/^(?:https?|mailto|ftp|tel):/.test(trimmedPath)) {
        return match
      }

      const newUrl = resolveAssetUrl(
        trimmedPath,
        markdownFilePath,
        config,
        urlMappings,
      )
      return newUrl ? `[${linkText}](${newUrl})` : match
    },
  )

  // Rewrite HTML img tags: <img src="path" />
  rewrittenContent = rewrittenContent.replaceAll(
    /<img([^>]+)src=["']([^"']+)["']([^>]*)>/g,
    (match, beforeSrc, imagePath, afterSrc) => {
      const newUrl = resolveAssetUrl(
        imagePath.trim(),
        markdownFilePath,
        config,
        urlMappings,
      )
      return newUrl ? `<img${beforeSrc}src="${newUrl}"${afterSrc}>` : match
    },
  )

  return rewrittenContent
}

/**
 * Resolve the new URL for an asset reference
 */
function resolveAssetUrl(
  originalPath: string,
  markdownFilePath: string,
  config: SectionConfig,
  urlMappings: Map<string, string>,
): string | null {
  // Skip external URLs
  if (/^(?:https?|mailto|ftp|tel):/.test(originalPath)) {
    return null
  }

  // Skip anchor links
  if (originalPath.startsWith('#')) {
    return null
  }

  try {
    // Try direct mapping first
    if (urlMappings.has(originalPath)) {
      return urlMappings.get(originalPath)!
    }

    // Try resolving relative to markdown file
    const markdownDir = dirname(markdownFilePath)
    const resolvedPath = resolve(markdownDir, originalPath)

    if (urlMappings.has(resolvedPath)) {
      return urlMappings.get(resolvedPath)!
    }

    // Try relative path from original directory
    const relativeFromOriginal = relative(config.originalPath, resolvedPath)
    if (urlMappings.has(relativeFromOriginal)) {
      return urlMappings.get(relativeFromOriginal)!
    }

    // Try just the filename
    const filename = basename(originalPath)
    if (urlMappings.has(filename)) {
      return urlMappings.get(filename)!
    }
  } catch {
    // If path resolution fails, skip rewriting
  }

  return null
}
