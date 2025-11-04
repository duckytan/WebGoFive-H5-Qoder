/**
 * 五子棋游戏核心引擎
 * 负责管理游戏状态、规则判定、历史记录等核心逻辑
 * 
 * @author 项目团队
 * @version 1.0.0
 * @date 2024
 */

class GomokuGame {
    /**
     * 构造函数 - 初始化游戏状态
     */
    constructor() {
        // 棋盘状态：15x15，0=空，1=黑棋，2=白棋
        this.boardSize = 15;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        
        // AI辅助配置
        this.aiDirections = [
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 1, dy: 1 },
            { dx: 1, dy: -1 }
        ];
        this.aiScoreTable = {
            five: 1000000,
            openFour: 160000,
            closedFour: 42000,
            brokenFour: 55000,
            openThree: 12000,
            closedThree: 2600,
            brokenThree: 6200,
            openTwo: 600,
            closedTwo: 150,
            baseOpen: 35,
            doubleOpenFour: 420000,
            doubleBrokenFour: 200000,
            doubleOpenThree: 36000,
            openFourSupport: 120000,
            openBrokenThreeCombo: 18000,
            doubleClosedFour: 32000,
            doubleClosedThree: 9000
        };
        
        // 落子历史记录
        this.moves = [];
        
        // 当前玩家：1=黑棋（先手），2=白棋（后手）
        this.currentPlayer = 1;
        
        // 游戏状态：ready=准备中，playing=对局中，finished=已结束
        this.gameStatus = 'ready';
        
        // 获胜方：null=未结束，1=黑棋胜，2=白棋胜，0=平局
        this.winner = null;
        
        // 游戏开始时间
        this.startTime = null;
        
        // 游戏结束时间
        this.endTime = null;
        
        // 游戏模式：PvP=双人对战，PvE=人机对战
        this.gameMode = 'PvP';
        
        // AI难度（仅PvE模式）
        this.aiDifficulty = 'NORMAL';
        
