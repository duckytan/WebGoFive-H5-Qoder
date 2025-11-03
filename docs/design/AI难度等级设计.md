# 五子棋AI难度等级设计文档

## 📋 概述

本文档定义了H5五子棋游戏中AI的4个难度等级，从新手到地狱级别，每个级别都有不同的算法复杂度和计算深度。

---

## 🎯 AI难度等级定义

### 1. 新手级别 (Beginner)
**目标用户**：刚接触五子棋的玩家  
**设计理念**：简单易懂，让玩家容易获胜，建立信心

#### 技术参数
- **搜索深度**：2层 (1手棋预测)
- **算法**：简单Minimax，无剪枝
- **评估函数**：基础连子计数
- **响应时间**：< 500ms
- **胜率目标**：让玩家有70-80%胜率

#### 算法特征
```javascript
class BeginnerAI {
    constructor() {
        this.maxDepth = 2;
        this.useAlphaBeta = false;
        this.evaluationComplexity = 'basic';
    }
    
    // 简单的评估函数 - 只计算连子数量
    evaluate(board, player) {
        let score = 0;
        // 只检查2连、3连的简单组合
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (board.getPiece(i, j) === player) {
                    score += this.countConsecutive(board, i, j, player);
                }
            }
        }
        return score;
    }
}
```

#### 行为特点
- 优先考虑自己连子，较少考虑防守
- 不识别复杂的威胁模式
- 偶尔会下明显的错棋
- 容易被简单的陷阱欺骗

---

### 2. 正常级别 (Normal)
**目标用户**：有一定五子棋经验的玩家  
**设计理念**：平衡攻防，提供适度挑战

#### 技术参数
- **搜索深度**：4层 (2手棋预测)
- **算法**：Minimax + Alpha-Beta剪枝
- **评估函数**：模式识别 + 威胁分析
- **响应时间**：< 1000ms
- **胜率目标**：与玩家旗鼓相当，45-55%

#### 算法特征
```javascript
class NormalAI {
    constructor() {
        this.maxDepth = 4;
        this.useAlphaBeta = true;
        this.patterns = this.initializePatterns();
    }
    
    // 改进的评估函数 - 模式识别
    evaluate(board, player) {
        let score = 0;
        
        // 威胁模式评分
        const threats = this.findThreats(board, player);
        score += this.scoreThreats(threats);
        
        // 防御评分
        const opponentThreats = this.findThreats(board, 3 - player);
        score -= this.scoreThreats(opponentThreats) * 1.1; // 稍微重视防御
        
        return score;
    }
    
    findThreats(board, player) {
        const threats = [];
        // 识别活三、冲四、活四等威胁模式
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (board.isEmpty(i, j)) {
                    const threat = this.analyzeThreatAt(board, i, j, player);
                    if (threat.level > 0) {
                        threats.push({ x: i, y: j, ...threat });
                    }
                }
            }
        }
        return threats;
    }
}
```

#### 行为特点
- 能识别基本的威胁模式（活三、冲四）
- 有基本的攻防平衡
- 能进行简单的多步计算
- 开始考虑位置价值（中心区域优先）

---

### 3. 困难级别 (Hard)
**目标用户**：五子棋高手和有经验的玩家  
**设计理念**：高级策略，强大计算能力

#### 技术参数
- **搜索深度**：6-8层 (3-4手棋预测)
- **算法**：增强Minimax + Alpha-Beta + 启发式搜索
- **评估函数**：高级模式识别 + 威胁序列分析
- **响应时间**：< 2000ms
- **胜率目标**：对普通玩家有优势，65-75%

#### 算法特征
```javascript
class HardAI {
    constructor() {
        this.maxDepth = 8;
        this.useAdvancedPruning = true;
        this.threatSequenceAnalysis = true;
        this.openingBook = this.loadOpeningBook();
    }
    
    // 高级评估函数 - 威胁序列分析
    evaluate(board, player) {
        // 开局库查询
        if (board.moveCount < 10) {
            const bookMove = this.consultOpeningBook(board);
            if (bookMove) return this.evaluateBookMove(bookMove);
        }
        
        let score = 0;
        
        // 威胁序列分析
        const winningSequence = this.findWinningSequence(board, player, 6);
        if (winningSequence) {
            score += 10000 / winningSequence.length;
        }
        
        // 高级模式识别
        score += this.advancedPatternEvaluation(board, player);
        
        // 位置控制评估
        score += this.territoryControl(board, player);
        
        return score;
    }
    
    findWinningSequence(board, player, maxDepth) {
        // 威胁空间搜索 - 基于Allis的理论
        return this.threatSpaceSearch(board, player, maxDepth);
    }
}
```

#### 行为特点
- 掌握高级威胁模式（双三、双四、VCT/VCF）
- 能计算复杂的威胁序列
- 具备开局知识
- 重视棋盘控制和形势判断
- 能识别和利用对手错误

---

### 4. 地狱级别 (Hell)
**目标用户**：五子棋专家和AI挑战者  
**设计理念**：接近完美的计算，极强的棋力

#### 技术参数
- **搜索深度**：10-12层 (5-6手棋预测)
- **算法**：完整威胁空间搜索 + 证明数搜索 + 高级剪枝
- **评估函数**：专家级模式库 + 动态评估 + 机器学习
- **响应时间**：< 3000ms
- **胜率目标**：对专家级玩家也有优势，80-90%

