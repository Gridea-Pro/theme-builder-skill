@echo off
REM DSH 插件安装脚本 (Windows CMD)
REM
REM 原理：pnpm >=10 首次 add 会报 ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED，
REM       报错信息中包含精确的 allowBuilds key（含 git URL + commit SHA）。
REM       脚本自动提取该 key，写入 pnpm-workspace.yaml，然后重跑 add。
REM
REM 用法：
REM   install-dsh.bat                              REM 从 GitHub 安装
REM   install-dsh.bat D:\theme-builder-skill       REM 从本地目录安装

setlocal enabledelayedexpansion

set "PACKAGE_NAME=@gridea-pro/dsh-skill-theme-builder"
set "PROFILE=web"

if defined DSH_HOME (
  set "DSH_HOME=%DSH_HOME%"
) else (
  set "DSH_HOME=%USERPROFILE%\.dsh"
)
set "PROFILE_DIR=!DSH_HOME!\profiles\!PROFILE!"
set "WORKSPACE_FILE=!PROFILE_DIR!\pnpm-workspace.yaml"
set "TEMP_OUTPUT=%TEMP%\dsh-install-output.txt"

if "%~1"=="" (
  set "SOURCE=github:xiaxi626/theme-builder-skill#dsh"
) else (
  set "SOURCE=%~1"
)

echo ==^> DSH 插件安装脚本
echo     包名:    !PACKAGE_NAME!
echo     Profile: !PROFILE!
echo     源:      !SOURCE!
echo.

REM 1. 确保 profile 目录存在
if not exist "!PROFILE_DIR!" mkdir "!PROFILE_DIR!"

REM 2. 首次 add（预期失败，捕获输出提取 allowBuilds key）
echo ==^> 首次安装（预期触发构建授权报错）...
npx @deepseek-ai/dsh plugin --profile !PROFILE! add "!SOURCE!" > "!TEMP_OUTPUT!" 2>&1
type "!TEMP_OUTPUT!"

REM 3. 从报错中提取 allowBuilds key
REM    pnpm 打印格式：@包名@git+ssh://...#SHA: true
findstr /C:"!PACKAGE_NAME!@git+" "!TEMP_OUTPUT!" > "%TEMP%\dsh-allow-line.txt" 2>&1

set "ALLOW_KEY="
for /f "tokens=1 delims=:" %%A in ('findstr /C:"!PACKAGE_NAME!@git+" "!TEMP_OUTPUT!"') do (
  set "ALLOW_KEY=%%A"
  goto :found_key
)

:found_key
REM 清理 key 中的空格
set "ALLOW_KEY=!ALLOW_KEY: =!"

if "!ALLOW_KEY!"=="" (
  REM 检查是否已经安装成功
  findstr /C:"added" "!TEMP_OUTPUT!" >nul 2>&1
  if !errorlevel! equ 0 (
    echo.
    echo ==^> 安装成功（无需构建授权）
    echo     启动: npx @deepseek-ai/dsh web
    goto :cleanup
  )
  echo.
  echo !! 未能自动提取 allowBuilds key
  echo !! 请手动操作：
  echo    1. 查看上方报错信息中 pnpm 打印的 allowBuilds 行
  echo    2. 将该行写入 !WORKSPACE_FILE!
  echo    3. 重新执行: npx @deepseek-ai/dsh plugin --profile !PROFILE! add "!SOURCE!"
  goto :cleanup
)

echo.
echo ==^> 提取到 allowBuilds key: !ALLOW_KEY!

REM 4. 写入 pnpm-workspace.yaml
echo ==^> 配置构建授权 (!WORKSPACE_FILE!)

if not exist "!WORKSPACE_FILE!" (
  (
    echo allowBuilds:
    echo   !ALLOW_KEY!: true
  ) > "!WORKSPACE_FILE!"
  echo     已创建 !WORKSPACE_FILE!
) else (
  findstr /C:"!ALLOW_KEY!" "!WORKSPACE_FILE!" >nul 2>&1
  if !errorlevel! equ 0 (
    echo     授权已存在，跳过
  ) else (
    findstr /C:"allowBuilds:" "!WORKSPACE_FILE!" >nul 2>&1
    if !errorlevel! equ 0 (
      echo   !ALLOW_KEY!: true>> "!WORKSPACE_FILE!"
    ) else (
      echo.>> "!WORKSPACE_FILE!"
      echo allowBuilds:>> "!WORKSPACE_FILE!"
      echo   !ALLOW_KEY!: true>> "!WORKSPACE_FILE!"
    )
    echo     已追加授权到 !WORKSPACE_FILE!
  )
)
echo.

REM 5. 重新安装
echo ==^> 重新安装...
npx @deepseek-ai/dsh plugin --profile !PROFILE! add "!SOURCE!"

echo.
echo ==^> 安装完成！
echo     启动: npx @deepseek-ai/dsh web
echo     卸载: npx @deepseek-ai/dsh plugin --profile !PROFILE! remove !PACKAGE_NAME!

:cleanup
if exist "!TEMP_OUTPUT!" del "!TEMP_OUTPUT!"
if exist "%TEMP%\dsh-allow-line.txt" del "%TEMP%\dsh-allow-line.txt"
endlocal
