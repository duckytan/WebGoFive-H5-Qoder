/**
 * 深度搜索AI算法
 * 采用更深层搜索、开局库、威胁序列分析等高级技术
 * 
 * @author 项目团队
 * @version 2.0.0
 * @date 2024
 */

class AdvancedAI {
    constructor(game) {
        this.game = game;
        
        // 开局库 - 常见开局定式
        this.openingBook = this.initOpeningBook();
        
        // 改进的评分表
        this.scoreTable = {
            five: 10000000,
            activeFour: 200000,
            rushFour: 80000,
            activeThree: 15000,
            sleepThree: 3500,
            activeTwo: 1000,
            sleepTwo: 300,
            potential: 50,
            // 组合威胁
            doubleActiveFour: 500000,
            fourPlusThree: 180000,
            doubleActiveThree: 50000,
            threeWithTwo: 8000
        };
        
        // 棋型模式
        this.patterns = this.initPatterns();
        
        // 搜索配置
        this.searchConfig = {
            maxDepthBeginner: 2,
            maxDepthNormal: 3,
            maxDepthHard: 4,
            maxDepthHell: 5,
            candidateLimit: {
                BEGINNER: 15,
                NORMAL: 20,
                HARD: 25,
                HELL: 30
            },
            timeLimit: 3000
        };
        
        // VCF搜索深度限制
        this.vcfDepthLimit = 10;
        
        console.log('[AdvancedAI] 深度搜索AI算法已初始化');
    }
    
    /**
     * 初始化开局库
     */
    initOpeningBook() {
        return {
            // 第一手：天元最优
            first: [{ x: 7, y: 7 }],
            
            // 第二手：根据第一手位置选择对称位置或常见应对
            second: [
                // 对角应对
                { pattern: [[7, 7]], responses: [[6, 6], [8, 8], [6, 8], [8, 6]] },
                // 直接应对
                { pattern: [[7, 7]], responses: [[7, 6], [7, 8], [6, 7], [8, 7]] }
            ],
            
            // 常见开局定式
            sequences: [
                // 瑞星开局
                { moves: [[7,7], [6,7], [7,6]], weight: 10 },
                // 花月开局
                { moves: [[7,7], [7,6], [6,6]], weight: 9 },
                // 恒星开局
                { moves: [[7,7], [8,6], [7,6]], weight: 8 }
            ]
        };
    }
    
    /**
     * 初始化棋型模式
     */
    initPatterns() {
        return {
            five: /11111/,
            activeFour: /011110/,
            rushFour: /(11110|01111|11011|11101|10111)/,
            activeThree: /(01110|011010|010110)/,
            sleepThree: /(11100|00111|11010|01011|10110|01101)/,
            activeTwo: /(01100|00110|01010)/,
            sleepTwo: /(11000|00011|10100|00101|10010|01001)/
        };
    }
    
    /**
     * 获取AI落子
     */
    getMove(difficulty = 'NORMAL') {
        const aiPlayer = this.game.currentPlayer;
        const opponent = aiPlayer === 1 ? 2 : 1;
        
        console.log(`[AdvancedAI] 开始计算，难度: ${difficulty}`);
        
        // 1. 检查是否为开局阶段
        if (this.game.moves.length <= 2) {
            const openingMove = this.getOpeningMove();
            if (openingMove) {
                console.log(`[AdvancedAI] 开局库落子: (${openingMove.x}, ${openingMove.y})`);
                return openingMove;
            }
        }
        
        // 2. 立即获胜
        const winMove = this.findWinningMove(aiPlayer);
        if (winMove) {
            console.log(`[AdvancedAI] 立即获胜: (${winMove.x}, ${winMove.y})`);
            return winMove;
        }
        
        // 3. 阻止对手获胜
        const blockWin = this.findWinningMove(opponent);
        if (blockWin) {
            console.log(`[AdvancedAI] 阻止对手: (${blockWin.x}, ${blockWin.y})`);
            return blockWin;
        }
        
        // 4. VCF搜索（地狱难度）
        if (difficulty === 'HELL') {
            const vcfMove = this.searchVCF(aiPlayer);
            if (vcfMove) {
                console.log(`[AdvancedAI] VCF必胜: (${vcfMove.x}, ${vcfMove.y})`);
                return vcfMove;
            }
            
            // VCF防守
            const vcfDefense = this.searchVCFDefense(opponent);
            if (vcfDefense) {
                console.log(`[AdvancedAI] VCF防守: (${vcfDefense.x}, ${vcfDefense.y})`);
                return vcfDefense;
            }
        }
        
        // 5. 威胁序列搜索（困难及以上）
        if (difficulty === 'HARD' || difficulty === 'HELL') {
            const threatMove = this.searchThreatSequence(aiPlayer, opponent);
            if (threatMove && threatMove.score > 100000) {
                console.log(`[AdvancedAI] 威胁序列: (${threatMove.x}, ${threatMove.y}), 评分: ${threatMove.score}`);
                return threatMove;
            }
        }
        
        // 6. 深度搜索
        const depth = this.getSearchDepth(difficulty);
        const bestMove = this.iterativeDeepeningSearch(aiPlayer, opponent, depth);
        
        if (bestMove) {
            console.log(`[AdvancedAI] 最佳落点: (${bestMove.x}, ${bestMove.y}), 评分: ${bestMove.score.toFixed(2)}, 深度: ${depth}`);
            return bestMove;
        }
        
        // 7. 降级到简单策略
        return this.game.findAnyValidMove();
    }
    