#### 技术参数
```javascript
class HellAI {
    constructor() {
        this.maxDepth = 12;
        this.useThreatSpaceSearch = true;
        this.useProofNumberSearch = true;
        this.expertPatternLibrary = this.loadExpertPatterns();
        this.neuralNetwork = this.loadTrainedNetwork();
    }
    
    // 专家级评估函数
    evaluate(board, player) {
        // 神经网络辅助评估
        let nnScore = this.neuralNetwork.evaluate(board, player);
        
        // 完整威胁分析
        let tacticalScore = this.completeThreatAnalysis(board, player);
        
        // 战略位置评估
        let strategicScore = this.strategicEvaluation(board, player);
        
        // 动态权重调整
        const gamePhase = this.determineGamePhase(board);
        return this.weightedCombination(nnScore, tacticalScore, strategicScore, gamePhase);
    }
    
    // 完整的威胁空间搜索
    completeThreatAnalysis(board, player) {
        // 实现Victor Allis的威胁空间搜索算法
        const threats = this.findAllThreats(board, player);
        const sequences = this.buildThreatDependencyGraph(threats);
        return this.evaluateThreatSequences(sequences);
    }
    
    // 证明数搜索 - 用于确定性分析
    proofNumberSearch(board, player, maxNodes) {
        // 寻找确定的胜负结果
        return this.pns(board, player, maxNodes);
    }
}
```

#### 行为特点
- 掌握所有已知的五子棋理论
- 能进行深度威胁序列计算
- 具备完整的开局和定式库
- 能适应对手的游戏风格
- 在复杂局面下仍能找到最优解
- 几乎不会犯战术错误

---

## 🔍 核心算法详解

### 1. Minimax算法基础
```javascript
function minimax(board, depth, maximizingPlayer, alpha, beta) {
    if (depth === 0 || gameOver(board)) {
        return evaluate(board);
    }
    
    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of generateMoves(board)) {
            makeMove(board, move);
            const evalScore = minimax(board, depth - 1, false, alpha, beta);
            undoMove(board, move);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break; // Alpha-Beta剪枝
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of generateMoves(board)) {
            makeMove(board, move);
            const evalScore = minimax(board, depth - 1, true, alpha, beta);
            undoMove(board, move);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}
```

### 2. 威胁模式识别
基于收集的资料，威胁可以分类为：

#### 胜利威胁
- **五连** (5,1): 立即获胜
- **活四** (4,2): 下一步必胜

#### 强制威胁  
- **冲四** (4,1): 对手必须防御
- **活三** (3,3): 可以形成双威胁
- **眠三** (3,2): 需要防御的三连

#### 潜在威胁
- **活二** (2,4): 可发展为多种威胁
- **眠二** (2,1-3): 受限的二连威胁

```javascript
const ThreatPatterns = {
    // 威胁模式定义 (stones, ways)
    FIVE: { stones: 5, ways: 1, score: 100000 },
    OPEN_FOUR: { stones: 4, ways: 2, score: 10000 },
    SIMPLE_FOUR: { stones: 4, ways: 1, score: 1000 },
    OPEN_THREE: { stones: 3, ways: 3, score: 100 },
    BROKEN_THREE: { stones: 3, ways: 2, score: 50 },
    SIMPLE_THREE: { stones: 3, ways: 1, score: 10 },
    OPEN_TWO: { stones: 2, ways: 4, score: 5 }
};
```

### 3. 威胁空间搜索
```javascript
class ThreatSpaceSearch {
    // Victor Allis的威胁空间搜索算法实现
    findWinningSequence(board, player) {
        const threats = this.generateThreats(board, player);
        const dependencyGraph = this.buildDependencyGraph(threats);
        return this.searchSequence(dependencyGraph);
    }
    
    // 全防御技巧 - 假设对手可以同时下所有防御
    allDefensesTrick(threat) {
        const defenses = this.findDefenses(threat);
        return this.simulateAllDefenses(defenses);
    }
}
```

---

## 📊 性能基准

### 计算复杂度对比
| 难度 | 搜索深度 | 节点数 | 平均响应时间 | 内存使用 |
|------|----------|---------|--------------|----------|
| 新手 | 2层 | ~100 | 300ms | 5MB |
| 正常 | 4层 | ~10,000 | 800ms | 15MB |
| 困难 | 8层 | ~1,000,000 | 1800ms | 40MB |
| 地狱 | 12层 | ~100,000,000 | 2800ms | 100MB |

### 棋力评估
- **新手**: 约等于刚学会规则的玩家
- **正常**: 约等于有几个月经验的业余玩家  
- **困难**: 约等于五子棋业余高手
- **地狱**: 接近专业级别，能与五子棋大师抗衡

---

## 🎮 游戏体验优化

### 自适应难度调整
```javascript
class AdaptiveDifficulty {
    constructor() {
        this.playerWinRate = 0.5;
        this.gameHistory = [];
    }
    
    adjustDifficulty() {
        if (this.playerWinRate > 0.7) {
            // 玩家胜率太高，增加难度
            this.increaseDifficulty();
        } else if (this.playerWinRate < 0.3) {
            // 玩家胜率太低，降低难度
            this.decreaseDifficulty();
        }
    }
}
```

### 教学模式
```javascript
class TeachingMode {
    // 为新手提供提示和解释
    provideTutorial(board, lastMove) {
        const threats = this.analyzeSituation(board);
        return this.generateTips(threats);
    }
    
    explainAIMove(board, aiMove) {
        return this.analyzeReasonForMove(board, aiMove);
    }
}
```

