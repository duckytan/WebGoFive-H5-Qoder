// 五子棋界面演示脚本 - 用于展示各种界面效果

/**
 * 模块依赖检查工具
 */
const ModuleDependencyChecker = {
    /**
     * 检查所有必需模块是否已加载
     * @param {Array<string>} requiredModules - 必需模块列表
     * @returns {Object} 检查结果
     */
    checkDependencies(requiredModules) {
        if (typeof window === 'undefined') {
            return {
                success: true,
                missing: [],
                loaded: [],
                message: '检测环境未提供 window 对象，跳过依赖检查'
            };
        }
        
        const missing = [];
        const loaded = [];
        
        requiredModules.forEach(moduleName => {
            if (typeof window[moduleName] === 'undefined') {
                missing.push(moduleName);
            } else {
                loaded.push({
                    name: moduleName,
                    info: window[moduleName].__moduleInfo || null
                });
            }
        });
        
        return {
            success: missing.length === 0,
            missing,
            loaded,
            message: missing.length > 0 
                ? `缺少必需模块: ${missing.join(', ')}` 
                : '所有依赖模块已加载'
        };
    },
    
    /**
     * 检查模块版本兼容性
     * @param {string} moduleName - 模块名称
     * @param {string} minVersion - 最低版本要求
     * @returns {boolean} 是否兼容
     */
    checkVersion(moduleName, minVersion) {
        if (typeof window === 'undefined' || typeof window[moduleName] === 'undefined') {
            return false;
        }
        
        const module = window[moduleName];
        if (!module || !module.__moduleInfo) {
            return false;
        }
        
        const currentVersion = module.__moduleInfo.version;
        return this.compareVersion(currentVersion, minVersion) >= 0;
    },
    
    /**
     * 比较版本号
     * @param {string} v1 - 版本1
     * @param {string} v2 - 版本2
     * @returns {number} 1:v1>v2, 0:相等, -1:v1<v2
     */
    compareVersion(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            
            if (p1 > p2) return 1;
            if (p1 < p2) return -1;
        }
        
        return 0;
    },
    
    /**
     * 打印模块依赖信息
     */
    logModuleInfo() {
        console.log('\n=== 模块加载信息 ===');
        
        const moduleNames = ['GameUtils', 'GomokuGame', 'SimpleBoardRenderer', 'GameSaveLoad', 'GameReplay'];
        
        moduleNames.forEach(name => {
            const module = window[name];
            if (module && module.__moduleInfo) {
                const info = module.__moduleInfo;
                console.log(`✅ ${info.name} v${info.version} - 依赖: [${info.dependencies.join(', ') || '无'}]`);
            } else {
                console.log(`❌ ${name} - 未加载或无版本信息`);
            }
        });
        
        console.log('===================\n');
    }
};

const INTERFACE_DEMO_REQUIRED_MODULES = ['GameUtils', 'GomokuGame', 'SimpleBoardRenderer'];
const INTERFACE_DEMO_OPTIONAL_MODULES = ['GameSaveLoad', 'GameReplay', 'VCFPracticeManager'];

