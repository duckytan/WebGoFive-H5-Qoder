# H5五子棋游戏 - 开发者文档

## 目录
1. [项目概述](#项目概述)
2. [架构设计](#架构设计)
3. [核心组件](#核心组件)
4. [API文档](#api文档)
5. [开发指南](#开发指南)
6. [测试指南](#测试指南)
7. [部署指南](#部署指南)
8. [扩展开发](#扩展开发)

## 项目概述

### 技术栈
- **前端**: 纯JavaScript (ES6+), HTML5, CSS3
- **渲染**: HTML5 Canvas API
- **架构**: 面向对象设计，模块化组件
- **存储**: LocalStorage + JSON文件导入导出
- **测试**: 自定义JavaScript测试框架

### 项目结构
```
/
├── index.html              # 主游戏界面
├── test.html              # 测试界面
├── js/                    # JavaScript模块
│   ├── main.js           # 应用入口点
│   ├── GameManager.js    # 游戏管理器
│   ├── Board.js          # 棋盘状态管理
│   ├── RuleEngine.js     # 规则引擎
│   ├── CanvasRenderer.js # Canvas渲染器
│   ├── AIEngine.js       # AI引擎
│   ├── GameDataManager.js# 数据管理器
│   ├── FileHandler.js    # 文件处理器
│   ├── ReplayManager.js  # 回放管理器
│   ├── PerformanceManager.js # 性能管理器
│   └── ErrorHandler.js   # 错误处理器
├── styles/
│   └── main.css          # 样式文件
├── test/                 # 测试文件
│   ├── comprehensive-test-suite.js
│   ├── integration-test.js
│   ├── browser-compatibility-test.js
│   └── ...
└── docs/                 # 文档
    ├── user-guide.md
    └── developer-guide.md
```

### 设计原则
- **单一职责**: 每个类负责一个明确的功能
- **依赖注入**: 通过构造函数注入依赖
- **事件驱动**: 基于DOM事件的交互模式
- **数据不可变**: 通过克隆保证数据安全
- **错误处理**: 完善的错误捕获和恢复机制

## 架构设计

### 整体架构
```
┌─────────────────────────────────────────┐
│                UI Layer                 │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │   Canvas    │  │   Control Panel │   │
│  │   Renderer  │  │   (Buttons)     │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│              Game Logic Layer           │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │    Game     │  │      Rule       │   │
│  │   Manager   │  │    Engine       │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│               Data Layer                │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │   Board     │  │   AI Engine     │   │
│  │   State     │  │                 │   │
│  └─────────────┘  └─────────────────┘   │
└─────────────────────────────────────────┘
```

### 数据流
1. **用户输入** → GameManager (事件监听)
2. **GameManager** → Board (状态更新)
3. **GameManager** → RuleEngine (规则验证)
4. **GameManager** → CanvasRenderer (视觉更新)
5. **CanvasRenderer** → Canvas (DOM渲染)

### 组件关系
- **GameManager**: 核心协调器，管理所有组件
- **Board**: 纯数据模型，无业务逻辑
- **RuleEngine**: 无状态规则验证器
- **CanvasRenderer**: 纯渲染逻辑，无状态
- **AIEngine**: 独立的AI决策模块

## 核心组件

### Board类
棋盘状态管理，负责维护15×15棋盘的状态。

```javascript
class Board {
    constructor() {
        this.size = 15;
        this.grid = Array(15).fill().map(() => Array(15).fill(0));
        this.lastMove = null;
        this.moveCount = 0;
    }
    
    // 核心方法
    placePiece(x, y, player) { /* 放置棋子 */ }
    isEmpty(x, y) { /* 检查位置是否为空 */ }
    getPiece(x, y) { /* 获取指定位置棋子 */ }
    clone() { /* 深拷贝棋盘 */ }
}
```

**关键特性**:
- 不可变操作：通过clone()支持状态回滚
- 边界检查：所有操作都进行坐标验证
- 移动计数：自动维护落子计数

### RuleEngine类
规则引擎，处理五子棋规则判定和禁手检测。

```javascript
class RuleEngine {
    constructor() {
        this.directions = [[1,0], [0,1], [1,1], [1,-1]];
    }
    
    // 核心方法
    checkWin(board, x, y, player) { /* 胜负判定 */ }
    checkForbidden(board, x, y) { /* 禁手检测 */ }
    countLine(board, x, y, dx, dy, player) { /* 连子计数 */ }
}
```

**禁手规则实现**:
- **三三禁手**: 一步棋同时形成两个活三
- **四四禁手**: 一步棋同时形成两个四（活四/冲四）
- **长连禁手**: 一步棋形成六子或以上连线

### GameManager类
游戏管理器，协调所有组件，管理游戏流程。

```javascript
class GameManager {
    constructor() {
        this.board = new Board();
        this.ruleEngine = new RuleEngine();
        this.renderer = new CanvasRenderer('game-canvas');
        this.gameState = { /* 游戏状态 */ };
    }
    
    // 核心方法
    makeMove(x, y) { /* 执行落子 */ }
    startNewGame() { /* 开始新游戏 */ }
    undoMove() { /* 悔棋 */ }
    render() { /* 渲染游戏画面 */ }
}
```

**状态管理**:
- 游戏模式：PvP/PvE切换
- 当前玩家：自动轮换
- 移动历史：完整记录每步棋
- 游戏状态：playing/ended/paused

### CanvasRenderer类
Canvas渲染器，负责游戏画面的绘制。

```javascript
class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }
    
    // 核心方法
    render(board, gameState, hoverPos, forbidden) { /* 主渲染 */ }
    screenToBoard(screenX, screenY) { /* 坐标转换 */ }
    boardToScreen(boardX, boardY) { /* 坐标转换 */ }
}
```

**渲染特性**:
- 高DPI支持：自动适配高分辨率屏幕
- 响应式设计：自适应屏幕尺寸
- 悬停预览：实时显示落子预览
- 禁手提示：红色显示禁手位置

## API文档

### Board API

#### placePiece(x, y, player)
在指定位置放置棋子。

**参数**:
- `x` (number): X坐标 (0-14)
- `y` (number): Y坐标 (0-14)  
- `player` (number): 玩家 (1=黑棋, 2=白棋)

**返回值**: `boolean` - 是否成功放置

**示例**:
```javascript
const board = new Board();
const success = board.placePiece(7, 7, 1); // 在天元放置黑棋
```

#### isEmpty(x, y)
检查指定位置是否为空。

**参数**:
- `x` (number): X坐标
- `y` (number): Y坐标

**返回值**: `boolean` - 位置是否为空

#### getPiece(x, y)
获取指定位置的棋子。

**返回值**: `number` - 棋子类型 (0=空, 1=黑棋, 2=白棋, -1=无效位置)

#### clone()
创建棋盘的深拷贝。

**返回值**: `Board` - 新的棋盘实例

### RuleEngine API

#### checkWin(board, x, y, player)
检查指定位置是否获胜。

**参数**:
- `board` (Board): 棋盘对象
- `x` (number): 最后落子X坐标
- `y` (number): 最后落子Y坐标
- `player` (number): 玩家

**返回值**: `boolean` - 是否获胜

#### checkForbidden(board, x, y)
检查指定位置是否为禁手（仅对黑棋）。

**返回值**: `string|null` - 禁手类型或null
- `'double-three'`: 双三禁手
- `'double-four'`: 双四禁手
- `'overline'`: 长连禁手

### GameManager API

#### makeMove(x, y)
执行落子操作。

**参数**:
- `x` (number): X坐标
- `y` (number): Y坐标

**返回值**: `boolean` - 是否成功落子

#### startNewGame()
开始新游戏，重置所有状态。

#### undoMove()
悔棋操作。

**返回值**: `boolean` - 是否成功悔棋

#### toggleGameMode()
切换游戏模式（PvP ↔ PvE）。

### CanvasRenderer API

#### render(board, gameState, hoverPosition, hoverForbidden)
渲染游戏画面。

**参数**:
- `board` (Board): 棋盘对象
- `gameState` (Object): 游戏状态
- `hoverPosition` (Object): 悬停位置 {x, y}
- `hoverForbidden` (boolean|string): 是否禁手

#### screenToBoard(screenX, screenY)
将屏幕坐标转换为棋盘坐标。

**返回值**: `Object|null` - 棋盘坐标 {x, y} 或 null

#### boardToScreen(boardX, boardY)
将棋盘坐标转换为屏幕坐标。

**返回值**: `Object` - 屏幕坐标 {x, y}

## 开发指南

### 环境搭建
1. 克隆项目到本地
2. 使用本地HTTP服务器运行（不能直接用file://协议）
3. 推荐使用：
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   ```

### 代码规范
- **命名约定**: 
  - 类名：PascalCase (GameManager)
  - 方法名：camelCase (makeMove)
  - 常量：UPPER_SNAKE_CASE (BOARD_SIZE)
- **注释规范**: 使用JSDoc格式
- **错误处理**: 使用try-catch包装关键操作
- **日志记录**: 使用console.log记录关键状态

### 添加新功能
1. **创建新类**: 继承现有模式，单一职责
2. **集成到GameManager**: 通过依赖注入
3. **添加测试**: 在test/目录下创建对应测试
4. **更新文档**: 同步更新API文档

### 调试技巧
- 使用`window.debugGame`对象进行调试
- 在浏览器控制台中查看游戏状态
- 使用`gameManager.validateGameIntegrity()`检查数据一致性

## 测试指南

### 测试结构
```
test/
├── comprehensive-test-suite.js    # 综合单元测试
├── integration-test.js           # 集成测试
├── browser-compatibility-test.js # 兼容性测试
├── basic-test.js                # 基础功能测试
├── rule-engine-test.js          # 规则引擎测试
└── forbidden-test.js            # 禁手规则测试
```

### 运行测试
1. 打开`test.html`
2. 点击对应的测试按钮
3. 查看控制台输出结果

### 编写测试
```javascript
class MyTest {
    async runTest(testName, testFunction) {
        try {
            await testFunction();
            console.log(`✅ ${testName}`);
        } catch (error) {
            console.log(`❌ ${testName}: ${error.message}`);
        }
    }
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
}
```

### 测试覆盖
- **单元测试**: 每个类的所有公共方法
- **集成测试**: 组件间协作和完整流程
- **兼容性测试**: 不同浏览器的API支持
- **性能测试**: 关键操作的性能基准

## 部署指南

### 生产环境部署
1. **静态文件服务器**: 任何支持静态文件的服务器
2. **CDN部署**: 可部署到CDN进行加速
3. **HTTPS**: 推荐使用HTTPS协议

### 推荐平台
- **GitHub Pages**: 免费静态托管
- **Netlify**: 自动部署和CDN
- **Vercel**: 现代化部署平台

### 性能优化
- **文件压缩**: 压缩JavaScript和CSS文件
- **图片优化**: 如果有图片资源，进行压缩
- **缓存策略**: 设置适当的缓存头

## 扩展开发

### 添加新的AI算法
1. 继承或修改`AIEngine`类
2. 实现新的评估函数
3. 添加对应的测试用例

### 添加新的游戏模式
1. 在`GameManager`中添加新模式
2. 修改UI以支持模式选择
3. 更新相关的游戏逻辑

### 添加网络对战
1. 集成WebSocket或WebRTC
2. 实现房间管理系统
3. 处理网络延迟和断线重连

### 添加更多棋类游戏
1. 抽象化`Board`和`RuleEngine`
2. 创建游戏特定的规则实现
3. 复用渲染和UI组件

---

更多技术细节请参考源代码注释和测试用例。