### 风险点提示系统
```javascript
class RiskIndicator {
    constructor() {
        this.enabled = true; // 默认开启
        this.riskLevels = {
            CRITICAL: { steps: 1, color: 'rgba(255, 0, 0, 0.3)', priority: 10 },
            HIGH: { steps: 2, color: 'rgba(255, 100, 0, 0.25)', priority: 8 },
            MEDIUM: { steps: 3, color: 'rgba(255, 200, 0, 0.2)', priority: 6 }
        };
    }
    
    // 分析对手威胁
    analyzeOpponentThreats(board, opponentPlayer) {
        const risks = [];
        
        // 检查即将获胜的威胁（1步内）
        const criticalThreats = this.findWinningMoves(board, opponentPlayer);
        criticalThreats.forEach(threat => {
            risks.push({
                x: threat.x,
                y: threat.y,
                level: 'CRITICAL',
                description: '对手下一步即可获胜！',
                sequence: threat.sequence
            });
        });
        
        // 检查2步内的威胁
        const highRisks = this.findTwoStepThreats(board, opponentPlayer);
        highRisks.forEach(threat => {
            risks.push({
                x: threat.x,
                y: threat.y,
                level: 'HIGH',
                description: '对手2步内可能获胜',
                sequence: threat.sequence
            });
        });
        
        // 检查活四、活三等强威胁
        const mediumRisks = this.findPotentialThreats(board, opponentPlayer);
        mediumRisks.forEach(threat => {
            risks.push({
                x: threat.x,
                y: threat.y,
                level: 'MEDIUM',
                description: `对手可形成${threat.type}`,
                sequence: threat.sequence
            });
        });
        
        return this.filterAndPrioritizeRisks(risks);
    }
    
    // 检查即将获胜的位置
    findWinningMoves(board, player) {
        const winningMoves = [];
        
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                if (board.isEmpty(x, y)) {
                    // 模拟落子
                    board.placePiece(x, y, player);
                    
                    // 检查是否获胜
                    if (this.ruleEngine.checkWin(board, x, y, player)) {
                        winningMoves.push({
                            x: x,
                            y: y,
                            sequence: this.getWinningSequence(board, x, y, player)
                        });
                    }
                    
                    // 撤销模拟
                    board.removePiece(x, y);
                }
            }
        }
        
        return winningMoves;
    }
    
    // 检查两步内的威胁
    findTwoStepThreats(board, player) {
        const threats = [];
        
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                if (board.isEmpty(x, y)) {
                    // 模拟第一步
                    board.placePiece(x, y, player);
                    
                    // 检查下一步是否有必胜
                    const nextWinning = this.findWinningMoves(board, player);
                    if (nextWinning.length > 0) {
                        threats.push({
                            x: x,
                            y: y,
                            sequence: [{ x, y }, ...nextWinning]
                        });
                    }
                    
                    board.removePiece(x, y);
                }
            }
        }
        
        return threats;
    }
    
    // 风险过滤和优先级排序
    filterAndPrioritizeRisks(risks) {
        // 移除重叠的风险点
        const uniqueRisks = this.removeDuplicateRisks(risks);
        
        // 按优先级排序
        return uniqueRisks.sort((a, b) => {
            const priorityA = this.riskLevels[a.level].priority;
            const priorityB = this.riskLevels[b.level].priority;
            return priorityB - priorityA;
        }).slice(0, 8); // 最多显示8个风险点
    }
    
    // 设置提示开关
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    // 检查潜在威胁（活四、活三等）
    findPotentialThreats(board, player) {
        const threats = [];
        
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                if (board.isEmpty(x, y)) {
                    // 模拟落子
                    board.placePiece(x, y, player);
                    
                    // 检查形成的威胁类型
                    const threatType = this.analyzeThreatType(board, x, y, player);
                    if (threatType && ['活四', '冲四', '活三'].includes(threatType)) {
                        threats.push({
                            x: x,
                            y: y,
                            type: threatType,
                            sequence: this.getThreatSequence(board, x, y, player)
                        });
                    }
                    
                    board.removePiece(x, y);
                }
            }
        }
        
        return threats;
    }
    
    // 分析威胁类型
    analyzeThreatType(board, x, y, player) {
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1] // 水平、垂直、主对角线、反对角线
        ];
        
        for (const [dx, dy] of directions) {
            const count = this.countDirection(board, x, y, dx, dy, player);
            const openEnds = this.countOpenEnds(board, x, y, dx, dy, player);
            
            if (count === 4 && openEnds === 2) return '活四';
            if (count === 4 && openEnds === 1) return '冲四';
            if (count === 3 && openEnds >= 2) return '活三';
            if (count === 3 && openEnds === 1) return '眠三';
        }
        
        return null;
    }
    
    // 计算方向上的连子数
    countDirection(board, x, y, dx, dy, player) {
        let count = 1; // 包含当前位置
        
        // 正方向计数
        let nx = x + dx, ny = y + dy;
        while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.getPiece(nx, ny) === player) {
            count++;
            nx += dx;
            ny += dy;
        }
        
        // 负方向计数
        nx = x - dx;
        ny = y - dy;
        while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.getPiece(nx, ny) === player) {
            count++;
            nx -= dx;
            ny -= dy;
        }
        
        return count;
    }
    
    // 计算开放端数量
    countOpenEnds(board, x, y, dx, dy, player) {
        let openEnds = 0;
        
        // 检查正方向开放端
        let nx = x + dx, ny = y + dy;
        while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.getPiece(nx, ny) === player) {
            nx += dx;
            ny += dy;
        }
        if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.isEmpty(nx, ny)) {
            openEnds++;
        }
        
        // 检查负方向开放端
        nx = x - dx;
        ny = y - dy;
        while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.getPiece(nx, ny) === player) {
            nx -= dx;
            ny -= dy;
        }
        if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.isEmpty(nx, ny)) {
            openEnds++;
        }
        
        return openEnds;
    }
    
    // 获取获胜序列
    getWinningSequence(board, x, y, player) {
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        
        for (const [dx, dy] of directions) {
            const sequence = [];
            
            // 收集这个方向上的所有棋子
            let nx = x, ny = y;
            while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.getPiece(nx, ny) === player) {
                sequence.unshift({ x: nx, y: ny });
                nx -= dx;
                ny -= dy;
            }
            
            nx = x + dx;
            ny = y + dy;
            while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.getPiece(nx, ny) === player) {
                sequence.push({ x: nx, y: ny });
                nx += dx;
                ny += dy;
            }
            
            if (sequence.length >= 5) {
                return sequence.slice(0, 5); // 返回五子连珠序列
            }
        }
        
        return [{ x, y }];
    }
    
    // 获取威胁序列
    getThreatSequence(board, x, y, player) {
        // 简化版本，返回形成威胁的关键位置
        return [{ x, y }];
    }
    
    // 移除重复的风险点
    removeDuplicateRisks(risks) {
        const seen = new Set();
        return risks.filter(risk => {
            const key = `${risk.x},${risk.y}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    
    // 更新当前风险状态
    updateRisks(board, currentPlayer) {
        if (!this.enabled) {
            this.currentRisks = [];
            return;
        }
        
        const opponentPlayer = currentPlayer === 1 ? 2 : 1;
        this.currentRisks = this.analyzeOpponentThreats(board, opponentPlayer);
    }
    
    // 设置提示开关
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.currentRisks = [];
        }
    }
    
    // 获取渲染信息
    getRenderInfo() {
        if (!this.enabled) return [];
        
        return this.currentRisks.map(risk => ({
            x: risk.x,
            y: risk.y,
            color: this.riskLevels[risk.level].color,
            level: risk.level,
            description: risk.description
        }));
    }
    
    // 获取设置状态
    isEnabled() {
        return this.enabled;
    }
}

