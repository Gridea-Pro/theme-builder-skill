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
 *   - list() and get() both read SKILL.md at call time, so edits to the
 *     frontmatter description and to the body are picked up without a rebuild
 *
 * @module @gridea-pro/dsh-skill-theme-builder
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { BUNDLED_SKILL_RANK, } from '@deepseek-ai/dsh-skill';
/** Absolute URL to the bundled SKILL.md body file. */
const SKILL_BODY_URL = new URL('../SKILL.md', import.meta.url);
/**
 * Directory base for relative resource resolution.
 * The model receives this path in the <skill_resources> block and resolves
 * references/scripts/assets paths against it.
 */
const RESOURCE_BASE = {
    kind: 'directory',
    path: fileURLToPath(new URL('../', import.meta.url)),
};
/** Skill is available on both model and user invocation surfaces. */
const INVOCATION = { modelInvocable: true, userInvocable: true };
/** Used only when SKILL.md is unreadable or carries no description. */
const FALLBACK_DESCRIPTION = 'Gridea Pro 博客主题开发专家';
/**
 * Split a Markdown file into its frontmatter `description` and its body.
 *
 * Handles both YAML forms the description may take:
 *   - block scalar (`>` or `|`) followed by indented lines, folded into one line
 *   - plain single-line value
 *
 * The block-scalar branch must not depend on anything following it: in this
 * skill `description` is the last frontmatter field, and the closing `---` is
 * already consumed by the outer match.
 */
function parseFrontmatter(raw) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!match)
        return { description: FALLBACK_DESCRIPTION, body: raw };
    const frontmatter = match[1];
    const body = match[2];
    const block = frontmatter.match(/^description:[ \t]*[>|][-+]?[ \t]*\r?\n((?:[ \t]+.*(?:\r?\n|$))+)/m);
    if (block) {
        const folded = block[1].split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join(' ');
        if (folded)
            return { description: folded, body };
    }
    const plain = frontmatter.match(/^description:[ \t]*(\S.*?)[ \t]*$/m);
    return { description: plain ? plain[1] : FALLBACK_DESCRIPTION, body };
}
/** Candidate shape shared by list() and get(); `description` is filled in from SKILL.md. */
const CANDIDATE = {
    name: 'gridea-theme-builder',
    invocation: INVOCATION,
    provider: 'gridea-theme-builder',
    source: 'bundled',
    resourceBase: RESOURCE_BASE,
    rank: BUNDLED_SKILL_RANK,
    locator: SKILL_BODY_URL,
};
const provider = {
    name: 'gridea-theme-builder',
    /**
     * The catalog description is the model's only routing signal — `get()` runs
     * only after the model has already chosen this skill — so the full
     * frontmatter description (trigger conditions and keywords included) has to
     * be resolved here, not deferred to load time.
     *
     * An unreadable SKILL.md degrades to the fallback description instead of
     * throwing, so one broken bundle cannot empty the whole catalog.
     */
    async list() {
        let description = FALLBACK_DESCRIPTION;
        try {
            description = parseFrontmatter(await readFile(SKILL_BODY_URL, 'utf8')).description;
        }
        catch {
            // 保底：读不到就用兜底描述，不让整个 skill 目录塌掉
        }
        return [{ ...CANDIDATE, description }];
    },
    async get() {
        const raw = await readFile(SKILL_BODY_URL, 'utf8');
        const { description, body } = parseFrontmatter(raw);
        return {
            name: CANDIDATE.name,
            description,
            invocation: CANDIDATE.invocation,
            provider: CANDIDATE.provider,
            source: CANDIDATE.source,
            resourceBase: RESOURCE_BASE,
            content: body,
        };
    },
};
/** Cordis plugin name. */
export const name = 'gridea-theme-builder';
/** Required capability seam: the skills registry. */
export const inject = ['skills'];
/** Register the bundled gridea-theme-builder skill provider on ctx.skills. */
export function apply(ctx) {
    ctx.skills.registerProvider(() => provider);
}
