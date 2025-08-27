// 游戏保存和加载模块
class GameSaveLoad {
    constructor() {
        this.currentGameData = null;
        this.autoSaveEnabled = true;
        this.autoSaveInterval = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 保存棋局按钮
        const saveBtn = document.getElementById('save-game-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveGame());
        }
        
        // 加载棋局按钮
        const loadBtn = document.getElementById('load-game-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadGame());
        }
        
        // 文件输入
        const fileInput = document.getElementById('load-game-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileLoad(e));
        }
        
        // 自动保存设置
        const autoSaveToggle = document.getElementById('auto-save');
        if (autoSaveToggle) {
            autoSaveToggle.addEventListener('change', (e) => {
                this.toggleAutoSave(e.target.checked);
            });
        }
    }
    
    /**
     * 保存当前棋局
     */
    saveGame() {
        try {
            const gameData = this.getCurrentGameData();
            if (!gameData || gameData.moves.length === 0) {
                this.showMessage('当前没有可保存的棋局', 'warning');
                return;
            }
            
            const fileName = this.generateFileName(gameData);
            const jsonData = JSON.stringify(gameData, null, 2);
            
            // 创建下载链接
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            // 清理
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('棋局保存成功', 'success');
            console.log('棋局已保存:', fileName);
            
        } catch (error) {
            console.error('保存棋局失败:', error);
            this.showMessage('保存失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 触发加载棋局文件选择
     */
    loadGame() {
        const fileInput = document.getElementById('load-game-input');
        if (fileInput) {
            fileInput.click();
        }
    }
    
    /**
     * 处理文件加载
     */
    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.toLowerCase().endsWith('.json')) {
            this.showMessage('请选择有效的JSON格式棋局文件', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const gameData = JSON.parse(e.target.result);
                this.loadGameFromData(gameData);
            } catch (error) {
                console.error('加载棋局失败:', error);
                this.showMessage('文件格式错误: ' + error.message, 'error');
            }
        };
        
        reader.onerror = () => {
            this.showMessage('文件读取失败', 'error');
        };
        
        reader.readAsText(file);
        
        // 清空文件输入，允许重复选择同一文件
        event.target.value = '';
    }
    
    /**
     * 从数据加载棋局
     */
    loadGameFromData(gameData) {
        try {
            // 验证数据格式
            this.validateGameData(gameData);
            
            // 确认是否要替换当前棋局
            if (this.hasCurrentGame() && !confirm('加载新棋局将覆盖当前游戏，是否继续？')) {
                return;
            }
            
            // 重置游戏状态
            this.resetGame();
            
            // 恢复棋局数据
            this.restoreGameState(gameData);
            
            this.showMessage(`棋局加载成功 (${gameData.moves.length}步)`, 'success');
            console.log('棋局已加载:', gameData.gameInfo);
            
            // 启用回放按钮
            this.enableReplayButton();
            
        } catch (error) {
            console.error('加载棋局数据失败:', error);
            this.showMessage('加载失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 获取当前游戏数据
     */
    getCurrentGameData() {
        // 这里需要与实际的游戏引擎集成
        // 目前返回模拟数据
        const mockData = {
            version: '1.0.0',
            gameInfo: {
                mode: 'PvP', // 或 'PvE'
                difficulty: 'NORMAL',
                startTime: new Date().toISOString(),
                endTime: null,
                result: null // 'black_win', 'white_win', 'draw', null
            },
            boardState: this.getCurrentBoardState(),
            moves: this.getCurrentMoves(),
            currentPlayer: this.getCurrentPlayer(),
            moveCount: this.getMoveCount(),
            gameTime: this.getGameTime(),
            settings: this.getGameSettings()
        };
        
        this.currentGameData = mockData;
        return mockData;
    }
    
    /**
     * 获取当前棋盘状态
     */
    getCurrentBoardState() {
        // 15x15的棋盘状态，0=空，1=黑棋，2=白棋
        const board = Array(15).fill().map(() => Array(15).fill(0));
        
        // 这里需要从实际的游戏引擎获取棋盘状态
        // 目前返回模拟数据
        return board;
    }
    
    /**
     * 获取当前移动记录
     */
    getCurrentMoves() {
        // 这里需要从实际的游戏引擎获取移动记录
        // 返回格式: [{x: 7, y: 7, player: 1, timestamp: '...'}, ...]
        return [];
    }
    
    /**
     * 获取当前玩家
     */
    getCurrentPlayer() {
        // 从界面获取当前玩家信息
        const playerPiece = document.getElementById('player-piece');
        return playerPiece && playerPiece.classList.contains('piece--black') ? 1 : 2;
    }
    
    /**
     * 获取移动计数
     */
    getMoveCount() {
        const moveCountElement = document.getElementById('move-count');
        if (moveCountElement) {
            const text = moveCountElement.textContent;
            const match = text.match(/第(\\d+)回合/);
            return match ? parseInt(match[1]) - 1 : 0;
        }
        return 0;
    }
    
    /**
     * 获取游戏时间
     */
    getGameTime() {
        const gameTimeElement = document.getElementById('game-time');
        if (gameTimeElement) {
            const timeText = gameTimeElement.textContent;
            const parts = timeText.split(':');
            if (parts.length === 2) {
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            }
        }
        return 0;
    }
    
    /**
     * 获取游戏设置
     */
    getGameSettings() {
        return {
            riskIndicator: document.getElementById('risk-indicator-toggle')?.checked || false,
            coordinateDisplay: document.getElementById('coordinate-display-toggle')?.checked || false,
            soundEffects: document.getElementById('sound-effects')?.checked || true,
            animations: document.getElementById('animations')?.checked || true
        };
    }
    
    /**
     * 验证游戏数据格式
     */
    validateGameData(gameData) {
        if (!gameData || typeof gameData !== 'object') {
            throw new Error('无效的游戏数据格式');
        }
        
        const requiredFields = ['version', 'gameInfo', 'boardState', 'moves'];
        for (const field of requiredFields) {
            if (!(field in gameData)) {
                throw new Error(`缺少必需字段: ${field}`);
            }
        }
        
        if (!Array.isArray(gameData.boardState) || gameData.boardState.length !== 15) {
            throw new Error('无效的棋盘数据格式');
        }
        
        if (!Array.isArray(gameData.moves)) {
            throw new Error('无效的移动记录格式');
        }
        
        // 验证版本兼容性
        const version = gameData.version;
        if (!this.isCompatibleVersion(version)) {
            throw new Error(`不兼容的文件版本: ${version}`);
        }
    }
    
    /**
     * 检查版本兼容性
     */
    isCompatibleVersion(version) {
        const supportedVersions = ['1.0.0', '1.0.1', '1.1.0'];
        return supportedVersions.includes(version);
    }
    
    /**
     * 重置游戏状态
     */
    resetGame() {
        // 清空棋盘
        if (window.boardRenderer) {
            window.boardRenderer.clearBoard();
        }
        
        // 重置UI状态
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.disabled = true;
        }
        
        console.log('游戏状态已重置');
    }
    
    /**
     * 恢复游戏状态
     */
    restoreGameState(gameData) {
        try {
            // 恢复棋盘状态
            this.restoreBoardState(gameData.boardState, gameData.moves);
            
            // 恢复游戏信息
            this.restoreGameInfo(gameData);
            
            // 恢复设置
            if (gameData.settings) {
                this.restoreSettings(gameData.settings);
            }
            
            // 启用相关按钮
            const saveBtn = document.getElementById('save-game-btn');
            const replayBtn = document.getElementById('replay-btn');
            if (saveBtn) saveBtn.disabled = false;
            if (replayBtn) replayBtn.disabled = false;
            
        } catch (error) {
            console.error('恢复游戏状态失败:', error);
            throw error;
        }
    }
    
    /**
     * 恢复棋盘状态
     */
    restoreBoardState(boardState, moves) {
        // 这里需要与实际的游戏引擎集成
        // 逐步重放所有移动来恢复棋盘状态
        if (moves && moves.length > 0) {
            console.log(`恢复${moves.length}步棋局`);
            // 实际实现中需要调用游戏引擎的方法来重放移动
        }
    }
    
    /**
     * 恢复游戏信息
     */
    restoreGameInfo(gameData) {
        // 恢复游戏模式
        if (gameData.gameInfo.mode) {
            // 设置游戏模式显示
            const gameModeElement = document.getElementById('game-mode');
            if (gameModeElement) {
                gameModeElement.textContent = gameData.gameInfo.mode === 'PvP' ? '双人对战' : '人机对战';
            }
        }
        
        // 恢复移动计数
        if (gameData.moveCount !== undefined) {
            const moveCountElement = document.getElementById('move-count');
            if (moveCountElement) {
                moveCountElement.textContent = `第${gameData.moveCount + 1}回合`;
            }
        }
        
        // 恢复当前玩家
        if (gameData.currentPlayer) {
            this.updateCurrentPlayer(gameData.currentPlayer);
        }
    }
    
    /**
     * 更新当前玩家显示
     */
    updateCurrentPlayer(player) {
        const playerPiece = document.getElementById('player-piece');
        const playerName = document.getElementById('player-name');
        
        if (playerPiece) {
            playerPiece.className = `piece piece--${player === 1 ? 'black' : 'white'}`;
        }
        
        if (playerName) {
            playerName.textContent = player === 1 ? '黑棋' : '白棋';
        }
    }
    
    /**
     * 恢复设置
     */
    restoreSettings(settings) {
        if (settings.riskIndicator !== undefined) {
            const toggle = document.getElementById('risk-indicator-toggle');
            if (toggle) toggle.checked = settings.riskIndicator;
        }
        
        if (settings.coordinateDisplay !== undefined) {
            const toggle = document.getElementById('coordinate-display-toggle');
            if (toggle) toggle.checked = settings.coordinateDisplay;
        }
        
        if (settings.soundEffects !== undefined) {
            const toggle = document.getElementById('sound-effects');
            if (toggle) toggle.checked = settings.soundEffects;
        }
        
        if (settings.animations !== undefined) {
            const toggle = document.getElementById('animations');
            if (toggle) toggle.checked = settings.animations;
        }
    }
    
    /**
     * 生成文件名
     */
    generateFileName(gameData) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS
        const mode = gameData.gameInfo.mode || 'Unknown';
        const moves = gameData.moves.length;
        
        return `五子棋_${mode}_${moves}步_${dateStr}_${timeStr}.json`;
    }
    
    /**
     * 检查是否有当前游戏
     */
    hasCurrentGame() {
        return this.getMoveCount() > 0;
    }
    
    /**
     * 启用回放按钮
     */
    enableReplayButton() {
        const replayBtn = document.getElementById('replay-btn');
        if (replayBtn) {
            replayBtn.disabled = false;
        }
    }
    
    /**
     * 自动保存功能
     */
    toggleAutoSave(enabled) {
        this.autoSaveEnabled = enabled;
        
        if (enabled) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
        
        console.log(`自动保存: ${enabled ? '已开启' : '已关闭'}`);
    }
    
    /**
     * 开始自动保存
     */
    startAutoSave() {
        this.stopAutoSave(); // 清除现有定时器
        
        this.autoSaveInterval = setInterval(() => {
            if (this.hasCurrentGame()) {
                this.autoSaveToLocal();
            }
        }, 30000); // 每30秒自动保存一次
    }
    
    /**
     * 停止自动保存
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
    
    /**
     * 自动保存到本地存储
     */
    autoSaveToLocal() {
        try {
            const gameData = this.getCurrentGameData();
            if (gameData && gameData.moves.length > 0) {
                localStorage.setItem('gomoku_auto_save', JSON.stringify(gameData));
                console.log('游戏已自动保存到本地存储');
            }
        } catch (error) {
            console.error('自动保存失败:', error);
        }
    }
    
    /**
     * 从本地存储恢复自动保存的游戏
     */
    loadAutoSave() {
        try {
            const savedData = localStorage.getItem('gomoku_auto_save');
            if (savedData) {
                const gameData = JSON.parse(savedData);
                if (confirm('发现自动保存的棋局，是否恢复？')) {
                    this.loadGameFromData(gameData);
                    return true;
                }
            }
        } catch (error) {
            console.error('加载自动保存失败:', error);
            localStorage.removeItem('gomoku_auto_save');
        }
        return false;
    }
    
    /**
     * 清除自动保存数据
     */
    clearAutoSave() {
        localStorage.removeItem('gomoku_auto_save');
        console.log('自动保存数据已清除');
    }
    
    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        const hintMessage = document.getElementById('hint-message');
        if (hintMessage) {
            hintMessage.textContent = message;
            
            // 根据类型设置样式
            hintMessage.className = 'hint-message';
            if (type === 'error') {
                hintMessage.style.color = '#d32f2f';
                hintMessage.style.borderColor = '#d32f2f';
            } else if (type === 'success') {
                hintMessage.style.color = '#388e3c';
                hintMessage.style.borderColor = '#388e3c';
            } else if (type === 'warning') {
                hintMessage.style.color = '#f57c00';
                hintMessage.style.borderColor = '#f57c00';
            } else {
                hintMessage.style.color = '';
                hintMessage.style.borderColor = '';
            }
            
            // 3秒后恢复默认样式
            setTimeout(() => {
                hintMessage.style.color = '';
                hintMessage.style.borderColor = '';
            }, 3000);
        }
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    /**
     * 销毁实例，清理资源
     */
    destroy() {
        this.stopAutoSave();
        this.currentGameData = null;
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.GameSaveLoad = GameSaveLoad;
}