// Canvas渲染器集成示例
class CanvasRendererWithRiskIndicator {
    constructor(canvasId, riskIndicator) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.riskIndicator = riskIndicator;
        this.cellSize = 30; // 每个格子的大小
        this.boardOffset = 20; // 棋盘边缘偏移
    }
    
    // 渲染风险提示
    renderRiskIndicators() {
        const risks = this.riskIndicator.getRenderInfo();
        
        for (const risk of risks) {
            const screenX = this.boardOffset + risk.x * this.cellSize;
            const screenY = this.boardOffset + risk.y * this.cellSize;
            
            // 绘制淡色圆形提示
            this.ctx.save();
            this.ctx.fillStyle = risk.color;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, this.cellSize * 0.4, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // 添加边框以增强可见性
            if (risk.level === 'CRITICAL') {
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }
    
    // 完整的渲染方法
    render(board, gameState) {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染棋盘
        this.renderBoard();
        
        // 渲染风险提示（在棋子之前，避免遮挡）
        this.renderRiskIndicators();
        
        // 渲染棋子
        this.renderPieces(board);
        
        // 渲染其他游戏元素...
    }
    
    renderBoard() {
        // 棋盘渲染逻辑
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < 15; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(this.boardOffset + i * this.cellSize, this.boardOffset);
            this.ctx.lineTo(this.boardOffset + i * this.cellSize, this.boardOffset + 14 * this.cellSize);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(this.boardOffset, this.boardOffset + i * this.cellSize);
            this.ctx.lineTo(this.boardOffset + 14 * this.cellSize, this.boardOffset + i * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    renderPieces(board) {
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                const piece = board.getPiece(x, y);
                if (piece !== 0) {
                    const screenX = this.boardOffset + x * this.cellSize;
                    const screenY = this.boardOffset + y * this.cellSize;
                    
                    this.ctx.fillStyle = piece === 1 ? '#000' : '#fff';
                    this.ctx.beginPath();
                    this.ctx.arc(screenX, screenY, this.cellSize * 0.3, 0, 2 * Math.PI);
                    this.ctx.fill();
                    
                    if (piece === 2) {
                        this.ctx.strokeStyle = '#000';
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                    }
                }
            }
        }
    }
}

// 游戏管理器集成示例
class GameManagerWithRiskIndicator {
    constructor() {
        this.board = new Board();
        this.ruleEngine = new RuleEngine();
        this.riskIndicator = new RiskIndicator();
        this.renderer = new CanvasRendererWithRiskIndicator('game-canvas', this.riskIndicator);
        this.currentPlayer = 1; // 1为黑棋，2为白棋
        
        this.setupUI();
    }
    
    // 设置用户界面
    setupUI() {
        // 创建风险提示开关
        const toggleButton = document.createElement('button');
        toggleButton.id = 'risk-indicator-toggle';
        toggleButton.textContent = '风险提示: 开启';
        toggleButton.onclick = () => this.toggleRiskIndicator();
        
        const gameControls = document.getElementById('game-controls');
        if (gameControls) {
            gameControls.appendChild(toggleButton);
        }
    }
    
    // 切换风险提示功能
    toggleRiskIndicator() {
        const newState = !this.riskIndicator.isEnabled();
        this.riskIndicator.setEnabled(newState);
        
        const button = document.getElementById('risk-indicator-toggle');
        if (button) {
            button.textContent = `风险提示: ${newState ? '开启' : '关闭'}`;
        }
        
        // 重新渲染
        this.render();
    }
    
    // 处理玩家移动
    makeMove(x, y) {
        if (this.board.placePiece(x, y, this.currentPlayer)) {
            // 更新风险提示
            this.riskIndicator.updateRisks(this.board, this.currentPlayer);
            
            // 检查游戏结束
            if (this.ruleEngine.checkWin(this.board, x, y, this.currentPlayer)) {
                this.endGame(this.currentPlayer);
                return;
            }
            
            // 切换玩家
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            
            // 重新渲染
            this.render();
        }
    }
    
    // 渲染游戏
    render() {
        this.renderer.render(this.board, {
            currentPlayer: this.currentPlayer,
            riskIndicatorEnabled: this.riskIndicator.isEnabled()
        });
    }
    
    endGame(winner) {
        // 游戏结束处理
        console.log(`玩家 ${winner} 获胜！`);
        this.riskIndicator.setEnabled(false); // 游戏结束时关闭风险提示
    }
}
```

---

## 🔧 实现注意事项

### 1. 性能优化
- 使用传置表（Transposition Table）缓存计算结果
- 实现增量更新的评估函数
- 优化移动生成和排序算法
- 使用位运算加速模式匹配

### 2. 用户体验
- 响应时间控制：所有级别都应在3秒内响应
- 进度指示：显示AI思考进度
- 可中断计算：允许玩家中断AI计算

### 3. 调试支持
```javascript
class AIDebugger {
    logDecisionProcess(board, move, reasoning) {
        console.log({
            move: move,
            evaluation: reasoning.evaluation,
            threats: reasoning.threats,
            sequence: reasoning.winningSequence
        });
    }
}
```

---

## 📚 参考资料

### 学术论文
1. **Victor Allis**: "Searching for solutions in games and artificial intelligence" - 威胁空间搜索的理论基础
2. **Louis Victor Allis**: "Go-Moku and Threat-Space Search" - 五子棋专门的威胁分析
3. **Tournament-winning gomoku AI** - 实际比赛获胜的现代AI实现

### 核心算法
1. **Minimax + Alpha-Beta剪枝**: 经典博弈树搜索
2. **威胁空间搜索**: 专门针对五子棋的搜索优化
3. **证明数搜索**: 确定性分析方法
4. **模式识别**: 基于预定义威胁模式的快速评估

### 评估函数设计
1. **连子计数**: 基础的位置评估
2. **威胁分析**: 识别各种威胁模式的价值
3. **位置控制**: 评估对棋盘关键区域的控制
4. **威胁序列**: 分析多步威胁组合的价值

---

## 🔄 后续扩展

### 机器学习集成
- 使用神经网络改进评估函数
- 通过自我对弈进行强化学习
- 收集人类专家对局数据进行监督学习

### 高级功能
- 开局库的自动学习和更新
- 对手建模和风格适应
- 残局数据库的构建和查询

---

---

## 🧠 智能提示系统设计

### 功能概述
智能提示系统能够通过AI计算为玩家推荐1-3个最有利的落子位置，帮助新手学习和提升游戏体验。系统会分析当前局面，优先考虑防守必要性、获胜机会，然后提供AI推荐的最佳策略位置。

### 核心特性
- **智能分析**：结合防守、进攻、战略位置的综合评估
- **分级提示**：最佳、次优、备选三个等级，不同颜色和动画效果
- **冷却机制**：3秒冷却时间，防止过度依赖
- **快捷操作**：支持键盘H键快速请求提示
- **自动清除**：5秒后自动清除提示，保持界面清洁

```javascript
// 智能提示系统
class MoveHintSystem {
    constructor(aiEngine, riskIndicator) {
        this.aiEngine = aiEngine;
        this.riskIndicator = riskIndicator;
        this.enabled = true;
        this.maxHints = 3; // 最多显示3个提示位置
        this.currentHints = [];
        this.hintColors = {
            BEST: 'rgba(0, 255, 0, 0.4)',      // 最佳位置 - 绿色
            GOOD: 'rgba(0, 150, 255, 0.35)',   // 次优位置 - 蓝色
            OKAY: 'rgba(255, 255, 0, 0.3)'     // 备选位置 - 黄色
        };
    }
    
    // 计算最佳移动提示
    async calculateHints(board, player) {
        if (!this.enabled) {
            return [];
        }
        
        try {
            const hints = [];
            
            // 1. 检查是否有必须防守的位置
            const defensiveMoves = this.findDefensiveMoves(board, player);
            if (defensiveMoves.length > 0) {
                hints.push({
                    x: defensiveMoves[0].x,
                    y: defensiveMoves[0].y,
                    type: 'DEFENSIVE',
                    level: 'BEST',
                    reason: '必须防守！对手即将获胜',
                    priority: 100
                });
            }
            
            // 2. 检查是否有直接获胜位置
            const winningMoves = this.findWinningMoves(board, player);
            if (winningMoves.length > 0) {
                hints.push({
                    x: winningMoves[0].x,
                    y: winningMoves[0].y,
                    type: 'WINNING',
                    level: 'BEST',
                    reason: '获胜机会！五子连珠',
                    priority: 200
                });
            }
            
            // 3. 使用AI引擎计算最佳位置
            const aiMoves = await this.getAIRecommendations(board, player);
            for (const move of aiMoves) {
                if (!this.isDuplicateHint(hints, move)) {
                    hints.push(move);
                }
            }
            
            // 4. 排序并限制数量
            const sortedHints = hints
                .sort((a, b) => b.priority - a.priority)
                .slice(0, this.maxHints);
            
            // 5. 分配显示等级
            this.assignDisplayLevels(sortedHints);
            
            this.currentHints = sortedHints;
            return sortedHints;
            
        } catch (error) {
            console.error('计算提示时出错:', error);
            return [];
        }
    }
    
    // 查找防守位置
    findDefensiveMoves(board, player) {
        const opponent = player === 1 ? 2 : 1;
        const defensiveMoves = [];
        
        // 使用风险指示器查找对手威胁
        const threats = this.riskIndicator.findWinningMoves(board, opponent);
        
        for (const threat of threats) {
            defensiveMoves.push({
                x: threat.x,
                y: threat.y,
                priority: 90,
                reason: '阻止对手获胜'
            });
        }
        
        return defensiveMoves;
    }
    
    // 查找获胜位置
    findWinningMoves(board, player) {
        const winningMoves = [];
        
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                if (board.isEmpty(x, y)) {
                    // 模拟落子
                    board.placePiece(x, y, player);
                    
                    // 检查是否获胜
                    if (this.checkWin(board, x, y, player)) {
                        winningMoves.push({
                            x: x,
                            y: y,
                            priority: 95,
                            reason: '直接获胜'
                        });
                    }
                    
                    // 撤销模拟
                    board.removePiece(x, y);
                }
            }
        }
        
        return winningMoves;
    }
    
    // 获取AI推荐位置
    async getAIRecommendations(board, player) {
        const recommendations = [];
        
        // 临时降低AI搜索深度以加快提示速度
        const originalDepth = this.aiEngine.maxDepth;
        this.aiEngine.maxDepth = Math.min(4, originalDepth);
        
        try {
            // 获取AI的最佳移动
            const bestMove = await this.aiEngine.makeMove(board, player);
            if (bestMove) {
                recommendations.push({
                    x: bestMove.x,
                    y: bestMove.y,
                    type: 'AI_BEST',
                    priority: 80,
                    reason: 'AI推荐最佳位置',
                    evaluation: bestMove.evaluation || 0
                });
            }
            
            // 获取次优选择
            const alternativeMoves = await this.getAlternativeMoves(board, player);
            for (const move of alternativeMoves) {
                recommendations.push(move);
            }
            
        } finally {
            // 恢复原始搜索深度
            this.aiEngine.maxDepth = originalDepth;
        }
        
        return recommendations;
    }
    
    // 获取备选移动
    async getAlternativeMoves(board, player) {
        const alternatives = [];
        const evaluatedMoves = [];
        
        // 评估所有可能的移动
        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                if (board.isEmpty(x, y)) {
                    // 快速评估这个位置
                    const evaluation = this.quickEvaluateMove(board, x, y, player);
                    evaluatedMoves.push({ x, y, evaluation });
                }
            }
        }
        
        // 选择评分最高的几个位置
        const topMoves = evaluatedMoves
            .sort((a, b) => b.evaluation - a.evaluation)
            .slice(1, 4); // 跳过第一个（最佳），取接下来的3个
        
        for (let i = 0; i < topMoves.length; i++) {
            const move = topMoves[i];
            alternatives.push({
                x: move.x,
                y: move.y,
                type: 'ALTERNATIVE',
                priority: 70 - i * 10, // 递减优先级
                reason: `备选位置 ${i + 1}`,
                evaluation: move.evaluation
            });
        }
        
        return alternatives;
    }
    
    // 快速评估移动
    quickEvaluateMove(board, x, y, player) {
        let score = 0;
        
        // 模拟落子
        board.placePiece(x, y, player);
        
        // 计算连子数量和威胁
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        
        for (const [dx, dy] of directions) {
            const count = this.countConsecutive(board, x, y, dx, dy, player);
            const openEnds = this.countOpenEnds(board, x, y, dx, dy, player);
            
            // 根据连子数和开放端数计算分数
            if (count >= 4) score += 1000;
            else if (count === 3 && openEnds >= 2) score += 100;
            else if (count === 3 && openEnds === 1) score += 50;
            else if (count === 2 && openEnds >= 2) score += 10;
        }
        
        // 位置价值加分（中心区域更有价值）
        const centerDistance = Math.abs(x - 7) + Math.abs(y - 7);
        score += Math.max(0, 14 - centerDistance);
        
        // 撤销模拟
        board.removePiece(x, y);
        
        return score;
    }
    
    // 检查获胜
    checkWin(board, x, y, player) {
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        
        for (const [dx, dy] of directions) {
            if (this.countConsecutive(board, x, y, dx, dy, player) >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    // 计算连续棋子数
    countConsecutive(board, x, y, dx, dy, player) {
        let count = 1;
        
        // 正方向
        let nx = x + dx, ny = y + dy;
        while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.getPiece(nx, ny) === player) {
            count++;
            nx += dx;
            ny += dy;
        }
        
        // 负方向
        nx = x - dx;
        ny = y - dy;
        while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.getPiece(nx, ny) === player) {
            count++;
            nx -= dx;
            ny -= dy;
        }
        
        return count;
    }
    
    // 计算开放端数
    countOpenEnds(board, x, y, dx, dy, player) {
        let openEnds = 0;
        
        // 检查正方向
        let nx = x + dx, ny = y + dy;
        while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.getPiece(nx, ny) === player) {
            nx += dx;
            ny += dy;
        }
        if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.isEmpty(nx, ny)) {
            openEnds++;
        }
        
        // 检查负方向
        nx = x - dx;
        ny = y - dy;
        while (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.getPiece(nx, ny) === player) {
            nx -= dx;
            ny -= dy;
        }
        if (nx >= 0 && nx < 15 && ny >= 0 && ny < 15 && board.isEmpty(nx, ny)) {
            openEnds++;
        }
        
        return openEnds;
    }
    
    // 检查重复提示
    isDuplicateHint(hints, newHint) {
        return hints.some(hint => hint.x === newHint.x && hint.y === newHint.y);
    }
    
    // 分配显示等级
    assignDisplayLevels(hints) {
        for (let i = 0; i < hints.length; i++) {
            if (i === 0) {
                hints[i].level = 'BEST';
            } else if (i === 1) {
                hints[i].level = 'GOOD';
            } else {
                hints[i].level = 'OKAY';
            }
        }
    }
    
    // 获取当前提示
    getCurrentHints() {
        return this.currentHints;
    }
    
    // 清除提示
    clearHints() {
        this.currentHints = [];
    }
    
    // 获取渲染信息
    getRenderInfo() {
        if (!this.enabled) return [];
        
        return this.currentHints.map(hint => ({
            x: hint.x,
            y: hint.y,
            color: this.hintColors[hint.level],
            level: hint.level,
            reason: hint.reason,
            type: hint.type
        }));
    }
    
    // 设置提示开关
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.clearHints();
        }
    }
    
    // 获取开关状态
    isEnabled() {
        return this.enabled;
    }
    
    // 设置最大提示数量
    setMaxHints(count) {
        this.maxHints = Math.max(1, Math.min(5, count)); // 限制在1-5之间
    }
}

