/**
 * VCF冲四练习管理器
 * 负责管理VCF练习题库、验证玩家走法、提供练习指导
 * 
 * @author 项目团队
 * @version 1.2.0
 * @date 2025-01-06
 */

class VCFPracticeManager {
    constructor() {
        this.puzzles = this.initializePuzzles();
        this.currentPuzzle = null;
        this.currentStep = 0;
        
        console.log('[VCFPractice] VCF练习管理器已初始化，共', this.puzzles.length, '道练习题');
    }
    
    /**
     * 初始化练习题库
     */
    initializePuzzles() {
        return [
            // 入门级练习1：横向冲四
            {
                id: 'vcf-basic-horizontal',
                title: '横向突破',
                difficulty: '入门',
                description: '黑棋先手，通过横向冲四逼迫白棋防守后顺势五连。',
                initialBoard: this.createEmptyBoard([
                    { x: 6, y: 7, player: 1 },
                    { x: 7, y: 7, player: 1 },
                    { x: 8, y: 7, player: 1 },
                    { x: 6, y: 8, player: 2 },
                    { x: 7, y: 8, player: 2 }
                ]),
                currentPlayer: 1,
                solution: [
                    { x: 9, y: 7, player: 1, type: 'attack', desc: '先在右侧落子，形成横向冲四。' },
                    { x: 5, y: 7, player: 2, type: 'defense', desc: '白棋必须补在左侧防止立即成五。' },
                    { x: 10, y: 7, player: 1, type: 'attack', desc: '再次延伸，完成五连取胜。' }
                ],
                hints: [
                    '横向已有三连，尝试在右侧继续延伸制造冲四。',
                    '白棋封住左侧后，留意另一端仍有空间。',
                    '最后一步直接延伸到右侧，完成五连。'
                ]
            },

            // 入门级练习2：对角冲四
            {
                id: 'vcf-basic-diagonal',
                title: '斜线攻势',
                difficulty: '入门',
                description: '黑棋沿主对角线发动冲四，迫使白棋落在角上防守。',
                initialBoard: this.createEmptyBoard([
                    { x: 6, y: 6, player: 1 },
                    { x: 7, y: 7, player: 1 },
                    { x: 8, y: 8, player: 1 },
                    { x: 7, y: 6, player: 2 },
                    { x: 8, y: 7, player: 2 }
                ]),
                currentPlayer: 1,
                solution: [
                    { x: 9, y: 9, player: 1, type: 'attack', desc: '沿对角线继续延伸，制造冲四。' },
                    { x: 5, y: 5, player: 2, type: 'defense', desc: '白棋只得补在对角线另一端。' },
                    { x: 10, y: 10, player: 1, type: 'attack', desc: '顺势再走一步，完成对角五连。' }
                ],
                hints: [
                    '注意主对角线已经有三子连线，可向右下延伸。',
                    '白棋防守后，对角线另一端仍然空着。',
                    '保持同一条对角线，继续延伸即可五连。'
                ]
            },

            // 中级练习：纵向二次冲四
            {
                id: 'vcf-intermediate-vertical',
                title: '垂直压制',
                difficulty: '中级',
                description: '黑棋利用纵向冲四制造强制节奏，连走两步完成胜利。',
                initialBoard: this.createEmptyBoard([
                    { x: 7, y: 6, player: 1 },
                    { x: 7, y: 7, player: 1 },
                    { x: 7, y: 8, player: 1 },
                    { x: 6, y: 7, player: 2 },
                    { x: 8, y: 7, player: 2 }
                ]),
                currentPlayer: 1,
                solution: [
                    { x: 7, y: 5, player: 1, type: 'attack', desc: '先向上延伸，形成纵向冲四。' },
                    { x: 7, y: 9, player: 2, type: 'defense', desc: '白棋必须挡在下方。' },
                    { x: 7, y: 4, player: 1, type: 'attack', desc: '再向上补点，实现纵向五连。' }
                ],
                hints: [
                    '纵向已有三子连线，先在上方再放一子。',
                    '白棋补在下方后，观察上方是否还有空位。',
                    '继续向上延伸，就能完成五连。'
                ]
            }
        ];
    }
    
    /**
     * 创建空棋盘并放置初始棋子
     */
    createEmptyBoard(pieces = []) {
        const board = Array(15).fill(null).map(() => Array(15).fill(0));
        
        pieces.forEach(piece => {
            if (piece.x >= 0 && piece.x < 15 && piece.y >= 0 && piece.y < 15) {
                board[piece.y][piece.x] = piece.player;
            }
        });
        
        return board;
    }
    
    /**
     * 获取随机练习题
     */
    getRandomPuzzle() {
        const randomIndex = Math.floor(Math.random() * this.puzzles.length);
        this.currentPuzzle = this.puzzles[randomIndex];
        this.currentStep = 0;
        
        console.log('[VCFPractice] 选择练习题:', this.currentPuzzle.title, '(', this.currentPuzzle.difficulty, ')');
        
        return this.currentPuzzle;
    }
    
