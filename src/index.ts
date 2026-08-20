/**
 * Gridea Pro theme builder skill provider for DeepSeek Harness.
 *
 * Registers the `gridea-theme-builder` skill from the bundled SKILL.md.
 * The resourceBase points to the plugin bundle directory so the model can
 * resolve references/, scripts/, and assets/ relative paths mentioned in
 * the skill body.
 *
 * Pattern follows the official @deepseek-ai/dsh-skill-badge plugin:
 *   - registerProvider() with a static SkillProvider
 *   - list() returns a pre-built candidate (description read lazily in get())
 *   - get() reads SKILL.md at call time (body and description picked up dynamically)
 *
 * @module @gridea-pro/dsh-skill-theme-builder
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import {
  BUNDLED_SKILL_RANK,
  type SkillCandidate,
  type SkillDefinition,
  type SkillProvider,
} from '@deepseek-ai/dsh-skill'

/** Absolute URL to the bundled SKILL.md body file. */
const SKILL_BODY_URL = new URL('../SKILL.md', import.meta.url)

/**
 * Directory base for relative resource resolution.
 * The model receives this path in the <skill_resources> block and resolves
 * references/scripts/assets paths against it.
 */
const RESOURCE_BASE = {
  kind: 'directory' as const,
  path: fileURLToPath(new URL('../', import.meta.url)),
}

/** Skill is available on both model and user invocation surfaces. */
const INVOCATION = { modelInvocable: true, userInvocable: true } as const

/**
 * Fallback description used by list() before SKILL.md is read.
 * get() always reads the real description from frontmatter at call time,
 * so this constant only needs to be a reasonable placeholder.
 */
const FALLBACK_DESCRIPTION = 'Gridea Pro 博客主题开发专家'

/**
 * Parse YAML frontmatter from a Markdown file.
 * Returns { description, body } where description is extracted from the
 * `description` field (supports both block scalar `>` and plain string).
 * If no frontmatter is present, returns the full content as body.
 */
function parseFrontmatter(raw: string): { description: string; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { description: FALLBACK_DESCRIPTION, body: raw }

  const frontmatter = match[1]
  const body = match[2]

  // Match description field (handles `>` block scalar and plain string)
  const descMatch = frontmatter.match(/^description:\s*(?:>\s*\n([\s\S]*?)(?=\n\w|\n---)|(.+))$/m)
  let description = FALLBACK_DESCRIPTION
  if (descMatch) {
    description = (descMatch[1] || descMatch[2] || FALLBACK_DESCRIPTION).trim()
  }

  return { description, body }
}

/** Static candidate returned by list(). Description is a placeholder; get() returns the real one. */
const CANDIDATE: SkillCandidate = {
  name: 'gridea-theme-builder',
  description: FALLBACK_DESCRIPTION,
  invocation: INVOCATION,
  provider: 'gridea-theme-builder',
  source: 'bundled',
  resourceBase: RESOURCE_BASE,
  rank: BUNDLED_SKILL_RANK,
  locator: SKILL_BODY_URL,
}

const provider: SkillProvider = {
  name: 'gridea-theme-builder',
  list: () => Promise.resolve([CANDIDATE]),
  async get(): Promise<SkillDefinition> {
    const raw = await readFile(SKILL_BODY_URL, 'utf8')
    const { description, body } = parseFrontmatter(raw)
    return {
      name: CANDIDATE.name,
      description,
      invocation: CANDIDATE.invocation,
      provider: CANDIDATE.provider,
      source: CANDIDATE.source,
      resourceBase: RESOURCE_BASE,
      content: body,
    }
  },
}

/** Cordis plugin name. */
export const name = 'gridea-theme-builder'

/** Required capability seam: the skills registry. */
export const inject = ['skills']

/** Register the bundled gridea-theme-builder skill provider on ctx.skills. */
export function apply(ctx: Context): void {
  ctx.skills.registerProvider(() => provider)
}
