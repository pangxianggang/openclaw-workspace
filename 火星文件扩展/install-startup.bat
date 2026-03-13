@echo off
chcp 65001 >nul

echo.
echo 🔴 安装火星文件服务开机自动启动
echo.

set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

REM 使用 PowerShell 创建快捷方式（避开中文路径问题）
powershell -Command "lnkPath = [System.IO.Path]::Combine([System.Environment]::GetFolderPath('Startup'), 'MarsService.lnk'); WshShell = New-Object -ComObject WScript.Shell; Shortcut = WshShell.CreateShortcut(lnkPath); Shortcut.TargetPath = 'C:\Users\Administrator\Desktop\火星文件扩展\启动火星文件服务.bat'; Shortcut.WorkingDirectory = 'C:\Users\Administrator\Desktop\火星文件扩展'; Shortcut.WindowStyle = 7; Shortcut.Save()"

if %ERRORLEVEL% EQU 0 (
    echo ✅ 安装完成！
    echo.
    echo 火星文件服务将在下次开机时自动启动
    echo.
    echo 如需停止开机启动，删除启动文件夹中的快捷方式即可
    echo 路径：%STARTUP%
) else (
    echo ❌ 安装失败，请手动创建快捷方式
)

echo.
pause
