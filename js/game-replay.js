// 游戏回放模块
class GameReplay {
    constructor() {
        this.replayData = null;
        this.currentStep = 0;
        this.totalSteps = 0;
        this.isPlaying = false;
        this.playSpeed = 1; // 播放速度倍数
        this.playInterval = null;
        this.stepDuration = 1000; // 每步间隔时间(ms)
        this.replayEngine = window.GomokuGame ? new window.GomokuGame() : null;
        this.originalGameData = null;
        
        if (this.replayEngine) {
            this.replayEngine.reset();
        }
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 回放按钮
        const replayBtn = document.getElementById('replay-btn');
        if (replayBtn) {
            replayBtn.addEventListener('click', () => this.startReplay());
        }
        
        // 回放控制按钮
        this.setupReplayControlListeners();
        
        // 模态框关闭
        const closeReplayBtn = document.getElementById('close-replay-btn');
        const replayCloseBtn = document.getElementById('replay-close-btn');
        
        if (closeReplayBtn) {
            closeReplayBtn.addEventListener('click', () => this.closeReplay());
        }
        if (replayCloseBtn) {
            replayCloseBtn.addEventListener('click', () => this.closeReplay());
        }
    }
    
    setupReplayControlListeners() {
        // 播放控制按钮
        const firstBtn = document.getElementById('replay-first');
        const prevBtn = document.getElementById('replay-prev');
        const playPauseBtn = document.getElementById('replay-play-pause');
        const nextBtn = document.getElementById('replay-next');
        const lastBtn = document.getElementById('replay-last');
        
        if (firstBtn) firstBtn.addEventListener('click', () => this.goToFirst());
        if (prevBtn) prevBtn.addEventListener('click', () => this.goToPrevious());
        if (playPauseBtn) playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        if (nextBtn) nextBtn.addEventListener('click', () => this.goToNext());
        if (lastBtn) lastBtn.addEventListener('click', () => this.goToLast());
        
        // 进度条
        const progressSlider = document.getElementById('replay-progress-slider');
        if (progressSlider) {
            progressSlider.addEventListener('input', (e) => this.seekToStep(e.target.value));
            progressSlider.addEventListener('change', (e) => this.seekToStep(e.target.value));
        }
        
        // 速度控制按钮
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const speed = parseFloat(e.target.dataset.speed);
                this.setPlaySpeed(speed);
                this.updateSpeedButtons(speed);
            });
        });
        
        // 功能按钮
        const stepsToggleBtn = document.getElementById('replay-steps-toggle');
        const exportBtn = document.getElementById('replay-export');
        const closeBtn = document.getElementById('replay-close');
        const closeStepsBtn = document.getElementById('close-steps-panel');
        
        if (stepsToggleBtn) {
            stepsToggleBtn.addEventListener('click', () => this.toggleStepsPanel());
        }
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReplay());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeReplay());
        }
        if (closeStepsBtn) {
            closeStepsBtn.addEventListener('click', () => this.hideStepsPanel());
        }
    }
    
    /**
     * 开始回放
     */
    startReplay() {
        try {
            // 保存当前游戏状态
            if (window.game) {
                this.originalGameData = window.game.exportData();
                console.log('GameReplay: 已保存原始棋局状态');
            }
            
            // 获取当前棋局数据
            this.replayData = this.getReplayData();
            
            if (!this.replayData || !this.replayData.moves || this.replayData.moves.length === 0) {
                GameUtils.showMessage('没有可回放的棋局', 'warning');
                this.originalGameData = null;
                return;
            }
            
            this.totalSteps = this.replayData.moves.length;
            this.currentStep = 0;
            
            // 显示回放播放器
            this.showReplayPlayer();
            
            // 初始化回放界面
            this.initializeReplayUI();
            
            // 重置棋盘到初始状态
            this.resetBoardForReplay();
            
            console.log('开始棋局回放，总共', this.totalSteps, '步');
            
        } catch (error) {
            console.error('启动回放失败:', error);
            GameUtils.showMessage('回放失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 获取回放数据
     */
    getReplayData() {
        // 从游戏核心引擎获取真实数据
        if (!window.game) {
            console.warn('GameReplay: window.game 未初始化');
            return null;
        }
        
        const gameInfo = window.game.getGameInfo();
        const moves = window.game.getMoves();
        
        if (!moves || moves.length === 0) {
            console.warn('GameReplay: 没有可回放的棋局');
            return null;
        }
        
        return {
            gameInfo: {
                mode: gameInfo.gameMode,
                startTime: gameInfo.startTime ? new Date(gameInfo.startTime).toISOString() : null,
                endTime: gameInfo.endTime ? new Date(gameInfo.endTime).toISOString() : null,
                winner: gameInfo.winner,
                duration: gameInfo.duration
            },
            moves: moves,
            boardState: window.game.getBoardState(),
            settings: {}
        };
    }
    
    /**
     * 生成模拟移动数据用于演示
     */
    generateMockMoves() {
        const moves = [];
        const positions = [
            {x: 7, y: 7}, {x: 8, y: 8}, {x: 6, y: 6}, {x: 9, y: 9},
            {x: 5, y: 5}, {x: 10, y: 10}, {x: 7, y: 6}, {x: 7, y: 8},
            {x: 7, y: 5}, {x: 7, y: 9}, {x: 7, y: 4} // 黑棋获胜
        ];
        
        positions.forEach((pos, index) => {
            moves.push({
                x: pos.x,
                y: pos.y,
                player: (index % 2) + 1,
                step: index + 1,
                timestamp: new Date(Date.now() + index * 5000).toISOString()
            });
        });
        
        return moves;
    }
    
    /**
     * 显示回放播放器
     */
    showReplayPlayer() {
        const replayPlayer = document.getElementById('replay-player');
        const gameHints = document.getElementById('game-hints');
        
        if (replayPlayer) {
            replayPlayer.style.display = 'block';
        }
        
        // 隐藏游戏提示
        if (gameHints) {
            gameHints.style.display = 'none';
        }
    }
    
    /**
     * 关闭回放
     */
    closeReplay() {
        this.stopPlaying();
        
        const replayPlayer = document.getElementById('replay-player');
        const gameHints = document.getElementById('game-hints');
        
        if (replayPlayer) {
            replayPlayer.style.display = 'none';
        }
        
        // 显示游戏提示
        if (gameHints) {
            gameHints.style.display = 'flex';
        }
        
        // 隐藏步骤面板
        this.hideStepsPanel();
        
        // 恢复到回放前的状态
        this.restoreOriginalState();
        
        console.log('回放已关闭');
    }
    
    /**
     * 初始化回放UI
     */
    initializeReplayUI() {
        // 更新步数显示
        this.updateStepDisplay();
        
        // 更新进度条
        this.updateProgressBar();
        
        // 更新播放按钮状态
        this.updatePlayButton();
        
        // 更新速度显示
        this.updateSpeedDisplay();
        
        // 生成步骤列表
        this.generateStepsList();
        
        // 更新按钮状态
        this.updateControlButtons();
    }
    
    /**
     * 重置棋盘到初始状态
     */
    resetBoardForReplay() {
        if (this.replayEngine) {
            this.replayEngine.reset();
        }
        
        if (window.boardRenderer) {
            const boardState = this.replayEngine ? this.replayEngine.getBoardState() : Array(15).fill().map(() => Array(15).fill(0));
            window.boardRenderer.board = boardState;
            window.boardRenderer.render();
        }
        console.log('棋盘已重置为回放模式');
    }
    
    /**
     * 跳到第一步
     */
    goToFirst() {
        this.seekToStep(0);
    }
    
    /**
     * 上一步
     */
    goToPrevious() {
        if (this.currentStep > 0) {
            this.seekToStep(this.currentStep - 1);
        }
    }
    
    /**
     * 切换播放/暂停
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.pausePlaying();
        } else {
            this.startPlaying();
        }
    }
    
    /**
     * 下一步
     */
    goToNext() {
        if (this.currentStep < this.totalSteps) {
            this.seekToStep(this.currentStep + 1);
        }
    }
    
    /**
     * 跳到最后一步
     */
    goToLast() {
        this.seekToStep(this.totalSteps);
    }
    
    /**
     * 开始自动播放
     */
    startPlaying() {
        if (this.currentStep >= this.totalSteps) {
            // 如果已经在末尾，从头开始
            this.seekToStep(0);
        }
        
        this.isPlaying = true;
        this.updatePlayButton();
        
        this.playInterval = setInterval(() => {
            if (this.currentStep < this.totalSteps) {
                this.goToNext();
            } else {
                // 播放完毕，自动停止
                this.pausePlaying();
            }
        }, this.stepDuration / this.playSpeed);
        
        console.log('开始自动播放，速度:', this.playSpeed + 'x');
    }
    
    /**
     * 暂停播放
     */
    pausePlaying() {
        this.isPlaying = false;
        this.updatePlayButton();
        
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
        
        console.log('播放已暂停');
    }
    
    /**
     * 停止播放
     */
    stopPlaying() {
        this.pausePlaying();
        this.currentStep = 0;
        this.updateUI();
    }
    
    /**
     * 跳转到指定步骤
     */
    seekToStep(step) {
        const targetStep = Math.max(0, Math.min(parseInt(step), this.totalSteps));
        
        if (targetStep === this.currentStep) return;
        
        this.currentStep = targetStep;
        
        // 重建棋盘到目标步骤
        this.rebuildBoardToStep(targetStep);
        
        // 更新UI
        this.updateUI();
        
        console.log('跳转到第', targetStep, '步');
    }
    
    /**
     * 重建棋盘到指定步骤
     */
    rebuildBoardToStep(targetStep) {
        // 清空棋盘
        this.resetBoardForReplay();
        
        // 使用回放专用引擎逐步重放
        if (this.replayEngine && window.boardRenderer) {
            this.replayEngine.reset();
            
            for (let i = 0; i < targetStep && i < this.replayData.moves.length; i++) {
                const move = this.replayData.moves[i];
                this.replayEngine.placePiece(move.x, move.y);
                console.log(`回放第${i + 1}步: ${move.player === 1 ? '黑棋' : '白棋'} 落子 (${move.x}, ${move.y})`);
            }
            
            // 同步渲染器
            window.boardRenderer.board = this.replayEngine.getBoardState();
            window.boardRenderer.render();
        } else {
            console.warn('GameReplay: replayEngine 或 boardRenderer 未初始化');
        }
    }
    
    /**
     * 在回放中放置棋子（已废弃，使用 game-core）
     */
    placePieceForReplay(x, y, player, step) {
        console.warn('placePieceForReplay 已废弃，通过 rebuildBoardToStep 统一处理');
    }
    
    /**
     * 设置播放速度
     */
    setPlaySpeed(speed) {
        this.playSpeed = speed;
        this.updateSpeedButtons(speed);
        
        // 如果正在播放，重新设置定时器
        if (this.isPlaying) {
            this.pausePlaying();
            this.startPlaying();
        }
        
        console.log('播放速度设置为:', speed + 'x');
    }
    
    /**
     * 更新UI显示
     */
    updateUI() {
        this.updateStepDisplay();
        this.updateProgressBar();
        this.updateControlButtons();
        this.updateCurrentPlayer();
        this.highlightCurrentStepInList();
    }
    
    /**
     * 更新步数显示
     */
    updateStepDisplay() {
        const stepInfo = document.getElementById('replay-step-info');
        const timeDisplay = document.getElementById('replay-time-current');
        
        if (stepInfo) {
            stepInfo.textContent = `第${this.currentStep}步 / 共${this.totalSteps}步`;
        }
        
        if (timeDisplay) {
            const minutes = Math.floor(this.currentStep / 60);
            const seconds = this.currentStep % 60;
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * 更新进度条
     */
    updateProgressBar() {
        const progressSlider = document.getElementById('replay-progress-slider');
        const progressFill = document.getElementById('replay-progress-fill');
        const totalTimeDisplay = document.getElementById('replay-time-total');
        
        if (progressSlider) {
            progressSlider.max = this.totalSteps;
            progressSlider.value = this.currentStep;
        }
        
        if (progressFill) {
            const percentage = this.totalSteps > 0 ? (this.currentStep / this.totalSteps) * 100 : 0;
            progressFill.style.width = percentage + '%';
        }
        
        if (totalTimeDisplay) {
            const minutes = Math.floor(this.totalSteps / 60);
            const seconds = this.totalSteps % 60;
            totalTimeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    /**
     * 更新播放按钮
     */
    updatePlayButton() {
        const playIcon = document.getElementById('replay-play-icon');
        if (playIcon) {
            playIcon.textContent = this.isPlaying ? '⏸️' : '▶️';
        }
        
        const playPauseBtn = document.getElementById('replay-play-pause');
        if (playPauseBtn) {
            playPauseBtn.title = this.isPlaying ? '暂停' : '播放';
        }
    }
    
    /**
     * 更新控制按钮状态
     */
    updateControlButtons() {
        const firstBtn = document.getElementById('replay-first');
        const prevBtn = document.getElementById('replay-prev');
        const nextBtn = document.getElementById('replay-next');
        const lastBtn = document.getElementById('replay-last');
        
        if (firstBtn) firstBtn.disabled = this.currentStep === 0;
        if (prevBtn) prevBtn.disabled = this.currentStep === 0;
        if (nextBtn) nextBtn.disabled = this.currentStep === this.totalSteps;
        if (lastBtn) lastBtn.disabled = this.currentStep === this.totalSteps;
    }
    
    /**
     * 更新当前玩家显示
     */
    updateCurrentPlayer() {
        const playerInfo = document.getElementById('replay-player-info');
        if (playerInfo && this.currentStep > 0 && this.currentStep <= this.totalSteps) {
            const move = this.replayData.moves[this.currentStep - 1];
            playerInfo.textContent = move.player === 1 ? '黑棋落子' : '白棋落子';
        } else {
            if (playerInfo) {
                playerInfo.textContent = '游戏开始';
            }
        }
    }
    
    /**
     * 生成步骤列表
     */
    generateStepsList() {
        const stepsContainer = document.getElementById('replay-steps-list');
        if (!stepsContainer) return;
        
        stepsContainer.innerHTML = '';
        
        if (!this.replayData || !this.replayData.moves.length) {
            stepsContainer.innerHTML = '<div class=\"step-item\">没有可显示的步骤</div>';
            return;
        }
        
        this.replayData.moves.forEach((move, index) => {
            const stepItem = document.createElement('div');
            stepItem.className = 'step-item';
            stepItem.dataset.step = index + 1;
            
            stepItem.innerHTML = `
                <span class="step-number">${index + 1}</span>
                <span class="step-player ${move.player === 1 ? 'black' : 'white'}">${move.player === 1 ? '●' : '○'}</span>
                <span class="step-position">(${move.x + 1}, ${move.y + 1})</span>
                <span class="step-time">${this.formatTime(new Date(move.timestamp))}</span>
            `;
            
            // 点击跳转到指定步骤
            stepItem.addEventListener('click', () => {
                this.seekToStep(index + 1);
            });
            
            stepsContainer.appendChild(stepItem);
        });
    }
    
    /**
     * 高亮当前步骤
     */
    highlightCurrentStepInList() {
        const stepsContainer = document.getElementById('replay-steps-list');
        if (!stepsContainer) return;
        
        // 移除所有高亮
        const allSteps = stepsContainer.querySelectorAll('.step-item');
        allSteps.forEach(item => item.classList.remove('current'));
        
        // 高亮当前步骤
        if (this.currentStep > 0) {
            const currentStepElement = stepsContainer.querySelector(`[data-step=\"${this.currentStep}\"]`);
            if (currentStepElement) {
                currentStepElement.classList.add('current');
                currentStepElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }
    
    /**
     * 导出回放数据
     */
    exportReplay() {
        if (!this.replayData) {
            GameUtils.showMessage('没有可导出的回放数据', 'warning');
            return;
        }
        
        try {
            const exportData = {
                ...this.replayData,
                exportTime: new Date().toISOString(),
                currentStep: this.currentStep
            };
            
            const fileName = this.generateReplayFileName();
            
            if (GameUtils.downloadAsJSON(exportData, fileName)) {
                GameUtils.showMessage('回放数据导出成功', 'success');
            } else {
                GameUtils.showMessage('导出失败', 'error');
            }
            
        } catch (error) {
            console.error('导出回放失败:', error);
            GameUtils.showMessage('导出失败: ' + error.message, 'error');
        }
    }
    
    /**
     * 生成回放文件名
     */
    generateReplayFileName() {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
        const steps = this.totalSteps;
        
        return `五子棋回放_${steps}步_${dateStr}_${timeStr}.json`;
    }
    
    /**
     * 恢复原始状态
     */
    restoreOriginalState() {
        // 恢复回放前的棋局状态
        if (this.originalGameData && window.game) {
            window.game.loadFromData(this.originalGameData);
            
            if (window.boardRenderer) {
                window.boardRenderer.board = window.game.getBoardState();
                window.boardRenderer.render();
            }
            
            if (window.demo) {
                window.demo.updateGameStatus();
            }
            
            console.log('GameReplay: 已恢复原始棋局状态');
            this.originalGameData = null;
        } else {
            console.log('GameReplay: 无需恢复（无原始状态）');
        }
    }
    
    /**
     * 格式化时间显示
     */
    formatTime(date) {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    /**
     * 显示/隐藏步骤面板
     */
    toggleStepsPanel() {
        const stepsPanel = document.getElementById('replay-steps-panel');
        if (stepsPanel) {
            if (stepsPanel.style.display === 'none' || !stepsPanel.style.display) {
                this.showStepsPanel();
            } else {
                this.hideStepsPanel();
            }
        }
    }
    
    /**
     * 显示步骤面板
     */
    showStepsPanel() {
        const stepsPanel = document.getElementById('replay-steps-panel');
        if (stepsPanel) {
            stepsPanel.style.display = 'block';
            this.generateStepsList();
        }
    }
    
    /**
     * 隐藏步骤面板
     */
    hideStepsPanel() {
        const stepsPanel = document.getElementById('replay-steps-panel');
        if (stepsPanel) {
            stepsPanel.style.display = 'none';
        }
    }
    
    /**
     * 更新速度按钮状态
     */
    updateSpeedButtons(activeSpeed) {
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
            const speed = parseFloat(btn.dataset.speed);
            if (speed === activeSpeed) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    /**
     * 生成步骤列表（新版本）
     */
    generateStepsList() {
        const stepsContainer = document.getElementById('replay-steps-container');
        if (!stepsContainer) return;
        
        stepsContainer.innerHTML = '';
        
        if (!this.replayData || !this.replayData.moves.length) {
            stepsContainer.innerHTML = '<div class="no-steps">没有可显示的步骤</div>';
            return;
        }
        
        this.replayData.moves.forEach((move, index) => {
            const stepItem = document.createElement('div');
            stepItem.className = 'replay-step-item';
            stepItem.dataset.step = index + 1;
            
            stepItem.innerHTML = `
                <span class="step-num">${index + 1}</span>
                <span class="step-piece ${move.player === 1 ? 'black' : 'white'}">${move.player === 1 ? '●' : '○'}</span>
                <span class="step-pos">(${move.x + 1}, ${move.y + 1})</span>
                <span class="step-timestamp">${this.formatTime(new Date(move.timestamp))}</span>
            `;
            
            // 点击跳转到指定步骤
            stepItem.addEventListener('click', () => {
                this.seekToStep(index + 1);
            });
            
            stepsContainer.appendChild(stepItem);
        });
    }
    
    /**
     * 高亮当前步骤（新版本）
     */
    highlightCurrentStepInList() {
        const stepsContainer = document.getElementById('replay-steps-container');
        if (!stepsContainer) return;
        
        // 移除所有高亮
        const allSteps = stepsContainer.querySelectorAll('.replay-step-item');
        allSteps.forEach(item => item.classList.remove('active'));
        
        // 高亮当前步骤
        if (this.currentStep > 0) {
            const currentStepElement = stepsContainer.querySelector(`[data-step="${this.currentStep}"]`);
            if (currentStepElement) {
                currentStepElement.classList.add('active');
                currentStepElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }
    
    /**
     * 销毁实例，清理资源
     */
    destroy() {
        this.stopPlaying();
        this.replayData = null;
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.GameReplay = GameReplay;
}