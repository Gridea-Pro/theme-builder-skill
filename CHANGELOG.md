# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 规范,版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Fixed / Changed

- `references/template-variables.md`：补齐与 Gridea Pro 真实运行时之间的多处差距：
  - **Post 对象**：补 `id` / `abstract` / `description` / `toc` / `categories` / `tagsString` / `stats` / `prevPost` / `nextPost` / `createdAt` / `updatedAt` / `updatedAtFormat` / `published`；
  - **修正旧文档错误**：`post.date` 实际是 `time.Time`（不是字符串），展示日期首选 `post.dateFormat`；
  - **新增对象章节**：`Category` / `PostStats` / `SimplePostView`（prevPost / nextPost 的元素类型）；
  - **Tag 对象**：补 `slug` / `usedName`；**Memo 对象**：补 `id` / `tags` / `createdAt` / `createdAtISO` / `dateFormat`；
  - **Pagination**：补 `currentPage` / `totalPages` / `totalPosts` / `hasPrev` / `hasNext` / `prevURL` / `nextURL`，并保留 `prev` / `next` 兼容字段；
  - **全局变量表**：补 `category` / `current_tag`(别名) / `archives` / `links` / `commentSetting` / `site`(`config` 别名)；
  - **新增页面 `category.html`**：每个分类一份，由引擎 `RenderCategoryPages` 自动渲染到 `/category/<slug>/`；同时澄清「**没有 `categories.html`**」——引擎不暴露全站分类索引页和 `categories` 全局数组，要做总览得自己从 `posts[].categories` 聚合；
  - **新增章节《引擎自动生成的输出》**：列出 `/api/search.json`（schema：`[{title, link, date, tags, content}]`，content 已脱 HTML）/ `/feed.xml` / `/atom.xml` / `/sitemap.xml` / `/robots.txt` / `/manifest.json`，以及客户端 fetch 示例；
  - **上下篇导航语义警示**：`prevPost` 在 Gridea Pro 里实际是数组前一项（更新的一篇），与 Hexo / Hugo 习惯相反；从其他生态移植主题时不能照搬「上一篇 = 更早」的标签。
- `assets/mock-data.json`：首篇 mock 文章补 `id` / `abstract` / `description` / `toc` / `categories` / `stats` / `prevPost` / `nextPost` / `createdAt` / `updatedAt` 等新字段；新增 `category` 全局对象供 `category.html` 渲染；标签补 `slug`。
- `scripts/render_test.py`：补 `category.html` 模板的 context 构建分支（注入 `category` + 按 `post.categories` 过滤 posts），与真实运行时对齐。

## [0.1.0] - 2026-04-14

### Added

- 首个版本发布
- `SKILL.md`:Gridea Pro 主题开发专家 Skill 入口,包含 5 步工作流和 16 条关键规则
- 三种模板引擎支持:Jinja2 (Pongo2)、Go Templates、EJS
- `scripts/scaffold_theme.py`:主题脚手架生成器
- `scripts/validate_syntax.py`:模板语法与变量名静态校验
- `scripts/render_test.py`:基于 mock 数据的渲染测试
- `references/`:完整参考文档(变量清单、三大引擎指南、架构、config schema、CSS 模式、SEO、质量清单)
- `assets/starters/`:三种引擎的起始模板
- `assets/mock-data.json` / `mock-data-empty.json`:渲染测试 fixture
- 中文 README,含与 `frontend-design` 等前端设计 Skill 的组合使用方式和 5 个 Prompt 模板
