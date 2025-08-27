# H5五子棋游戏 - API文档

## 目录
1. [概述](#概述)
2. [核心类API](#核心类api)
3. [工具类API](#工具类api)
4. [事件系统](#事件系统)
5. [数据结构](#数据结构)
6. [错误处理](#错误处理)
7. [扩展接口](#扩展接口)

## 概述

本文档详细描述了H5五子棋游戏的所有公共API接口。所有API都遵循JSDoc标准，提供完整的类型信息和使用示例。

### 版本信息
- **API版本**: 1.0.0
- **兼容性**: ES6+
- **浏览器支持**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

### 命名约定
- **类名**: PascalCase (如 `GameManager`)
- **方法名**: camelCase (如 `makeMove`)
- **常量**: UPPER_SNAKE_CASE (如 `BOARD_SIZE`)
- **私有方法**: 以下划线开头 (如 `_privateMethod`)

## 核心类API

### Board类

棋盘状态管理类，负责维护15×15棋盘的状态。

#### 构造函数

```javascript
/**
 * 创建一个新的棋盘实例
 * @constructor
 */
new Board()
```

#### 属性

| 属性 | 类型 | 描述 | 只读 |
|------|------|------|------|
| `size` | `number` | 棋盘尺寸，固定为15 | ✓ |
| `grid` | `number[][]` | 棋盘网格状态 | |
| `lastMove` | `Object\|null` | 最后一步棋信息 | |
| `moveCount` | `number` | 已下棋子总数 | |

#### 方法

##### placePiece(x, y, player)

在指定位置放置棋子。

```javascript
/**
 * @param {number} x - X坐标 (0-14)
 * @param {number} y - Y坐标 (0-14)
 * @param {number} player - 玩家 (1=黑棋, 2=白棋)
 * @returns {boolean} 是否成功放置
 */
board.placePiece(7, 7, 1)
```

**示例**:
```javascript
const board = new Board();
const success = board.placePiece(7, 7, 1); // 在天元放置黑棋
console.log(success); // true

const duplicate = board.placePiece(7, 7, 2); // 尝试重复放置
console.log(duplicate); // false
```

##### isEmpty(x, y)

检查指定位置是否为空。

```javascript
/**
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {boolean} 位置是否为空
 */
board.isEmpty(7, 7)
```

##### getPiece(x, y)

获取指定位置的棋子。

```javascript
/**
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {number} 棋子类型 (0=空, 1=黑棋, 2=白棋, -1=无效位置)
 */
board.getPiece(7, 7)
```

##### isValidPosition(x, y)

检查坐标是否有效。

```javascript
/**
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {boolean} 坐标是否有效
 */
board.isValidPosition(7, 7)
```

##### clone()

创建棋盘的深拷贝。

```javascript
/**
 * @returns {Board} 新的棋盘实例
 */
const clonedBoard = board.clone()
```

##### clear()

清空棋盘，重置所有状态。

```javascript
board.clear()
```

##### isFull()

检查棋盘是否已满。

```javascript
/**
 * @returns {boolean} 棋盘是否已满
 */
board.isFull()
```

##### getEmptyPositions()

获取所有空位置。

```javascript
/**
 * @returns {Array<{x: number, y: number}>} 空位置数组
 */
const emptyPositions = board.getEmptyPositions()
```

### RuleEngine类

规则引擎类，处理五子棋规则判定和禁手检测。

#### 构造函数

```javascript
/**
 * 创建规则引擎实例
 * @constructor
 */
new RuleEngine()
```

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `directions` | `number[][]` | 四个检查方向的向量 |

#### 方法

##### checkWin(board, x, y, player)

检查指定位置是否获胜。

```javascript
/**
 * @param {Board} board - 棋盘对象
 * @param {number} x - 最后落子X坐标
 * @param {number} y - 最后落子Y坐标
 * @param {number} player - 玩家
 * @returns {boolean} 是否获胜
 */
ruleEngine.checkWin(board, 7, 7, 1)
```

##### checkForbidden(board, x, y)

检查指定位置是否为禁手（仅对黑棋）。

```javascript
/**
 * @param {Board} board - 棋盘对象
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {string|null} 禁手类型或null
 */
const forbidden = ruleEngine.checkForbidden(board, 7, 7)
```

**返回值**:
- `'double-three'`: 双三禁手
- `'double-four'`: 双四禁手
- `'overline'`: 长连禁手
- `null`: 非禁手

##### countLine(board, x, y, dx, dy, player)

计算指定方向的连子数量。

```javascript
/**
 * @param {Board} board - 棋盘对象
 * @param {number} x - 起始X坐标
 * @param {number} y - 起始Y坐标
 * @param {number} dx - X方向增量
 * @param {number} dy - Y方向增量
 * @param {number} player - 玩家
 * @returns {number} 连子数量
 */
const count = ruleEngine.countLine(board, 7, 7, 1, 0, 1)
```

### GameManager类

游戏管理器类，协调所有组件，管理游戏流程。

#### 构造函数

```javascript
/**
 * 创建游戏管理器实例
 * @constructor
 */
new GameManager()
```

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `board` | `Board` | 棋盘实例 |
| `ruleEngine` | `RuleEngine` | 规则引擎实例 |
| `renderer` | `CanvasRenderer` | 渲染器实例 |
| `gameState` | `Object` | 游戏状态对象 |

#### 方法

##### makeMove(x, y)

执行落子操作。

```javascript
/**
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @returns {boolean} 是否成功落子
 */
gameManager.makeMove(7, 7)
```

##### startNewGame()

开始新游戏。

```javascript
gameManager.startNewGame()
```

##### undoMove()

悔棋操作。

```javascript
/**
 * @returns {boolean} 是否成功悔棋
 */
const success = gameManager.undoMove()
```

##### toggleGameMode()

切换游戏模式（PvP ↔ PvE）。

```javascript
gameManager.toggleGameMode()
```

##### render()

渲染游戏画面。

```javascript
gameManager.render()
```

##### saveGame()

保存游戏到文件。

```javascript
/**
 * @returns {Promise<void>}
 */
await gameManager.saveGame()
```

##### loadGame()

触发游戏加载文件选择。

```javascript
gameManager.loadGame()
```

### CanvasRenderer类

Canvas渲染器类，负责游戏画面的绘制。

#### 构造函数

```javascript
/**
 * 创建渲染器实例
 * @constructor
 * @param {string} canvasId - Canvas元素的ID
 */
new CanvasRenderer('game-canvas')
```

#### 属性

| 属性 | 类型 | 描述 |
|------|------|------|
| `canvas` | `HTMLCanvasElement` | Canvas元素 |
| `ctx` | `CanvasRenderingContext2D` | 2D渲染上下文 |
| `cellSize` | `number` | 单元格尺寸 |
| `boardOffset` | `Object` | 棋盘偏移量 |

#### 方法

##### render(board, gameState, hoverPosition, hoverForbidden)

渲染游戏画面。

```javascript
/**
 * @param {Board} board - 棋盘对象
 * @param {Object} gameState - 游戏状态
 * @param {Object|null} hoverPosition - 悬停位置
 * @param {boolean|string} hoverForbidden - 是否禁手
 */
renderer.render(board, gameState, {x: 7, y: 7}, false)
```

##### screenToBoard(screenX, screenY)

屏幕坐标转棋盘坐标。

```javascript
/**
 * @param {number} screenX - 屏幕X坐标
 * @param {number} screenY - 屏幕Y坐标
 * @returns {Object|null} 棋盘坐标或null
 */
const boardPos = renderer.screenToBoard(240, 240)
```

##### boardToScreen(boardX, boardY)

棋盘坐标转屏幕坐标。

```javascript
/**
 * @param {number} boardX - 棋盘X坐标
 * @param {number} boardY - 棋盘Y坐标
 * @returns {Object} 屏幕坐标
 */
const screenPos = renderer.boardToScreen(7, 7)
```

## 工具类API

### AIEngine类

AI引擎类，提供人工智能对战功能。

#### 方法

##### makeMove(board, player)

AI计算最佳落子位置。

```javascript
/**
 * @param {Board} board - 棋盘对象
 * @param {number} player - AI玩家
 * @returns {Promise<Object>} 落子位置 {x, y}
 */
const move = await aiEngine.makeMove(board, 2)
```

##### setDifficulty(difficulty)

设置AI难度。

```javascript
/**
 * @param {string} difficulty - 难度等级 ('easy'|'medium'|'hard')
 */
aiEngine.setDifficulty('hard')
```

### GameDataManager类

游戏数据管理类，处理游戏数据的存储和序列化。

#### 方法

##### addMove(move, gameState, board)

添加移动记录。

```javascript
/**
 * @param {Object} move - 移动信息
 * @param {Object} gameState - 游戏状态
 * @param {Board} board - 棋盘对象
 */
dataManager.addMove(move, gameState, board)
```

##### getMoveHistory()

获取移动历史。

```javascript
/**
 * @returns {Array} 移动历史数组
 */
const history = dataManager.getMoveHistory()
```

##### serialize()

序列化游戏数据。

```javascript
/**
 * @returns {string} 序列化的JSON字符串
 */
const jsonData = dataManager.serialize()
```

##### deserialize(jsonData)

反序列化游戏数据。

```javascript
/**
 * @param {string} jsonData - JSON字符串
 * @returns {boolean} 是否成功
 */
const success = dataManager.deserialize(jsonData)
```

## 事件系统

### DOM事件

游戏使用标准DOM事件系统进行交互。

#### Canvas事件

```javascript
// 点击事件
canvas.addEventListener('click', (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // 处理点击
});

// 鼠标移动事件
canvas.addEventListener('mousemove', (event) => {
    // 处理悬停预览
});
```

#### 键盘事件

```javascript
// 快捷键支持
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'n': // 新游戏
        case 'z': // 悔棋
        case 'm': // 切换模式
    }
});
```

### 自定义事件

游戏内部使用自定义事件进行组件通信。

```javascript
// 游戏状态变化事件
const gameStateEvent = new CustomEvent('gameStateChange', {
    detail: { gameState: newGameState }
});
document.dispatchEvent(gameStateEvent);
```

## 数据结构

### GameState对象

```javascript
const gameState = {
    mode: 'pvp',              // 游戏模式: 'pvp' | 'pve'
    currentPlayer: 1,         // 当前玩家: 1 | 2
    gameStatus: 'playing',    // 游戏状态: 'playing' | 'ended' | 'paused'
    winner: null,             // 获胜者: null | 1 | 2 | 'draw'
    moveHistory: [],          // 移动历史
    isReplayMode: false,      // 是否回放模式
    startTime: 1234567890,    // 开始时间戳
    endTime: null             // 结束时间戳
};
```

### Move对象

```javascript
const move = {
    x: 7,                     // X坐标
    y: 7,                     // Y坐标
    player: 1,                // 玩家
    timestamp: 1234567890,    // 时间戳
    moveNumber: 1             // 步数
};
```

### Position对象

```javascript
const position = {
    x: 7,                     // X坐标 (0-14)
    y: 7                      // Y坐标 (0-14)
};
```

## 错误处理

### 错误类型

游戏定义了以下错误类型：

```javascript
const ErrorTypes = {
    INVALID_POSITION: 'invalid_position',
    POSITION_OCCUPIED: 'position_occupied',
    FORBIDDEN_MOVE: 'forbidden_move',
    GAME_ENDED: 'game_ended',
    AI_ERROR: 'ai_error',
    RENDER_ERROR: 'render_error',
    DATA_ERROR: 'data_error'
};
```

### 错误处理示例

```javascript
try {
    const success = gameManager.makeMove(x, y);
    if (!success) {
        throw new Error('落子失败');
    }
} catch (error) {
    console.error('游戏错误:', error.message);
    // 显示用户友好的错误信息
    gameManager.showMessage('操作失败，请重试', 'error');
}
```

## 扩展接口

### 插件系统

游戏支持通过插件系统进行扩展：

```javascript
// 注册插件
GameManager.registerPlugin('myPlugin', {
    onGameStart: (gameState) => {
        // 游戏开始时的处理
    },
    onMove: (move, gameState) => {
        // 落子时的处理
    },
    onGameEnd: (result, gameState) => {
        // 游戏结束时的处理
    }
});
```

### 自定义渲染器

可以创建自定义渲染器：

```javascript
class CustomRenderer extends CanvasRenderer {
    constructor(canvasId) {
        super(canvasId);
    }
    
    render(board, gameState, hoverPosition, hoverForbidden) {
        // 自定义渲染逻辑
        super.render(board, gameState, hoverPosition, hoverForbidden);
        this.drawCustomElements();
    }
    
    drawCustomElements() {
        // 绘制自定义元素
    }
}
```

### 自定义AI

可以实现自定义AI算法：

```javascript
class CustomAI extends AIEngine {
    async makeMove(board, player) {
        // 自定义AI算法
        const bestMove = this.calculateBestMove(board, player);
        return bestMove;
    }
    
    calculateBestMove(board, player) {
        // AI计算逻辑
        return { x: 7, y: 7 };
    }
}
```

---

更多详细信息请参考源代码中的JSDoc注释。