// Canvas渲染器扩展 - 支持移动提示
class CanvasRendererWithHints extends CanvasRendererWithRiskIndicator {
    constructor(canvasId, riskIndicator, hintSystem) {
        super(canvasId, riskIndicator);
        this.hintSystem = hintSystem;
        this.hintAnimationTime = 0;
        this.hintAnimationSpeed = 0.05;
    }
    
    // 渲染移动提示
    renderMoveHints() {
        const hints = this.hintSystem.getRenderInfo();
        
        // 更新动画时间
        this.hintAnimationTime += this.hintAnimationSpeed;
        if (this.hintAnimationTime > Math.PI * 2) {
            this.hintAnimationTime = 0;
        }
        
        for (let i = 0; i < hints.length; i++) {
            const hint = hints[i];
            const screenX = this.boardOffset + hint.x * this.cellSize;
            const screenY = this.boardOffset + hint.y * this.cellSize;
            
            this.ctx.save();
            
            // 绘制提示圆圈
            this.ctx.fillStyle = hint.color;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, this.cellSize * 0.35, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // 添加边框
            this.ctx.strokeStyle = this.getHintBorderColor(hint.level);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // 绘制优先级标记
            this.renderHintPriority(screenX, screenY, i + 1, hint.level);
            
            // 添加脉搏动画效果
            if (hint.level === 'BEST') {
                this.renderPulseEffect(screenX, screenY, hint.color);
            }
            
            this.ctx.restore();
        }
    }
    
