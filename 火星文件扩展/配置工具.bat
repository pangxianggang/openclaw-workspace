@echo off
chcp 65001 >nul
cls

echo.
echo ════════════════════════════════════════════════════════════
echo                     火星编程 CODE - 配置工具
echo ════════════════════════════════════════════════════════════
echo.
echo   请设置你的阿里云 DashScope API Key
echo.
echo   支持的模型:
echo     - qwen3.5-plus          (通义千问)
echo     - qwen3-max-2026-01-23  (通义千问)
echo     - qwen3-coder-next      (通义千问)
echo     - qwen3-coder-plus      (通义千问)
echo     - slm-5                 (通义千问)
echo     - glm-4.7               (智谱 AI)
echo     - kimi-k2.5             (月之暗面)
echo     - MiniMax-M2.5          (MiniMax)
echo.
echo ════════════════════════════════════════════════════════════
echo.

set /p API_KEY="请输入 API Key: "

if "%API_KEY%"=="" (
    echo.
    echo ❌ 未输入 API Key
    echo.
    pause
    exit /b 1
)

echo.
echo 请选择模型 (输入序号):
echo   1. qwen3.5-plus          (推荐)
echo   2. qwen3-max-2026-01-23
echo   3. qwen3-coder-next
echo   4. qwen3-coder-plus
echo   5. slm-5
echo   6. glm-4.7
echo   7. kimi-k2.5
echo   8. MiniMax-M2.5
echo.

set /p MODEL_CHOICE="请输入选项 (1-8，默认 1): "

if "%MODEL_CHOICE%"=="" set MODEL_CHOICE=1

if "%MODEL_CHOICE%"=="1" set MODEL_ID=qwen3.5-plus
if "%MODEL_CHOICE%"=="2" set MODEL_ID=qwen3-max-2026-01-23
if "%MODEL_CHOICE%"=="3" set MODEL_ID=qwen3-coder-next
if "%MODEL_CHOICE%"=="4" set MODEL_ID=qwen3-coder-plus
if "%MODEL_CHOICE%"=="5" set MODEL_ID=slm-5
if "%MODEL_CHOICE%"=="6" set MODEL_ID=glm-4.7
if "%MODEL_CHOICE%"=="7" set MODEL_ID=kimi-k2.5
if "%MODEL_CHOICE%"=="8" set MODEL_ID=MiniMax-M2.5

echo.
echo ════════════════════════════════════════════════════════════
echo.
echo   配置信息:
echo     API Key: %API_KEY%
echo     模型：%MODEL_ID%
echo.
echo   是否保存配置？(Y/N)
echo.

set /p CONFIRM="请输入确认： "

if /i not "%CONFIRM%"=="Y" (
    echo.
    echo ❌ 配置已取消
    echo.
    pause
    exit /b 1
)

:: 保存环境变量
setx AI_API_KEY "%API_KEY%"
setx AI_MODEL "%MODEL_ID%"
setx AI_PROVIDER "dashscope"

echo.
echo ════════════════════════════════════════════════════════════
echo.
echo   ✅ 配置已保存!
echo.
echo   下次启动可以使用以下命令:
echo     启动编程平台.bat
echo.
echo   或在平台中使用:
echo     /api %API_KEY%
echo     /model %MODEL_ID%
echo.

pause
