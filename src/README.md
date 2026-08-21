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

## 从 GitHub 安装（给其他用户用）

其他用户不需要 clone 仓库，通过 `dsh plugin add` 直接从 GitHub 拉取安装。

### 安装

```bash
npx @deepseek-ai/dsh plugin --profile web add "github:Gridea-Pro/theme-builder-skill"
```

> `package.json` 没有 `prepare` 脚本，pnpm 不会触发构建授权，安装一步到位。编译产物 `lib/` 已提交在仓库中。

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
| 需要编译 | 否（tsx 直接跑 .ts） | 否（`lib/` 已提交） |
| 需要构建授权 | 否 | 否 |
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

---

## 开发者须知

### 修改 `src/index.ts` 后同步 `lib/`

本项目没有 `prepare` 脚本（去掉它是为了让 GitHub 安装不需要 pnpm 构建授权）。因此修改 `src/index.ts` 后必须手动编译并提交 `lib/`：

```bash
npm run build
git add lib/ src/index.ts
git commit -m "feat: update plugin code"
```

CI 会检查 `lib/` 与 `src/` 是否同步（`check-lib-sync` job）。如果忘了编译，CI 会红灯。

### 包管理器说明

本项目使用 **npm** 管理依赖（`package-lock.json` + `npm ci`）。DSH 的 `plugin add` 底层使用 pnpm 从 GitHub 拉取，但 pnpm 读的是 `package.json`，不关心仓库的 lock 文件格式——`package-lock.json` 对 pnpm 透明，会被忽略。因此两者不冲突，用户也不需要安装 pnpm。

### `description` 自动从 SKILL.md 提取

`src/index.ts` 的 `get()` 方法会运行时从 `SKILL.md` frontmatter 解析 `description` 字段，不需要在代码中维护两份。`list()` 使用一个简短的 fallback 描述，仅用于初始目录展示；模型实际获取 skill 时调用 `get()`，拿到的是 SKILL.md 中的完整描述。