    // 获取提示边框颜色
    getHintBorderColor(level) {
        switch (level) {
            case 'BEST': return 'rgba(0, 255, 0, 0.8)';
            case 'GOOD': return 'rgba(0, 150, 255, 0.7)';
            case 'OKAY': return 'rgba(255, 255, 0, 0.6)';
            default: return 'rgba(128, 128, 128, 0.5)';
        }
    }
    
    // 渲染优先级标记
    renderHintPriority(x, y, priority, level) {
        this.ctx.fillStyle = level === 'BEST' ? '#fff' : '#000';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(priority.toString(), x, y);
    }
    
    // 渲染脉搏效果
    renderPulseEffect(x, y, baseColor) {
        const pulseAlpha = 0.3 + 0.2 * Math.sin(this.hintAnimationTime * 3);
        const pulseRadius = this.cellSize * (0.5 + 0.1 * Math.sin(this.hintAnimationTime * 3));
        
        this.ctx.save();
        this.ctx.globalAlpha = pulseAlpha;
        this.ctx.strokeStyle = baseColor.replace(/[\d\.]+\)$/, '0.8)');
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    // 重写渲染方法
    render(board, gameState) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.renderBoard();              // 渲染棋盘
        this.renderRiskIndicators();     // 渲染风险提示
        this.renderMoveHints();          // 渲染移动提示
        this.renderPieces(board);        // 渲染棋子
        