class InterfaceDemo {
    constructor() {
        const dependencyCheck = ModuleDependencyChecker.checkDependencies(INTERFACE_DEMO_REQUIRED_MODULES);
        if (!dependencyCheck.success) {
            console.error(`[Demo] ${dependencyCheck.message}`);
            ModuleDependencyChecker.logModuleInfo();
            throw new Error(`InterfaceDemo 初始化失败: ${dependencyCheck.message}`);
        }
        
        INTERFACE_DEMO_OPTIONAL_MODULES.forEach(moduleName => {
            if (typeof window[moduleName] !== 'undefined' && window[moduleName].__moduleInfo) {
                console.log(`[Demo] 可选模块 ${moduleName} v${window[moduleName].__moduleInfo.version} 可用`);
            }
        });
        
        this.currentPlayer = 1; // 1为黑棋，2为白棋
        this.gameMode = 'PvE'; // PvP、PvE、EvE或VCF_PRACTICE
        this.moveCount = 0;
        this.gameTime = 0;
        this.timeInterval = null;
        this.aiThinking = false;
        this.aiTimer = null;
        this.hintResetTimer = null;
        this.eveAutoPlay = false; // EvE模式自动对战标志
        this.lastHintTime = 0; // 上次使用提示的时间
        this.hintCooldown = 3000; // 提示冷却时间（毫秒）
        
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
        
        // VCF练习模式状态
        this.practiceManager = null;
        this.practiceState = {
            active: false,
            currentPuzzle: null,
            stepIndex: 0,
            completed: false
        };
        
        // 模式循环顺序
        this.availableModes = ['PvE', 'PvP', 'EvE'];
        
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
        
        // 设置初始游戏模式
        if (window.game) {
            window.game.setGameMode(this.gameMode);
        }
        
        // 更新初始UI状态
        this.updateModeDisplay();
        
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
        
        // 棋盘点击事件由 board-renderer.js 处理
        // board-renderer 会调用 handleVCFPracticeMove 或 handleMoveResult
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // 功能开关
        this.setupToggleSwitches();
        
        // 获取提示按钮（现在在标题栏）
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.showHint());
        }
        
        // VCF练习按钮
        const vcfRetryBtn = document.getElementById('vcf-practice-retry');
        const vcfNextBtn = document.getElementById('vcf-practice-next');
        const vcfLevelSelect = document.getElementById('vcf-level-select');
        
        if (vcfRetryBtn) {
            vcfRetryBtn.addEventListener('click', () => this.restartVCFPuzzle());
        }
        if (vcfNextBtn) {
            vcfNextBtn.addEventListener('click', () => this.startVCFPractice());
        }
        if (vcfLevelSelect) {
            vcfLevelSelect.addEventListener('change', (e) => {
                const level = parseInt(e.target.value, 10);
                this.startVCFPractice(level);
            });
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
        
        // AI难度选择
        const aiDifficultySelect = document.getElementById('ai-difficulty');
        if (aiDifficultySelect) {
            aiDifficultySelect.addEventListener('change', (e) => {
                this.setAIDifficulty(e.target.value);
            });
            this.setAIDifficulty(aiDifficultySelect.value);
        }
        
        // EvE模式黑方AI难度
        const blackAIDifficultySelect = document.getElementById('black-ai-difficulty');
        if (blackAIDifficultySelect) {
            blackAIDifficultySelect.addEventListener('change', (e) => {
                this.setBlackAIDifficulty(e.target.value);
            });
            this.setBlackAIDifficulty(blackAIDifficultySelect.value);
        }
        
        // EvE模式白方AI难度
        const whiteAIDifficultySelect = document.getElementById('white-ai-difficulty');
        if (whiteAIDifficultySelect) {
            whiteAIDifficultySelect.addEventListener('change', (e) => {
                this.setWhiteAIDifficulty(e.target.value);
            });
            this.setWhiteAIDifficulty(whiteAIDifficultySelect.value);
        }
    }
    
    setAIDifficulty(difficulty) {
        if (window.game) {
            window.game.setAIDifficulty(difficulty);
            this.updateHintMessage(`AI难度已设置为: ${this.getDifficultyLabel(difficulty)}`);
            if (this.gameMode === 'PvE') {
                this.updateGameStatus();
            }
            console.log(`[Demo] AI难度设置为: ${difficulty}`);
        }
    }
    
    setBlackAIDifficulty(difficulty) {
        if (window.game) {
            window.game.setBlackAIDifficulty(difficulty);
            this.updateHintMessage(`黑方AI难度已设置为: ${this.getDifficultyLabel(difficulty)}`);
            if (this.gameMode === 'EvE') {
                this.updateGameStatus();
            }
            console.log(`[Demo] 黑方AI难度设置为: ${difficulty}`);
        }
    }
    
    setWhiteAIDifficulty(difficulty) {
        if (window.game) {
            window.game.setWhiteAIDifficulty(difficulty);
            this.updateHintMessage(`白方AI难度已设置为: ${this.getDifficultyLabel(difficulty)}`);
            if (this.gameMode === 'EvE') {
                this.updateGameStatus();
            }
            console.log(`[Demo] 白方AI难度设置为: ${difficulty}`);
        }
    }
    
    getDifficultyLabel(difficulty) {
        const labels = {
            'BEGINNER': '新手',
            'NORMAL': '正常',
            'HARD': '困难',
            'HELL': '地狱'
        };
        return labels[difficulty] || difficulty;
    }
    
    getAIDifficultyForPlayer(player) {
        if (this.gameMode === 'EvE' && window.game) {
            return player === 1 ? window.game.blackAIDifficulty : window.game.whiteAIDifficulty;
        }
        return window.game?.aiDifficulty || 'NORMAL';
    }
    
    getAIThinkingDuration(difficulty) {
        const level = difficulty || window.game?.aiDifficulty || 'NORMAL';
        const durations = {
            'BEGINNER': 500,
            'NORMAL': 900,
            'HARD': 1400,
            'HELL': 1800
        };
        return durations[level] || 900;
    }
    
    finishAIThinking() {
        this.aiThinking = false;
        const aiThinking = document.getElementById('ai-thinking');
        if (aiThinking) {
            aiThinking.style.display = 'none';
        }
    }
    
    cancelAIThinking() {
        if (this.aiTimer) {
            clearTimeout(this.aiTimer);
            this.aiTimer = null;
        }
        this.finishAIThinking();
    }
    
    canPlacePiece() {
        if (window.game && window.game.gameStatus === 'finished') {
            return false;
        }
        if (this.gameMode === 'EvE') {
            return false;
        }
        if (this.gameMode === 'VCF_PRACTICE') {
            return this.practiceState.active && !this.practiceState.completed;
        }
        if (this.gameMode === 'PvE') {
            if (this.aiThinking) {
                return false;
            }
            if (window.game && window.game.currentPlayer !== 1) {
                return false;
            }
        }
        return true;
    }
    
    startNewGame() {
        this.addButtonClickEffect('new-game-btn');
        this.cancelAIThinking();
        
        if (this.hintResetTimer) {
            clearTimeout(this.hintResetTimer);
            this.hintResetTimer = null;
        }
        
        // VCF练习模式特殊处理
        if (this.gameMode === 'VCF_PRACTICE' && this.practiceManager) {
            this.startVCFPractice();
            return;
        }
        
        // 重置游戏核心
        if (window.game) {
            window.game.reset();
            window.game.setGameMode(this.gameMode);
        }
        
        // 重置本地状态
        this.moveCount = 0;
        this.currentPlayer = 1;
        this.gameTime = 0;
        this.eveAutoPlay = false;
        
        this.updateGameStatus();
        
        if (this.gameMode === 'EvE') {
            this.updateHintMessage('机机对战模式开始！观看AI对决');
        } else {
            this.updateHintMessage('新游戏开始！黑棋先手');
        }
        
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
        
        // EvE模式自动开始AI对战
        if (this.gameMode === 'EvE') {
            this.eveAutoPlay = true;
            this.startEveAutoPlay();
        }
    }
    
    startVCFPractice(level = null) {
        if (!this.practiceManager) {
            this.updateHintMessage('⚠️ VCF练习管理器未加载');
            return;
        }
        
        // 设置Demo的游戏模式
        this.gameMode = 'VCF_PRACTICE';
        
        // 设置目标等级
        if (level === null) {
            level = this.selectedPracticeLevel || this.practiceManager.currentLevel || 1;
        } else {
            this.selectedPracticeLevel = level;
        }
        
        // 开始新练习
        const puzzle = this.practiceManager.startPractice(level);
        
        if (!puzzle) {
            this.updateHintMessage('⚠️ 无法加载练习题');
            return;
        }
        
        this.selectedPracticeLevel = puzzle.level;
        
        this.practiceState = {
            active: true,
            currentPuzzle: puzzle,
            stepIndex: 0,
            completed: false,
            playerMoves: 0
        };
        
        // 加载练习题棋盘
        if (window.game) {
            window.game.loadCustomState({
                board: puzzle.initialBoard,
                currentPlayer: puzzle.currentPlayer,
                gameStatus: 'playing'
            });
            
            // 设置游戏模式为VCF练习
            window.game.setGameMode('VCF_PRACTICE');
            
            // 设置AI为最高难度
            window.game.setAIDifficulty('HELL');
        }
        
        // 渲染棋盘
        if (window.boardRenderer) {
            window.boardRenderer.board = window.game.getBoardState();
            window.boardRenderer.render();
        }
        
        // 同步状态
        const info = window.game?.getGameInfo?.();
        this.moveCount = info?.moveCount || 0;
        this.currentPlayer = info?.currentPlayer || puzzle.currentPlayer;
        this.practiceState.completed = false;
        this.updateGameStatus();
        
        // 更新UI
        this.updateVCFPracticeDisplay();
        
        // 重置按钮状态
        const undoBtn = document.getElementById('undo-btn');
        const saveBtn = document.getElementById('save-game-btn');
        const replayBtn = document.getElementById('replay-btn');
        
        if (undoBtn) undoBtn.disabled = true;
        if (saveBtn) saveBtn.disabled = true;
        if (replayBtn) replayBtn.disabled = true;
        
        const levelName = this.practiceManager.getLevelName(this.practiceManager.currentLevel);
        console.log('[Demo] 开始VCF练习:', puzzle.title, '等级:', levelName);
    }
    
    updateVCFPracticeDisplay() {
        if (!this.practiceState.active || !this.practiceState.currentPuzzle) {
            return;
        }
        
        const puzzle = this.practiceState.currentPuzzle;
        const stats = this.practiceManager.getProgressStats();
        const levelName = this.practiceManager.getLevelName(puzzle.level);
        
        // 更新练习信息面板
        const titleEl = document.getElementById('vcf-practice-title');
        const difficultyEl = document.getElementById('vcf-practice-difficulty');
        const descEl = document.getElementById('vcf-practice-desc');
        const progressEl = document.getElementById('vcf-practice-progress');
        const hintEl = document.getElementById('vcf-practice-hint');
        const bestEl = document.getElementById('vcf-practice-best');
        const levelSelectEl = document.getElementById('vcf-level-select');
        
        if (titleEl) titleEl.textContent = puzzle.title;
        if (difficultyEl) {
            const difficultyClassMap = {
                '入门': 'beginner',
                '初级': 'intermediate',
                '中级': 'advanced',
                '高级': 'expert'
            };
            const difficultyClass = difficultyClassMap[levelName] || 'normal';
            difficultyEl.textContent = levelName;
            difficultyEl.className = `vcf-difficulty vcf-difficulty--${difficultyClass}`;
        }
        if (descEl) descEl.textContent = puzzle.description;
        if (progressEl) {
            const levelProgress = stats.levelProgress[puzzle.level - 1] || 0;
            const levelTotal = stats.levelTotals?.[puzzle.level - 1] || 10;
            progressEl.textContent = `等级${puzzle.level} · 已完成${levelProgress}/${levelTotal}题 · 连胜${stats.currentStreak}题`;
        }
        if (hintEl) {
            hintEl.textContent = `目标：在${puzzle.maxMoves}步内获胜 · AI防守：地狱级`;
        }
        if (bestEl) {
            const puzzleId = puzzle.id;
            const bestTime = this.practiceManager.progress.bestTimes[puzzleId];
            if (bestTime) {
                bestEl.textContent = `历史最快：${this.formatTime(bestTime)}`;
                bestEl.style.color = '#4caf50';
            } else {
                bestEl.textContent = '历史最快：未记录';
                bestEl.style.color = '#757575';
            }
        }
        if (levelSelectEl) {
            levelSelectEl.value = puzzle.level.toString();
        }
        
        // 更新主状态显示
        this.updateHintMessage(`📚 ${levelName}练习：${puzzle.title} - ${puzzle.description}`);
    }
    
    handleVCFPracticeMove(x, y) {
        if (!this.practiceState.active || !this.practiceManager) {
            return;
        }
        
        if (!window.game) {
            this.updateHintMessage('⚠️ 游戏核心未加载，无法落子');
            return;
        }
        
        // 检查是否轮到玩家
        if (window.game.currentPlayer !== this.practiceState.currentPuzzle.currentPlayer && this.practiceState.playerMoves === 0) {
            this.updateHintMessage('⚠️ 当前不是玩家回合');
            return;
        }
        
        const result = window.game.placePiece(x, y);
        
        if (!result.success) {
            this.updateHintMessage(`⚠️ 落子失败: ${result.error}`);
            return;
        }
        
        // 更新渲染
        if (window.boardRenderer) {
            window.boardRenderer.board = window.game.getBoardState();
            window.boardRenderer.render();
        }
        
        this.practiceState.playerMoves++;
        this.updateGameStatus();
        this.updateVCFPracticeDisplay();
        
        // 检查玩家是否获胜
        if (result.gameOver && result.winner === this.practiceState.currentPuzzle.currentPlayer) {
            this.finishVCFPractice(true, result);
            return;
        }
        
        // 检查步数上限
        if (this.practiceState.playerMoves >= this.practiceState.currentPuzzle.maxMoves) {
            this.finishVCFPractice(false, result);
            return;
        }
        
        // AI防守
        setTimeout(() => {
            this.executeVCFAIDefense();
        }, 400);
    }
    
    executeVCFAIDefense() {
        if (!window.game || window.game.gameStatus === 'finished') {
            return;
        }
        
        const aiMove = window.game.getAIMove();
        
        if (!aiMove) {
            console.warn('[Demo] VCF练习AI未找到防守落点');
            return;
        }
        
        const defenseResult = window.game.placePiece(aiMove.x, aiMove.y);
        
        if (!defenseResult.success) {
            console.warn('[Demo] VCF练习AI落子失败:', defenseResult.error);
            return;
        }
        
        if (window.boardRenderer) {
            window.boardRenderer.board = window.game.getBoardState();
            window.boardRenderer.render();
        }
        
        this.updateGameStatus();
        this.updateVCFPracticeDisplay();
        
        if (defenseResult.gameOver && defenseResult.winner !== this.practiceState.currentPuzzle.currentPlayer) {
            this.finishVCFPractice(false, defenseResult);
        }
    }
    
    finishVCFPractice(isWin, result) {
        const puzzle = this.practiceState.currentPuzzle;
        const summary = this.practiceManager.completePractice(isWin);
        this.practiceState.completed = true;
        
        if (!summary.success) {
            this.updateHintMessage(summary.message || '练习结束');
            
            // 即使失败也显示结果模态框
            setTimeout(() => {
                const modal = document.getElementById('game-result-modal');
                const resultIcon = document.getElementById('result-icon');
                const resultTitle = document.getElementById('result-title');
                const resultMessage = document.getElementById('result-message');
                const finalTimeEl = document.getElementById('final-time');
                const finalMovesEl = document.getElementById('final-moves');
                const bestRecordEl = document.getElementById('vcf-best-record');
                const bestRecordContainer = document.getElementById('vcf-best-record-container');
                
                if (resultIcon) {
                    resultIcon.textContent = '😐';
                    resultIcon.className = 'result-icon draw';
                }
                if (resultTitle) {
                    resultTitle.textContent = '练习失败';
                }
                if (resultMessage) {
                    resultMessage.textContent = 'AI防守成功，继续尝试其他战术吧';
                }
                if (finalTimeEl) {
                    finalTimeEl.textContent = '未完成';
                }
                if (finalMovesEl) {
                    finalMovesEl.textContent = `${this.practiceState.playerMoves}回合`;
                }
                if (bestRecordContainer) {
                    bestRecordContainer.style.display = 'none';
                }
                
                this.showModal('game-result-modal');
            }, 600);
            
            return;
        }
        
        const finalTime = summary.elapsedTime || 0;
        const formattedTime = this.formatTime(finalTime);
        const bestTime = summary.bestTime ? this.formatTime(summary.bestTime) : '未记录';
        
        const levelName = this.practiceManager.getLevelName(puzzle.level);
        
        if (isWin) {
            const recordText = summary.isNewRecord ? '✨ 新纪录！' : `历史最佳：${bestTime}`;
            const levelUpText = summary.shouldLevelUp ? ` 🎉 已自动升级到${this.practiceManager.getLevelName(summary.newLevel)}等级！` : '';
            this.updateHintMessage(`🎉 恭喜通关！用时 ${formattedTime} · ${recordText}${levelUpText}`);
        } else {
            this.updateHintMessage('❌ 挑战失败，尝试寻找更优的冲四路径');
        }
        
        if (summary.shouldLevelUp && summary.newLevel) {
            this.selectedPracticeLevel = summary.newLevel;
            const levelSelect = document.getElementById('vcf-level-select');
            if (levelSelect) {
                levelSelect.value = summary.newLevel.toString();
            }
        }
        
        // 更新面板显示记录
        this.updateVCFPracticeDisplay();
        
        // 显示结果模态框
        setTimeout(() => {
            const modal = document.getElementById('game-result-modal');
            const resultIcon = document.getElementById('result-icon');
            const resultTitle = document.getElementById('result-title');
            const resultMessage = document.getElementById('result-message');
            const finalTimeEl = document.getElementById('final-time');
            const finalMovesEl = document.getElementById('final-moves');
            const bestRecordEl = document.getElementById('vcf-best-record');
            const bestRecordContainer = document.getElementById('vcf-best-record-container');
            
            if (resultIcon) {
                resultIcon.textContent = isWin ? '🏆' : '😐';
                resultIcon.className = `result-icon ${isWin ? 'winner' : 'draw'}`;
            }
            if (resultTitle) {
                resultTitle.textContent = isWin ? '练习成功！' : '练习结束';
            }
            if (resultMessage) {
                resultMessage.textContent = isWin 
                    ? `${levelName} · ${puzzle.title} 通关！AI防守等级：地狱`
                    : 'AI防守成功，继续尝试其他战术吧';
            }
            if (finalTimeEl) {
                finalTimeEl.textContent = formattedTime;
            }
            if (finalMovesEl) {
                finalMovesEl.textContent = `${this.practiceState.playerMoves}回合`;
            }
            if (bestRecordEl) {
                bestRecordEl.textContent = `历史最快：${summary.bestTime ? this.formatTime(summary.bestTime) : '未记录'}`;
                if (bestRecordContainer) {
                    bestRecordContainer.style.display = 'flex';
                }
            }
            
            // 如果是新纪录，显示特效
            if (isWin && summary.isNewRecord && bestRecordContainer) {
                bestRecordContainer.style.animation = 'pulse 0.6s ease-in-out';
            }
            
            this.showModal('game-result-modal');
        }, 600);
        
        console.log('[Demo] VCF练习结束', { isWin, summary });
    }
    
    restartVCFPuzzle() {
        if (!this.practiceState.currentPuzzle) {
            this.startVCFPractice();
            return;
        }
        
        this.startVCFPractice(this.practiceState.currentPuzzle.level);
        console.log('[Demo] 重新开始当前练习题');
    }
    
    startEveAutoPlay() {
        if (!this.eveAutoPlay) {
            return;
        }
        this.cancelAIThinking();
        setTimeout(() => {
            if (this.eveAutoPlay && this.gameMode === 'EvE' && window.game && window.game.gameStatus !== 'finished') {
                this.simulateAIThinking();
            }
        }, 800);
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
        
        if (this.hintResetTimer) {
            clearTimeout(this.hintResetTimer);
            this.hintResetTimer = null;
        }
        
        if (window.boardRenderer && typeof window.boardRenderer.clearHintHighlight === 'function') {
            window.boardRenderer.clearHintHighlight(false);
        }
        
        // 启用悔棋按钮
        const undoBtn = document.getElementById('undo-btn');
        const saveBtn = document.getElementById('save-game-btn');
        const replayBtn = document.getElementById('replay-btn');
        
        if (undoBtn) undoBtn.disabled = this.gameMode === 'EvE';
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
        
        // 如果游戏结束，停止EvE自动对战
        if (result.gameOver && this.gameMode === 'EvE') {
            this.eveAutoPlay = false;
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
        
        // 根据是否有VCF管理器决定模式列表
        const modes = this.practiceManager ? ['PvE', 'PvP', 'EvE', 'VCF_PRACTICE'] : ['PvE', 'PvP', 'EvE'];
        const currentIndex = modes.indexOf(this.gameMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.gameMode = modes[nextIndex];
        
        // 同步到游戏核心
        if (window.game) {
            window.game.setGameMode(this.gameMode);
        }
        
        // 取消特殊状态
        if (this.gameMode !== 'EvE') {
            this.eveAutoPlay = false;
            this.cancelAIThinking();
        }
        if (this.gameMode !== 'VCF_PRACTICE') {
            this.practiceState.active = false;
        }
        
        // 如果切换到VCF练习模式，自动开始新的练习题
        if (this.gameMode === 'VCF_PRACTICE' && this.practiceManager) {
            this.updateModeDisplay();
            this.updateHintMessage('已切换到冲四练习（VCF）模式，正在加载题目...');
            console.log('[Demo] 切换到VCF_PRACTICE模式，自动开始练习');
            this.startVCFPractice();
            return;
        }
        
        this.updateModeDisplay();
        
        const modeNames = {
            'PvP': '双人对战',
            'PvE': '人机对战',
            'EvE': '机机对战',
            'VCF_PRACTICE': '冲四练习（VCF）'
        };
        this.updateHintMessage(`已切换到${modeNames[this.gameMode]}模式`);
        console.log(`[Demo] 切换到${this.gameMode}模式`);
    }
    
    updateModeDisplay() {
        const modeToggleText = document.getElementById('mode-toggle-text');
        const aiControls = document.getElementById('ai-controls');
        const pveSetting = document.getElementById('pve-ai-setting');
        const eveSettings = document.getElementById('eve-ai-settings');
        const practicePanel = document.getElementById('vcf-practice-panel');
        
        const modes = this.practiceManager ? ['PvE', 'PvP', 'EvE', 'VCF_PRACTICE'] : ['PvE', 'PvP', 'EvE'];
        const modeLabels = {
            'PvP': '双人对战',
            'PvE': '人机对战',
            'EvE': '机机对战',
            'VCF_PRACTICE': '冲四练习（VCF）'
        };
        const currentIndex = modes.indexOf(this.gameMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        if (modeToggleText) {
            modeToggleText.textContent = `切换到${modeLabels[nextMode]}`;
        }
        
        if (aiControls) {
            aiControls.style.display = (this.gameMode === 'PvP' || this.gameMode === 'VCF_PRACTICE') ? 'none' : 'block';
        }
        if (pveSetting) {
            pveSetting.style.display = this.gameMode === 'PvE' ? 'block' : 'none';
        }
        if (eveSettings) {
            eveSettings.style.display = this.gameMode === 'EvE' ? 'grid' : 'none';
        }
        if (practicePanel) {
            practicePanel.style.display = this.gameMode === 'VCF_PRACTICE' ? 'block' : 'none';
        }
        
        this.updateGameStatus();
    }
    
    showHint() {
        this.addButtonClickEffect('hint-btn');
        
        const now = Date.now();
        const cooldownRemaining = this.hintCooldown - (now - this.lastHintTime);
        
        if (cooldownRemaining > 0) {
            const seconds = Math.ceil(cooldownRemaining / 1000);
            this.updateHintMessage(`⏰ 提示冷却中，请等待 ${seconds} 秒`);
            console.warn(`[Demo] 提示冷却中，剩余 ${seconds} 秒`);
            return;
        }
        
        if (!window.game) {
            this.updateHintMessage('⚠️ 游戏核心未加载，无法提供提示');
            console.error('[Demo] 游戏核心未加载，无法获取AI建议');
            return;
        }
        
        if (typeof window.game.getGameInfo === 'function') {
            const info = window.game.getGameInfo();
            this.currentPlayer = info.currentPlayer;
        }
        
        if (window.game.gameStatus === 'finished') {
            this.updateHintMessage('⚠️ 游戏已结束，无法获取提示');
            console.warn('[Demo] 游戏已结束，无法获取提示');
            return;
        }
        
        if (this.gameMode === 'EvE') {
            this.updateHintMessage('⚠️ 机机对战模式，无需获取提示');
            console.warn('[Demo] EvE模式，无需提示');
            return;
        }
        
        if (this.gameMode === 'PvE') {
            if (this.aiThinking) {
                this.updateHintMessage('⌛ AI正在思考，请稍候');
                console.warn('[Demo] AI正在思考，暂不提供提示');
                return;
            }
            if (window.game.currentPlayer === 2) {
                this.updateHintMessage('⚠️ 当前为AI回合，无需提示');
                console.warn('[Demo] 当前为AI回合，无需提示');
                return;
            }
        }
        
        this.lastHintTime = now;
        
        console.log('[Demo] 正在获取AI建议...');
        const aiMove = window.game.getAIMove();
        
        if (!aiMove) {
            this.updateHintMessage('⚠️ 暂时没有可用的AI建议');
            console.warn('[Demo] AI无法找到有效建议位置');
            return;
        }
        
        const coordinate = this.formatBoardCoordinate(aiMove.x, aiMove.y);
        const message = `💡 AI建议: 尝试在 ${coordinate} 落子`;
        this.updateHintMessage(message);
        
        const hintMessage = document.getElementById('hint-message');
        if (hintMessage) {
            hintMessage.style.background = 'linear-gradient(135deg, #e8f5e8 0%, #fff 100%)';
            hintMessage.style.borderColor = '#4caf50';
        }
        
        if (window.boardRenderer && typeof window.boardRenderer.highlightHintPosition === 'function') {
            window.boardRenderer.highlightHintPosition(aiMove.x, aiMove.y, { duration: 5000 });
        }
        
        if (this.hintResetTimer) {
            clearTimeout(this.hintResetTimer);
        }
        
        this.hintResetTimer = setTimeout(() => {
            this.hintResetTimer = null;
            this.updateHintMessage('点击棋盘继续游戏');
            const hintEl = document.getElementById('hint-message');
            if (hintEl) {
                hintEl.style.background = 'white';
                hintEl.style.borderColor = '#ccc';
            }
            if (window.boardRenderer && typeof window.boardRenderer.clearHintHighlight === 'function') {
                window.boardRenderer.clearHintHighlight();
            }
        }, 5000);
        
        console.log(`[Demo] AI建议位置: (${aiMove.x}, ${aiMove.y}) = ${coordinate}`);
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
        if (this.aiThinking) {
            console.warn('[Demo] AI正在思考中，请勿重复调用');
            return;
        }
        
        this.aiThinking = true;
        const aiThinking = document.getElementById('ai-thinking');
        if (aiThinking) {
            aiThinking.style.display = 'block';
        }
        
        const currentPlayer = window.game?.currentPlayer || 2;
        const thinkerLabel = this.gameMode === 'EvE' ? (currentPlayer === 1 ? '黑方AI' : '白方AI') : 'AI';
        this.updateHintMessage(`${thinkerLabel}思考中...`);
        console.log(`[Demo] ${thinkerLabel}开始思考...`);
        
        // 模拟AI思考时间（根据难度调整）
        const difficulty = this.getAIDifficultyForPlayer(currentPlayer);
        const thinkingTime = this.getAIThinkingDuration(difficulty);
        
        this.aiTimer = setTimeout(() => {
            if (!window.game) {
                console.error('[Demo] 游戏核心未加载');
                this.aiThinking = false;
                if (aiThinking) {
                    aiThinking.style.display = 'none';
                }
                return;
            }
            
            // 获取AI落子位置
            const aiMove = window.game.getAIMove();
            
            if (!aiMove) {
                console.error('[Demo] AI无法找到有效落子位置');
                this.aiThinking = false;
                if (aiThinking) {
                    aiThinking.style.display = 'none';
                }
                this.updateHintMessage('AI无法落子，游戏可能已结束');
                return;
            }
            
            console.log(`[Demo] AI选择落子位置: (${aiMove.x}, ${aiMove.y})`);
            
            // 执行AI落子
            const result = window.game.placePiece(aiMove.x, aiMove.y);
            
            if (result.success) {
                // 更新棋盘渲染
                if (window.boardRenderer) {
                    window.boardRenderer.board = window.game.getBoardState();
                    window.boardRenderer.render();
                }
                
                // 更新界面状态
                const gameInfo = window.game.getGameInfo();
                this.moveCount = gameInfo.moveCount;
                this.currentPlayer = gameInfo.currentPlayer;
                this.updateGameStatus();
                
                // 启用按钮
                const undoBtn = document.getElementById('undo-btn');
                const saveBtn = document.getElementById('save-game-btn');
                const replayBtn = document.getElementById('replay-btn');
                
                if (undoBtn) undoBtn.disabled = this.gameMode === 'EvE';
                if (saveBtn) saveBtn.disabled = false;
                if (replayBtn) replayBtn.disabled = false;
                
                // 自动保存
                if (this.gameSaveLoad && this.gameSaveLoad.autoSaveEnabled) {
                    this.gameSaveLoad.autoSaveToLocal();
                }
                
                // 处理游戏结束
                if (result.gameOver) {
                    if (this.gameSaveLoad) {
                        this.gameSaveLoad.clearAutoSave();
                    }
                    if (window.boardRenderer) {
                        window.boardRenderer.handleGameOver(result);
                    }
                } else {
                    if (this.gameMode === 'EvE') {
                        const nextPlayer = this.currentPlayer === 1 ? '黑方AI' : '白方AI';
                        this.updateHintMessage(`AI已落子，轮到${nextPlayer}`);
                        
                        if (this.eveAutoPlay) {
                            setTimeout(() => {
                                if (this.eveAutoPlay && window.game && window.game.gameStatus !== 'finished') {
                                    this.simulateAIThinking();
                                }
                            }, 300);
                        }
                    } else {
                        this.updateHintMessage('AI已落子，轮到您了');
                    }
                }
                
                console.log('[Demo] AI落子完成');
            } else {
                console.error('[Demo] AI落子失败:', result.error);
                this.updateHintMessage('AI落子失败');
            }
            
            // 恢复状态
            this.aiThinking = false;
            if (aiThinking) {
                aiThinking.style.display = 'none';
            }
        }, thinkingTime);
    }
    
    showGameResult(result) {
        const modal = document.getElementById('game-result-modal');
        const resultIcon = document.getElementById('result-icon');
        const resultTitle = document.getElementById('result-title');
        const resultMessage = document.getElementById('result-message');
        const finalTime = document.getElementById('final-time');
        const finalMoves = document.getElementById('final-moves');
        const bestRecordContainer = document.getElementById('vcf-best-record-container');
        const bestRecordValue = document.getElementById('vcf-best-record');
        
        if (bestRecordContainer) {
            bestRecordContainer.style.display = 'none';
        }
        if (bestRecordValue) {
            bestRecordValue.textContent = '历史最快: 未记录';
        }
        
        if (window.game) {
            const info = window.game.getGameInfo();
            this.gameTime = Math.floor(info.duration / 1000);
            this.moveCount = info.moveCount;
        }
        
        // 兼容旧的字符串参数和新的对象参数
        let winner;
        if (typeof result === 'object' && result.winner !== undefined) {
            winner = result.winner;
        } else if (result === 'win') {
            winner = 1;
        } else if (result === 'lose') {
            winner = 2;
        } else if (result === 'draw') {
            winner = 0;
        }
        
        // 根据获胜者显示不同的信息
        if (winner === 0) {
            // 平局
            if (resultIcon) {
                resultIcon.textContent = '🤝';
                resultIcon.className = 'result-icon draw';
            }
            if (resultTitle) resultTitle.textContent = '平局';
            if (resultMessage) resultMessage.textContent = '双方势均力敌，棋局以平局结束';
        } else if (winner === 1) {
            // 黑棋获胜
            if (resultIcon) {
                resultIcon.textContent = '🎉';
                resultIcon.className = 'result-icon winner';
            }
            if (resultTitle) resultTitle.textContent = '黑棋获胜！';
            if (resultMessage) {
                if (this.gameMode === 'PvE') {
                    resultMessage.textContent = '恭喜，你赢了！';
                } else if (this.gameMode === 'EvE') {
                    const blackDiff = window.game?.blackAIDifficulty || 'NORMAL';
                    resultMessage.textContent = `黑方AI（${this.getDifficultyLabel(blackDiff)}）获得胜利！`;
                } else {
                    resultMessage.textContent = '黑棋五子连珠，赢得了这局游戏！';
                }
            }
        } else if (winner === 2) {
            // 白棋获胜
            if (resultIcon) {
                resultIcon.textContent = this.gameMode === 'PvE' ? '😔' : '🎉';
                resultIcon.className = this.gameMode === 'PvE' ? 'result-icon loser' : 'result-icon winner';
            }
            if (resultTitle) {
                resultTitle.textContent = this.gameMode === 'PvE' ? 'AI获胜！' : '白棋获胜！';
            }
            if (resultMessage) {
                if (this.gameMode === 'PvE') {
                    resultMessage.textContent = '很遗憾，AI赢了这局，再接再厉！';
                } else if (this.gameMode === 'EvE') {
                    const whiteDiff = window.game?.whiteAIDifficulty || 'NORMAL';
                    resultMessage.textContent = `白方AI（${this.getDifficultyLabel(whiteDiff)}）获得胜利！`;
                } else {
                    resultMessage.textContent = '白棋五子连珠，赢得了这局游戏！';
                }
            }
        }
        
        if (finalTime) finalTime.textContent = this.formatTime(this.gameTime);
        if (finalMoves) finalMoves.textContent = `${this.moveCount}回合`;
        
        this.showModal('game-result-modal');
        console.log(`[Demo] 显示游戏结果: 获胜者=${winner}`);
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
        const gameModeDisplay = document.getElementById('game-mode');
        
        if (playerPiece) {
            playerPiece.className = `piece piece--${this.currentPlayer === 1 ? 'black' : 'white'}`;
        }
        
        if (playerName) {
            if (this.gameMode === 'EvE') {
                playerName.textContent = this.currentPlayer === 1 ? '黑方AI' : '白方AI';
            } else {
                playerName.textContent = this.currentPlayer === 1 ? '黑棋' : '白棋';
            }
        }
        
        if (moveCountDisplay) {
            moveCountDisplay.textContent = `第${this.moveCount + 1}回合`;
        }
        
        if (gameModeDisplay) {
            if (this.gameMode === 'PvE') {
                const difficulty = window.game?.aiDifficulty || 'NORMAL';
                const difficultyLabel = this.getDifficultyLabel(difficulty);
                gameModeDisplay.textContent = `人机对战 (${difficultyLabel})`;
            } else if (this.gameMode === 'EvE') {
                const blackDiff = window.game?.blackAIDifficulty || 'NORMAL';
                const whiteDiff = window.game?.whiteAIDifficulty || 'NORMAL';
                const blackLabel = this.getDifficultyLabel(blackDiff);
                const whiteLabel = this.getDifficultyLabel(whiteDiff);
                gameModeDisplay.textContent = `机机对战 (黑:${blackLabel} vs 白:${whiteLabel})`;
            } else if (this.gameMode === 'VCF_PRACTICE' && this.practiceState.active && this.practiceState.currentPuzzle) {
                const puzzle = this.practiceState.currentPuzzle;
                const totalSteps = puzzle.maxMoves || 1;
                const stepsTaken = Math.min(this.practiceState.playerMoves || 0, totalSteps);
                const isCompleted = !!this.practiceState.completed;
                const currentStep = isCompleted ? totalSteps : Math.max(1, Math.min(stepsTaken + 1, totalSteps));
                const levelName = this.practiceManager?.getLevelName?.(puzzle.level) || '入门';
                gameModeDisplay.textContent = `冲四练习 (${levelName} · ${currentStep}/${totalSteps}步)`;
            } else if (this.gameMode === 'VCF_PRACTICE') {
                gameModeDisplay.textContent = '冲四练习（VCF）';
            } else {
                gameModeDisplay.textContent = '双人对战';
            }
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
        
        // 初始化VCF练习管理器
        if (typeof VCFPracticeManager !== 'undefined') {
            this.practiceManager = new VCFPracticeManager();
            console.log('VCF练习管理器已初始化');
        } else {
            console.warn('VCFPracticeManager模块未加载');
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

const INTERFACE_DEMO_MODULE_INFO = {
    name: 'InterfaceDemo',
    version: '1.2.0',
    author: '项目团队',
    dependencies: INTERFACE_DEMO_REQUIRED_MODULES
};

if (typeof window !== 'undefined') {
    window.InterfaceDemo = Object.assign(InterfaceDemo, {
        __moduleInfo: INTERFACE_DEMO_MODULE_INFO,
        __requiredModules: INTERFACE_DEMO_REQUIRED_MODULES,
        __optionalModules: INTERFACE_DEMO_OPTIONAL_MODULES
    });
    window.ModuleDependencyChecker = ModuleDependencyChecker;
    
    if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('moduleLoaded', {
            detail: INTERFACE_DEMO_MODULE_INFO
        }));
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Object.assign(InterfaceDemo, {
        __moduleInfo: INTERFACE_DEMO_MODULE_INFO,
        __requiredModules: INTERFACE_DEMO_REQUIRED_MODULES,
        __optionalModules: INTERFACE_DEMO_OPTIONAL_MODULES
    });
    module.exports.ModuleDependencyChecker = ModuleDependencyChecker;
}

// 页面加载完成后初始化演示
document.addEventListener('DOMContentLoaded', () => {
    const dependencyCheck = ModuleDependencyChecker.checkDependencies(INTERFACE_DEMO_REQUIRED_MODULES);
    if (!dependencyCheck.success) {
        console.error(`[Demo] 初始化失败: ${dependencyCheck.message}`);
        ModuleDependencyChecker.logModuleInfo();
        return;
    }
    
    console.log('[Demo] 五子棋界面演示初始化...');
    window.demo = new window.InterfaceDemo();
    
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