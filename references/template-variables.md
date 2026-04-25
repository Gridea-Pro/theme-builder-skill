# Gridea Pro 模板变量完整参考

> **这是主题开发中最重要的文件。** 渲染出错 80% 的原因是变量名拼写错误。编写任何模板代码之前，必须先查阅本文件。

## 目录

1. [全局变量](#全局变量)
2. [Post 对象](#post-对象)
3. [Tag 对象](#tag-对象)
4. [Category 对象](#category-对象)
5. [PostStats 对象](#poststats-对象)
6. [SimplePostView 对象（prevPost / nextPost）](#simplepostview-对象prevpost--nextpost)
7. [Menu 对象](#menu-对象)
8. [Pagination 对象](#pagination-对象)
9. [Memo 对象](#memo-对象)
10. [Link 对象](#link-对象)
11. [各页面可用变量表](#各页面可用变量表)
12. [引擎自动生成的输出](#引擎自动生成的输出)
13. [三引擎语法对照表](#三引擎语法对照表)
14. [易错变量速查](#易错变量速查)

---

## 全局变量

以下变量在**所有页面**中均可使用：

| 变量 | 类型 | 说明 |
|------|------|------|
| `config` | Object | 站点级配置对象（`site` 的别名，两者互通） |
| `site` | Object | 站点级配置对象（与 `config` 同源） |
| `config.domain` | string | 站点域名，含协议头，无尾部斜杠。示例：`"https://myblog.com"` |
| `config.siteName` | string | 站点名称 |
| `config.siteDescription` | string | 站点描述 |
| `config.avatar` | string | 头像图片路径 |
| `config.logo` | string | Logo 图片路径 |
| `theme_config` | Object | 主题自定义配置对象（来自 config.json 中 `customConfig` 的定义） |
| `theme_config.xxx` | 视定义而定 | 通过 customConfig 中各项的 `name` 字段访问，如 `theme_config.primaryColor` |
| `menus` | []Menu | 导航菜单列表 |
| `tags` | []Tag | 所有标签列表 |
| `category` | Category | **当前分类对象**（仅在 `category.html` 渲染时被引擎赋值；其他页面里访问会得到空对象） |
| `current_tag` / `tag` / `currentTag` | Tag | **当前标签对象**（三个名字是同一个数据的别名，仅在 `tag.html` 渲染时有效） |
| `archives` | []ArchiveYear | 按年份分组的归档数据。结构 `{ year: int, posts: []Post }`，仅 `archives.html` 使用 |
| `links` | []Link | 友链列表（详见 [Link 对象](#link-对象)） |
| `commentSetting` | Object | 评论平台配置（`platform` / `appId` / `serverURLs` 等，由 Gridea Pro 全局评论设置注入） |
| `now` | time.Time | 当前时间（Go 的 `time.Time` 对象，可使用 `|date` 过滤器格式化） |

### config 与 theme_config 的区别

- **`config`**：站点级配置，由 Gridea Pro 核心定义，包含 domain、siteName、siteDescription、avatar、logo 等
- **`theme_config`**：主题自定义配置，由主题开发者在 config.json 的 `customConfig` 数组中声明，用户通过 GUI 面板设置值

**切勿混淆！** 在模板中访问自定义配置项时，必须使用 `theme_config.xxx`，不能用 `config.xxx`。

---

## Post 对象

文章对象，在列表页通过循环 `posts` 获取，在文章详情页通过 `post` 直接访问。

| 字段 | 类型 | 说明 |
|------|------|------|
| `post.id` | string | 文章 ID |
| `post.title` | string | 文章标题 |
| `post.content` | template.HTML | 渲染后的 HTML 内容。**Jinja2 中必须用 `\|safe` 过滤器输出**，否则 HTML 标签会被转义 |
| `post.abstract` | template.HTML | 摘要 HTML（来自正文 `<!-- more -->` 之前的内容，无则为空）。同样需要 `\|safe` 输出 |
| `post.description` | string | 文章描述纯文本（无 HTML），适合用作 meta description |
| `post.toc` | template.HTML | 自动生成的目录 HTML（基于正文 h2/h3）。需要 `\|safe` 输出，无目录时为空字符串 |
| `post.date` | time.Time | 发布日期，**是 Go 的 `time.Time` 对象**（不是字符串）。可用 `\|date:"2006-01-02"` 过滤器格式化；展示时建议直接用 `post.dateFormat` |
| `post.dateFormat` | string | 已经按站点 `DateFormat` 格式化好的日期显示字符串，**展示日期首选这个** |
| `post.createdAt` | time.Time | 创建时间（与 `post.date` 同源） |
| `post.updatedAt` | time.Time | 最后修改时间 |
| `post.updatedAtFormat` | string | 格式化后的修改时间显示字符串 |
| `post.link` | string | 文章 URL 路径（相对路径） |
| `post.tags` | []Tag | 文章的标签列表 |
| `post.tagsString` | string | 标签名以逗号分隔的字符串（meta keywords 直接可用） |
| `post.categories` | []Category | 文章的分类列表（详见 [Category 对象](#category-对象)） |
| `post.feature` | string | 特色图片 URL。无特色图片时为空字符串 `""` |
| `post.stats` | PostStats | 文章统计信息（字数、阅读分钟数等，详见 [PostStats 对象](#poststats-对象)） |
| `post.prevPost` | SimplePostView \| null | **数组中更早一项的文章**（按 CreatedAt 降序排序后的 i-1）。**注意 Gridea Pro 的语义与 Hexo / Hugo 相反：prevPost 实际是更新的一篇**。详见 [SimplePostView](#simplepostview-对象prevpost--nextpost) |
| `post.nextPost` | SimplePostView \| null | **数组中更晚一项的文章**（i+1，即更老的一篇）。访问前用 `{% if post.nextPost %}` 判空 |
| `post.isTop` | bool | 是否置顶 |
| `post.published` | bool | 是否已发布 |
| `post.hideInList` | bool | 是否在列表中隐藏 |
| `post.fileName` | string | 源文件名（不含扩展名） |

### 关键注意事项

- **`post.content` 是 HTML**：已经由 Markdown 渲染为 HTML，在 Jinja2 中必须使用 `{{ post.content|safe }}` 输出，在 Go Templates 中使用 `{{ .Post.Content }}`（默认不转义），在 EJS 中使用 `<%- post.content %>`（注意是 `<%-` 不是 `<%=`）
- **`post.date` 是 `time.Time`，不是字符串**：以前的文档说反了。展示直接用 `{{ post.dateFormat }}` 最省事；要换格式就 `{{ post.date|date:"2006-01-02" }}`（Go time 风格的 layout）
- **`post.feature` 可能为空**：展示特色图片前必须判断是否为空字符串
- **`post.prevPost` / `post.nextPost` 可能为 `null`**：第一篇/最后一篇会缺一个方向；模板中务必先判空再用
- **`post.prevPost` 的方向语义反直觉**：在 Hexo / Hugo 习惯里 prev = 更早，但 Gridea Pro 的 `prevPost` 实际是数组前一项（即更新的一篇）。如果是从其他生态移植主题，**别照搬"上一篇 = 更早"的标签**，要么按 Gridea 实际方向写，要么交换 prevPost / nextPost 的位置
- **`post.toc` / `post.abstract` 默认空字符串**：未生成时不会报错，可直接 `{% if post.toc %}` 判空

---

## Tag 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `tag.name` | string | 标签名称（用户可见） |
| `tag.slug` | string | URL 用的 slug（**唯一**，按 slug 匹配文章；用 `name` 匹配可能撞重名） |
| `tag.link` | string | 标签页 URL，例如 `/tag/<slug>/` |
| `tag.count` | int | 使用该标签的文章数量 |
| `tag.usedName` | string | 兼容旧版的别名（一般无需关心） |

---

## Category 对象

分类对象。文章对象上的 `post.categories[]` 由 `Category` 元素组成；当 Gridea Pro 渲染分类列表页 `category.html` 时，`category` 全局变量也会被赋值为当前分类。

| 字段 | 类型 | 说明 |
|------|------|------|
| `category.name` | string | 分类名称 |
| `category.slug` | string | URL 用的 slug |
| `category.link` | string | 分类页 URL，例如 `/category/<slug>/` |
| `category.count` | int | 使用该分类的文章数量（仅在分类列表页 `category` 全局变量上有效） |

> Gridea Pro 引擎会自动为**每个**有文章的分类渲染 `/category/<slug>/`（模板名 `category`），数据由 `RenderCategoryPages` 注入。**没有**全局的"所有分类"索引页，也**没有** `categories` 数组全局变量；如果需要分类总览页，要么在自定义页面里用 `posts` 自行聚合 `post.categories`，要么走 `tags.html`。

### 在文章卡片上展示分类

```jinja2
{% if post.categories|length > 0 %}
  <span class="post-cats">
    {% for cat in post.categories %}
      <a href="{{ cat.link }}">{{ cat.name }}</a>{% if not loop.last %} · {% endif %}
    {% endfor %}
  </span>
{% endif %}
```

---

## PostStats 对象

`post.stats` 字段，文章字数 / 阅读时长信息，由引擎在 build 阶段算好。

| 字段 | 类型 | 说明 |
|------|------|------|
| `post.stats.words` | int | 字数（CJK 字符感知） |
| `post.stats.minutes` | int | 阅读分钟数（按约 400 字/分钟） |
| `post.stats.text` | string | 已格式化的阅读时长描述，如 `"5 min read"` |

> Jinja2 主题里也可以用 `post.content | reading_time` / `post.content | word_count` 自行算，但 `post.stats` 是引擎已经算好的、零成本的常量，**优先用 `post.stats`**。

---

## SimplePostView 对象（prevPost / nextPost）

`post.prevPost` / `post.nextPost` 字段的元素类型——上下篇导航专用，不是完整 PostView，只暴露最少需要的展示字段。

| 字段 | 类型 | 说明 |
|------|------|------|
| `post.prevPost.title` | string | 邻接文章标题 |
| `post.prevPost.link` | string | 邻接文章 URL |
| `post.prevPost.fileName` | string | 邻接文章源文件名 |
| `post.prevPost.feature` | string | 邻接文章特色图片 URL（可能为空） |

`post.nextPost` 字段集合相同。两者**都可能为 `null`**（例如第一篇没有 `prevPost`），使用前必须判空。

### 上下篇导航示例

```jinja2
<nav class="post-nav">
  {% if post.prevPost %}
    <a href="{{ post.prevPost.link }}" rel="prev">&laquo; 上一篇：{{ post.prevPost.title }}</a>
  {% endif %}
  {% if post.nextPost %}
    <a href="{{ post.nextPost.link }}" rel="next">下一篇：{{ post.nextPost.title }} &raquo;</a>
  {% endif %}
</nav>
```

> ⚠️ 别在 `<a>` 标签里写"更早 / 更新"的方向暗示——Gridea Pro 把数组**前一项（更新）**赋给 `prevPost`，与 Hexo / Hugo 习惯相反。要么照 Gridea 的方向写、要么把 prevPost / nextPost 的位置交换，**两种都可以**，但不要给读者错误预期。

---

## Menu 对象

| 字段 | 类型 | 说明 |
|------|------|------|
| `menu.name` | string | 菜单显示名称 |
| `menu.link` | string | 菜单链接 URL |

---

## Pagination 对象

分页对象，仅在支持分页的页面中可用（index.html、blog.html）。

| 字段 | 类型 | 说明 |
|------|------|------|
| `pagination.currentPage` | int | 当前页码（**从 1 开始**） |
| `pagination.totalPages` | int | 总页数 |
| `pagination.totalPosts` | int | 该列表的文章总数 |
| `pagination.hasPrev` | bool | 是否有上一页 |
| `pagination.hasNext` | bool | 是否有下一页 |
| `pagination.prevURL` | string | 上一页 URL（无则为空字符串） |
| `pagination.nextURL` | string | 下一页 URL（无则为空字符串） |
| `pagination.prev` | string | `prevURL` 的别名（兼容旧主题，与之指向同一数据） |
| `pagination.next` | string | `nextURL` 的别名（兼容旧主题，与之指向同一数据） |

### 分页使用示例（Jinja2）

```jinja2
<nav class="pagination">
  {% if pagination.hasPrev %}
    <a href="{{ pagination.prevURL }}" rel="prev">&laquo; 上一页</a>
  {% endif %}
  <span>第 {{ pagination.currentPage }} / {{ pagination.totalPages }} 页</span>
  {% if pagination.hasNext %}
    <a href="{{ pagination.nextURL }}" rel="next">下一页 &raquo;</a>
  {% endif %}
</nav>
```

---

## Memo 对象

短想法/灵感记录对象，仅在 memos.html 中通过 `memos` 列表访问。

| 字段 | 类型 | 说明 |
|------|------|------|
| `memo.id` | string | Memo ID |
| `memo.content` | template.HTML | Memo 正文 HTML（需 `\|safe` 输出） |
| `memo.tags` | []string | 标签名数组（注意是字符串数组，不是 Tag 对象） |
| `memo.createdAt` | string | 按站点 `DateFormat` 格式化好的发布时间，**展示首选这个** |
| `memo.createdAtISO` | string | 固定 `YYYY-MM-DD` 格式（不随用户配置变），适合做热力图 / 归档的稳定 key |
| `memo.dateFormat` | string | 站点当前的 `DateFormat` 字符串（一般无需关心） |

---

## Link 对象

友链条目对象。Gridea Pro 把全部友链**同时**暴露为两条路径，两者**指向同一份数据**：

- `links` —— 顶层变量，所有页面都可用
- `theme_config.links` —— 经由 `customConfig.links` 合并到 `theme_config` 上，所有页面都可用

> ⚠️ 字段名是从 domain.Link 注入时**重命名**过的（参见 `backend/internal/engine/data_builder.go`）。模板中**不能**写 `link.name` / `link.url`，必须用下表的字段名。

| 字段 | 类型 | 说明 |
|------|------|------|
| `link.siteName` | string | 站点名称（来源于 `domain.Link.Name`） |
| `link.siteLink` | string | 站点 URL（来源于 `domain.Link.Url`） |
| `link.description` | string | 站点描述，可能为空字符串 |
| `link.avatar` | string | 站点头像 URL，可能为空字符串 |

### 友链遍历示例

```jinja2
{# 推荐写法 1：直接遍历顶层 links #}
{% if links and links|length > 0 %}
  {% for link in links %}
    <a class="flink" href="{{ link.siteLink }}" target="_blank" rel="noopener">
      {% if link.avatar %}
        <img src="{{ link.avatar }}" alt="{{ link.siteName }}">
      {% endif %}
      <h4>{{ link.siteName }}</h4>
      {% if link.description %}<p>{{ link.description }}</p>{% endif %}
    </a>
  {% endfor %}
{% endif %}

{# 写法 2：从 theme_config.links 取，效果完全等同 #}
{% for link in theme_config.links %}...{% endfor %}
```

### 易错变量速查（友链专用）

| 错误写法 | 正确写法 | 原因 |
|----------|----------|------|
| `link.name` | `link.siteName` | 注入时被重命名 |
| `link.url` | `link.siteLink` | 注入时被重命名 |
| `link.title` | `link.siteName` | 没有 title 字段 |
| `link.desc` | `link.description` | 没有缩写 |
| `link.icon` | `link.avatar` | 没有 icon 字段 |

---

## 各页面可用变量表

> **全局变量（所有页面都有）**：`config` / `site` / `theme_config` / `menus` / `tags` / `links` / `commentSetting` / `now`。下表只列出每个页面**额外**注入的变量。

| 页面模板 | 额外注入的变量 | 引擎渲染逻辑 |
|----------|----------------|--------------|
| `index.html` | `posts`, `pagination` | 首页（自动分页生成 `/page/2/`、`/page/3/` …） |
| `blog.html` | `posts`, `pagination` | 博客列表页 |
| `post.html` | `post` | 文章详情页（每篇文章一个），`post.prevPost` / `post.nextPost` 由引擎自动注入 |
| `archives.html` | `posts`, `archives`, `pagination` | 归档页（`archives` 是按年份分组的 `[]ArchiveYear`） |
| `tag.html` | `posts`, `tag`, `current_tag`, `currentTag`, `pagination` | **每个标签**一份，渲染到 `/tag/<slug>/`；`tag` 是当前标签对象 |
| `tags.html` | （仅全局变量） | 全站标签索引页（用 `tags` 全局列表渲染） |
| `category.html` | `posts`, `category`, `pagination` | **每个分类**一份，渲染到 `/category/<slug>/`；`category` 是当前分类对象 |
| `memos.html` | `memos` | 闪念列表页 |
| `links.html` | （仅全局变量；`links` 即在那里） | 友链页 |
| `about.html` | （仅全局变量） | 关于页（一般主题只渲染静态文案） |
| `404.html` | （仅全局变量） | 404 页 |

### 关键区别

- **`index.html` vs `blog.html`**：两者结构基本一样、都有 `posts` 和 `pagination`，区别在于站点是否启用 blog 路径作为博客入口
- **`tag.html` 与 `category.html`**：引擎对每个 tag/category **逐一**渲染一份；当前对象分别叫 `tag` / `category`，均带 `count` 字段
- **`tags.html`**：注意它**没有** `posts`，只有全局 `tags` 列表（要按标签筛文章得自己客户端分组）
- **没有 `categories.html`**：引擎不会渲染全站分类索引页。如果主题里写了这个文件，不会被当成入口生成；要做分类总览要么写在 `tags.html` 里，要么自定义页面
- **404.html**：变量最少，仅靠全局变量

---

## 引擎自动生成的输出

下面这些是 Gridea Pro 引擎在 build 阶段**直接生成**的产物，**不是模板**——主题不需要也不应该自己写文件去模拟。客户端（JS / 搜索框等）可以直接 fetch 这些路径。

| 路径 | 说明 | 何时生成 |
|------|------|----------|
| `/api/search.json` | 全站搜索索引 JSON。schema：`[{title, link, date, tags, content}]`，其中 `content` 是去 HTML 后的纯文本前 3000 字符 | 始终生成 |
| `/feed.xml` | RSS 订阅源 | 当主题配置里 `feedEnabled = true` 时生成 |
| `/atom.xml` | Atom 订阅源 | 同上 |
| `/sitemap.xml` | 站点地图 | 当 SEO 设置里 `sitemapEnabled = true` 时生成 |
| `/robots.txt` | 爬虫规则 | 当 SEO 设置里 `robotsEnabled = true` 时生成 |
| `/manifest.json` | PWA Manifest | 当 PWA 启用时生成 |

### 用 `/api/search.json` 做客户端搜索

```javascript
// 主题里的搜索 JS：直接 fetch 引擎产物，不需要主题在 templates/ 里写 search-index.html
fetch('/api/search.json')
  .then(r => r.ok ? r.json() : [])
  .then(entries => {
    // entries = [{title, link, date, tags, content}, ...]
    // 自己实现搜索匹配逻辑
  });
```

> 历史教训：早期主题（mango / liushen 等）见不到 `/api/search.json` 自动生成，自己 fetch `/atom.xml` 用 DOMParser 解析做搜索；现在直接用 `/api/search.json` 即可，schema 稳定、性能更好、内容已脱 HTML 标签。

---

## 三引擎语法对照表

以下对照表展示同一操作在 Jinja2 (Pongo2)、Go Templates、EJS 中的写法。**注意 Pongo2 与标准 Jinja2 存在差异，此处以 Pongo2 实际语法为准。**

### 输出文本变量

```jinja2
{# Jinja2 (Pongo2) #}
{{ config.siteName }}
```

```go
{{/* Go Templates */}}
{{ .Config.SiteName }}
```

```ejs
<!-- EJS -->
<%= config.siteName %>
```

### 输出原始 HTML（不转义）

```jinja2
{# Jinja2 (Pongo2) #}
{{ post.content|safe }}
```

```go
{{/* Go Templates — 默认不转义 */}}
{{ .Post.Content }}
```

```ejs
<!-- EJS — 使用 <%- 而非 <%= -->
<%- post.content %>
```

### 循环遍历文章列表

```jinja2
{# Jinja2 (Pongo2) #}
{% for post in posts %}
  <h2>{{ post.title }}</h2>
{% endfor %}
```

```go
{{/* Go Templates */}}
{{ range .Posts }}
  <h2>{{ .Title }}</h2>
{{ end }}
```

```ejs
<!-- EJS -->
<% posts.forEach(function(post) { %>
  <h2><%= post.title %></h2>
<% }); %>
```

### 条件判断

```jinja2
{# Jinja2 (Pongo2) #}
{% if post.isTop %}
  <span>置顶</span>
{% endif %}
```

```go
{{/* Go Templates */}}
{{ if .Post.IsTop }}
  <span>置顶</span>
{{ end }}
```

```ejs
<!-- EJS -->
<% if (post.isTop) { %>
  <span>置顶</span>
<% } %>
```

### 判断变量是否存在或有值

```jinja2
{# Jinja2 (Pongo2) #}
{% if post.feature %}
  <img src="{{ post.feature }}" />
{% endif %}
```

```go
{{/* Go Templates — 必须判空防 nil panic */}}
{{ if .Post.Feature }}
  <img src="{{ .Post.Feature }}" />
{{ end }}
```

```ejs
<!-- EJS -->
<% if (post.feature) { %>
  <img src="<%= post.feature %>" />
<% } %>
```

### 访问嵌套字段

```jinja2
{# Jinja2 (Pongo2) #}
{{ config.siteName }}
{{ theme_config.primaryColor }}
```

```go
{{/* Go Templates */}}
{{ .Config.SiteName }}
{{ .ThemeConfig.primaryColor }}
```

```ejs
<!-- EJS -->
<%= config.siteName %>
<%= theme_config.primaryColor %>
```

### 带索引的循环

```jinja2
{# Jinja2 (Pongo2) — 使用 forloop 内置对象 #}
{% for post in posts %}
  <span>{{ forloop.Counter }}. {{ post.title }}</span>
{% endfor %}
```

```go
{{/* Go Templates */}}
{{ range $index, $post := .Posts }}
  <span>{{ $index }}. {{ $post.Title }}</span>
{{ end }}
```

```ejs
<!-- EJS -->
<% posts.forEach(function(post, index) { %>
  <span><%= index + 1 %>. <%= post.title %></span>
<% }); %>
```

### 引入局部模板

```jinja2
{# Jinja2 (Pongo2) — 路径相对于 templates/ 根目录 #}
{% include "partials/header.html" %}
```

```go
{{/* Go Templates */}}
{{ template "partials/header.html" . }}
```

```ejs
<!-- EJS -->
<%- include('partials/header') %>
```

### 模板继承

```jinja2
{# Jinja2 (Pongo2) — base.html #}
<!DOCTYPE html>
<html>
<head><title>{% block title %}{% endblock %}</title></head>
<body>{% block content %}{% endblock %}</body>
</html>

{# index.html #}
{% extends "base.html" %}
{% block title %}{{ config.siteName }}{% endblock %}
{% block content %}
  <h1>文章列表</h1>
{% endblock %}
```

```go
{{/* Go Templates — 使用 define/template，无原生继承 */}}
{{/* base.html */}}
<!DOCTYPE html>
<html>
<head><title>{{ template "title" . }}</title></head>
<body>{{ template "content" . }}</body>
</html>

{{/* index.html */}}
{{ define "title" }}{{ .Config.SiteName }}{{ end }}
{{ define "content" }}
  <h1>文章列表</h1>
{{ end }}
```

```ejs
<!-- EJS — 无原生继承，用 include 模拟 -->
<!-- partials/head.ejs -->
<!DOCTYPE html>
<html>
<head><title><%= title %></title></head>
<body>

<!-- index.ejs -->
<%- include('partials/head', { title: config.siteName }) %>
  <h1>文章列表</h1>
<%- include('partials/footer') %>
```

### 访问站点配置与主题配置

```jinja2
{# Jinja2 (Pongo2) #}
站点名称：{{ config.siteName }}
主题自定义色：{{ theme_config.primaryColor }}
```

```go
{{/* Go Templates */}}
站点名称：{{ .Config.SiteName }}
主题自定义色：{{ .ThemeConfig.primaryColor }}
```

```ejs
<!-- EJS -->
站点名称：<%= config.siteName %>
主题自定义色：<%= theme_config.primaryColor %>
```

### 日期格式化

```jinja2
{# Jinja2 (Pongo2) #}
{# now 是 time.Time，可用 date 过滤器 #}
{{ now|date:"2006-01-02" }}

{# post.date 也是 time.Time，但展示首选 post.dateFormat（已按站点配置格式化好） #}
{{ post.dateFormat }}

{# 想换格式时再用 |date 过滤器 #}
{{ post.date|date:"2006年01月02日" }}
```

```go
{{/* Go Templates */}}
{{ .Now.Format "2006-01-02" }}
{{ .Post.DateFormat }}                  {{/* 已格式化好的字符串 */}}
{{ .Post.Date.Format "2006-01-02" }}    {{/* 自定义格式 */}}
```

```ejs
<!-- EJS -->
<%= now.Format("2006-01-02") %>
<%= post.dateFormat %>
```

### 字符串长度

```jinja2
{# Jinja2 (Pongo2) #}
{{ post.title|length }}
```

```go
{{/* Go Templates — 内置 len 函数 */}}
{{ len .Post.Title }}
```

```ejs
<!-- EJS -->
<%= post.title.length %>
```

### 默认值

```jinja2
{# Jinja2 (Pongo2) — 参数用冒号，不用括号！ #}
{{ post.feature|default:"/images/default-cover.jpg" }}
```

```go
{{/* Go Templates — 使用 if-else */}}
{{ if .Post.Feature }}{{ .Post.Feature }}{{ else }}/images/default-cover.jpg{{ end }}
```

```ejs
<!-- EJS -->
<%= post.feature || '/images/default-cover.jpg' %>
```

---

## 易错变量速查

| 错误写法 | 正确写法 | 原因 |
|----------|----------|------|
| `post.url` | `post.link` | Gridea 用 `link` 不用 `url` |
| `post.body` | `post.content` | 正文 HTML 字段名是 `content` |
| `post.image` | `post.feature` | 特色图片字段名为 `feature` |
| `post.pinned` | `post.isTop` | 置顶字段名为 `isTop` |
| `post.toc_html` / `post.tableOfContents` | `post.toc` | 目录字段名简写为 `toc`，需 `\|safe` |
| `{{ post.date }}` 直接展示日期 | `{{ post.dateFormat }}` 或 `{{ post.date\|date:"layout" }}` | `post.date` 是 `time.Time` 不是字符串，直接输出会得到 Go 时间默认格式（不能用） |
| `post.readingTime` | `post.stats.text` 或 `post.stats.minutes` | 阅读时长在 `post.stats` 子对象里 |
| `post.next` / `post.prev` | `post.nextPost` / `post.prevPost` | 字段名带 `Post` 后缀，且**注意 prev / next 的方向语义与 Hexo 相反**（见 [SimplePostView](#simplepostview-对象prevpost--nextpost)） |
| `categories`（全局变量） | 没有这个全局，`category.html` 里只有 `category`（当前分类） + `posts` | 引擎不暴露"所有分类"列表；要分类总览需自己从 `posts[].categories` 聚合 |
| `config.title` | `config.siteName` | 站点名称字段为 `siteName` |
| `config.url` | `config.domain` | 域名字段为 `domain` |
| `tag.posts_count` | `tag.count` | 标签文章数字段为 `count` |
| `link.name` | `link.siteName` | 友链注入时被重命名（来源 `domain.Link.Name`） |
| `link.url` | `link.siteLink` | 友链注入时被重命名（来源 `domain.Link.Url`） |
| `link.desc` | `link.description` | 友链描述字段为 `description`，无缩写 |
| `link.icon` | `link.avatar` | 友链头像字段为 `avatar`，没有 `icon` |
| `theme_config` 写成 `themeConfig` | `theme_config` | 模板中使用下划线命名 |
| `pagination.previous` | `pagination.prev` 或 `pagination.prevURL` | 字段简写为 `prev` / `next`（也有 `prevURL` / `nextURL` 全名） |
| `{{ value\|default("x") }}` | `{{ value\|default:"x" }}` | Pongo2 过滤器参数用冒号 |
