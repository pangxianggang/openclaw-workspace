@echo off
chcp 65001 >nul
echo.
echo 🔴 火星文件管理 HTTP 桥接服务
echo.

cd /d "%~dp0"

REM 检查火星文件管理是否已构建
if not exist "..\火星文件\dist\cli\index.js" (
  echo ❌ 火星文件管理未构建，正在构建...
  cd "..\火星文件"
  call npm install
  call npm run build
  cd "..\火星文件扩展"
)

echo ✅ 火星文件管理已就绪
echo.

REM 设置工作区（可以修改为其他路径）
set FM_WORKSPACE=%CD%
set FM_PORT=8765

echo 工作区：%FM_WORKSPACE%
echo 端口：%FM_PORT%
echo.

node fm-http-bridge.js

pause
