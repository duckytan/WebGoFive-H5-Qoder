// 游戏保存和加载模块
class GameSaveLoad {
    constructor() {
        this.currentGameData = null;
        this.autoSaveEnabled = true;
        this.autoSaveInterval = null;
        
        this.setupEventListeners();
        
        if (this.autoSaveEnabled) {
            this.startAutoSave();
        }
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
                GameUtils.showMessage('当前没有可保存的棋局', 'warning');
                return;
            }
            
            const fileName = this.generateFileName(gameData);
            
            // 使用通用工具下载
            if (GameUtils.downloadAsJSON(gameData, fileName)) {
                GameUtils.showMessage('棋局保存成功', 'success');
                console.log('棋局已保存:', fileName);
            } else {
                GameUtils.showMessage('保存失败', 'error');
            }
            
        } catch (error) {
            console.error('保存棋局失败:', error);
            GameUtils.showMessage('保存失败: ' + error.message, 'error');
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
            GameUtils.showMessage('请选择有效的JSON格式棋局文件', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const gameData = JSON.parse(e.target.result);
                this.loadGameFromData(gameData);
            } catch (error) {
                console.error('加载棋局失败:', error);
                GameUtils.showMessage('文件格式错误: ' + error.message, 'error');
            }
        };
        
        reader.onerror = () => {
            GameUtils.showMessage('文件读取失败', 'error');
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
            
            GameUtils.showMessage(`棋局加载成功 (${gameData.moves.length}步)`, 'success');
            console.log('棋局已加载:', gameData.gameInfo);
            
            // 启用回放按钮
            this.enableReplayButton();
            
        } catch (error) {
            console.error('加载棋局数据失败:', error);
            GameUtils.showMessage('加载失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 获取当前游戏数据
     */
    getCurrentGameData() {
        if (!window.game) {
            console.warn('GameSaveLoad: 无法获取游戏数据，window.game 未初始化');
            return null;
        }
        
        const exportData = window.game.exportData();
        const gameInfo = window.game.getGameInfo();
        
        const gameData = {
            version: exportData.version,
            gameInfo: {
                mode: gameInfo.gameMode,
                difficulty: gameInfo.aiDifficulty,
                startTime: gameInfo.startTime ? new Date(gameInfo.startTime).toISOString() : new Date().toISOString(),
                endTime: gameInfo.endTime ? new Date(gameInfo.endTime).toISOString() : null,
                result: gameInfo.winner === 1 ? 'black_win'
                        : gameInfo.winner === 2 ? 'white_win'
                        : gameInfo.winner === 0 ? 'draw'
                        : null
            },
            boardState: exportData.boardState,
            moves: exportData.moves,
            currentPlayer: gameInfo.currentPlayer,
            moveCount: gameInfo.moveCount,
            gameTime: Math.floor(gameInfo.duration / 1000),
            settings: this.getGameSettings(),
            timestamp: exportData.timestamp
        };
        
        this.currentGameData = gameData;
        return gameData;
    }
    
    /**
     * 获取当前棋盘状态（已废弃，使用 game.exportData）
     */
    getCurrentBoardState() {
        if (window.game) {
            return window.game.getBoardState();
        }
        return Array(15).fill().map(() => Array(15).fill(0));
    }
    
    /**
     * 获取当前移动记录（已废弃，使用 game.exportData）
     */
    getCurrentMoves() {
        if (window.game) {
            return window.game.getMoves();
        }
        return [];
    }
    
    /**
     * 获取当前玩家（已废弃，使用 game.exportData）
     */
    getCurrentPlayer() {
        if (window.game) {
            return window.game.currentPlayer;
        }
        const playerPiece = document.getElementById('player-piece');
        return playerPiece && playerPiece.classList.contains('piece--black') ? 1 : 2;
    }
    
    /**
     * 获取移动计数（已废弃，使用 game.getGameInfo）
     */
    getMoveCount() {
        if (window.game) {
            return window.game.getGameInfo().moveCount;
        }
        const moveCountElement = document.getElementById('move-count');
        if (moveCountElement) {
            const text = moveCountElement.textContent;
            const match = text.match(/第(\d+)回合/);
            return match ? parseInt(match[1]) - 1 : 0;
        }
        return 0;
    }
    
    /**
     * 获取游戏时间（已废弃，使用 game.getGameInfo）
     */
    getGameTime() {
        if (window.game) {
            return Math.floor(window.game.getGameInfo().duration / 1000);
        }
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
        if (window.game) {
            window.game.reset();
        }
        
        if (window.boardRenderer) {
            window.boardRenderer.board = window.game ? window.game.getBoardState() : window.boardRenderer.getBoardState();
            window.boardRenderer.render();
        }
        
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
            if (!window.game) {
                throw new Error('GameSaveLoad: window.game 未初始化');
            }
            
            // 通过核心引擎恢复状态
            window.game.reset();
            const success = window.game.loadFromData(gameData);
            if (!success) {
                throw new Error('GameSaveLoad: loadFromData 返回失败');
            }
            
            // 同步渲染器
            if (window.boardRenderer) {
                window.boardRenderer.board = window.game.getBoardState();
                window.boardRenderer.render();
            }
            
            // 恢复设置
            if (gameData.settings) {
                this.restoreSettings(gameData.settings);
            }
            
            // 更新界面状态
            this.restoreUI(gameData);
            
            // 启用按钮
            const undoBtn = document.getElementById('undo-btn');
            const saveBtn = document.getElementById('save-game-btn');
            const replayBtn = document.getElementById('replay-btn');
            if (undoBtn) undoBtn.disabled = window.game.getGameInfo().moveCount === 0;
            if (saveBtn) saveBtn.disabled = false;
            if (replayBtn) replayBtn.disabled = false;
            
            console.log(`GameSaveLoad: 已恢复 ${gameData.moves?.length || 0} 步棋局`);
            
        } catch (error) {
            console.error('恢复游戏状态失败:', error);
            throw error;
        }
    }
    
    /**
     * 同步 UI 状态
     */
    restoreUI(gameData) {
        if (!window.game) return;
        const info = window.game.getGameInfo();
        
        // 游戏模式显示
        const gameModeElement = document.getElementById('game-mode');
        if (gameModeElement) {
            gameModeElement.textContent = info.gameMode === 'PvP' ? '双人对战' : '人机对战';
        }
        
        // 当前玩家显示
        const playerPiece = document.getElementById('player-piece');
        const playerName = document.getElementById('player-name');
        if (playerPiece) {
            playerPiece.className = `piece piece--${info.currentPlayer === 1 ? 'black' : 'white'}`;
        }
        if (playerName) {
            playerName.textContent = info.currentPlayer === 1 ? '黑棋' : '白棋';
        }
        
        // 回合数
        const moveCountElement = document.getElementById('move-count');
        if (moveCountElement) {
            moveCountElement.textContent = `第${info.moveCount + 1}回合`;
        }
        
        // 用时
        const gameTimeElement = document.getElementById('game-time');
        if (gameTimeElement) {
            const seconds = Math.floor(info.duration / 1000);
            const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
            const secs = (seconds % 60).toString().padStart(2, '0');
            gameTimeElement.textContent = `${mins}:${secs}`;
        }
        
        // 同步 InterfaceDemo 的内部状态
        if (window.demo) {
            window.demo.moveCount = info.moveCount;
            window.demo.currentPlayer = info.currentPlayer;
            window.demo.gameMode = info.gameMode;
            window.demo.updateGameStatus();
            window.demo.updateHintMessage('棋局加载完成');
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
                
                // 验证数据有效性
                if (!gameData || !gameData.moves || gameData.moves.length === 0) {
                    localStorage.removeItem('gomoku_auto_save');
                    return false;
                }
                
                // 显示友好的提示信息
                const moveCount = gameData.moves.length;
                const date = new Date(gameData.timestamp || Date.now());
                const timeStr = date.toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const message = `发现上次未完成的对局（${moveCount}步，${timeStr}），是否继续？`;
                
                if (confirm(message)) {
                    this.loadGameFromData(gameData);
                    GameUtils.showMessage('棋局已恢复', 'success');
                    return true;
                } else {
                    // 用户选择不恢复，清除自动保存
                    localStorage.removeItem('gomoku_auto_save');
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
     * 销毁实例，清理资源
     */
    destroy() {
        this.stopAutoSave();
        this.currentGameData = null;
    }
}

const GAME_SAVE_LOAD_MODULE_INFO = {
    name: 'GameSaveLoad',
    version: '1.0.1',
    author: '项目团队',
    dependencies: [
        'GomokuGame',
        'GameUtils'
    ]
};

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.GameSaveLoad = Object.assign(GameSaveLoad, { __moduleInfo: GAME_SAVE_LOAD_MODULE_INFO });
    if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('moduleLoaded', {
            detail: GAME_SAVE_LOAD_MODULE_INFO
        }));
    }
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Object.assign(GameSaveLoad, { __moduleInfo: GAME_SAVE_LOAD_MODULE_INFO });
}