        // 如果有移动提示动画，请求下一帧
        if (this.hintSystem.getCurrentHints().length > 0) {
            requestAnimationFrame(() => this.render(board, gameState));
        }
    }
}

// 游戏管理器扩展 - 支持智能提示
class GameManagerWithHints extends GameManagerWithRiskIndicator {
    constructor() {
        super();
        this.hintSystem = new MoveHintSystem(this.aiEngine, this.riskIndicator);
        this.renderer = new CanvasRendererWithHints('game-canvas', this.riskIndicator, this.hintSystem);
        this.hintCooldown = 3000; // 3秒冷却时间
        this.lastHintTime = 0;
        
        this.setupHintUI();
        this.setupKeyboardShortcuts();
    }
    
    // 设置提示相关UI
    setupHintUI() {
        // 创建提示按钮
        const hintButton = document.createElement('button');
        hintButton.id = 'move-hint-button';
        hintButton.textContent = '💡 获取提示 (H)';
        hintButton.onclick = () => this.requestHint();
        
        // 创建提示开关
        const toggleHintButton = document.createElement('button');
        toggleHintButton.id = 'hint-toggle-button';
        toggleHintButton.textContent = '智能提示: 开启';
        toggleHintButton.onclick = () => this.toggleHintSystem();
        
        // 创建提示信息显示区域
        const hintInfo = document.createElement('div');
        hintInfo.id = 'hint-info';
        hintInfo.style.marginTop = '10px';
        hintInfo.style.fontSize = '12px';
        hintInfo.style.color = '#666';
        
        const gameControls = document.getElementById('game-controls');
        if (gameControls) {
            gameControls.appendChild(hintButton);
            gameControls.appendChild(toggleHintButton);
            gameControls.appendChild(hintInfo);
        }
    }
    
