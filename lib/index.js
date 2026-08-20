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
 *   - list() returns a pre-built candidate
 *   - get() reads SKILL.md at call time (body edits picked up dynamically)
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
/**
 * Routing description shown in the model-facing skill catalog.
 * Must match the `description` field in SKILL.md frontmatter.
 * If the frontmatter description changes, update this constant.
 */
const DESCRIPTION = 'Gridea Pro 博客主题开发专家。支持 Jinja2 (Pongo2)、Go Templates、EJS 三种模板引擎。' +
    '提供主题脚手架生成、语法验证、渲染测试、避坑指南和完整的模板变量参考。' +
    '当用户要求创建 Gridea 主题、修改 Gridea 主题、修复主题渲染问题、学习 Gridea 主题开发、' +
    '从 EJS/Hugo 迁移主题时触发。' +
    '触发关键词：Gridea 主题、博客主题、theme 开发、模板语法、主题配置、theme config。';
/** Static candidate returned by every list() call. */
const CANDIDATE = {
    name: 'gridea-theme-builder',
    description: DESCRIPTION,
    invocation: INVOCATION,
    provider: 'gridea-theme-builder',
    source: 'bundled',
    resourceBase: RESOURCE_BASE,
    rank: BUNDLED_SKILL_RANK,
    locator: SKILL_BODY_URL,
};
/**
 * Strip YAML frontmatter (--- delimited) from a Markdown file and return
 * the body. If no frontmatter is present, the original content is returned
 * unchanged.
 */
function stripFrontmatter(raw) {
    const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?([\s\S]*)$/);
    return match ? match[1] : raw;
}
const provider = {
    name: 'gridea-theme-builder',
    list: () => Promise.resolve([CANDIDATE]),
    async get() {
        const raw = await readFile(SKILL_BODY_URL, 'utf8');
        return {
            name: CANDIDATE.name,
            description: CANDIDATE.description,
            invocation: CANDIDATE.invocation,
            provider: CANDIDATE.provider,
            source: CANDIDATE.source,
            resourceBase: RESOURCE_BASE,
            content: stripFrontmatter(raw),
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
