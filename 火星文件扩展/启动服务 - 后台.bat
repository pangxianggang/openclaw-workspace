@echo off
chcp 65001 >nul
echo.
echo 🔴 火星文件服务 - 后台启动版本
echo.
echo 此脚本用于后台启动服务，不显示窗口
echo.

cd /d "%~dp0"

REM 设置环境变量
set FM_WORKSPACE=%CD%
set FM_PORT=8765

REM 后台启动 node
start /B node fm-http-bridge.js

echo ✅ 服务已在后台启动
echo 端口：8765
echo.
echo AI 现在可以调用火星文件工具了
echo.