    // 设置键盘快捷键
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (event.key.toLowerCase() === 'h' && !event.ctrlKey && !event.altKey) {
                event.preventDefault();
                this.requestHint();
            }
        });
    }
    
    // 请求移动提示
    async requestHint() {
        const now = Date.now();
        
        // 检查冷却时间
        if (now - this.lastHintTime < this.hintCooldown) {
            const remaining = Math.ceil((this.hintCooldown - (now - this.lastHintTime)) / 1000);
            this.showHintMessage(`请等待 ${remaining} 秒后再请求提示`);
            return;
        }
        
        // 检查游戏状态
        if (this.gameState.isGameOver) {
            this.showHintMessage('游戏已结束，无需提示');
            return;
        }
        
        // 在PvE模式下，只为玩家提供提示
        if (this.gameMode === 'PvE' && this.currentPlayer === 2) {
            this.showHintMessage('请等待AI完成移动');
            return;
        }
        
        try {
            this.showHintMessage('正在计算最佳移动...');
            
            // 禁用提示按钮防止重复点击
            const hintButton = document.getElementById('move-hint-button');
            if (hintButton) {
                hintButton.disabled = true;
                hintButton.textContent = '💭 计算中...';
            }
            
            // 计算提示
            const hints = await this.hintSystem.calculateHints(this.board, this.currentPlayer);
            
            if (hints.length > 0) {
                this.displayHints(hints);
                this.lastHintTime = now;
            } else {
                this.showHintMessage('当前局面无明显最佳移动');
            }
            
        } catch (error) {
            console.error('计算提示时出错:', error);
            this.showHintMessage('计算提示失败，请重试');
        } finally {
            // 恢复按钮状态
            const hintButton = document.getElementById('move-hint-button');
            if (hintButton) {
                hintButton.disabled = false;
                hintButton.textContent = '💡 获取提示 (H)';
            }
        }
    }
    
    // 显示提示信息
    displayHints(hints) {
        let message = '推荐移动：\n';
        
        hints.forEach((hint, index) => {
            const pos = `(${String.fromCharCode(65 + hint.x)}, ${hint.y + 1})`;
            const priority = index === 0 ? '最佳' : index === 1 ? '次优' : '备选';
            message += `${index + 1}. ${pos} - ${priority}: ${hint.reason}\n`;
        });
        
        this.showHintMessage(message);
        this.render(); // 重新渲染以显示提示标记
        
        // 5秒后自动清除提示
        setTimeout(() => {
            this.clearHints();
        }, 5000);
    }
    
    // 显示提示消息
    showHintMessage(message) {
        const hintInfo = document.getElementById('hint-info');
        if (hintInfo) {
            hintInfo.textContent = message;
            hintInfo.style.color = message.includes('错误') || message.includes('失败') ? '#d32f2f' : '#666';
        }
    }
    
    // 清除提示
    clearHints() {
        this.hintSystem.clearHints();
        this.showHintMessage('');
        this.render();
    }
    
    // 切换提示系统
    toggleHintSystem() {
        const newState = !this.hintSystem.isEnabled();
        this.hintSystem.setEnabled(newState);
        
        const button = document.getElementById('hint-toggle-button');
        if (button) {
            button.textContent = `智能提示: ${newState ? '开启' : '关闭'}`;
        }
        
        if (!newState) {
            this.clearHints();
        }
    }
    
    // 重写makeMove方法以清除提示
    makeMove(x, y) {
        // 清除当前提示
        this.clearHints();
        
        // 调用父类方法
        super.makeMove(x, y);
    }
    
    // 重写startNewGame方法
    startNewGame() {
        this.clearHints();
        this.lastHintTime = 0;
        super.startNewGame();
    }
}
```

### 提示等级说明

| 等级 | 颜色 | 动画效果 | 使用场景 |
|------|------|----------|----------|
| **最佳** | 绿色 | 脉搏动画 | 必须防守位置、直接获胜位置、AI最优推荐 |
| **次优** | 蓝色 | 无 | AI次优选择、战略要点 |
| **备选** | 黄色 | 无 | 候补位置、发展空间 |

### 提示计算优先级

1. **防守检查** (优先级: 100) - 阻止对手获胜
2. **获胜检查** (优先级: 200) - 直接获胜机会
3. **AI最佳** (优先级: 80) - AI引擎推荐
4. **备选位置** (优先级: 70-50) - 评估算法推荐

### 用户交互设计

- **提示按钮**: "💡 获取提示 (H)" - 点击或按H键请求提示
- **开关按钮**: "智能提示: 开启/关闭" - 控制功能启用状态
- **冷却机制**: 3秒冷却时间，防止过度依赖
- **自动清除**: 5秒后自动清除提示，保持界面清洁
- **状态反馈**: 实时显示计算进度和提示信息

### 性能优化

- **搜索深度限制**: 提示计算时临时降低AI搜索深度至4层
- **快速评估**: 使用简化的位置评估算法
- **结果缓存**: 避免重复计算相同局面
- **异步计算**: 不阻塞用户界面的响应

### 教育价值

- **策略学习**: 通过观察AI推荐了解五子棋策略
- **位置价值**: 理解不同位置的战略重要性
- **攻防平衡**: 学习何时进攻、何时防守
- **渐进提升**: 逐步减少对提示的依赖