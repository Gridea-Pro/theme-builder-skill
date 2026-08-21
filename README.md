<p align="center">
  <img src="https://raw.githubusercontent.com/Gridea-Pro/gridea-pro/main/build/appicon.png" alt="Gridea Pro Theme Builder Skill" width="100">
</p>

<h1 align="center">Gridea Pro Theme Builder Skill</h1>

<p align="center">
  让 AI 帮你生成能直接在 <a href="https://github.com/Gridea-Pro/gridea-pro">Gridea Pro</a> 中使用的博客主题。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/AI%20Agent-Skill-8A2BE2.svg" alt="AI Agent Skill">
  <img src="https://img.shields.io/badge/Engines-Jinja2%20%7C%20Go%20%7C%20EJS-4FC08D.svg" alt="Template Engines">
  <img src="https://img.shields.io/badge/Python-3.8+-3776AB.svg?logo=python&logoColor=white" alt="Python">
</p>

---

## 是什么

Gridea Pro 专属的主题构建 AI Agent Skill。
将该 Skill 加载到支持 Skill 规范的 AI 客户端（Claude Code / Claude Desktop / Cursor / Cline 等）后，你用自然语言描述风格和需求，AI 就会产出一个完整的 Gridea Pro 主题目录，可直接复制到 `themes/` 下使用。

内置三种模板引擎支持：**Jinja2（推荐）**、**Go Templates**、**EJS**，以及完整的变量参考、避坑指南和渲染测试脚本。

## 怎么用

**1. 装上 Skill**

```bash
git clone https://github.com/Gridea-Pro/theme-builder-skill.git \
  ~/.claude/skills/gridea-theme-builder
```

其他 Agent 放到它约定的 skill 目录即可，或者直接把仓库目录交给它。入口是根目录的 `SKILL.md`，**不需要编译，也不需要预装依赖**。

**2. 自然语言下指令**

```
帮我用 gridea-theme-builder 生成一个叫 "minimal-ink" 的 Jinja2 主题,
极简风格、墨黑配米白、支持暗色模式。
```

**3. 取走主题目录**

AI 跑完会自动执行 `scaffold → validate → render` 全流程，把通过测试的主题目录交给你。复制到 Gridea Pro 站点目录下的 `themes/`（默认 `~/Documents/Gridea Pro/themes/`），在应用里切换主题即可。

> 站点目录可以在 Gridea Pro 里修改，以应用中显示的路径为准。另外，主题装好后若又改动了 `config.json` 里的 customConfig 声明，需要重启应用才会生效。

## 搭配前端设计 Skill 效果更好

本 Skill 只负责"生成能跑通的主题"，**美感不是它的强项**。推荐的组合工作流：

```
frontend-design       →    gridea-theme-builder    →    web-design-guidelines
(先出视觉方向)             (落地成主题)                   (审查无障碍/响应式)
```

常用搭档：`frontend-design`、`ui-ux-pro-max`、`brand-guidelines`、`web-design-guidelines`、`theme-factory`（以上为 Claude 生态 Skill 名，其他 Agent 请找对等物）。

## Prompt 模板

<details>
<summary><b>两阶段：先设计、后生成</b></summary>

```
阶段 1:用 frontend-design 为个人技术博客设计视觉方向。
定位:{硬核/极简/温柔}  参考:{paulgraham.com / Ghost Casper}
产出:色板(含暗色)、中英文字体搭配、首页/文章页草图。

阶段 2:用 gridea-theme-builder 把方向落地为 Jinja2 主题 "{name}",
必须通过 validate 和 render 测试。
```
</details>

<details>
<summary><b>从参考站抄氛围</b></summary>

```
提炼 {URL} 的设计语言,用 gridea-theme-builder 生成 Jinja2 主题 "{name}"。
约束:支持暗色模式 / 中文正文用思源宋体 / 首页展示 10 篇摘要 + 标签云 /
文章页有阅读进度条和目录 / config.json 暴露主色和字体两个可视化选项。
```
</details>

<details>
<summary><b>从 Hugo 主题迁移</b></summary>

```
把 Hugo 主题 {URL} 迁移为 Gridea Pro 的 Go Templates 主题 "{name}"。
必须对照 references/template-variables.md 替换变量名,
CustomConfig 用 index 访问,跑通 validate 和 render 测试。
```
</details>

<details>
<summary><b>最小可用</b></summary>

```
用 gridea-theme-builder 生成极简 Jinja2 主题 "{name}":
白底无衬线、单列无侧栏、支持暗色模式。跑完测试给我目录。
```
</details>

## 目录结构

```
.
├── SKILL.md                  # Skill 入口：完整工作流 + 三引擎关键规则
├── references/               # 变量清单、三引擎指南、架构、SEO、CSS 模式等
├── scripts/
│   ├── scaffold_theme.py     # 生成脚手架
│   ├── validate_syntax.py    # 静态语法/变量名校验
│   └── render_test.py        # 用 mock 数据渲染全部页面
└── assets/
    ├── starters/             # 三引擎起始模板
    └── mock-data.json        # 测试 fixture
```

以上是 **Skill 本体**。根目录另有一层 DSH 插件封装（`src/`、`lib/`、`package.json`、`tsconfig.json`、`cordis.patch.yml`、`overlay.yml`）—— 只用 Claude / Cursor 这类 Skill 客户端的话，**这些文件可以完全忽略**，不影响任何功能。

> `CLAUDE.md` 是 Claude Code 专属的元指令文件，其他 Agent 与人类用户可忽略。

## 作为 DSH 插件使用（可选）

如果你用的是 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)，而不是 Claude Code 一类的 Skill 客户端，本仓库额外提供了一层插件封装，把同一份 `SKILL.md` 注册成 DSH 的 skill provider。两边共用同一份内容，不存在不同步的问题。

安装步骤、本地调试与常见问题见 [src/README.md](src/README.md)。

**用 Claude / Cursor 的话，跳过本节即可。**

## 开发环境

```bash
pip install -r requirements.txt  # 仅需 jinja2
```

通常不必手动执行：`scaffold_theme.py` 和 `validate_syntax.py` 是纯标准库，开箱即用；只有 `render_test.py` 需要 jinja2，且它会在缺失时自动安装。

## 许可

[MIT](LICENSE)。

本仓库是主题开发的配套工具与模板，用宽松协议发布，你用 `scaffold_theme.py` 生成的主题归你所有，可以按任意协议发布、也可以闭源商用。

[Gridea Pro](https://github.com/Gridea-Pro/gridea-pro) 主项目仍为 GPL-3.0，两者互不影响。
