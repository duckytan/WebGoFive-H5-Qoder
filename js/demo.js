// 五子棋界面演示脚本 - 用于展示各种界面效果

class InterfaceDemo {
    constructor() {
        this.currentPlayer = 1; // 1为黑棋，2为白棋
        this.gameMode = 'PvP'; // PvP或PvE
        this.moveCount = 0;
        this.gameTime = 0;
        this.timeInterval = null;
        
        // 禁手提示配置
        this.forbiddenPromptConfig = {
            showMessage: true,
            highlight: true,
            highlightDuration: 1800,
            highlightColor: 'rgba(211, 47, 47, 0.85)',
            borderColor: '#d32f2f',
            textColor: '#b71c1c',
            showLabel: true,
            logDetail: false
        };
        
        // 初始化新功能模块
        this.gameSaveLoad = null;
        this.gameReplay = null;
        
        this.initializeDemo();
        this.setupEventListeners();
        this.startGameTimer();
        this.initializeModules();
    }
    
    initializeDemo() {
        // 隐藏加载界面
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 1000);
        
        // 演示风险提示功能
        this.demoRiskIndicator();
    }
    
    setupEventListeners() {
        // 新游戏按钮
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.startNewGame());
        }
        
        // 悔棋按钮
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undoMove());
        }
        
        // 模式切换按钮
        const modeToggleBtn = document.getElementById('mode-toggle-btn');
        if (modeToggleBtn) {
            modeToggleBtn.addEventListener('click', () => this.toggleGameMode());
        }
        
        // 设置按钮
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }
        
        // 帮助按钮
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }
        
        // 模态框关闭按钮
        this.setupModalListeners();
        
        // 棋盘点击事件
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // 功能开关
        this.setupToggleSwitches();
        
        // 获取提示按钮（现在在标题栏）
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHint());
        }
    }
    
    setupModalListeners() {
        // 设置模态框
        const closeSettingsBtn = document.getElementById('close-settings-btn');
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        const resetSettingsBtn = document.getElementById('reset-settings-btn');
        
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => this.hideModal('settings-modal'));
        }
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }
        if (resetSettingsBtn) {
            resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        }
        
        // 帮助模态框
        const closeHelpBtn = document.getElementById('close-help-btn');
        const closeHelpFooterBtn = document.getElementById('close-help-footer-btn');
        const startTutorialBtn = document.getElementById('start-tutorial-btn');
        
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', () => this.hideModal('help-modal'));
        }
        if (closeHelpFooterBtn) {
            closeHelpFooterBtn.addEventListener('click', () => this.hideModal('help-modal'));
        }
        if (startTutorialBtn) {
            startTutorialBtn.addEventListener('click', () => this.startTutorial());
        }
        
        // 游戏结果模态框
        const playAgainBtn = document.getElementById('play-again-btn');
        const closeResultBtn = document.getElementById('close-result-btn');
        
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => this.playAgain());
        }
        if (closeResultBtn) {
            closeResultBtn.addEventListener('click', () => this.hideModal('game-result-modal'));
        }
        
        // 点击模态框背景关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
        
        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }
    
    setupToggleSwitches() {
        // 风险提示开关
        const riskToggle = document.getElementById('risk-indicator-toggle');
        if (riskToggle) {
            riskToggle.addEventListener('change', (e) => {
                this.toggleRiskIndicator(e.target.checked);
            });
        }
        
        // 坐标显示开关
        const coordToggle = document.getElementById('coordinate-display-toggle');
        if (coordToggle) {
            coordToggle.addEventListener('change', (e) => {
                this.toggleCoordinateDisplay(e.target.checked);
            });
        }
    }
    
    startNewGame() {
        this.addButtonClickEffect('new-game-btn');
        
        // 重置游戏核心
        if (window.game) {
            window.game.reset();
            window.game.setGameMode(this.gameMode);
        }
        
        // 重置本地状态
        this.moveCount = 0;
        this.currentPlayer = 1;
        this.gameTime = 0;
        
        this.updateGameStatus();
        this.updateHintMessage('新游戏开始！黑棋先手');
        
        // 重置棋盘渲染
        if (window.boardRenderer) {
            window.boardRenderer.clearBoard();
        }
        
        // 重置按钮状态
        const undoBtn = document.getElementById('undo-btn');
        const saveBtn = document.getElementById('save-game-btn');
        const replayBtn = document.getElementById('replay-btn');
        
        if (undoBtn) undoBtn.disabled = true;
        if (saveBtn) saveBtn.disabled = true;
        if (replayBtn) replayBtn.disabled = true;
        
        // 清除自动保存数据
        if (this.gameSaveLoad) {
            this.gameSaveLoad.clearAutoSave();
        }
        
        console.log('[Demo] 开始新游戏');
    }
    
    undoMove() {
        this.addButtonClickEffect('undo-btn');
        
        // 使用游戏核心的悔棋功能
        if (window.game) {
            const steps = this.gameMode === 'PvE' ? 2 : 1; // PvE模式悔棋2步
            const success = window.game.undo(steps);
            
            if (success) {
                // 同步本地状态
                const gameInfo = window.game.getGameInfo();
                this.moveCount = gameInfo.moveCount;
                this.currentPlayer = gameInfo.currentPlayer;
                
                // 更新棋盘渲染
                if (window.boardRenderer) {
                    window.boardRenderer.board = window.game.getBoardState();
                    window.boardRenderer.render();
                }
                
                this.updateGameStatus();
                this.updateHintMessage('已悔棋');
                
                // 更新按钮状态
                if (this.moveCount === 0) {
                    const undoBtn = document.getElementById('undo-btn');
                    if (undoBtn) {
                        undoBtn.disabled = true;
                    }
                    
                    if (this.gameSaveLoad) {
                        this.gameSaveLoad.clearAutoSave();
                    }
                } else if (this.gameSaveLoad && this.gameSaveLoad.autoSaveEnabled) {
                    // 悔棋后重新保存
                    this.gameSaveLoad.autoSaveToLocal();
                }
                
                console.log('[Demo] 悔棋成功');
            } else {
                this.updateHintMessage('无法悔棋');
                console.warn('[Demo] 悔棋失败');
            }
        }
    }
    
    /**
     * 处理落子结果
     */
    handleMoveResult(data) {
        const { x, y, player, result } = data;
        
        // 更新本地状态
        const gameInfo = window.game.getGameInfo();
        this.moveCount = gameInfo.moveCount;
        this.currentPlayer = gameInfo.currentPlayer;
        
        this.updateGameStatus();
        
        // 启用悔棋按钮
        const undoBtn = document.getElementById('undo-btn');
        const saveBtn = document.getElementById('save-game-btn');
        const replayBtn = document.getElementById('replay-btn');
        
        if (undoBtn) undoBtn.disabled = false;
        if (saveBtn) saveBtn.disabled = false;
        if (replayBtn) replayBtn.disabled = false;
        
        // 自动保存（每步落子后）
        if (this.gameSaveLoad && this.gameSaveLoad.autoSaveEnabled) {
            this.gameSaveLoad.autoSaveToLocal();
        }
        
        // 如果游戏结束，清除自动保存
        if (result.gameOver && this.gameSaveLoad) {
            this.gameSaveLoad.clearAutoSave();
            console.log('[Demo] 游戏结束，已清除自动保存');
        }
        
        // 如果是PvE模式且轮到AI
        if (!result.gameOver && this.gameMode === 'PvE' && this.currentPlayer === 2) {
            this.simulateAIThinking();
        }
        
        console.log('[Demo] 落子结果处理完成');
    }
    
    handleForbiddenMove({ x, y, result }) {
        const config = this.forbiddenPromptConfig || {};
        const type = (result && result.forbiddenType) || '禁手';
        const coordinate = this.formatBoardCoordinate(x, y);
        const directions = this.formatForbiddenDirections(result && result.details);
        let message = `⚠️ ${type}，黑棋不能在 ${coordinate} 落子`;
        if (directions) {
            message += `（方向：${directions}）`;
        }
        
        if (config.showMessage !== false) {
            this.updateHintMessage(message);
        }
        
        if (config.logDetail) {
            console.info('[ForbiddenMove]', { coordinate, type, details: result?.details });
        }
    }
    
    configureForbiddenPrompt(options = {}) {
        this.forbiddenPromptConfig = Object.assign({}, this.forbiddenPromptConfig, options);
        if (window.boardRenderer && typeof window.boardRenderer.render === 'function') {
            window.boardRenderer.render();
        }
    }
    
    formatForbiddenDirections(details) {
        if (!details) {
            return '';
        }
        
        const dirMap = {
            horizontal: '横向',
            vertical: '纵向',
            diag_down: '正斜线',
            diag_up: '反斜线'
        };
        const descriptors = [];
        const addDirection = (direction, count) => {
            if (!direction) return;
            const label = dirMap[direction] || direction;
            descriptors.push(count && count > 1 ? `${label}×${count}` : label);
        };
        
        if (details.longLine && details.longLine.hasLongLine && Array.isArray(details.longLine.lines)) {
            details.longLine.lines.forEach(line => addDirection(line.direction));
        }
        if (details.openFours && details.openFours.total > 0 && Array.isArray(details.openFours.directions)) {
            details.openFours.directions.forEach(item => addDirection(item.direction, item.count));
        }
        if (details.openThrees && details.openThrees.total > 0 && Array.isArray(details.openThrees.directions)) {
            details.openThrees.directions.forEach(item => addDirection(item.direction, item.count));
        }
        
        const unique = [...new Set(descriptors)];
        return unique.join('、');
    }
    
    formatBoardCoordinate(x, y) {
        const letters = 'ABCDEFGHIJKLMNO';
        const column = letters[x] || String(x + 1);
        return `${column}${y + 1}`;
    }
    
    toggleGameMode() {
        this.addButtonClickEffect('mode-toggle-btn');
        this.gameMode = this.gameMode === 'PvP' ? 'PvE' : 'PvP';
        
        // 同步到游戏核心
        if (window.game) {
            window.game.setGameMode(this.gameMode);
        }
        
        const modeToggleText = document.getElementById('mode-toggle-text');
        const gameModeDisplay = document.getElementById('game-mode');
        const aiControls = document.getElementById('ai-controls');
        
        if (this.gameMode === 'PvE') {
            if (modeToggleText) modeToggleText.textContent = '切换到PvP';
            if (gameModeDisplay) gameModeDisplay.textContent = '人机对战';
            if (aiControls) aiControls.style.display = 'block';
        } else {
            if (modeToggleText) modeToggleText.textContent = '切换到PvE';
            if (gameModeDisplay) gameModeDisplay.textContent = '双人对战';
            if (aiControls) aiControls.style.display = 'none';
        }
        
        this.updateHintMessage(`已切换到${this.gameMode === 'PvP' ? '双人对战' : '人机对战'}模式`);
        console.log(`切换到${this.gameMode}模式`);
    }
    
    showHint() {
        this.addButtonClickEffect('hint-btn');
        
        // 模拟获取提示
        const hintMessage = document.getElementById('hint-message');
        if (hintMessage) {
            hintMessage.textContent = '💡 AI建议: 在中心区域落子可获得更好的控制';
            hintMessage.style.background = 'linear-gradient(135deg, #e8f5e8 0%, #fff 100%)';
            hintMessage.style.borderColor = '#4caf50';
            
            // 5秒后恢复
            setTimeout(() => {
                this.updateHintMessage('点击棋盘继续游戏');
                if (hintMessage) {
                    hintMessage.style.background = 'white';
                    hintMessage.style.borderColor = '#ccc';
                }
            }, 5000);
        }
        
        console.log('显示提示');
    }
    
    showSettings() {
        this.addButtonClickEffect('settings-btn');
        this.showModal('settings-modal');
        console.log('显示设置');
    }
    
    showHelp() {
        this.addButtonClickEffect('help-btn');
        this.showModal('help-modal');
        console.log('显示帮助');
    }
    
    handleCanvasHover(e) {
        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 这里可以添加棋盘悬停效果
    }
    
    handleKeydown(e) {
        switch(e.key.toLowerCase()) {
            case 'h':
                if (!e.ctrlKey && !e.altKey) {
                    e.preventDefault();
                    this.showHint();
                }
                break;
            case 'n':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.startNewGame();
                }
                break;
            case 'z':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.undoMove();
                }
                break;
            case 'escape':
                this.hideAllModals();
                break;
        }
    }
    
    simulateAIThinking() {
        const aiThinking = document.getElementById('ai-thinking');
        if (aiThinking) {
            aiThinking.style.display = 'block';
        }
        
        this.updateHintMessage('AI思考中...');
        
        // 模拟AI思考时间
        setTimeout(() => {
            if (aiThinking) {
                aiThinking.style.display = 'none';
            }
            
            this.currentPlayer = 1;
            this.updateGameStatus();
            this.updateHintMessage('AI已落子，轮到您了');
            
            console.log('AI落子完成');
        }, 1500);
    }
    
    showGameResult(result) {
        const modal = document.getElementById('game-result-modal');
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        const finalTime = document.getElementById('final-time');
        const finalMoves = document.getElementById('final-moves');
        
        if (window.game) {
            const info = window.game.getGameInfo();
            this.gameTime = Math.floor(info.duration / 1000);
            this.moveCount = info.moveCount;
        }
        
        if (result === 'win') {
            if (resultIcon) {
                resultIcon.textContent = '🎉';
                resultIcon.className = 'result-icon winner';
            }
            if (resultTitle) resultTitle.textContent = '恭喜获胜！';
            if (resultMessage) resultMessage.textContent = '您赢得了这局游戏！';
        } else if (result === 'draw') {
            if (resultIcon) {
                resultIcon.textContent = '🤝';
                resultIcon.className = 'result-icon draw';
            }
            if (resultTitle) resultTitle.textContent = '平局';
            if (resultMessage) resultMessage.textContent = '双方势均力敌，棋局以平局结束';
        } else {
            if (resultIcon) {
                resultIcon.textContent = '😔';
                resultIcon.className = 'result-icon loser';
            }
            if (resultTitle) resultTitle.textContent = '游戏结束';
            if (resultMessage) resultMessage.textContent = '很遗憾，您输了这局';
        }
        
        if (finalTime) finalTime.textContent = this.formatTime(this.gameTime);
        if (finalMoves) finalMoves.textContent = `${this.moveCount}回合`;
        
        this.showModal('game-result-modal');
    }
    
    playAgain() {
        this.hideModal('game-result-modal');
        this.startNewGame();
    }
    
    startTutorial() {
        this.hideModal('help-modal');
        this.updateHintMessage('教程模式：请在棋盘中央落子开始');
        console.log('开始教程');
    }
    
    saveSettings() {
        this.addButtonClickEffect('save-settings-btn');
        this.updateHintMessage('设置已保存');
        this.hideModal('settings-modal');
        console.log('保存设置');
    }
    
    resetSettings() {
        this.addButtonClickEffect('reset-settings-btn');
        this.updateHintMessage('设置已重置为默认值');
        console.log('重置设置');
    }
    
    toggleRiskIndicator(enabled) {
        console.log(`风险提示: ${enabled ? '开启' : '关闭'}`);
        this.updateHintMessage(`风险提示已${enabled ? '开启' : '关闭'}`);
    }
    
    toggleCoordinateDisplay(enabled) {
        const coordinates = document.getElementById('board-coordinates');
        if (coordinates) {
            coordinates.style.display = enabled ? 'block' : 'none';
        }
        console.log(`坐标显示: ${enabled ? '开启' : '关闭'}`);
        this.updateHintMessage(`坐标显示已${enabled ? '开启' : '关闭'}`);
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    updateGameStatus() {
        if (window.game) {
            const gameInfo = window.game.getGameInfo();
            this.currentPlayer = gameInfo.currentPlayer;
            this.moveCount = gameInfo.moveCount;
        }
        
        const playerPiece = document.getElementById('player-piece');
        const playerName = document.getElementById('player-name');
        const moveCountDisplay = document.getElementById('move-count');
        
        if (playerPiece) {
            playerPiece.className = `piece piece--${this.currentPlayer === 1 ? 'black' : 'white'}`;
        }
        
        if (playerName) {
            playerName.textContent = this.currentPlayer === 1 ? '黑棋' : '白棋';
        }
        
        if (moveCountDisplay) {
            moveCountDisplay.textContent = `第${this.moveCount + 1}回合`;
        }
    }
    
    updateHintMessage(message) {
        const hintMessage = document.getElementById('hint-message');
        if (hintMessage) {
            hintMessage.textContent = message;
        }
    }
    
    startGameTimer() {
        this.timeInterval = setInterval(() => {
            this.gameTime++;
            const gameTimeDisplay = document.getElementById('game-time');
            if (gameTimeDisplay) {
                gameTimeDisplay.textContent = this.formatTime(this.gameTime);
            }
        }, 1000);
    }
    
    initializeModules() {
        // 初始化棋局保存/加载模块
        if (typeof GameSaveLoad !== 'undefined') {
            this.gameSaveLoad = new GameSaveLoad();
            console.log('棋局保存/加载模块已初始化');
        } else {
            console.warn('GameSaveLoad模块未加载');
        }
        
        // 初始化棋局回放模块
        if (typeof GameReplay !== 'undefined') {
            this.gameReplay = new GameReplay();
            console.log('棋局回放模块已初始化');
        } else {
            console.warn('GameReplay模块未加载');
        }
        
        // 尝试从本地存储恢复自动保存的游戏
        if (this.gameSaveLoad) {
            setTimeout(() => {
                this.gameSaveLoad.loadAutoSave();
            }, 1000);
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    addButtonClickEffect(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.add('btn-click');
            setTimeout(() => {
                button.classList.remove('btn-click');
            }, 200);
        }
    }
    
    demoRiskIndicator() {
        // 演示风险提示功能
        setTimeout(() => {
            this.updateHintMessage('⚠️ 演示: 红色区域表示对手威胁位置');
        }, 3000);
    }
}

// 页面加载完成后初始化演示
document.addEventListener('DOMContentLoaded', () => {
    console.log('五子棋界面演示初始化...');
    const demo = new InterfaceDemo();
    
    // 演示快捷键提示
    setTimeout(() => {
        const shortcuts = document.getElementById('keyboard-shortcuts');
        if (shortcuts) {
            shortcuts.style.display = 'block';
            shortcuts.classList.add('show');
            
            setTimeout(() => {
                shortcuts.classList.remove('show');
                setTimeout(() => {
                    shortcuts.style.display = 'none';
                }, 300);
            }, 5000);
        }
    }, 2000);
});