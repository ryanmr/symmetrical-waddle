import { z } from 'zod'

/**
 * Zod schema for section configuration
 */
export const sectionConfigSchema = z.object({
  slug: z
    .string()
    .min(1, 'Section slug cannot be empty')
    .regex(/^[a-z0-9-]+$/, 'Section slug must contain only lowercase letters, numbers, and hyphens'),
  sectionName: z.string().min(1, 'Section name cannot be empty'),
  contentPath: z.string().min(1, 'Content path cannot be empty'),
  publicAssetsPath: z.string().min(1, 'Public assets path cannot be empty'),
  optimizedAssetsPath: z.string().min(1, 'Optimized assets path cannot be empty'),
  originalPath: z.string().min(1, 'Original path cannot be empty'),
})

/**
 * Zod schema for the complete conversion configuration
 */
export const conversionConfigSchema = z.object({
  sections: z
    .array(sectionConfigSchema)
    .min(1, 'At least one section must be configured')
    .refine(
      (sections) => {
        const slugs = sections.map((s) => s.slug)
        return new Set(slugs).size === slugs.length
      },
      {
        message: 'Section slugs must be unique',
      },
    ),
})

/**
 * TypeScript types inferred from zod schemas
 */
export type SectionConfig = z.infer<typeof sectionConfigSchema>
export type ConversionConfig = z.infer<typeof conversionConfigSchema>

/**
 * Default configuration
 */
export const defaultConfig: ConversionConfig = {
  sections: [
    {
      slug: 'docs',
      sectionName: 'Documentation',
      contentPath: './output/content/docs',
      publicAssetsPath: '/assets/docs/',
      optimizedAssetsPath: './output/assets/docs',
      originalPath: './input/docs',
    },
  ],
}

/**
 * Validate configuration using zod schema
 */
export function validateConfig(config: unknown): ConversionConfig {
  try {
    return conversionConfigSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map((err: z.ZodIssue) => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
        return `${path}${err.message}`
      })
      throw new Error(`Configuration validation failed:\n  - ${messages.join('\n  - ')}`)
    }
    throw error
  }
}