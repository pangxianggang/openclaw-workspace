@echo off
chcp 65001 >nul
echo.
echo 🔴 安装火星文件服务开机自动启动
echo.

set STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set SCRIPT_DIR=%~dp0

echo 正在创建启动快捷方式...
echo.

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell"
powershell -Command "$Shortcut = $WshShell.CreateShortcut('%STARTUP_DIR%\火星文件服务.lnk')"
powershell -Command "$Shortcut.TargetPath = '%SCRIPT_DIR%启动火星文件服务.bat'"
powershell -Command "$Shortcut.WorkingDirectory = '%SCRIPT_DIR%'"
powershell -Command "$Shortcut.WindowStyle = 7"
powershell -Command "$Shortcut.Save()"

echo.
echo ✅ 安装完成！
echo.
echo 火星文件服务将在下次开机时自动启动
echo.
echo 如需手动启动，运行：启动火星文件服务.bat
echo.
pause