    /**
     * 获取指定难度的练习题
     */
    getPuzzleByDifficulty(difficulty) {
        const filtered = this.puzzles.filter(p => p.difficulty === difficulty);
        if (filtered.length === 0) {
            return this.getRandomPuzzle();
        }
        
        const randomIndex = Math.floor(Math.random() * filtered.length);
        this.currentPuzzle = filtered[randomIndex];
        this.currentStep = 0;
        
        return this.currentPuzzle;
    }
    
    /**
     * 获取指定ID的练习题
     */
    getPuzzleById(id) {
        const puzzle = this.puzzles.find(p => p.id === id);
        if (puzzle) {
            this.currentPuzzle = puzzle;
            this.currentStep = 0;
            return puzzle;
        }
        return null;
    }
    
    /**
     * 验证玩家落子是否正确
     */
    validateMove(x, y) {
        if (!this.currentPuzzle) {
            return {
                valid: false,
                message: '没有进行中的练习'
            };
        }
        
        if (this.currentStep >= this.currentPuzzle.solution.length) {
            return {
                valid: false,
                message: '练习已完成'
            };
        }
        
        const expectedMove = this.currentPuzzle.solution[this.currentStep];
        
        // 只验证攻击步（玩家的步骤）
        if (expectedMove.type !== 'attack') {
            return {
                valid: false,
                message: '当前不应该由玩家落子'
            };
        }
        
        if (x === expectedMove.x && y === expectedMove.y) {
            console.log('[VCFPractice] 玩家落子正确:', `(${x},${y})`);
            return {
                valid: true,
                message: '正确！' + (expectedMove.desc || ''),
                isComplete: false
            };
        } else {
            const letters = 'ABCDEFGHIJKLMNO';
            const expectedCoord = `${letters[expectedMove.x]}${expectedMove.y + 1}`;
            return {
                valid: false,
                message: `这里不能形成冲四。提示：试试 ${expectedCoord} 位置`,
                expectedX: expectedMove.x,
                expectedY: expectedMove.y
            };
        }
    }
    
    /**
     * 获取下一步AI防守位置
     */
    getNextDefenseMove() {
        if (!this.currentPuzzle) {
            return null;
        }
        
        if (this.currentStep >= this.currentPuzzle.solution.length) {
            return null;
        }
        
        const nextMove = this.currentPuzzle.solution[this.currentStep];
        
        if (nextMove.type === 'defense') {
            return {
                x: nextMove.x,
                y: nextMove.y,
                desc: nextMove.desc
            };
        }
        
        return null;
    }
    
    /**
     * 前进到下一步
     */
    advanceStep(steps = 1) {
        this.currentStep += steps;
        console.log('[VCFPractice] 当前步骤:', this.currentStep, '/', this.currentPuzzle.solution.length);
    }
    
    /**
     * 检查练习是否完成
     */
    isComplete() {
        if (!this.currentPuzzle) {
            return false;
        }
        return this.currentStep >= this.currentPuzzle.solution.length;
    }
    
    /**
     * 获取当前提示
     */
    getCurrentHint() {
        if (!this.currentPuzzle || !this.currentPuzzle.hints) {
            return '继续思考，寻找冲四的位置';
        }
        
        const hintIndex = Math.min(
            Math.floor(this.currentStep / 2), 
            this.currentPuzzle.hints.length - 1
        );
        
        return this.currentPuzzle.hints[hintIndex];
    }
    
    /**
     * 获取进度信息
     */
    getProgress() {
        if (!this.currentPuzzle) {
            return { current: 0, total: 0, percentage: 0 };
        }
        
        // 只计算攻击步骤（玩家的步数）
        const totalAttackSteps = this.currentPuzzle.solution.filter(s => s.type === 'attack').length;
        const currentAttackStep = Math.floor((this.currentStep + 1) / 2);
        
        return {
            current: currentAttackStep,
            total: totalAttackSteps,
            percentage: Math.round((currentAttackStep / totalAttackSteps) * 100)
        };
    }
    
    /**
     * 重置当前练习
     */
    reset() {
        this.currentStep = 0;
        console.log('[VCFPractice] 重置练习');
    }
    
    /**
     * 获取所有练习题列表（用于选择界面）
     */
    getAllPuzzles() {
        return this.puzzles.map(p => ({
            id: p.id,
            title: p.title,
            difficulty: p.difficulty,
            description: p.description
        }));
    }
}

// 模块信息
const VCF_PRACTICE_MODULE_INFO = {
    name: 'VCFPracticeManager',
    version: '1.2.0',
    author: '项目团队',
    dependencies: []
};

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.VCFPracticeManager = Object.assign(VCFPracticeManager, { 
        __moduleInfo: VCF_PRACTICE_MODULE_INFO 
    });
    
    console.log('[VCFPractice] VCF练习模块已加载');
    
    if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('moduleLoaded', {
            detail: VCF_PRACTICE_MODULE_INFO
        }));
    }
}

// 支持模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Object.assign(VCFPracticeManager, { 
        __moduleInfo: VCF_PRACTICE_MODULE_INFO 
    });
}
