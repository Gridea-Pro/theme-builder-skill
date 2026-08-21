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
import type { Context } from '@deepseek-ai/cordis';
/** Cordis plugin name. */
export declare const name = "gridea-theme-builder";
/** Required capability seam: the skills registry. */
export declare const inject: string[];
/** Register the bundled gridea-theme-builder skill provider on ctx.skills. */
export declare function apply(ctx: Context): void;
