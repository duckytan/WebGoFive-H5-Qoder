# H5五子棋游戏

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](./docs/history/VERSION.md)

> 基于 HTML5 Canvas 技术开发的在线五子棋游戏，支持双人对战和人机对战模式

## ✨ 项目特色

- 🎮 **多模式对战** - 支持双人对战(PvP)、人机对战(PvE)、机机对战(EvE)和VCF练习
- 🎓 **VCF练习模式** - 系统化学习冲四战术，从入门到精通 ⭐NEW!
- 🎯 **完整规则** - 严格遵循五子棋规则，包括禁手检测
- 🤖 **智能AI** - 四级难度AI系统 (新手/正常/困难/地狱)
- 💾 **存档回放** - 支持棋局保存、加载和回放功能
- 📱 **响应式设计** - 支持桌面和移动设备
- 🎨 **精美界面** - 现代化UI设计，流畅动画效果

## 🚀 快速开始

### 本地运行

```bash
# 克隆项目
git clone https://github.com/your-username/gomoku-game.git
cd gomoku-game

# 启动本地服务器
python3 -m http.server 8080

# 或使用 Node.js
npx http-server -p 8080
```

然后在浏览器中访问 `http://localhost:8080`

### 在线体验

访问在线演示: [Demo](https://duckytan.github.io/WebGoFive-H5-Qoder/)

## 📖 文档

完整文档请访问 [文档中心](./docs/README.md)

### 快速链接

#### 🎯 核心文档
- [需求规格书](./docs/requirements/需求规格书.md) - 功能需求和验收标准
- [五子棋规则与算法](./docs/design/五子棋规则与算法.md) - 游戏规则和核心算法
- [AI难度等级设计](./docs/design/AI难度等级设计.md) - AI系统设计方案

#### 👨‍💻 开发指南
- [新项目开发指南](./docs/guides/新项目开发指南.md) - 完整开发流程和技术架构
- [开发者快速参考](./docs/reference/开发者快速参考.md) - API速查和开发规范
- [项目规范与安全指南](./docs/guides/项目规范与安全指南.md) - 编码规范和安全要求

#### 📚 其他文档
- [用户使用指南](./docs/user/user-guide.md) - 游戏操作说明
- [问题排查指南](./docs/reference/troubleshooting-guide.md) - 常见问题和解决方案
- [部署指南](./docs/operations/deployment-guide.md) - 部署配置说明

## 🎮 功能特性

### 游戏模式
- **双人对战 (PvP)** - 黑白双方轮流对弈
- **人机对战 (PvE)** - 对战AI，可选择四种难度
- **机机对战 (EvE)** - 观赏AI之间的对弈
- **冲四练习 (VCF)** - 通过专题练习掌握连续冲四战术 ⭐NEW!

### 规则系统
- ✅ 标准五子棋规则
- ✅ 禁手检测 (三三、四四、长连)
- ✅ 胜负判定
- ✅ 悔棋功能

### 辅助功能
- 💡 智能提示
- 💾 棋局保存/加载
- ⏯️ 棋局回放
- ⚙️ 个性化设置
- 📊 游戏统计

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **渲染**: Canvas API
- **架构**: 模块化设计
- **存储**: LocalStorage + JSON
- **部署**: GitHub Pages

## 📂 项目结构

```
gomoku-game/
├── index.html              # 主页面
├── js/                     # JavaScript模块
│   ├── game-core.js       # 游戏核心引擎
│   ├── board-renderer.js  # 棋盘渲染器
│   ├── demo.js            # 界面交互
│   ├── game-save-load.js  # 存档功能
│   ├── game-replay.js     # 回放功能
│   └── vcf-practice.js    # VCF练习管理器 ⭐NEW!
├── css/                    # 样式文件
│   ├── style.css          # 主样式
│   └── animations.css     # 动画效果
├── docs/                   # 文档目录
│   ├── design/            # 设计文档
│   ├── guides/            # 开发指南
│   ├── reference/         # API参考
│   ├── requirements/      # 需求文档
│   ├── user/              # 用户文档
│   ├── operations/        # 运维文档
│   ├── overview/          # 项目概览
│   └── history/           # 历史记录
└── README.md              # 本文件
```

## 📊 项目状态

### 里程碑进度

- ✅ **Milestone 1**: 核心游戏引擎 (v0.1.0)
- ✅ **Milestone 2**: 数据持久化 (v0.2.0)
- ✅ **Milestone 3**: 禁手规则 (v0.3.0)
- ✅ **Milestone 4**: AI系统 (v1.0.0)
- ✅ **Milestone 5**: 用户体验优化 (v1.0.1)
- ⏳ **Milestone 6**: 测试和发布 (v1.1.0) - 进行中

详细进度请查看 [项目总结](./docs/overview/PROJECT_SUMMARY.md)

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

请确保遵循 [项目规范与安全指南](./docs/guides/项目规范与安全指南.md)

## 📄 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接

- 项目主页: [GitHub Repository](https://github.com/your-username/gomoku-game)
- 在线演示: [Live Demo](https://your-username.github.io/gomoku-game)
- 问题反馈: [Issue Tracker](https://github.com/your-username/gomoku-game/issues)
- 文档中心: [Documentation](./docs/README.md)

## 👥 团队

由 AI 开发助手团队共同开发和维护

## 📝 更新日志

查看 [更新日志](./docs/history/CHANGELOG.md) 了解版本变更

---

**当前版本**: v1.0.1  
**最后更新**: 2025年1月  
**开发状态**: 🟢 活跃开发中

如有问题或建议，欢迎提交 [Issue](https://github.com/your-username/gomoku-game/issues)