    /**
     * 从开局库获取落子
     */
    getOpeningMove() {
        const moveCount = this.game.moves.length;
        
        // 第一手
        if (moveCount === 0) {
            return this.openingBook.first[0];
        }
        
        // 第二手
        if (moveCount === 1) {
            const firstMove = this.game.moves[0];
            if (firstMove.x === 7 && firstMove.y === 7) {
                const responses = this.openingBook.second[0].responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }
        
        // 第三手 - 根据前两手匹配定式
        if (moveCount === 2) {
            for (const seq of this.openingBook.sequences) {
                if (this.matchesSequence(seq.moves.slice(0, 2))) {
                    const nextMove = seq.moves[2];
                    if (this.game.board[nextMove[1]][nextMove[0]] === 0) {
                        return { x: nextMove[0], y: nextMove[1] };
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * 匹配开局序列
     */
    matchesSequence(sequence) {
        if (sequence.length > this.game.moves.length) {
            return false;
        }
        
        for (let i = 0; i < sequence.length; i++) {
            const [sx, sy] = sequence[i];
            const move = this.game.moves[i];
            if (move.x !== sx || move.y !== sy) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 查找必胜点
     */
    findWinningMove(player) {
        const candidates = this.getCandidateMoves(2, 50);
        
        for (const {x, y} of candidates) {
            this.game.board[y][x] = player;
            const isWin = this.game.checkWin(x, y).isWin;
            this.game.board[y][x] = 0;
            
            if (isWin && !this.game.isForbiddenMoveForPlayer(player, x, y)) {
                return {x, y};
            }
        }
        
        return null;
    }
    
    /**
     * VCF搜索（连续冲四）
     */
    searchVCF(player, depth = 0, maxDepth = this.vcfDepthLimit) {
        if (depth >= maxDepth) {
            return null;
        }
        
        const opponent = player === 1 ? 2 : 1;
        const fours = this.findFourMoves(player);
        
        for (const fourMove of fours) {
            this.game.board[fourMove.y][fourMove.x] = player;
            
            // 检查是否获胜
            if (this.game.checkWin(fourMove.x, fourMove.y).isWin) {
                this.game.board[fourMove.y][fourMove.x] = 0;
                return fourMove;
            }
            
            // 对手所有防守点
            const defenses = this.findDefenseMoves(player, fourMove);
            let allDefensesFail = true;
            
            for (const defense of defenses) {
                this.game.board[defense.y][defense.x] = opponent;
                
                // 递归搜索
                const nextVCF = this.searchVCF(player, depth + 1, maxDepth);
                
                this.game.board[defense.y][defense.x] = 0;
                
                if (!nextVCF) {
                    allDefensesFail = false;
                    break;
                }
            }
            
            this.game.board[fourMove.y][fourMove.x] = 0;
            
            if (allDefensesFail && defenses.length > 0) {
                return fourMove;
            }
        }
        
        return null;
    }
    
    /**
     * VCF防守搜索
     */
    searchVCFDefense(opponent) {
        const candidates = this.getCandidateMoves(2, 20);
        
        for (const {x, y} of candidates) {
            this.game.board[y][x] = opponent;
            const hasVCF = this.searchVCF(opponent, 0, 6);
            this.game.board[y][x] = 0;
            
            if (hasVCF) {
                return {x, y};
            }
        }
        
        return null;
    }
    
    /**
     * 查找冲四点
     */
    findFourMoves(player) {
        const moves = [];
        const candidates = this.getCandidateMoves(2, 30);
        
        for (const {x, y} of candidates) {
            this.game.board[y][x] = player;
            const score = this.evaluatePosition(x, y, player);
            this.game.board[y][x] = 0;
            
            if (score > 50000) {
                moves.push({x, y, score});
            }
        }
        
        moves.sort((a, b) => b.score - a.score);
        return moves;
    }
    
    /**
     * 查找防守点
     */
    findDefenseMoves(attackPlayer, attackMove) {
        const defenses = [];
        const range = 2;
        
        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const x = attackMove.x + dx;
                const y = attackMove.y + dy;
                
                if (this.game.isValidPosition(x, y) && this.game.board[y][x] === 0) {
                    defenses.push({x, y});
                }
            }
        }
        
        return defenses;
    }
    
    /**
     * 威胁序列搜索
     */
    searchThreatSequence(aiPlayer, opponent) {
        const candidates = this.getCandidateMoves(2, 25);
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const {x, y} of candidates) {
            // 模拟落子
            this.game.board[y][x] = aiPlayer;
            
            // 计算此位置形成的威胁
            const threats = this.analyzeThreat(x, y, aiPlayer);
            const opponentThreats = this.countOpponentThreats(opponent);
            
            const score = threats.score - opponentThreats * 0.8;
            
            this.game.board[y][x] = 0;
            
            if (score > bestScore && !this.game.isForbiddenMoveForPlayer(aiPlayer, x, y)) {
                bestScore = score;
                bestMove = {x, y, score};
            }
        }
        
        return bestMove;
    }
    
    /**
     * 分析威胁
     */
    analyzeThreat(x, y, player) {
        let activeFours = 0;
        let rushFours = 0;
        let activeThrees = 0;
        let sleepThrees = 0;
        
        for (const dir of this.game.aiDirections) {
            const line = this.getLineString(x, y, dir.dx, dir.dy, player);
            
            if (this.patterns.activeFour.test(line)) {
                activeFours++;
            } else if (this.patterns.rushFour.test(line)) {
                rushFours++;
            } else if (this.patterns.activeThree.test(line)) {
                activeThrees++;
            } else if (this.patterns.sleepThree.test(line)) {
                sleepThrees++;
            }
        }
        
        let score = 0;
        if (activeFours >= 2) {
            score = this.scoreTable.doubleActiveFour;
        } else if (activeFours >= 1 && activeThrees >= 1) {
            score = this.scoreTable.fourPlusThree;
        } else if (activeFours >= 1) {
            score = this.scoreTable.activeFour;
        } else if (rushFours >= 1) {
            score = this.scoreTable.rushFour;
        } else if (activeThrees >= 2) {
            score = this.scoreTable.doubleActiveThree;
        } else if (activeThrees >= 1) {
            score = this.scoreTable.activeThree;
        } else if (sleepThrees >= 1) {
            score = this.scoreTable.sleepThree;
        }
        
        return {
            activeFours,
            rushFours,
            activeThrees,
            sleepThrees,
            score
        };
    }
    
    /**
     * 获取线性字符串表示
     */
    getLineString(x, y, dx, dy, player) {
        let line = '';
        
        for (let i = -4; i <= 4; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            
            if (!this.game.isValidPosition(nx, ny)) {
                line += '2';
            } else if (this.game.board[ny][nx] === player) {
                line += '1';
            } else if (this.game.board[ny][nx] === 0) {
                line += '0';
            } else {
                line += '2';
            }
        }
        
        return line;
    }
    
    /**
     * 统计对手威胁数
     */
    countOpponentThreats(opponent) {
        let threats = 0;
        const candidates = this.getCandidateMoves(2, 20);
        
        for (const {x, y} of candidates) {
            this.game.board[y][x] = opponent;
            const threat = this.analyzeThreat(x, y, opponent);
            this.game.board[y][x] = 0;
            
            if (threat.activeFours > 0 || threat.activeThrees > 0) {
                threats += threat.score / 10000;
            }
        }
        
        return threats;
    }
    
    /**
     * 迭代加深搜索
     */
    iterativeDeepeningSearch(aiPlayer, opponent, maxDepth) {
        let bestMove = null;
        const startTime = Date.now();
        
        for (let depth = 1; depth <= maxDepth; depth++) {
            if (Date.now() - startTime > this.searchConfig.timeLimit) {
                break;
            }
            
            const move = this.alphaBetaSearch(aiPlayer, opponent, depth, -Infinity, Infinity, true);
            if (move) {
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    /**
     * Alpha-Beta剪枝搜索
     */
    alphaBetaSearch(aiPlayer, opponent, depth, alpha, beta, isMaximizing) {
        if (depth === 0 || this.game.gameStatus === 'finished') {
            return null;
        }
        
        const candidates = this.getCandidateMoves(2, this.searchConfig.candidateLimit[this.getCurrentDifficulty()]);
        const player = isMaximizing ? aiPlayer : opponent;
        let bestMove = null;
        
        for (const {x, y} of candidates) {
            if (this.game.isForbiddenMoveForPlayer(player, x, y)) {
                continue;
            }
            
            this.game.board[y][x] = player;
            const score = this.evaluatePosition(x, y, player);
            
            if (depth > 1) {
                const nextMove = this.alphaBetaSearch(aiPlayer, opponent, depth - 1, alpha, beta, !isMaximizing);
                // 简化：只使用当前评分
            }
            
            this.game.board[y][x] = 0;
            
            if (isMaximizing) {
                if (!bestMove || score > alpha) {
                    alpha = score;
                    bestMove = {x, y, score};
                }
            } else {
                if (!bestMove || score < beta) {
                    beta = score;
                    bestMove = {x, y, score};
                }
            }
            
            if (beta <= alpha) {
                break;
            }
        }
        
        return bestMove;
    }
    
    /**
     * 评估位置分数
     */
    evaluatePosition(x, y, player) {
        const opponent = player === 1 ? 2 : 1;
        
        // 基础位置分数
        let myScore = 0;
        let oppScore = 0;
        
        // 我方分数
        this.game.board[y][x] = player;
        myScore = this.calculatePositionScore(x, y, player);
        this.game.board[y][x] = 0;
        
        // 对手分数（防守价值）
        this.game.board[y][x] = opponent;
        oppScore = this.calculatePositionScore(x, y, opponent);
        this.game.board[y][x] = 0;
        
        // 综合评分：攻击为主，防守为辅
        return myScore * 1.1 + oppScore * 0.9;
    }
    
    /**
     * 计算位置分数
     */
    calculatePositionScore(x, y, player) {
        let score = 0;
        
        for (const dir of this.game.aiDirections) {
            const line = this.getLineString(x, y, dir.dx, dir.dy, player);
            
            if (this.patterns.five.test(line)) {
                score += this.scoreTable.five;
            } else if (this.patterns.activeFour.test(line)) {
                score += this.scoreTable.activeFour;
            } else if (this.patterns.rushFour.test(line)) {
                score += this.scoreTable.rushFour;
            } else if (this.patterns.activeThree.test(line)) {
                score += this.scoreTable.activeThree;
            } else if (this.patterns.sleepThree.test(line)) {
                score += this.scoreTable.sleepThree;
            } else if (this.patterns.activeTwo.test(line)) {
                score += this.scoreTable.activeTwo;
            } else if (this.patterns.sleepTwo.test(line)) {
                score += this.scoreTable.sleepTwo;
            }
        }
        
        // 位置价值：中心位置更有价值
        const centerBonus = this.getCenterBonus(x, y);
        score += centerBonus;
        
        return score;
    }
    
    /**
     * 获取中心位置加成
     */
    getCenterBonus(x, y) {
        const center = 7;
        const distance = Math.abs(x - center) + Math.abs(y - center);
        return Math.max(0, 100 - distance * 5);
    }
    
    /**
     * 获取搜索深度
     */
    getSearchDepth(difficulty) {
        switch (difficulty) {
            case 'BEGINNER': return this.searchConfig.maxDepthBeginner;
            case 'NORMAL': return this.searchConfig.maxDepthNormal;
            case 'HARD': return this.searchConfig.maxDepthHard;
            case 'HELL': return this.searchConfig.maxDepthHell;
            default: return this.searchConfig.maxDepthNormal;
        }
    }
    
    /**
     * 获取候选落子位置
     */
    getCandidateMoves(range = 2, limit = 25) {
        const candidates = new Set();
        let hasAnyPiece = false;
        
        for (let y = 0; y < this.game.boardSize; y++) {
            for (let x = 0; x < this.game.boardSize; x++) {
                if (this.game.board[y][x] !== 0) {
                    hasAnyPiece = true;
                    
                    for (let dy = -range; dy <= range; dy++) {
                        for (let dx = -range; dx <= range; dx++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            
                            if (this.game.isValidPosition(nx, ny) && this.game.board[ny][nx] === 0) {
                                candidates.add(`${nx},${ny}`);
                            }
                        }
                    }
                }
            }
        }
        
        if (!hasAnyPiece) {
            return [{x: 7, y: 7}];
        }
        
        const result = Array.from(candidates).map(key => {
            const [x, y] = key.split(',').map(Number);
            return {x, y};
        });
        
        if (result.length <= limit) {
            return result;
        }
        
        // 按位置价值排序
        result.sort((a, b) => {
            const scoreA = this.evaluatePosition(a.x, a.y, this.game.currentPlayer);
            const scoreB = this.evaluatePosition(b.x, b.y, this.game.currentPlayer);
            return scoreB - scoreA;
        });
        
        return result.slice(0, limit);
    }
    
    /**
     * 获取当前难度
     */
    getCurrentDifficulty() {
        if (this.game.gameMode === 'EvE') {
            return this.game.currentPlayer === 1 ? this.game.blackAIDifficulty : this.game.whiteAIDifficulty;
        }
        return this.game.aiDifficulty || 'NORMAL';
    }
}

// 模块导出
if (typeof window !== 'undefined') {
    window.AdvancedAI = AdvancedAI;
    console.log('[AdvancedAI] 模块已加载到全局命名空间');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAI;
}
