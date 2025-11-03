// 简单的棋盘渲染器 - 用于界面展示
class SimpleBoardRenderer {
    constructor(canvasId) {
        console.log('正在初始化棋盘渲染器...', canvasId);
        
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas元素未找到:', canvasId);
            return;
        }
        
        console.log('Canvas元素找到:', this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('无法获取Canvas 2D上下文');
            return;
        }
        
        console.log('Canvas 2D上下文获取成功');
        
        this.boardSize = 15; // 15x15棋盘
        this.cellSize = 36; // 每个格子的大小
        this.padding = 30; // 边距
        
        // 计算实际需要的画布大小
        this.boardWidth = (this.boardSize - 1) * this.cellSize;
        this.boardHeight = (this.boardSize - 1) * this.cellSize;
        this.canvasWidth = this.boardWidth + this.padding * 2;
        this.canvasHeight = this.boardHeight + this.padding * 2;
        
        console.log('棋盘尺寸:', {
            boardWidth: this.boardWidth,
            boardHeight: this.boardHeight,
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight
        });
        
        // 设置画布尺寸
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        console.log('画布尺寸设置完成:', this.canvas.width, 'x', this.canvas.height);
        
        // 棋盘状态 - 0:空位, 1:黑棋, 2:白棋
        // 如果游戏核心已加载，同步其状态；否则使用空棋盘
        if (window.game) {
            this.board = window.game.getBoardState();
            console.log('已从游戏核心同步棋盘状态');
        } else {
            this.board = Array(15).fill().map(() => Array(15).fill(0));
            console.log('游戏核心未加载，使用空棋盘');
        }
        
        // 禁手提示配置
        this.forbiddenHintConfig = {
            highlightDuration: 1800,
            highlightColor: 'rgba(211, 47, 47, 0.85)',
            borderColor: '#d32f2f',
            textColor: '#b71c1c'
        };
        this.forbiddenHighlight = null;
        this.forbiddenHighlightTimer = null;
        
        // AI提示高亮配置
        this.hintHighlight = null;
        this.hintHighlightTimer = null;
        
        // 绑定点击事件
        this.setupEventListeners();
        
        // 立即渲染棋盘
        this.render();
        
        console.log('棋盘渲染器初始化完成');
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 转换为棋盘坐标
            const gridX = Math.round((x - this.padding) / this.cellSize);
            const gridY = Math.round((y - this.padding) / this.cellSize);
            
