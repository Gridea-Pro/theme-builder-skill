#!/usr/bin/env bash
# DSH 插件安装脚本（macOS / Linux / Git Bash）
#
# 原理：pnpm ≥10 首次 add 会报 ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED，
#       报错信息中包含精确的 allowBuilds key（含 git URL + commit SHA）。
#       脚本自动提取该 key，写入 pnpm-workspace.yaml，然后重跑 add。
#
# 用法：
#   bash install-dsh.sh                              # 从 GitHub 安装
#   bash install-dsh.sh ./                            # 从本地目录安装

set -euo pipefail

PACKAGE_NAME="@gridea-pro/dsh-skill-theme-builder"
PROFILE="${DSH_PROFILE:-web}"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PROFILE_DIR="$DSH_HOME/profiles/$PROFILE"
WORKSPACE_FILE="$PROFILE_DIR/pnpm-workspace.yaml"

SOURCE="${1:-github:xiaxi626/theme-builder-skill#dsh}"

echo "==> DSH 插件安装脚本"
echo "    包名:    $PACKAGE_NAME"
echo "    Profile: $PROFILE"
echo "    源:      $SOURCE"
echo ""

# 1. 确保 profile 目录存在
mkdir -p "$PROFILE_DIR"

# 2. 首次 add（预期失败，捕获输出提取 allowBuilds key）
echo "==> 首次安装（预期触发构建授权报错）..."
FIRST_OUTPUT=$(npx @deepseek-ai/dsh plugin --profile "$PROFILE" add "$SOURCE" 2>&1 || true)
echo "$FIRST_OUTPUT"

# 3. 从报错中提取 allowBuilds key
#    pnpm 打印格式：@包名@git+ssh://...#SHA: true
ALLOW_KEY=$(echo "$FIRST_OUTPUT" | grep -oP "${PACKAGE_NAME}@git\+[^:]+#[a-f0-9]+" | head -1)

if [ -z "$ALLOW_KEY" ]; then
  # 检查是否已经安装成功（没有报错）
  if echo "$FIRST_OUTPUT" | grep -qi "added\|installed\|done"; then
    echo ""
    echo "==> 安装成功（无需构建授权）"
    echo "    启动: npx @deepseek-ai/dsh web"
    exit 0
  fi
  echo ""
  echo "!! 未能自动提取 allowBuilds key"
  echo "!! 请手动操作："
  echo "   1. 查看上方报错信息中 pnpm 打印的 allowBuilds 行"
  echo "   2. 将该行写入 $WORKSPACE_FILE"
  echo "   3. 重新执行: npx @deepseek-ai/dsh plugin --profile $PROFILE add \"$SOURCE\""
  exit 1
fi

echo ""
echo "==> 提取到 allowBuilds key: $ALLOW_KEY"

# 4. 写入 pnpm-workspace.yaml
echo "==> 配置构建授权 ($WORKSPACE_FILE)"

if [ ! -f "$WORKSPACE_FILE" ]; then
  cat > "$WORKSPACE_FILE" << EOF
allowBuilds:
  ${ALLOW_KEY}: true
EOF
  echo "    已创建 $WORKSPACE_FILE"
elif grep -q "$ALLOW_KEY" "$WORKSPACE_FILE"; then
  echo "    授权已存在，跳过"
else
  if grep -q "^allowBuilds:" "$WORKSPACE_FILE"; then
    sed -i.bak "/^allowBuilds:/a\\  ${ALLOW_KEY}: true" "$WORKSPACE_FILE"
  else
    echo "" >> "$WORKSPACE_FILE"
    echo "allowBuilds:" >> "$WORKSPACE_FILE"
    echo "  ${ALLOW_KEY}: true" >> "$WORKSPACE_FILE"
  fi
  echo "    已追加授权到 $WORKSPACE_FILE"
fi
echo ""

# 5. 重新安装
echo "==> 重新安装..."
npx @deepseek-ai/dsh plugin --profile "$PROFILE" add "$SOURCE"

echo ""
echo "==> 安装完成！"
echo "    启动: npx @deepseek-ai/dsh web"
echo "    卸载: npx @deepseek-ai/dsh plugin --profile $PROFILE remove $PACKAGE_NAME"
