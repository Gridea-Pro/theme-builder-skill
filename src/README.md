# DSH Plugin — Gridea Theme Builder

本目录包含将 `theme-builder-skill` 作为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件运行所需的全部文件。

## 文件说明

| 文件 | 作用 |
|---|---|
| `src/index.ts` | 插件入口：注册 `gridea-theme-builder` skill provider |
| `src/README.md` | 本文档 |
| `package.json` | 插件清单，声明 `dsh.bundle` 和依赖 |
| `cordis.patch.yml` | bundle 模式的 patch 层（`dsh plugin add` 用） |
| `tsconfig.json` | TypeScript 编译配置 |
| `overlay.yml` | 本地开发 overlay 模板（`--patch` 用，需改路径） |
| `install-dsh.sh` | 安装脚本（macOS / Linux / Git Bash） |
| `install-dsh.bat` | 安装脚本（Windows CMD） |

---

## 本地测试（开发调试）

适合开发阶段快速验证，无需编译，改代码即生效。

### 1. 安装依赖

```bash
cd theme-builder-skill
npm install
```

### 2. 配置 overlay.yml

复制 `overlay.yml`，将 `name` 改为你机器上 `src/index.ts` 的绝对路径：

**Windows**（需要 `file://` 前缀）：
```yaml
- insert:
    - id: gridea-theme-builder
      name: 'file:///D:/theme-builder-skill/src/index.ts'
```

**macOS / Linux**（裸路径即可）：
```yaml
- insert:
    - id: gridea-theme-builder
      name: '/Users/你/theme-builder-skill/src/index.ts'
```

### 3. 启动

```bash
# Windows
npx @deepseek-ai/dsh web --patch D:/theme-builder-skill/overlay.yml

# macOS / Linux
npx @deepseek-ai/dsh web --patch /path/to/theme-builder-skill/overlay.yml
```

打开 `http://127.0.0.1:3080`，发送消息测试 skill 是否被模型加载。

### 4. 卸载

不带 `--patch` 重启即可，无需额外操作：

```bash
npx @deepseek-ai/dsh web
```

---

## 从 GitHub 安装（分发给别人用）

适合最终用户，安装后无需每次带 `--patch` 参数。

### 一键安装（推荐）

```bash
# macOS / Linux / Git Bash
bash install-dsh.sh

# Windows CMD
install-dsh.bat
```

脚本自动完成两阶段安装：
1. 首次 `add` 触发 pnpm 构建授权报错，从中提取精确的 `allowBuilds` key（含 git URL + commit SHA）
2. 将 key 写入 `~/.dsh/profiles/web/pnpm-workspace.yaml`，然后重新 `add` 完成安装

### 手动安装

如果不使用脚本，需手动执行三步：

```bash
# 1. 安装（首次会因构建授权失败，这是预期的）
npx @deepseek-ai/dsh plugin --profile web add "github:xiaxi626/theme-builder-skill#dsh"

# 2. 查看报错信息中 pnpm 打印的 allowBuilds 行，形如：
#    allowBuilds:
#      @gridea-pro/dsh-skill-theme-builder@git+ssh://git@github.com/xiaxi626/theme-builder-skill.git#<SHA>: true
#
#    将该行原样写入 ~/.dsh/profiles/web/pnpm-workspace.yaml
#
#    注意：key 包含完整的 git URL + commit SHA，不能用简单包名替代，
#    且 SHA 每次推送都会变。

# 3. 重新安装
npx @deepseek-ai/dsh plugin --profile web add "github:xiaxi626/theme-builder-skill#dsh"
```

### 启动

```bash
npx @deepseek-ai/dsh web
```

### 卸载

```bash
npx @deepseek-ai/dsh plugin --profile web remove @gridea-pro/dsh-skill-theme-builder
```

### 更新

```bash
npx @deepseek-ai/dsh plugin --profile web update @gridea-pro/dsh-skill-theme-builder
```

---

## 两种模式对比

| 维度 | 本地测试 (`--patch`) | GitHub 安装 (`plugin add`) |
|---|---|---|
| 适用场景 | 开发调试 | 分发给用户 |
| 需要本地克隆 | 是 | 否 |
| 需要编译 | 否（tsx 直接跑 .ts） | 是（pnpm 运行 `prepare`） |
| 需要构建授权 | 否 | 是（`allowBuilds`） |
| 路径硬编码 | 是（每台机器不同） | 否 |
| 改代码后生效 | 重启即生效 | 需 `plugin update` |
| 卸载方式 | 不带 `--patch` 重启 | `plugin remove` |

---

## 平台路径速查

| 平台 | overlay.yml 中 `name` 格式 | `--patch` 路径分隔符 |
|---|---|---|
| Windows | `file:///D:/path/to/src/index.ts` | 正斜杠 `/`（推荐）或双反斜杠 `\\` |
| macOS | `/Users/you/path/to/src/index.ts` | 正斜杠 `/` |
| Linux | `/home/you/path/to/src/index.ts` | 正斜杠 `/` |

> Windows 必须用 `file:///` 前缀，否则 Node ESM 加载器会把 `D:` 误认为 URL scheme。Unix 系统裸路径可直接使用。

---

## 常见问题

### `ERR_MODULE_NOT_FOUND: Cannot find package '@gridea-pro/dsh-skill-theme-builder'`

**原因**：用 `cordis.patch.yml`（包名引用）喂 `--patch`（期望文件路径）。

**解决**：改用 `overlay.yml`（文件路径引用），不要用 `cordis.patch.yml` 做 `--patch`。

### `ERR_UNSUPPORTED_ESM_URL_SCHEME: Received protocol 'd:'`

**原因**：Windows 上 overlay.yml 中 `name` 用了裸路径 `D:/...`。

**解决**：加 `file:///` 前缀 → `file:///D:/...`。

### `Cannot find module 'node:fs/promises'`

**原因**：缺少 `@types/node`。

**解决**：`npm install` 确保安装了 `@types/node`（已在 `devDependencies` 中声明）。

### `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`

**原因**：pnpm ≥10 默认拒绝运行 git 依赖的 `prepare` 脚本。

**解决**：使用 `install-dsh.sh` / `install-dsh.bat` 脚本自动处理；或手动将 pnpm 报错中打印的完整 `allowBuilds` key（含 git URL + commit SHA）写入 `~/.dsh/profiles/web/pnpm-workspace.yaml`。

> 注意：key 不能用简单包名，必须用 pnpm 打印的完整格式，且 commit SHA 每次推送都会变。
