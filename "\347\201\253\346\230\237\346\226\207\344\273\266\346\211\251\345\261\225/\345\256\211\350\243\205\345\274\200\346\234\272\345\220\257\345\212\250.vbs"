Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' 获取启动文件夹路径
strAppData = CreateObject("Shell.Application").NameSpace(19).Self.Path
StartupPath = strAppData & "\Microsoft\Windows\Start Menu\Programs\Startup\"

' 获取脚本所在目录
ScriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' 创建快捷方式
Set Shortcut = WshShell.CreateShortcut(StartupPath & "火星文件服务.lnk")
Shortcut.TargetPath = ScriptDir & "\启动火星文件服务.bat"
Shortcut.WorkingDirectory = ScriptDir
Shortcut.WindowStyle = 7  ' 最小化窗口
Shortcut.Save

WScript.Echo "✅ 火星文件服务已添加到开机启动"
WScript.Echo "路径：" & StartupPath & "火星文件服务.lnk"
