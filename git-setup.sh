#!/bin/bash
# H5五子棋项目 - Git配置脚本

echo "🚀 H5五子棋项目 - Git仓库初始化"
echo "=================================="

# 检查是否已经是Git仓库
if [ -d ".git" ]; then
    echo "✅ Git仓库已存在"
else
    echo "📦 初始化Git仓库..."
    git init
    echo "✅ Git仓库初始化完成"
fi

# 配置用户信息（请根据实际情况修改）
echo ""
echo "👤 配置Git用户信息..."
echo "请输入您的Git用户名："
read -r username
echo "请输入您的Git邮箱："
read -r email

git config user.name "$username"
git config user.email "$email"
echo "✅ Git用户信息配置完成"

# 设置默认分支名
echo ""
echo "🌿 设置默认分支..."
git config init.defaultBranch main
echo "✅ 默认分支设置为main"

# 配置行尾符处理
echo ""
echo "📝 配置行尾符处理..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    git config core.autocrlf true
    echo "✅ Windows环境：设置autocrlf为true"
else
    # macOS/Linux
    git config core.autocrlf input
    echo "✅ Unix环境：设置autocrlf为input"
fi

# 配置credential helper
echo ""
echo "🔐 配置凭据助手..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows - 使用manager-core
    git config credential.helper manager-core
    echo "✅ Windows环境：使用Git Credential Manager"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - 使用osxkeychain
    git config credential.helper osxkeychain
    echo "✅ macOS环境：使用osxkeychain"
else
    # Linux - 使用store
    git config credential.helper store
    echo "✅ Linux环境：使用store"
fi

# 添加文件到暂存区
echo ""
echo "📋 添加项目文件..."
git add .
echo "✅ 文件添加完成"

# 创建初始提交
echo ""
echo "📝 创建初始提交..."
git commit -m "feat: 初始化H5五子棋项目

- 完整的开发文档体系
- 技术架构设计
- 编码规范和安全指南
- 快速参考文档
- 项目配置文件

项目基于纯JavaScript(ES6+)开发，使用HTML5 Canvas 2D API渲染"

echo "✅ 初始提交创建完成"

# 提示下一步操作
echo ""
echo "🎉 Git仓库配置完成！"
echo ""
echo "下一步操作："
echo "1. 在GitHub上创建远程仓库"
echo "2. 配置SSH密钥或Personal Access Token"
echo "3. 添加远程仓库："
echo "   git remote add origin https://github.com/username/repository.git"
echo "4. 推送到远程仓库："
echo "   git push -u origin main"
echo ""
echo "🔒 安全提醒："
echo "- 确保Personal Access Token安全存储"
echo "- 推荐使用SSH密钥认证"
echo "- 定期检查仓库访问权限"
echo ""
echo "📚 参考文档："
echo "- 项目规范与安全指南.md"
echo "- 新项目开发指南.md"