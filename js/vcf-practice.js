/**
 * VCF冲四练习管理器
 * 负责管理VCF练习题库、验证玩家走法、提供练习指导
 * 
 * @author 项目团队
 * @version 1.1.0
 * @date 2025
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
            // 入门级练习1：简单横向冲四
            {
                id: 'beginner-01',
                title: '横向突破',
                difficulty: '入门',
                description: '黑先，通过横向连续冲四取胜',
                initialBoard: this.createEmptyBoard([
                    {x: 6, y: 7, player: 1},
                    {x: 7, y: 7, player: 1},
                    {x: 8, y: 7, player: 1},
                    {x: 7, y: 8, player: 2},
                    {x: 6, y: 8, player: 2}
                ]),
                currentPlayer: 1,
                solution: [
                    {x: 9, y: 7, player: 1, type: 'attack', desc: '形成横向冲四'},
                    {x: 5, y: 7, player: 2, type: 'defense', desc: '白方被迫防守'},
                    {x: 5, y: 7, player: 1, type: 'attack', desc: '完成五连获胜'}
                ],
                hints: [
                    '观察黑棋已有的横向三连子，寻找能形成冲四的位置',
                    '恭喜！白方防守后，你可以完成五连',
                    '完美！练习完成'
                ]
            },
            
            // 入门级练习2：斜向冲四
            {
                id: 'beginner-02',
                title: '斜线攻势',
                difficulty: '入门',
                description: '黑先，通过斜向冲四连击制胜',
                initialBoard: this.createEmptyBoard([
                    {x: 6, y: 6, player: 1},
                    {x: 7, y: 7, player: 1},
                    {x: 8, y: 8, player: 1},
                    {x: 7, y: 6, player: 2},
                    {x: 8, y: 7, player: 2}
                ]),
                currentPlayer: 1,
                solution: [
                    {x: 9, y: 9, player: 1, type: 'attack', desc: '形成斜向冲四'},
                    {x: 5, y: 5, player: 2, type: 'defense', desc: '白方防守'},
                    {x: 5, y: 5, player: 1, type: 'attack', desc: '完成五连'}
                ],
                hints: [
                    '注意黑棋的斜线三连，找到能延伸成冲四的点',
                    '很好！继续完成最后一步',
                    '太棒了！VCF练习成功'
                ]
            },
            
            // 中级练习：双向威胁
            {
                id: 'intermediate-01',
                title: '双线夹击',
                difficulty: '中级',
                description: '黑先，利用横纵两个方向的威胁连续冲四获胜',
                initialBoard: this.createEmptyBoard([
                    {x: 7, y: 6, player: 1},
                    {x: 7, y: 7, player: 1},
                    {x: 7, y: 8, player: 1},
                    {x: 6, y: 7, player: 1},
                    {x: 8, y: 6, player: 2},
                    {x: 9, y: 7, player: 2},
                    {x: 6, y: 9, player: 2}
                ]),
                currentPlayer: 1,
                solution: [
                    {x: 7, y: 5, player: 1, type: 'attack', desc: '纵向冲四'},
                    {x: 7, y: 9, player: 2, type: 'defense', desc: '白方防守上方'},
                    {x: 5, y: 7, player: 1, type: 'attack', desc: '横向冲四'},
                    {x: 9, y: 7, player: 2, type: 'defense', desc: '白方防守左侧（已有子，此处为示例）'},
                    {x: 7, y: 9, player: 1, type: 'attack', desc: '再次纵向冲四形成双四必胜'}
                ],
                hints: [
                    '先利用纵向的三连制造第一个冲四威胁',
                    '白方防守后，转向横向进攻',
                    '注意制造多重威胁',
                    '继续保持连续冲四的节奏',
                    '完美执行VCF战术！'
                ]
            },
            
            // 中级练习2：转折攻击
            {
                id: 'intermediate-02',
                title: '灵活转向',
                difficulty: '中级',
                description: '黑先，通过方向转换的连续冲四取胜',
                initialBoard: this.createEmptyBoard([
                    {x: 7, y: 7, player: 1},
                    {x: 8, y: 7, player: 1},
                    {x: 9, y: 7, player: 1},
                    {x: 7, y: 8, player: 1},
                    {x: 7, y: 9, player: 1},
                    {x: 6, y: 7, player: 2},
                    {x: 8, y: 8, player: 2},
                    {x: 9, y: 9, player: 2}
                ]),
                currentPlayer: 1,
                solution: [
                    {x: 10, y: 7, player: 1, type: 'attack', desc: '横向冲四'},
                    {x: 5, y: 7, player: 2, type: 'defense', desc: '白方防守'},
                    {x: 7, y: 6, player: 1, type: 'attack', desc: '转纵向冲四'},
                    {x: 7, y: 10, player: 2, type: 'defense', desc: '白方防守'},
                    {x: 5, y: 7, player: 1, type: 'attack', desc: '回到横向形成五连'}
                ],
                hints: [
                    '从横向的三连开始进攻',
                    '白方防守后，注意纵向也有威胁',
                    '灵活切换进攻方向是VCF的关键',
                    '继续施加压力',
                    '太棒了！成功完成转折攻击'
                ]
            },
            
            // 高级练习：复杂VCF序列
            {
                id: 'advanced-01',
                title: '大师级连杀',
                difficulty: '高级',
                description: '黑先，通过6步以上的VCF序列取胜',
                initialBoard: this.createEmptyBoard([
                    {x: 7, y: 7, player: 1},
                    {x: 8, y: 8, player: 1},
                    {x: 9, y: 9, player: 1},
                    {x: 6, y: 7, player: 1},
                    {x: 7, y: 8, player: 1},
                    {x: 8, y: 6, player: 2},
                    {x: 9, y: 7, player: 2},
                    {x: 10, y: 8, player: 2},
                    {x: 6, y: 9, player: 2}
                ]),
                currentPlayer: 1,
                solution: [
                    {x: 10, y: 10, player: 1, type: 'attack', desc: '斜线冲四'},
                    {x: 5, y: 6, player: 2, type: 'defense', desc: '白方防守'},
                    {x: 5, y: 7, player: 1, type: 'attack', desc: '横向冲四'},
                    {x: 10, y: 7, player: 2, type: 'defense', desc: '白方防守'},
                    {x: 7, y: 9, player: 1, type: 'attack', desc: '纵向冲四'},
                    {x: 7, y: 6, player: 2, type: 'defense', desc: '白方防守'},
                    {x: 5, y: 6, player: 1, type: 'attack', desc: '回到斜线形成五连'}
                ],
                hints: [
                    '从斜线的三连开始，这是关键的第一步',
                    '白方防守后，寻找横向的机会',
                    '继续保持多方向的威胁',
                    '注意每一步都必须是冲四',
                    '快到了，保持冷静',
                    '继续施压',
                    '完美！你已掌握复杂VCF序列'
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
    version: '1.1.0',
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
