# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 规范,版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Fixed / Changed

**2026-08-20 · customConfig type 白名单对齐真实 GUI（修复 CI 长期红灯）**

- **`type: "color"` 不存在，取色器是 `type: "input"` + `"card": "color"`**：`scaffold_theme.py` 生成的 `config.json` 用了 `type: "color"`，被 `validate_syntax.py` 判为非法 —— 脚手架的产物通不过自己的校验器，CI 三个引擎自 2026-07-09 起全红。现改为 `input` + `card: "color"`，用户拿到的是真正的取色器而不是纯文本框；三个 starter 的 `primaryColor` 同步跟进。
- **校验白名单漏了 6 种 GUI 实际支持的类型**：逐条对照 `CustomSetting.vue` 的 v-if 分支核对后，`radio`、`switch`、`markdown`、`array`、`picture`、`image` 均可正常渲染，此前被误判为非法并给出错误的替代建议。白名单与 `theme-config-schema.md` 的类型表一并重写。
- **新增三条 config.json 校验**：`card` 只允许 `color` / `post`；`type: array` 缺 `arrayItems` 报错（否则面板渲染空卡片）；`select` / `radio` 缺 `options` 报错（否则控件不渲染）。
- **文档补充数组配置写法**：`theme-config-schema.md` 增加 `arrayItems` 的完整示例。

**2026-07-08 · 基于 chatgpt 主题实战（真实引擎渲染）的修正与增强**

- **修正 `post.date` 类型描述（推翻上一轮"修正"）**：Jinja2 / EJS 渲染上下文经 `json.Marshal` 构建，`post.date` / `updatedAt` / `createdAt` 是 **RFC3339 字符串**；仅 Go Templates 直接传 struct 才是 `time.Time`。Jinja2 中对这些字段用 `|date:` 会报错并使整页降级（实战中曾导致首页 + 全部文章页降级）。`template-variables.md` / `jinja2-guide.md`（差异 8 重写）/ `SKILL.md` 规则 6 三处对齐，并给出正确用法：`dateFormat` / `|relative` / 直接输出 / `|slice`。
- **`archives` 分组键为大写 `Year` / `Posts`**（引擎 `ArchiveYearView` 无 json tag）：小写取值静默为空。`template-variables.md` 全局变量表 / 页面表 / 易错表更新。
- **新增 Pongo2 致命差异 13、14**（`jinja2-guide.md` 12 → 14 个）：
  - 13：`not x == y` 解析为 `(not x) == y`，恒 false 且不报错（if 块静默消失），不等判断必须用 `!=`；
  - 14：`loop.*` 由引擎 loader 自动映射到 `forloop.*`（两种写法都可用），但 `loop.length` 无映射不可用。
- **`theme-config-schema.md` 类型表重写**：GUI 实际只渲染 `input` / `textarea` / `select` / `toggle` / `picture-upload` 5 种；删除误列的 `number` / `color` / `boolean` / `code` / `image` / `array`，新增「无效类型 → 替代方案」对照表与数字配置完整模式（select + `|default:N|to_int`）。
- **`jinja2-guide.md` 自定义 filter 表补 `to_int`**：theme_config 数字经 GUI 保存后可能是字符串，与整数比较前必须转型。
- **`theme-architecture.md` 新增《本机调试与配置缓存》**：Gridea Pro 数据目录（`~/Documents/Gridea Pro/`）、主题 config.json 进程级缓存（改 customConfig 声明须重启应用，开发期可复制新目录名绕过）、降级视图识别（grep `fallback-banner`）、"渲染成功 ≠ 内容正确"的内容级验证要求。
- **`SKILL.md`**：工作流 5 步 → 6 步（新增第 6 步真实引擎验证）；关键规则 16 → 21 条（新增 `!=`、archives 大写键、`to_int`、customConfig 类型白名单、config.json 缓存）。
- **`scripts/validate_syntax.py` 新增 3 项静态检查**：`not x == y` 优先级陷阱（ERROR）、日期字段接 `|date:`（ERROR）、customConfig type 白名单（ERROR，附替代建议）。
- **`scripts/render_test.py` mock 精度提升**：`date` filter 严格化（字符串输入直接报错，模拟 Pongo2 真实行为——此前静默通过，测不出整页降级级错误）；`now` 注入 `datetime` 对象（对齐 time.Time，支持 Go layout 常用格式）；归档页注入大写 `Year` / `Posts` 分组数据；补 `to_int` filter 桩。
- **`assets/mock-data*.json`**：文章 `date` / `createdAt` / `updatedAt` 升级为 RFC3339 完整格式（对齐真实上下文，使 `|slice:"5:10"` 等字符串操作语义正确）。
- 回归验证：chatgpt 主题 12/12 通过；存量主题（flavor-theme / simplecho / writecho / muse / amore-jinja2）结果与改动前基线完全一致（零误伤）；注入 3 类真实坑的坏样本全部被新检查拦截。


- `references/template-variables.md`：补齐与 Gridea Pro 真实运行时之间的多处差距：
  - **Post 对象**：补 `id` / `abstract` / `description` / `toc` / `categories` / `tagsString` / `stats` / `prevPost` / `nextPost` / `createdAt` / `updatedAt` / `updatedAtFormat` / `published`；
  - **修正旧文档错误**：`post.date` 实际是 `time.Time`（不是字符串），展示日期首选 `post.dateFormat`；*（勘误：此条已于 2026-07-08 推翻——Jinja2/EJS 上下文经 JSON 序列化，`post.date` 是 RFC3339 字符串，仅 Go Templates 中是 time.Time，见上方条目）*；
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