            // 检查坐标是否有效
            if (gridX >= 0 && gridX < this.boardSize && 
                gridY >= 0 && gridY < this.boardSize && 
                this.board[gridY][gridX] === 0) {
                
                this.placePiece(gridX, gridY);
            }
        });
        
        // 悬停效果
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const gridX = Math.round((x - this.padding) / this.cellSize);
            const gridY = Math.round((y - this.padding) / this.cellSize);
            
            if (gridX >= 0 && gridX < this.boardSize && 
                gridY >= 0 && gridY < this.boardSize && 
                this.board[gridY][gridX] === 0) {
                this.canvas.style.cursor = 'pointer';
                this.hoverX = gridX;
                this.hoverY = gridY;
                this.render();
            } else {
                this.canvas.style.cursor = 'default';
                this.hoverX = -1;
                this.hoverY = -1;
                this.render();
            }
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.hoverX = -1;
            this.hoverY = -1;
            this.render();
        });
    }
    
    placePiece(x, y) {
        // 调用游戏核心引擎的落子方法
        if (!window.game) {
            console.error('[BoardRenderer] 游戏核心引擎未加载');
            return;
        }
        
        const result = window.game.placePiece(x, y);
        
        if (result.success) {
            // 同步棋盘状态
            this.board = window.game.getBoardState();
            this.clearHintHighlight(false);
            this.render();
            
            console.log(`[BoardRenderer] 落子成功: (${x}, ${y})`);
            
            // 通知界面层更新状态
            if (window.demo && window.demo.handleMoveResult) {
                window.demo.handleMoveResult({
                    x,
                    y,
                    player: window.game.currentPlayer === 1 ? 2 : 1, // 落子前的玩家
                    result
                });
            }
            
            // 处理游戏结束
            if (result.gameOver) {
                this.handleGameOver(result);
            }
        } else {
            console.warn(`[BoardRenderer] 落子失败: ${result.error}`);
            
            if (result.code === 'FORBIDDEN_MOVE') {
                // 高亮禁手位置
                this.highlightForbiddenPosition(x, y, result);
                
                if (window.demo) {
                    if (window.demo.handleForbiddenMove) {
                        window.demo.handleForbiddenMove({ x, y, result });
                    } else if (window.demo.updateHintMessage) {
                        const forbiddenType = result.forbiddenType || result.error;
                        window.demo.updateHintMessage(`⚠️ ${forbiddenType}！黑棋不能在此位置落子`);
                    }
                }
            } else {
                // 显示友好的错误提示
                if (window.demo && window.demo.updateHintMessage) {
                    if (result.code === 'POSITION_OCCUPIED') {
                        window.demo.updateHintMessage('⚠️ 此位置已有棋子');
                    } else if (result.code === 'GAME_FINISHED') {
                        window.demo.updateHintMessage('⚠️ 游戏已结束，请开始新游戏');
                    } else {
                        window.demo.updateHintMessage(`⚠️ ${result.error}`);
                    }
                }
            }
        }
    }
    
    /**
     * 高亮禁手位置
     */
    highlightForbiddenPosition(x, y, result) {
        const promptConfig = (window.demo && window.demo.forbiddenPromptConfig) || {};
        if (promptConfig.highlight === false) {
            return;
        }
        
        const highlightDuration = Math.max(300, promptConfig.highlightDuration || this.forbiddenHintConfig.highlightDuration);
        
        // 清除之前的高亮
        if (this.forbiddenHighlightTimer) {
            clearTimeout(this.forbiddenHighlightTimer);
        }
        
        // 设置新的高亮
        this.forbiddenHighlight = {
            x,
            y,
            result,
            timestamp: Date.now()
        };
        
        // 立即渲染
        this.render();
        
        // 一段时间后清除高亮
        this.forbiddenHighlightTimer = setTimeout(() => {
            this.forbiddenHighlight = null;
            this.render();
        }, highlightDuration);
    }
    
    /**
     * 高亮AI建议位置
     */
    highlightHintPosition(x, y, options = {}) {
        const isValidCoordinate = Number.isInteger(x) &&
            Number.isInteger(y) &&
            x >= 0 && x < this.boardSize &&
            y >= 0 && y < this.boardSize;
        
        if (!isValidCoordinate) {
            console.warn(`[BoardRenderer] 无法高亮AI建议，坐标无效: (${x}, ${y})`);
            return;
        }
        
        if (!this.board || this.board[y][x] !== 0) {
            console.warn(`[BoardRenderer] AI建议位置已被占用: (${x}, ${y})`);
            this.clearHintHighlight(false);
            return;
        }
        
        if (this.hintHighlightTimer) {
            clearTimeout(this.hintHighlightTimer);
            this.hintHighlightTimer = null;
        }
        
        this.hintHighlight = {
            x,
            y,
            timestamp: Date.now()
        };
        
        const duration = options.duration === undefined ? 5000 : options.duration;
        const shouldAutoClear = typeof duration === 'number' && isFinite(duration) && duration > 0;
        
        if (shouldAutoClear) {
            this.hintHighlightTimer = setTimeout(() => {
                this.clearHintHighlight();
            }, duration);
        }
        
        this.render();
    }
    
    clearHintHighlight(redraw = true) {
        if (this.hintHighlightTimer) {
            clearTimeout(this.hintHighlightTimer);
            this.hintHighlightTimer = null;
        }
        
        if (this.hintHighlight) {
            this.hintHighlight = null;
            if (redraw) {
                this.render();
            }
        }
    }
    
    drawHintHighlight() {
        if (!this.hintHighlight) {
            return;
        }
        
        const { x, y } = this.hintHighlight;
        
        if (!this.board || !this.board[y] || this.board[y][x] !== 0) {
            this.clearHintHighlight(false);
            return;
        }
        
        const screenX = this.padding + x * this.cellSize;
        const screenY = this.padding + y * this.cellSize;
        const outerRadius = this.cellSize * 0.48;
        const innerRadius = this.cellSize * 0.32;
        const crossSize = this.cellSize * 0.18;
        
        this.ctx.save();
        
        this.ctx.strokeStyle = 'rgba(76, 175, 80, 0.9)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 6]);
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, outerRadius, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = 'rgba(129, 199, 132, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, innerRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(67, 160, 71, 0.9)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(screenX - crossSize, screenY);
        this.ctx.lineTo(screenX + crossSize, screenY);
        this.ctx.moveTo(screenX, screenY - crossSize);
        this.ctx.lineTo(screenX, screenY + crossSize);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    /**
     * 处理游戏结束事件
     */
    handleGameOver(result) {
        console.log('[BoardRenderer] 游戏结束', result);
        
        // 通知demo显示游戏结果
        if (window.demo && typeof window.demo.showGameResult === 'function') {
            setTimeout(() => {
                window.demo.showGameResult({
                    winner: result.winner,
                    reason: result.reason,
                    winLine: result.winLine,
                    data: result
                });
            }, 300);
        }
    }
    
    getCurrentPlayer() {
        if (window.game) {
            return window.game.currentPlayer || 1;
        }
        
        // 兼容逻辑：根据当前棋盘推断
        let pieceCount = 0;
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== 0) {
                    pieceCount++;
                }
            }
        }
        return (pieceCount % 2 === 0) ? 1 : 2; // 黑棋先手
    }
    
    render() {
        console.log('正在渲染棋盘...');
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 设置画布背景色
        this.ctx.fillStyle = '#f4e4bc'; // 木质色
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘网格
        this.drawGrid();
        
        // 绘制特殊标记点（天元等）
        this.drawStarPoints();
        
        // 绘制棋子
        this.drawPieces();
        
        // 绘制悬停预览
        this.drawHoverPreview();
        
        // 绘制AI提示高亮
        this.drawHintHighlight();
        
        // 绘制禁手高亮
        this.drawForbiddenHighlight();
        
        console.log('棋盘渲染完成');
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#654321'; // 深棕色线条
        this.ctx.lineWidth = 1;
        
        // 绘制垂直线
        for (let i = 0; i < this.boardSize; i++) {
            const x = this.padding + i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding);
            this.ctx.lineTo(x, this.padding + this.boardHeight);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let i = 0; i < this.boardSize; i++) {
            const y = this.padding + i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, y);
            this.ctx.lineTo(this.padding + this.boardWidth, y);
            this.ctx.stroke();
        }
    }
    
    drawStarPoints() {
        // 五子棋标准星位点
        const starPoints = [
            [3, 3], [3, 11], [11, 3], [11, 11], // 四角
            [7, 7] // 天元
        ];
        
        this.ctx.fillStyle = '#654321';
        
        starPoints.forEach(([x, y]) => {
            const screenX = this.padding + x * this.cellSize;
            const screenY = this.padding + y * this.cellSize;
            
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        });
    }
    
    drawPieces() {
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const piece = this.board[y][x];
                if (piece !== 0) {
                    this.drawPiece(x, y, piece);
                }
            }
        }
    }
    
    drawPiece(x, y, player) {
        const screenX = this.padding + x * this.cellSize;
        const screenY = this.padding + y * this.cellSize;
        const radius = this.cellSize * 0.4;
        
        // 绘制棋子阴影
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(screenX + 2, screenY + 2, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
        
        // 绘制棋子
        this.ctx.save();
        
        if (player === 1) {
            // 黑棋 - 渐变效果
            const gradient = this.ctx.createRadialGradient(
                screenX - radius * 0.3, screenY - radius * 0.3, 0,
                screenX, screenY, radius
            );
            gradient.addColorStop(0, '#4a4a4a');
            gradient.addColorStop(1, '#1a1a1a');
            this.ctx.fillStyle = gradient;
        } else {
            // 白棋 - 渐变效果
            const gradient = this.ctx.createRadialGradient(
                screenX - radius * 0.3, screenY - radius * 0.3, 0,
                screenX, screenY, radius
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#e8e8e8');
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 棋子边框
        this.ctx.strokeStyle = player === 1 ? '#000' : '#ccc';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // 棋子高光
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(screenX - radius * 0.3, screenY - radius * 0.3, radius * 0.3, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawHoverPreview() {
        if (this.hoverX >= 0 && this.hoverY >= 0) {
            const screenX = this.padding + this.hoverX * this.cellSize;
            const screenY = this.padding + this.hoverY * this.cellSize;
            const radius = this.cellSize * 0.4;
            
            // 预览当前玩家的棋子
            const currentPlayer = this.getCurrentPlayer();
            
            this.ctx.save();
            this.ctx.globalAlpha = 0.5;
            
            if (currentPlayer === 1) {
                this.ctx.fillStyle = '#333';
            } else {
                this.ctx.fillStyle = '#f0f0f0';
                this.ctx.strokeStyle = '#ccc';
                this.ctx.lineWidth = 1;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            if (currentPlayer === 2) {
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }
    
    drawForbiddenHighlight() {
        if (!this.forbiddenHighlight) {
            return;
        }
        
        const { x, y, result } = this.forbiddenHighlight;
        const promptConfig = (window.demo && window.demo.forbiddenPromptConfig) || {};
        const highlightColor = promptConfig.highlightColor || this.forbiddenHintConfig.highlightColor;
        const borderColor = promptConfig.borderColor || this.forbiddenHintConfig.borderColor;
        const textColor = promptConfig.textColor || this.forbiddenHintConfig.textColor;
        const showLabel = promptConfig.showLabel !== false;
        
        const screenX = this.padding + x * this.cellSize;
        const screenY = this.padding + y * this.cellSize;
        const radius = this.cellSize * 0.45;
        const crossSize = this.cellSize * 0.28;
        
        this.ctx.save();
        
        // 背景圆形
        this.ctx.fillStyle = highlightColor;
        this.ctx.globalAlpha = 0.2;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // 边框
        this.ctx.globalAlpha = 1;
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(screenX, screenY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        
        // 交叉标记
        this.ctx.beginPath();
        this.ctx.moveTo(screenX - crossSize, screenY - crossSize);
        this.ctx.lineTo(screenX + crossSize, screenY + crossSize);
        this.ctx.moveTo(screenX - crossSize, screenY + crossSize);
        this.ctx.lineTo(screenX + crossSize, screenY - crossSize);
        this.ctx.stroke();
        
        if (showLabel) {
            // 文本标签
            const label = (result && result.forbiddenType) ? result.forbiddenType : '禁手';
            this.ctx.font = '14px "Microsoft YaHei", sans-serif';
            this.ctx.textBaseline = 'middle';
            const padding = 6;
            const textWidth = this.ctx.measureText(label).width;
            const boxWidth = textWidth + padding * 2;
            const boxHeight = 24;
            let rectX = screenX + radius + 8;
            let rectY = screenY - boxHeight / 2;
            rectX = Math.min(Math.max(rectX, this.padding), this.canvas.width - boxWidth - this.padding);
            rectY = Math.min(Math.max(rectY, this.padding), this.canvas.height - boxHeight - this.padding);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.rect(rectX, rectY, boxWidth, boxHeight);
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.fillStyle = textColor;
            this.ctx.fillText(label, rectX + padding, rectY + boxHeight / 2);
        }
        
        this.ctx.restore();
    }
    
    // 清空棋盘
    clearBoard() {
        if (window.game) {
            window.game.reset();
            this.board = window.game.getBoardState();
        } else {
            this.board = Array(15).fill().map(() => Array(15).fill(0));
        }
        
        this.clearHintHighlight(false);
        this.render();
        console.log('棋盘已清空');
    }
    
    // 获取棋盘状态
    getBoardState() {
        if (window.game) {
            return window.game.getBoardState();
        }
        return this.board.map(row => [...row]);
    }
}

// 在页面加载完成后初始化棋盘渲染器
document.addEventListener('DOMContentLoaded', () => {
    // 等待一小段时间确保所有元素都已加载
    setTimeout(() => {
        window.boardRenderer = new SimpleBoardRenderer('game-canvas');
        
        // 如果演示脚本已加载，将渲染器绑定到全局
        if (window.demo) {
            window.demo.boardRenderer = window.boardRenderer;
        }
        
        console.log('棋盘渲染器已初始化并绑定到全局变量');
    }, 100);
});