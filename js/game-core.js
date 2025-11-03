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
        this.board = Array(15).fill().map(() => Array(15).fill(0));
        
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
     * 统计单个方向上的活三数量
     * @param {string} lineSignature
     * @returns {number}
     */
    countOpenThreesInLine(lineSignature) {
        const windowSize = 6;
        let count = 0;
        
        for (let i = 0; i <= lineSignature.length - windowSize; i++) {
            const segment = lineSignature.slice(i, i + windowSize);
            
            // 外部必须为空位
            if (segment[0] !== '0' || segment[5] !== '0') {
                continue;
            }
            
            // 不允许包含对手棋子或边界
            if (segment.includes('2') || segment.includes('3')) {
                continue;
            }
            
            const middle = segment.slice(1, 5);
            const ones = (middle.match(/1/g) || []).length;
            const zeros = (middle.match(/0/g) || []).length;
            
            if (ones === 3 && zeros === 1) {
                count++;
            }
        }
        
        return count;
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
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.GomokuGame = GomokuGame;
    
    // 创建全局游戏实例
    window.game = new GomokuGame();
    
    console.log('[GameCore] 游戏核心引擎已加载并创建全局实例 window.game');
}

// 支持模块导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GomokuGame;
}