        console.log('[GameCore] 游戏核心引擎已初始化');
    }
    
    /**
     * 落子
     * @param {number} x - X坐标（0-14）
     * @param {number} y - Y坐标（0-14）
     * @returns {Object} 落子结果
     */
    placePiece(x, y) {
        // 1. 基础验证
        if (!this.isValidPosition(x, y)) {
            return {
                success: false,
                error: '坐标超出范围',
                code: 'INVALID_POSITION'
            };
        }
        
        if (this.board[y][x] !== 0) {
            return {
                success: false,
                error: '该位置已有棋子',
                code: 'POSITION_OCCUPIED'
            };
        }
        
        if (this.gameStatus === 'finished') {
            return {
                success: false,
                error: '游戏已结束',
                code: 'GAME_FINISHED'
            };
        }
        
        // 2. 检查禁手（仅对黑棋有效）
        if (this.currentPlayer === 1) {
            const forbiddenResult = this.checkForbidden(x, y);
            if (forbiddenResult.isForbidden) {
                return {
                    success: false,
                    error: `禁手：${forbiddenResult.type}`,
                    code: 'FORBIDDEN_MOVE',
                    forbiddenType: forbiddenResult.type,
                    details: forbiddenResult.details
                };
            }
        }
        
        // 3. 记录落子
        this.board[y][x] = this.currentPlayer;
        this.moves.push({
            x: x,
            y: y,
            player: this.currentPlayer,
            timestamp: Date.now(),
            step: this.moves.length + 1
        });
        
        // 3. 更新游戏状态
        if (this.gameStatus === 'ready') {
            this.gameStatus = 'playing';
            this.startTime = Date.now();
            console.log('[GameCore] 游戏开始');
        }
        
        console.log(`[GameCore] ${this.currentPlayer === 1 ? '黑棋' : '白棋'}在(${x}, ${y})落子，第${this.moves.length}步`);
        
        // 4. 检查胜负
        const winResult = this.checkWin(x, y);
        if (winResult.isWin) {
            this.gameStatus = 'finished';
            this.winner = this.currentPlayer;
            this.endTime = Date.now();
            
            console.log(`[GameCore] ${this.currentPlayer === 1 ? '黑棋' : '白棋'}获胜！`);
            
            return {
                success: true,
                gameOver: true,
                winner: this.currentPlayer,
                winLine: winResult.winLine,
                reason: 'five_in_row'
            };
        }
        
        // 5. 检查平局
        if (this.moves.length === 225) {
            this.gameStatus = 'finished';
            this.winner = 0;
            this.endTime = Date.now();
            
            console.log('[GameCore] 平局！棋盘已满');
            
            return {
                success: true,
                gameOver: true,
                winner: 0,
                reason: 'draw'
            };
        }
        
        // 6. 切换玩家
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        
        return {
            success: true,
            gameOver: false,
            nextPlayer: this.currentPlayer
        };
    }
    
    /**
     * 检查胜负
     * @param {number} x - 落子X坐标
     * @param {number} y - 落子Y坐标
     * @returns {Object} {isWin: boolean, winLine: Array}
     */
    checkWin(x, y) {
        const player = this.board[y][x];
        
        // 四个方向：横、竖、主对角线、副对角线
        const directions = [
            { dx: 1, dy: 0, name: '横向' },   // 横向
            { dx: 0, dy: 1, name: '纵向' },   // 纵向
            { dx: 1, dy: 1, name: '主对角' }, // 主对角线 ↘
            { dx: 1, dy: -1, name: '副对角' } // 副对角线 ↗
        ];
        
        for (let dir of directions) {
            const line = this.getLine(x, y, dir.dx, dir.dy, player);
            
            if (line.length >= 5) {
                console.log(`[GameCore] 检测到${dir.name}五连: ${JSON.stringify(line)}`);
                return {
                    isWin: true,
                    winLine: line,
                    direction: dir.name
                };
            }
        }
        
        return {
            isWin: false,
            winLine: null
        };
    }
    
    /**
     * 获取某方向的连线
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     * @param {number} dx - X方向增量
     * @param {number} dy - Y方向增量
     * @param {number} player - 玩家标识
     * @returns {Array} 连线坐标数组
     */
    getLine(x, y, dx, dy, player) {
        const line = [{x, y}];
        
        // 正向统计
        let nx = x + dx;
        let ny = y + dy;
        while (this.isValidPosition(nx, ny) && this.board[ny][nx] === player) {
            line.push({x: nx, y: ny});
            nx += dx;
            ny += dy;
        }
        
        // 反向统计
        nx = x - dx;
        ny = y - dy;
        while (this.isValidPosition(nx, ny) && this.board[ny][nx] === player) {
            line.unshift({x: nx, y: ny});
            nx -= dx;
            ny -= dy;
        }
        
        return line;
    }
    
    /**
     * 统计某方向的连子数
     * @param {number} x - 起始X坐标
     * @param {number} y - 起始Y坐标
     * @param {number} dx - X方向增量
     * @param {number} dy - Y方向增量
     * @param {number} player - 玩家标识
     * @returns {number} 连子数
     */
    countDirection(x, y, dx, dy, player) {
        let count = 0;
        let nx = x + dx;
        let ny = y + dy;
        
        while (this.isValidPosition(nx, ny) && this.board[ny][nx] === player) {
            count++;
            nx += dx;
            ny += dy;
        }
        
        return count;
    }
    
    /**
     * 检查禁手情况（当前仅实现三三禁手）
     * @param {number} x
     * @param {number} y
     * @returns {{isForbidden:boolean,type:string|null,details:object}}
     */
    checkForbidden(x, y) {
        const player = this.currentPlayer;
        const result = {
            isForbidden: false,
            type: null,
            details: {}
        };
        
        // 仅对黑棋检测禁手
        if (player !== 1) {
            return result;
        }
        
        // 临时落子以进行检测
        this.board[y][x] = player;
        
        // 检查长连禁手（六连及以上）
        const longLineInfo = this.checkLongLine(x, y, player);
        if (longLineInfo.hasLongLine) {
            this.board[y][x] = 0;
            result.isForbidden = true;
            result.type = '长连禁手';
            result.details = longLineInfo;
            return result;
        }
        
        const openThreeInfo = this.countOpenThrees(x, y, player);
        const openFourInfo = this.countOpenFours(x, y, player);
        this.board[y][x] = 0;
        
        const details = {
            openThrees: openThreeInfo,
            openFours: openFourInfo,
            longLine: longLineInfo
        };
        
        if (openFourInfo.total >= 2) {
            result.isForbidden = true;
            result.type = '四四禁手';
            result.details = details;
            return result;
        }
        
        if (openThreeInfo.total >= 2) {
            result.isForbidden = true;
            result.type = '三三禁手';
            result.details = details;
            return result;
        }
        
        result.details = details;
        return result;
    }
    
    /**
     * 统计某落子形成的活三数量
     * @param {number} x
     * @param {number} y
     * @param {number} player
     * @returns {{total:number, directions:Array}}
     */
    countOpenThrees(x, y, player) {
        const directions = [
            { dx: 1, dy: 0, name: 'horizontal' },
            { dx: 0, dy: 1, name: 'vertical' },
            { dx: 1, dy: 1, name: 'diag_down' },
            { dx: 1, dy: -1, name: 'diag_up' }
        ];
        
        let total = 0;
        const detail = [];
        
        directions.forEach((dir) => {
            const signature = this.getLineSignature(x, y, dir.dx, dir.dy, player, 4);
            const count = this.countOpenThreesInLine(signature);
            if (count > 0) {
                total += count;
                detail.push({
                    direction: dir.name,
                    count,
                    signature
                });
            }
        });
        
        return {
            total,
            directions: detail
        };
    }
    
    /**
     * 生成指定方向的线性表示
     * @param {number} x
     * @param {number} y
     * @param {number} dx
     * @param {number} dy
     * @param {number} player
     * @param {number} range
     * @returns {string}
     */
    getLineSignature(x, y, dx, dy, player, range = 4) {
        let signature = '';
        
        for (let offset = -range; offset <= range; offset++) {
            const nx = x + dx * offset;
            const ny = y + dy * offset;
            
            if (!this.isValidPosition(nx, ny)) {
                signature += '3'; // 边界
                continue;
            }
            
            const cell = this.board[ny][nx];
            if (cell === 0) {
                signature += '0';
            } else if (cell === player) {
                signature += '1';
            } else {
                signature += '2';
            }
        }
        
        return signature;
    }
    
    /**
     * 统计单个方向是否形成活三
     * @param {string} lineSignature
     * @returns {number} 如果存在活三返回1，否则返回0
     */
    countOpenThreesInLine(lineSignature) {
        if (!lineSignature) {
            return 0;
        }
        
        // 边界使用 "3" 标记，需要视为阻断位置
        const signature = lineSignature.replace(/3/g, '2');
        const patterns = ['01110', '011010', '010110'];
        
        for (const pattern of patterns) {
            let index = signature.indexOf(pattern);
            if (index === -1) {
                continue;
            }
            
            while (index !== -1) {
                // 确保模式周围不会立即形成更长的连续棋子（避免将活四误判为活三）
                const left = signature[index - 1];
                const right = signature[index + pattern.length];
                const hasLeftExtension = left === '1';
                const hasRightExtension = right === '1';
                
                if (!hasLeftExtension && !hasRightExtension) {
                    return 1; // 找到合法活三
                }
                
                index = signature.indexOf(pattern, index + 1);
            }
        }
        
        return 0;
    }
    
    /**
     * 统计某落子形成的活四数量
     * @param {number} x
     * @param {number} y
     * @param {number} player
     * @returns {{total:number, directions:Array}}
     */
    countOpenFours(x, y, player) {
        const directions = [
            { dx: 1, dy: 0, name: 'horizontal' },
            { dx: 0, dy: 1, name: 'vertical' },
            { dx: 1, dy: 1, name: 'diag_down' },
            { dx: 1, dy: -1, name: 'diag_up' }
        ];
        
        let total = 0;
        const detail = [];
        
        directions.forEach((dir) => {
            const signature = this.getLineSignature(x, y, dir.dx, dir.dy, player, 4);
            const count = this.countOpenFoursInLine(signature);
            if (count > 0) {
                total += count;
                detail.push({
                    direction: dir.name,
                    count,
                    signature
                });
            }
        });
        
        return {
            total,
            directions: detail
        };
    }
    
    /**
     * 检查是否形成长连（≥6）
     * @param {number} x
     * @param {number} y
     * @param {number} player
     * @returns {{hasLongLine:boolean, lines:Array}}
     */
    checkLongLine(x, y, player) {
        const directions = [
            { dx: 1, dy: 0, name: 'horizontal' },
            { dx: 0, dy: 1, name: 'vertical' },
            { dx: 1, dy: 1, name: 'diag_down' },
            { dx: 1, dy: -1, name: 'diag_up' }
        ];
        
        let hasLongLine = false;
        const lines = [];
        
        directions.forEach((dir) => {
            const line = this.getLine(x, y, dir.dx, dir.dy, player);
            if (line.length >= 6) {
                hasLongLine = true;
                lines.push({
                    direction: dir.name,
                    length: line.length,
                    coordinates: line
                });
            }
        });
        
        return {
            hasLongLine,
            lines
        };
    }
    
    /**
     * 统计单个方向上的活四数量
     * @param {string} lineSignature
     * @returns {number}
     */
    countOpenFoursInLine(lineSignature) {
        const windowSize = 6;
        let count = 0;
        
        for (let i = 0; i <= lineSignature.length - windowSize; i++) {
            const segment = lineSignature.slice(i, i + windowSize);
            
            if (segment[0] !== '0' || segment[5] !== '0') {
                continue;
            }
            
            if (segment.includes('2') || segment.includes('3')) {
                continue;
            }
            
            const middle = segment.slice(1, 5);
            const ones = (middle.match(/1/g) || []).length;
            const zeros = (middle.match(/0/g) || []).length;
            
            if (ones === 4 && zeros === 0) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * 验证坐标是否有效
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {boolean} 是否有效
     */
    isValidPosition(x, y) {
        return x >= 0 && x < 15 && y >= 0 && y < 15;
    }
    
    /**
     * 悔棋
     * @param {number} steps - 悔棋步数，默认1步
     * @returns {boolean} 是否成功
     */
    undo(steps = 1) {
        if (this.moves.length < steps) {
            console.warn('[GameCore] 悔棋失败：历史记录不足');
            return false;
        }
        
        console.log(`[GameCore] 悔棋 ${steps} 步`);
        
        for (let i = 0; i < steps; i++) {
            const lastMove = this.moves.pop();
            this.board[lastMove.y][lastMove.x] = 0;
            this.currentPlayer = lastMove.player;
        }
        
        // 如果游戏已结束，悔棋后恢复为进行中
        if (this.gameStatus === 'finished') {
            this.gameStatus = 'playing';
            this.winner = null;
            this.endTime = null;
            console.log('[GameCore] 游戏状态恢复为进行中');
        }
        
        // 如果悔棋后没有棋子了，恢复为准备状态
        if (this.moves.length === 0) {
            this.gameStatus = 'ready';
            this.currentPlayer = 1;
            this.startTime = null;
            console.log('[GameCore] 游戏状态恢复为准备中');
        }
        
        return true;
    }
    
    /**
     * 重置游戏
     */
    reset() {
        console.log('[GameCore] 重置游戏');
        
        this.board = Array(15).fill().map(() => Array(15).fill(0));
        this.moves = [];
        this.currentPlayer = 1;
        this.gameStatus = 'ready';
        this.winner = null;
        this.startTime = null;
        this.endTime = null;
    }
    
    /**
     * 设置游戏模式
     * @param {string} mode - 游戏模式：PvP或PvE
     */
    setGameMode(mode) {
        if (mode !== 'PvP' && mode !== 'PvE') {
            console.error('[GameCore] 无效的游戏模式:', mode);
            return;
        }
        
        this.gameMode = mode;
        console.log(`[GameCore] 游戏模式设置为: ${mode}`);
    }
    
    /**
     * 设置AI难度
     * @param {string} difficulty - 难度：BEGINNER/NORMAL/HARD/HELL
     */
    setAIDifficulty(difficulty) {
        const validDifficulties = ['BEGINNER', 'NORMAL', 'HARD', 'HELL'];
        if (!validDifficulties.includes(difficulty)) {
            console.error('[GameCore] 无效的AI难度:', difficulty);
            return;
        }
        
        this.aiDifficulty = difficulty;
        console.log(`[GameCore] AI难度设置为: ${difficulty}`);
    }
    
    /**
     * 获取游戏信息
     * @returns {Object} 游戏信息对象
     */
    getGameInfo() {
        const duration = this.startTime ? 
            (this.endTime || Date.now()) - this.startTime : 0;
        
        return {
            currentPlayer: this.currentPlayer,
            moveCount: this.moves.length,
            gameStatus: this.gameStatus,
            winner: this.winner,
            duration: duration,
            gameMode: this.gameMode,
            aiDifficulty: this.aiDifficulty,
            startTime: this.startTime,
            endTime: this.endTime
        };
    }
    
    /**
     * 获取棋盘状态副本
     * @returns {Array} 棋盘状态二维数组
     */
    getBoardState() {
        return this.board.map(row => [...row]);
    }
    
    /**
     * 获取落子历史副本
     * @returns {Array} 落子历史数组
     */
    getMoves() {
        return [...this.moves];
    }
    
    /**
     * 获取最后一步落子
     * @returns {Object|null} 最后一步落子信息，如果没有落子则返回null
     */
    getLastMove() {
        if (this.moves.length === 0) {
            return null;
        }
        return this.moves[this.moves.length - 1];
    }
    
    /**
     * 从数据恢复游戏状态
     * @param {Object} data - 游戏数据
     * @returns {boolean} 是否成功
     */
    loadFromData(data) {
        try {
            console.log('[GameCore] 从数据恢复游戏状态');
            
            // 验证数据格式
            if (!data || !data.boardState || !data.moves) {
                throw new Error('无效的游戏数据格式');
            }
            
            // 重置当前状态
            this.reset();
            
            // 恢复落子历史（通过重放moves）
            for (let move of data.moves) {
                const result = this.placePiece(move.x, move.y);
                if (!result.success) {
                    throw new Error(`恢复失败：无法在(${move.x}, ${move.y})落子`);
                }
            }
            
            // 恢复其他状态
            if (data.gameMode) this.gameMode = data.gameMode;
            if (data.aiDifficulty) this.aiDifficulty = data.aiDifficulty;
            if (data.startTime) this.startTime = data.startTime;
            
            console.log('[GameCore] 游戏状态恢复成功');
            return true;
            
        } catch (error) {
            console.error('[GameCore] 恢复游戏状态失败:', error);
            return false;
        }
    }
    
    /**
     * 导出游戏数据
     * @returns {Object} 游戏数据对象
     */
    exportData() {
        return {
            version: '1.0.0',
            gameInfo: this.getGameInfo(),
            boardState: this.getBoardState(),
            moves: this.getMoves(),
            timestamp: Date.now()
        };
    }
    
    /**
     * AI落子决策
     * @returns {Object|null} {x, y} 坐标，如果无法落子则返回null
     */
    getAIMove() {
        if (this.gameStatus === 'finished') {
            console.warn('[GameCore AI] 游戏已结束，无法落子');
            return null;
        }
        
        console.log(`[GameCore AI] 开始思考，难度: ${this.aiDifficulty}`);
        
        // 根据难度选择策略
        switch (this.aiDifficulty) {
            case 'BEGINNER':
                return this.getAIMoveRandom();
            case 'NORMAL':
                return this.getAIMoveNormal();
            case 'HARD':
                return this.getAIMoveHard();
            case 'HELL':
                return this.getAIMoveHell();
            default:
                return this.getAIMoveNormal();
        }
    }
    
    /**
     * 新手难度AI：简单随机策略，偶尔会犯错
     */
    getAIMoveRandom() {
        const aiPlayer = this.currentPlayer;
        const opponentPlayer = aiPlayer === 1 ? 2 : 1;
        
        // 50%几率直接获胜
        if (Math.random() < 0.5) {
            const winMove = this.findWinningMove(aiPlayer);
            if (winMove) {
                console.log(`[GameCore AI-BEGINNER] 找到获胜落点: (${winMove.x}, ${winMove.y})`);
                return winMove;
            }
        }
        
        // 40%几率阻止对手获胜
        if (Math.random() < 0.4) {
            const blockMove = this.findWinningMove(opponentPlayer);
            if (blockMove) {
                console.log(`[GameCore AI-BEGINNER] 阻止对手获胜: (${blockMove.x}, ${blockMove.y})`);
                return blockMove;
            }
        }
        
        // 否则在中心附近随机落子
        const emptyPositions = [];
        const center = 7;
        const range = 6;
        
        for (let y = Math.max(0, center - range); y < Math.min(15, center + range); y++) {
            for (let x = Math.max(0, center - range); x < Math.min(15, center + range); x++) {
                if (this.board[y][x] === 0) {
                    if (aiPlayer === 1) {
                        const forbiddenResult = this.checkForbidden(x, y);
                        if (!forbiddenResult.isForbidden) {
                            emptyPositions.push({x, y});
                        }
                    } else {
                        emptyPositions.push({x, y});
                    }
                }
            }
        }
        
        if (emptyPositions.length === 0) {
            return this.findAnyValidMove();
        }
        
        const randomIndex = Math.floor(Math.random() * emptyPositions.length);
        const move = emptyPositions[randomIndex];
        
        console.log(`[GameCore AI-BEGINNER] 随机落子: (${move.x}, ${move.y})`);
        return move;
    }
    
    /**
     * 正常难度AI：基于评分系统的策略
     */
    getAIMoveNormal() {
        const aiPlayer = this.currentPlayer;
        const opponentPlayer = aiPlayer === 1 ? 2 : 1;
        
        // 1. 立即获胜
        const winMove = this.findWinningMove(aiPlayer);
        if (winMove) {
            console.log(`[GameCore AI-NORMAL] 找到获胜落点: (${winMove.x}, ${winMove.y})`);
            return winMove;
        }
        
        // 2. 阻止对手获胜
        const blockMove = this.findWinningMove(opponentPlayer);
        if (blockMove) {
            console.log(`[GameCore AI-NORMAL] 阻止对手获胜: (${blockMove.x}, ${blockMove.y})`);
            return blockMove;
        }
        
        // 3. 使用评分系统选择最佳落点
        const bestMove = this.evaluateAllMoves(aiPlayer, opponentPlayer, 2);
        if (bestMove) {
            console.log(`[GameCore AI-NORMAL] 评分最高落点: (${bestMove.x}, ${bestMove.y}), 评分: ${bestMove.score.toFixed?.(2) ?? bestMove.score}`);
            return { x: bestMove.x, y: bestMove.y };
        }
        
        return this.findAnyValidMove();
    }
    
    /**
     * 困难难度AI：使用Minimax搜索
     */
    getAIMoveHard() {
        const aiPlayer = this.currentPlayer;
        const opponentPlayer = aiPlayer === 1 ? 2 : 1;
        
        // 1. 立即获胜
        const winMove = this.findWinningMove(aiPlayer);
        if (winMove) {
            console.log(`[GameCore AI-HARD] 找到获胜落点: (${winMove.x}, ${winMove.y})`);
            return winMove;
        }
        
        // 2. 阻止对手获胜
        const blockMove = this.findWinningMove(opponentPlayer);
        if (blockMove) {
            console.log(`[GameCore AI-HARD] 阻止对手获胜: (${blockMove.x}, ${blockMove.y})`);
            return blockMove;
        }
        
        // 3. 使用Minimax搜索（深度2）
        const bestMove = this.minimaxSearch(aiPlayer, opponentPlayer, 2);
        if (bestMove) {
            console.log(`[GameCore AI-HARD] Minimax最佳落点: (${bestMove.x}, ${bestMove.y}), 评分: ${bestMove.score}`);
            return bestMove;
        }
        
        return this.findAnyValidMove();
    }
    
    /**
     * 地狱难度AI：使用Alpha-Beta剪枝的深度搜索
     */
    getAIMoveHell() {
        const aiPlayer = this.currentPlayer;
        const opponentPlayer = aiPlayer === 1 ? 2 : 1;
        
        // 1. 立即获胜
        const winMove = this.findWinningMove(aiPlayer);
        if (winMove) {
            console.log(`[GameCore AI-HELL] 找到获胜落点: (${winMove.x}, ${winMove.y})`);
            return winMove;
        }
        
        // 2. 阻止对手获胜
        const blockMove = this.findWinningMove(opponentPlayer);
        if (blockMove) {
            console.log(`[GameCore AI-HELL] 阻止对手获胜: (${blockMove.x}, ${blockMove.y})`);
            return blockMove;
        }
        
        // 3. 使用Alpha-Beta剪枝搜索（深度3）
        const bestMove = this.alphaBetaSearch(aiPlayer, opponentPlayer, 3);
        if (bestMove) {
            console.log(`[GameCore AI-HELL] Alpha-Beta最佳落点: (${bestMove.x}, ${bestMove.y}), 评分: ${bestMove.score}`);
            return bestMove;
        }
        
        return this.findAnyValidMove();
    }
    
    /**
     * 查找能立即获胜的落点
     */
    findWinningMove(player) {
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                if (this.board[y][x] !== 0) continue;
                
                // 临时放置棋子测试
                this.board[y][x] = player;
                const winResult = this.checkWin(x, y);
                this.board[y][x] = 0; // 恢复
                
                if (winResult.isWin) {
                    if (this.isForbiddenMoveForPlayer(player, x, y)) {
                        continue;
                    }
                    return {x, y};
                }
            }
        }
        return null;
    }
    
    /**
     * 查找能形成活四的落点
     */
    findFourMove(player) {
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x] !== 0) continue;
                
                this.board[y][x] = player;
                const line = this.getMaxLine(x, y, player);
                this.board[y][x] = 0;
                
                if (line >= 4 && !this.isForbiddenMoveForPlayer(player, x, y)) {
                    return {x, y};
                }
            }
        }
        return null;
    }
    
    /**
     * 查找能形成活三的落点
     */
    findThreeMove(player) {
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x] !== 0) continue;
                
                this.board[y][x] = player;
                const line = this.getMaxLine(x, y, player);
                this.board[y][x] = 0;
                
                if (line >= 3 && !this.isForbiddenMoveForPlayer(player, x, y)) {
                    return {x, y};
                }
            }
        }
        return null;
    }
    
    /**
     * 查找中心区域的落点
     */
    findCenterMove() {
        const center = 7;
        const radius = 3;
        
        for (let r = 0; r <= radius; r++) {
            const positions = [];
            
            for (let dy = -r; dy <= r; dy++) {
                for (let dx = -r; dx <= r; dx++) {
                    if (Math.abs(dx) === r || Math.abs(dy) === r) {
                        const x = center + dx;
                        const y = center + dy;
                        
                        if (this.isValidPosition(x, y) && 
                            this.board[y][x] === 0 && 
                            !this.isForbiddenMoveForPlayer(this.currentPlayer, x, y)) {
                            positions.push({x, y});
                        }
                    }
                }
            }
            
            if (positions.length > 0) {
                return positions[Math.floor(Math.random() * positions.length)];
            }
        }
        
        return null;
    }
    
    /**
     * 获取某个位置最长的连线长度
     */
    getMaxLine(x, y, player) {
        const directions = [
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 1, dy: 1 },
            { dx: 1, dy: -1 }
        ];
        
        let maxLength = 0;
        
        for (let dir of directions) {
            const line = this.getLine(x, y, dir.dx, dir.dy, player);
            maxLength = Math.max(maxLength, line.length);
        }
        
        return maxLength;
    }
    
    /**
     * 查找任何有效的落子位置
     */
    findAnyValidMove() {
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x] === 0 && !this.isForbiddenMoveForPlayer(this.currentPlayer, x, y)) {
                    return { x, y };
                }
            }
        }
        return null;
    }
    
    /**
     * 评估所有可能的落子位置
     */
    evaluateAllMoves(aiPlayer, opponentPlayer, searchRange = 2) {
        const candidates = this.getCandidateMoves(searchRange, aiPlayer);
        const scoredMoves = [];
        
        for (const {x, y} of candidates) {
            const score = this.evaluatePosition(x, y, aiPlayer, opponentPlayer);
            if (!Number.isFinite(score)) {
                continue;
            }
            scoredMoves.push({ x, y, score });
        }
        
        if (!scoredMoves.length) {
            return null;
        }
        
        scoredMoves.sort((a, b) => b.score - a.score);
        const selectionPool = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
        const choice = selectionPool[Math.floor(Math.random() * selectionPool.length)];
        return choice;
    }
    
    /**
     * 获取候选落子位置（在有棋子的周围）
     */
    getCandidateMoves(range = 2, player = this.currentPlayer) {
        const candidates = new Map();
        let hasAnyPiece = false;
        
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x] !== 0) {
                    hasAnyPiece = true;
                    for (let dy = -range; dy <= range; dy++) {
                        for (let dx = -range; dx <= range; dx++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if ((dx === 0 && dy === 0) || !this.isValidPosition(nx, ny)) {
                                continue;
                            }
                            if (this.board[ny][nx] !== 0) {
                                continue;
                            }
                            const key = `${nx},${ny}`;
                            const proximity = Math.max(Math.abs(dx), Math.abs(dy));
                            if (!candidates.has(key)) {
                                candidates.set(key, {
                                    x: nx,
                                    y: ny,
                                    proximity,
                                    neighborScore: this.countNeighbors(nx, ny, 2)
                                });
                            } else {
                                const entry = candidates.get(key);
                                entry.proximity = Math.min(entry.proximity, proximity);
                            }
                        }
                    }
                }
            }
        }
        
        if (!hasAnyPiece) {
            const center = Math.floor(this.boardSize / 2);
            return [{ x: center, y: center }];
        }
        
        const result = [];
        for (const entry of candidates.values()) {
            if (this.isForbiddenMoveForPlayer(player, entry.x, entry.y)) {
                continue;
            }
            result.push(entry);
        }
        
        if (result.length === 0) {
            for (let y = 0; y < this.boardSize; y++) {
                for (let x = 0; x < this.boardSize; x++) {
                    if (this.board[y][x] === 0 && !this.isForbiddenMoveForPlayer(player, x, y)) {
                        return [{ x, y }];
                    }
                }
            }
        }
        
        result.sort((a, b) => {
            if (a.proximity !== b.proximity) {
                return a.proximity - b.proximity;
            }
            return b.neighborScore - a.neighborScore;
        });
        
        return result.map(({ x, y }) => ({ x, y }));
    }
    
    /**
     * 检查对特定玩家来说是否是禁手
     */
    isForbiddenMoveForPlayer(player, x, y) {
        if (player !== 1) {
            return false;
        }
        const oldPlayer = this.currentPlayer;
        this.currentPlayer = player;
        const forbiddenResult = this.checkForbidden(x, y);
        this.currentPlayer = oldPlayer;
        return forbiddenResult.isForbidden;
    }
    
    /**
     * 计算周围棋子数量
     */
    countNeighbors(x, y, radius) {
        let count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (this.isValidPosition(nx, ny) && this.board[ny][nx] !== 0) {
                    count++;
                }
            }
        }
        return count;
    }
    
    /**
     * 评估落子分值（包含进攻、防守、位置权重）
     */
    evaluateMoveValue(player, opponent, x, y, weights = {}) {
        if (this.board[y][x] !== 0) {
            return -Infinity;
        }
        if (this.isForbiddenMoveForPlayer(player, x, y)) {
            return -Infinity;
        }
        
        const offenseWeight = weights.offense ?? 1.0;
        const defenseWeight = weights.defense ?? 0.9;
        const positionalWeight = weights.positional ?? 0.2;
        const randomnessWeight = weights.randomness ?? 0;
        
        this.board[y][x] = player;
        const offenseScore = this.calculateScore(x, y, player).score;
        this.board[y][x] = 0;
        
        this.board[y][x] = opponent;
        const defenseScore = this.calculateScore(x, y, opponent).score;
        this.board[y][x] = 0;
        
        const positional = this.getPositionalScore(x, y);
        const jitter = randomnessWeight ? (Math.random() - 0.5) * randomnessWeight : 0;
        
        return offenseScore * offenseWeight + defenseScore * defenseWeight + positional * positionalWeight + jitter;
    }
    
    /**
     * 评估某个位置的分数（默认权重）
     */
    evaluatePosition(x, y, aiPlayer, opponentPlayer) {
        return this.evaluateMoveValue(aiPlayer, opponentPlayer, x, y, {
            offense: 1.1,
            defense: 0.9,
            positional: 1.0,
            randomness: 0
        });
    }
    
    /**
     * 获取位置分数（中心区域更有价值）
     */
    getPositionalScore(x, y) {
        const center = Math.floor(this.boardSize / 2);
        const distFromCenter = Math.abs(x - center) + Math.abs(y - center);
        const centerScore = Math.max(0, 12 - distFromCenter * 1.2);
        const neighborScore = this.countNeighbors(x, y, 2) * 0.6 + this.countNeighbors(x, y, 1) * 0.8;
        return centerScore + neighborScore;
    }
    
    /**
     * 计算某个位置的棋型分数
     */
    calculateScore(x, y, player) {
        let totalScore = 0;
        const patterns = [];
        
        for (const {dx, dy} of this.aiDirections) {
            const pattern = this.analyzeLinePattern(x, y, dx, dy, player);
            patterns.push(pattern);
            totalScore += pattern.score;
        }
        
        const comboScore = this.calculateComboBonus(patterns);
        return {
            score: totalScore + comboScore,
            patterns,
            comboScore
        };
    }
    
    /**
     * 分析某个方向的棋型
     */
    analyzeLinePattern(x, y, dx, dy, player) {
        const line = this.getLine(x, y, dx, dy, player);
        const length = line.length;
        
        if (length >= 5) {
            return {type: 'five', score: this.aiScoreTable.five, length};
        }
        
        if (length === 4) {
            const hasSpace = this.checkLineSpace(x, y, dx, dy, player, length);
            if (hasSpace.both) {
                return {type: 'openFour', score: this.aiScoreTable.openFour, length};
            } else if (hasSpace.one) {
                return {type: 'closedFour', score: this.aiScoreTable.closedFour, length};
            }
        }
        
        if (length === 3) {
            const hasSpace = this.checkLineSpace(x, y, dx, dy, player, length);
            if (hasSpace.both) {
                return {type: 'openThree', score: this.aiScoreTable.openThree, length};
            } else if (hasSpace.one) {
                return {type: 'closedThree', score: this.aiScoreTable.closedThree, length};
            }
        }
        
        if (length === 2) {
            const hasSpace = this.checkLineSpace(x, y, dx, dy, player, length);
            if (hasSpace.both) {
                return {type: 'openTwo', score: this.aiScoreTable.openTwo, length};
            } else if (hasSpace.one) {
                return {type: 'closedTwo', score: this.aiScoreTable.closedTwo, length};
            }
        }
        
        return {type: 'none', score: this.aiScoreTable.baseOpen, length: 1};
    }
    
    /**
     * 检查连线两端是否有空位
     */
    checkLineSpace(x, y, dx, dy, player, length) {
        const line = this.getLine(x, y, dx, dy, player);
        const firstPos = line[0];
        const lastPos = line[line.length - 1];
        
        const beforeX = firstPos.x - dx;
        const beforeY = firstPos.y - dy;
        const afterX = lastPos.x + dx;
        const afterY = lastPos.y + dy;
        
        const hasBeforeSpace = this.isValidPosition(beforeX, beforeY) && this.board[beforeY][beforeX] === 0;
        const hasAfterSpace = this.isValidPosition(afterX, afterY) && this.board[afterY][afterX] === 0;
        
        return {
            both: hasBeforeSpace && hasAfterSpace,
            one: hasBeforeSpace || hasAfterSpace,
            before: hasBeforeSpace,
            after: hasAfterSpace
        };
    }
    
    /**
     * 计算组合棋型的额外分数
     */
    calculateComboBonus(patterns) {
        let bonus = 0;
        const openFourCount = patterns.filter(p => p.type === 'openFour').length;
        const closedFourCount = patterns.filter(p => p.type === 'closedFour').length;
        const openThreeCount = patterns.filter(p => p.type === 'openThree').length;
        
        if (openFourCount >= 2) {
            bonus += this.aiScoreTable.doubleOpenFour;
        }
        if (openFourCount >= 1 && openThreeCount >= 1) {
            bonus += this.aiScoreTable.openFourSupport;
        }
        if (openThreeCount >= 2) {
            bonus += this.aiScoreTable.doubleOpenThree;
        }
        if (closedFourCount >= 2) {
            bonus += this.aiScoreTable.doubleClosedFour;
        }
        
        return bonus;
    }
    
    /**
     * 生成候选落子得分列表
     */
    scoreCandidates(player, opponent, candidates, weights) {
        const scored = [];
        for (const { x, y } of candidates) {
            const value = this.evaluateMoveValue(player, opponent, x, y, weights);
            if (!Number.isFinite(value)) {
                continue;
            }
            scored.push({ x, y, score: value });
        }
        scored.sort((a, b) => b.score - a.score);
        return scored;
    }
    
    /**
     * 评估当前棋盘整体局势
     */
    evaluateBoardScore(perspectivePlayer) {
        const opponent = perspectivePlayer === 1 ? 2 : 1;
        let score = 0;
        
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const cell = this.board[y][x];
                if (cell === perspectivePlayer) {
                    score += this.calculateScore(x, y, perspectivePlayer).score;
                } else if (cell === opponent) {
                    score -= this.calculateScore(x, y, opponent).score * 1.05;
                }
            }
        }
        
        return score;
    }
    
    /**
     * 通用搜索入口
     */
    searchBestMove(player, depth, options = {}) {
        const opponent = player === 1 ? 2 : 1;
        const config = Object.assign({
            range: 2,
            limit: 10,
            weights: { offense: 1.2, defense: 1.0, positional: 0.25, randomness: 0.2 },
            opponentWeights: { offense: 1.0, defense: 1.2, positional: 0.2, randomness: 0 },
            evaluationBoost: 0
        }, options);
        
        const candidates = this.getCandidateMoves(config.range, player);
        const scoredCandidates = this.scoreCandidates(player, opponent, candidates, config.weights);
        
        if (!scoredCandidates.length) {
            return null;
        }
        
        const topCandidates = scoredCandidates.slice(0, config.limit);
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of topCandidates) {
            this.board[move.y][move.x] = player;
            const winCheck = this.checkWin(move.x, move.y);
            let score;
            if (winCheck.isWin) {
                score = this.aiScoreTable.five * (depth + 2);
            } else {
                score = this.alphaBetaRecursive(
                    depth - 1,
                    opponent,
                    player,
                    -Infinity,
                    Infinity,
                    config
                );
            }
            this.board[move.y][move.x] = 0;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = { x: move.x, y: move.y, score };
            }
        }
        
        return bestMove;
    }
    
    /**
     * Alpha-Beta递归
     */
    alphaBetaRecursive(depth, currentPlayer, maximizingPlayer, alpha, beta, config) {
        const opponent = currentPlayer === 1 ? 2 : 1;
        
        if (depth <= 0) {
            return this.evaluateBoardScore(maximizingPlayer) + config.evaluationBoost;
        }
        
        const range = depth >= 2 ? config.range : Math.max(1, config.range - 1);
        const weights = currentPlayer === maximizingPlayer ? config.weights : config.opponentWeights;
        
        const candidates = this.getCandidateMoves(range, currentPlayer);
        let scored = this.scoreCandidates(currentPlayer, opponent, candidates, weights);
        
        if (!scored.length) {
            return this.evaluateBoardScore(maximizingPlayer);
        }
        
        const limit = currentPlayer === maximizingPlayer
            ? Math.min(scored.length, config.limit)
            : Math.min(scored.length, Math.max(4, Math.floor(config.limit * 0.75)));
        
        scored = scored.slice(0, limit);
        
        if (currentPlayer === maximizingPlayer) {
            let value = -Infinity;
            for (const move of scored) {
                this.board[move.y][move.x] = currentPlayer;
                const winCheck = this.checkWin(move.x, move.y);
                let score;
                if (winCheck.isWin) {
                    score = this.aiScoreTable.five * (depth + 1);
                } else {
                    score = this.alphaBetaRecursive(depth - 1, opponent, maximizingPlayer, alpha, beta, config);
                }
                this.board[move.y][move.x] = 0;
                
                value = Math.max(value, score);
                alpha = Math.max(alpha, value);
                if (alpha >= beta) {
                    break;
                }
            }
            return value;
        } else {
            let value = Infinity;
            for (const move of scored) {
                this.board[move.y][move.x] = currentPlayer;
                const winCheck = this.checkWin(move.x, move.y);
                let score;
                if (winCheck.isWin) {
                    score = -this.aiScoreTable.five * (depth + 1);
                } else {
                    score = this.alphaBetaRecursive(depth - 1, opponent, maximizingPlayer, alpha, beta, config);
                }
                this.board[move.y][move.x] = 0;
                
                value = Math.min(value, score);
                beta = Math.min(beta, value);
                if (alpha >= beta) {
                    break;
                }
            }
            return value;
        }
    }
    
    /**
     * 困难难度AI搜索
     */
    minimaxSearch(aiPlayer, opponentPlayer, depth) {
        return this.searchBestMove(aiPlayer, depth, {
            range: 2,
            limit: 8,
            weights: { offense: 1.2, defense: 1.0, positional: 0.3, randomness: 0.4 },
            opponentWeights: { offense: 1.0, defense: 1.2, positional: 0.25, randomness: 0 },
            evaluationBoost: 15
        });
    }
    
    /**
     * 地狱难度AI搜索
     */
    alphaBetaSearch(aiPlayer, opponentPlayer, depth) {
        return this.searchBestMove(aiPlayer, depth, {
            range: 3,
            limit: 12,
            weights: { offense: 1.3, defense: 1.15, positional: 0.25, randomness: 0.1 },
            opponentWeights: { offense: 1.1, defense: 1.3, positional: 0.22, randomness: 0 },
            evaluationBoost: 25
        });
    }
}

const GAME_CORE_MODULE_INFO = {
    name: 'GomokuGame',
    version: '1.0.2',
    author: '项目团队',
    dependencies: [
        'GameUtils'
    ]
};

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.GomokuGame = Object.assign(GomokuGame, { __moduleInfo: GAME_CORE_MODULE_INFO });
    
    // 创建全局游戏实例
    window.game = new window.GomokuGame();
    
    console.log('[GameCore] 游戏核心引擎已加载并创建全局实例 window.game');
    
    if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('moduleLoaded', {
            detail: GAME_CORE_MODULE_INFO
        }));
    }
}

// 支持模块导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Object.assign(GomokuGame, { __moduleInfo: GAME_CORE_MODULE_INFO });
}
