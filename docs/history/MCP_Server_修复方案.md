# MCP Server Fetch 启动问题修复方案

## 🔍 问题分析

**错误信息**：`exec: "uvx": executable file not found in %PATH%`

**问题原因**：
1. 系统缺少 `uv` 工具（Python包管理器）
2. Python Scripts目录不在系统PATH中
3. MCP Server配置使用了 `uvx` 命令而不是 `python -m` 方式

## ✅ 解决方案

### 方案1：添加Python Scripts到PATH（推荐）

#### 步骤1：添加环境变量
```powershell
# 方法A：临时添加（当前会话有效）
$env:PATH += ";C:\Users\ducky\AppData\Roaming\Python\Python313\Scripts"

# 方法B：永久添加（系统级，推荐）
# 1. 打开"系统属性" -> "环境变量"
# 2. 在"用户变量"中找到"Path"
# 3. 添加路径：C:\Users\ducky\AppData\Roaming\Python\Python313\Scripts
```

#### 步骤2：验证修复
```bash
# 重新打开终端后测试
mcp-server-fetch --help
```

### 方案2：使用Python模块方式（立即可用）

#### 创建批处理文件
```batch
@echo off
python -m mcp_server_fetch %*
```
保存为 `mcp-server-fetch.bat` 并放在PATH中的目录。

#### 或者在MCP配置中直接使用
```json
{
  "mcpServers": {
    "fetch": {
      "command": "python",
      "args": ["-m", "mcp_server_fetch"]
    }
  }
}
```

### 方案3：安装uv工具（可选）

#### 使用PowerShell安装
```powershell
# 方法A：使用官方安装脚本
irm https://astral.sh/uv/install.ps1 | iex

# 方法B：使用winget
winget install --id=astral-sh.uv -e

# 方法C：使用Scoop
scoop install uv
```

## 🚀 快速修复命令

### 临时解决方案（立即可用）
```powershell
# 1. 添加Python Scripts到当前会话PATH
$env:PATH += ";C:\Users\ducky\AppData\Roaming\Python\Python313\Scripts"

# 2. 验证修复
mcp-server-fetch --help
```

### 永久解决方案
```powershell
# 永久添加到用户PATH
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Users\ducky\AppData\Roaming\Python\Python313\Scripts", [EnvironmentVariableTarget]::User)
```

## 🔧 MCP配置调整

### 如果您的MCP配置文件中使用了uvx
将配置从：
```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

改为：
```json
{
  "mcpServers": {
    "fetch": {
      "command": "python",
      "args": ["-m", "mcp_server_fetch"]
    }
  }
}
```

或者（如果PATH已修复）：
```json
{
  "mcpServers": {
    "fetch": {
      "command": "mcp-server-fetch"
    }
  }
}
```

## ✅ 验证修复结果

### 1. 测试命令行工具
```bash
# 测试mcp-server-fetch命令
mcp-server-fetch --help

# 测试Python模块
python -m mcp_server_fetch --help
```

### 2. 测试MCP连接
重启您的IDE或MCP客户端，检查fetch服务是否正常启动。

## 🚨 注意事项

1. **重启终端**：修改PATH后需要重新打开终端
2. **权限问题**：如果遇到权限问题，使用管理员权限运行
3. **路径正确性**：确保Python Scripts路径正确（检查实际安装位置）

## 📚 相关资源

- [uv官方文档](https://docs.astral.sh/uv/)
- [MCP文档](https://docs.qoder.com/troubleshooting/mcp-common-issue)
- [Python PATH配置指南](https://docs.python.org/3/using/windows.html#finding-the-python-executable)

## 🔄 后续建议

1. **安装uv工具**：推荐安装uv以获得更好的Python包管理体验
2. **环境变量管理**：考虑使用工具如Scoop或Chocolatey统一管理开发工具
3. **MCP配置标准化**：建议团队统一MCP服务器配置方式

---

**修复状态**：✅ mcp-server-fetch已成功安装并可用  
**下一步**：添加到PATH或调整MCP配置即可正常使用