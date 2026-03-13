@echo off
setlocal enabledelayedexpansion

REM 火星文件管理 Native Host 启动脚本
cd /d "%~dp0"

REM 检查火星文件管理是否已构建
if not exist "..\火星文件\dist\cli\index.js" (
  echo FM-Engine not built. Building...
  cd "..\火星文件"
  call npm run build
  cd "..\火星文件扩展"
)

REM 启动 Node.js 脚本处理 Native Messaging
node fm-host-wrapper.js
