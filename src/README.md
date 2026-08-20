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

> **注意**：由于 pnpm ≥10 的安全策略，从 GitHub 安装**一定会经历"首次失败 → 手动授权 → 重新安装"三步**，这是 pnpm 的设计，不是 bug。如果觉得麻烦，请作者发布到 npm（见末尾说明）。

### 安装

**第 1 步：首次安装（预期会失败）**

```bash
npx @deepseek-ai/dsh plugin --profile web add "github:xiaxi626/theme-builder-skill#dsh"
```

会看到类似报错：

```
[ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED] ...
allowBuilds:
  @gridea-pro/dsh-skill-theme-builder@git+ssh://git@github.com/xiaxi626/theme-builder-skill.git#839c3efd...: true
```

这是正常的——pnpm 拒绝运行 git 依赖的构建脚本，需要你手动授权。

**第 2 步：写入构建授权**

打开 `~/.dsh/profiles/web/pnpm-workspace.yaml`（Windows: `C:\Users\你的用户名\.dsh\profiles\web\pnpm-workspace.yaml`）。

这个文件已有基础内容，**不要删原有内容**，在文件末尾追加 pnpm 报错中打印的那两行：

```yaml
# 原有内容保持不变：
packages:
  - .

nodeLinker: hoisted

# 追加以下内容（从 pnpm 报错中原样复制 key，用单引号包起来）：
allowBuilds:
  '@gridea-pro/dsh-skill-theme-builder@git+ssh://git@github.com/xiaxi626/theme-builder-skill.git#839c3efd...': true
```

关键注意点：
- key 包含完整的 git URL + commit SHA，**不能用简单包名替代**
- **从 pnpm 报错中原样复制**，不要手打（SHA 很容易抄错）
- **key 必须用单引号包起来**，因为 `@` 是 YAML 保留字符，不加引号会报 `bad indentation` 错误
- 不要把 pnpm 报错中的注释行（`# Add the package to ...`）复制进去
- SHA 每次推送都会变，更新插件时需要重复这个流程

**第 3 步：重新安装（这次会成功）**

```bash
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

卸载后建议手动清理 `pnpm-workspace.yaml` 中的 `allowBuilds` 条目（原有内容保留）。

### 更新

```bash
# 1. 先删掉旧的 allowBuilds 条目，重新 add 触发报错获取新 SHA
npx @deepseek-ai/dsh plugin --profile web add "github:xiaxi626/theme-builder-skill#dsh"
# 2. 用新的 key 更新 pnpm-workspace.yaml
# 3. 重新 add
npx @deepseek-ai/dsh plugin --profile web add "github:xiaxi626/theme-builder-skill#dsh"
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

**解决**：按上方"从 GitHub 安装"的三步流程操作——首次失败是正常的，将 pnpm 报错中打印的完整 `allowBuilds` key（含 git URL + commit SHA）追加到 `~/.dsh/profiles/web/pnpm-workspace.yaml`，然后重新 `add`。

> 注意：key 不能用简单包名，必须用 pnpm 打印的完整格式，且 commit SHA 每次推送都会变。

### 安装失败后清理

首次 `add` 失败**不会留下残余**——pnpm 在构建授权通过之前不会写入任何依赖。如果试图 `remove` 会看到 `ERR_PNPM_CANNOT_REMOVE_MISSING_DEPS`，这是正常的，说明 profile 是干净的，无需额外清理。

`~/.dsh/profiles/web/pnpm-workspace.yaml` 中的原有内容（`packages`、`nodeLinker`）是 DSH profile 自带的基础配置，**不要删**。只需追加或清理 `allowBuilds` 条目。

### `plugin update` 失效

GitHub 安装方式下，`plugin update` 可能因 SHA 变化导致授权失效。解决方式：手动删掉 `pnpm-workspace.yaml` 中的旧 `allowBuilds` 条目，重新走"add → 报错 → 写新 key → add"流程。
