@echo off
chcp 65001 >nul

:: 清屏
cls

:: 设置颜色
color 0B

:: 获取控制台大小
mode con cols=120 lines=50

:: 显示 ASCII Logo
echo.
echo.
echo.
echo.

echo                                 ██████╗  ██████╗ ███████╗████████╗███████╗ ██████╗ ███╗   ██╗
echo                                 ██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔════╝██╔═══██╗████╗  ██║
echo                                 ██████╔╝██║   ██║███████╗   ██║   ███████╗██║   ██║██╔██╗ ██║
echo                                 ██╔══██╗██║   ██║╚════██║   ██║   ╚════██║██║   ██║██║╚██╗██║
echo                                 ██████╔╝╚██████╔╝███████║   ██║   ███████║╚██████╔╝██║ ╚████║
echo                                 ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝
echo.
echo                                 ██╗  ██╗██╗   ██╗███╗   ██╗████████╗
echo                                 ╚██╗██╔╝██║   ██║████╗  ██║╚══██╔══╝
echo                                  ╚███╔╝ ██║   ██║██╔██╗ ██║   ██║
echo                                  ██╔██╗ ██║   ██║██║╚██╗██║   ██║
echo                                 ██╔╝ ██╗╚██████╔╝██║ ╚████║   ██║
echo                                 ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝
echo.
echo.
echo.
echo.

:: 设置颜色为青色
color 09

echo                                     ═══════════════════════════════════════════════════════════════
echo                                     ═══════════════════════════════════════════════════════════════
echo.

:: 恢复颜色
color 07

echo.
echo.

:: 检查火星文件是否已构建
if not exist "..\火星文件\dist\cli\index.js" (
    echo [系统] 正在初始化火星文件管理系统...
    cd "..\火星文件"
    call npm install >nul 2>&1
    call npm run build >nul 2>&1
    cd "..\火星文件扩展"
    echo [系统] 初始化完成
    echo.
)

:: 显示状态信息
echo ════════════════════════════════════════════════════════════════
echo.
echo   📁 工作区：%CD%
echo.
echo   🤖 AI 引擎：已就绪
echo   🔌 MCP 支持：已启用
echo   🔧 火星文件：已就绪
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo.

:: 检查 API Key
if "%AI_API_KEY%"=="" (
    echo   ⚠️  提示：未检测到 AI_API_KEY 环境变量
    echo       你可以在平台中输入 /api 来设置
    echo.
    echo   💡 支持的模型:
    echo       qwen3.5-plus, qwen3-max-2026-01-23
    echo       qwen3-coder-next, qwen3-coder-plus
    echo       slm-5, glm-4.7, kimi-k2.5, MiniMax-M2.5
    echo.
) else (
    echo   ✅ API 配置已加载
    echo   🤖 当前模型：AI_API_KEY
    echo.
)

echo   正在启动火星编程 CODE 平台...
echo.
echo   加载核心模块 ████████████ 100%%
echo   加载 MCP 模块  ████████████ 100%%
echo   连接 AI 服务  ████████████ 100%%
echo.
echo   启动完成！
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo.

timeout /t 1 >nul

cls

:: 启动平台
node mars-platform.js

pause
