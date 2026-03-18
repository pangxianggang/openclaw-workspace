# Mars File Service - Startup Installation Script

$startupPath = [System.Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupPath "MarsService.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)

$targetDir = "C:\Users\Administrator\Desktop\火星文件扩展"
$targetFile = Join-Path $targetDir "启动服务 - 后台.bat"

$Shortcut.TargetPath = $targetFile
$Shortcut.WorkingDirectory = $targetDir
$Shortcut.WindowStyle = 7
$Shortcut.Description = "Mars File Management HTTP Bridge - Auto Start"
$Shortcut.Save()

Write-Host "Installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Shortcut created: $shortcutPath"
Write-Host ""
Write-Host "Mars service will auto-start on next boot (background mode)"
Write-Host ""
Write-Host "To disable: delete the shortcut from startup folder"
