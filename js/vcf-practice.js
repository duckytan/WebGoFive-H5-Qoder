/**
 * VCF冲四练习管理器 (v2.0)
 * 负责管理VCF练习题库、验证玩家走法、提供练习指导
 * 
 * @author 项目团队
 * @version 2.0.0
 * @date 2025-01-07
 * 
 * 主要功能：
 * - 4个难度等级，每个等级50道题
 * - 自由下棋模式（不限定固定路径）
 * - AI最高难度防守（HELL模式）
 * - 最佳时间记录系统
 * - 自动升级机制（每完成5题自动进入下一难度）
 */

class VCFPracticeManager {
    constructor() {
        this.puzzles = this.initializePuzzles();
        this.currentPuzzle = null;
        this.currentLevel = 1;
        this.practiceTimer = null;
        this.startTime = null;
        
        // 从本地存储加载进度
        this.progress = this.loadProgress();
        
        console.log('[VCFPractice] VCF练习管理器v2.0已初始化，共', this.puzzles.length, '道练习题');
        console.log('[VCFPractice] 当前进度:', this.progress);
    }
    
    /**
     * 初始化练习题库 - 4个等级，每个等级50道题
     */
    initializePuzzles() {
        const puzzles = [];
        
        // 等级1：入门级（1-3步获胜）
        puzzles.push(...this.generateLevel1Puzzles());
        
        // 等级2：初级（3-5步获胜）
        puzzles.push(...this.generateLevel2Puzzles());
        
        // 等级3：中级（5-7步获胜）
        puzzles.push(...this.generateLevel3Puzzles());
        
        // 等级4：高级（7+步获胜）
        puzzles.push(...this.generateLevel4Puzzles());
        
        return puzzles;
    }
    
    /**
     * 生成等级1题库（入门级）
     * 1-3步获胜，棋形简单直接
     */
    generateLevel1Puzzles() {
        const puzzles = [];
        const basePatterns = [
            // 横向冲四系列
            { pieces: [[6,7,1],[7,7,1],[8,7,1],[6,8,2],[7,8,2]], desc: '横向连三，一步冲四后直接获胜' },
            { pieces: [[5,7,1],[6,7,1],[8,7,1],[5,8,2],[6,8,2]], desc: '横向跳三，填补后冲四获胜' },
            { pieces: [[6,6,1],[7,7,1],[8,8,1],[7,6,2],[8,7,2]], desc: '对角连三，延伸后冲四获胜' },
            { pieces: [[7,5,1],[7,6,1],[7,7,1],[8,5,2],[8,6,2]], desc: '纵向连三，延伸后冲四获胜' },
            { pieces: [[5,7,1],[6,7,1],[7,7,1],[9,7,1],[5,8,2]], desc: '横向四子冲四，两端都能获胜' },
            
            // 纵向冲四系列
            { pieces: [[7,5,1],[7,6,1],[7,8,1],[8,5,2],[8,6,2]], desc: '纵向跳三，填补后冲四获胜' },
            { pieces: [[7,4,1],[7,5,1],[7,6,1],[8,4,2],[8,5,2]], desc: '纵向连三，向上冲四获胜' },
            { pieces: [[7,6,1],[7,7,1],[7,8,1],[8,7,2],[8,8,2]], desc: '纵向连三，向下冲四获胜' },
            { pieces: [[7,5,1],[7,6,1],[7,7,1],[7,9,1],[8,6,2]], desc: '纵向四子跳一，两端冲四' },
            { pieces: [[7,4,1],[7,6,1],[7,7,1],[7,8,1],[8,5,2]], desc: '纵向跳四，填补中间获胜' },
            
            // 斜向冲四系列
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[6,5,2],[7,6,2]], desc: '主对角连三，延伸冲四获胜' },
            { pieces: [[6,6,1],[7,7,1],[9,9,1],[6,7,2],[7,8,2]], desc: '主对角跳三，填补后获胜' },
            { pieces: [[9,5,1],[8,6,1],[7,7,1],[9,6,2],[8,7,2]], desc: '副对角连三，延伸冲四获胜' },
            { pieces: [[10,4,1],[9,5,1],[7,7,1],[9,6,2],[8,7,2]], desc: '副对角跳三，填补后获胜' },
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[8,8,1],[6,5,2]], desc: '主对角四子，两端冲四' },
            
            // 简单组合
            { pieces: [[6,7,1],[7,7,1],[8,7,1],[7,6,1],[6,8,2],[7,8,2]], desc: 'T型连四，多方向威胁' },
            { pieces: [[7,6,1],[7,7,1],[7,8,1],[8,7,1],[6,7,2],[8,6,2]], desc: '十字连四，双向威胁' },
            { pieces: [[6,6,1],[7,7,1],[8,8,1],[7,6,1],[7,8,2],[8,7,2]], desc: '斜线与横线组合' },
            { pieces: [[6,7,1],[7,6,1],[7,7,1],[7,8,1],[8,7,2],[6,8,2]], desc: '多方向连四组合' },
            { pieces: [[7,5,1],[7,6,1],[7,7,1],[8,7,1],[8,6,2],[6,7,2]], desc: 'L型连四，角度攻击' },
        ];
        
        // 基于基础模式生成50道题
        for (let i = 0; i < 50; i++) {
            const patternIndex = i % basePatterns.length;
            const pattern = basePatterns[patternIndex];
            const variation = Math.floor(i / basePatterns.length);
            
            // 添加位置偏移变化
            const offsetX = (variation % 3) - 1;
            const offsetY = Math.floor(variation / 3) - 1;
            
            const pieces = pattern.pieces.map(([x, y, player]) => ({
                x: x + offsetX,
                y: y + offsetY,
                player
            }));
            
            puzzles.push({
                id: `vcf-level1-${String(i + 1).padStart(3, '0')}`,
                level: 1,
                title: `入门第${i + 1}题`,
                description: pattern.desc,
                initialBoard: this.createEmptyBoard(pieces),
                currentPlayer: 1,
                minMoves: 3,
                maxMoves: 10,
                tags: ['入门', '冲四', '基础']
            });
        }
        
        return puzzles;
    }
    
    /**
     * 生成等级2题库（初级）
     * 3-5步获胜，需要简单组合
     */
    generateLevel2Puzzles() {
        const puzzles = [];
        const basePatterns = [
            // 双方向冲四
            { pieces: [[6,7,1],[7,7,1],[8,7,1],[7,6,1],[6,8,2],[8,6,2],[9,7,2]], desc: '先横向冲四，再纵向冲四获胜' },
            { pieces: [[7,6,1],[7,7,1],[7,8,1],[6,7,1],[8,7,2],[7,5,2],[8,8,2]], desc: '先纵向冲四，再横向冲四获胜' },
            { pieces: [[6,6,1],[7,7,1],[8,8,1],[7,6,1],[7,8,2],[6,7,2],[9,5,2]], desc: '斜线与纵向组合冲四' },
            { pieces: [[6,7,1],[7,6,1],[8,5,1],[7,7,1],[6,8,2],[7,8,2],[9,6,2]], desc: '反斜线与横向组合冲四' },
            { pieces: [[5,7,1],[6,7,1],[8,7,1],[9,7,1],[5,8,2],[6,8,2],[7,6,2]], desc: '横向长连冲四，多点攻击' },
            
            // 跳跃式冲四
            { pieces: [[5,7,1],[7,7,1],[8,7,1],[9,7,1],[5,8,2],[6,8,2],[8,8,2]], desc: '跳跃横向冲四，填补空位' },
            { pieces: [[7,5,1],[7,7,1],[7,8,1],[7,9,1],[8,5,2],[8,6,2],[6,7,2]], desc: '跳跃纵向冲四，连续攻击' },
            { pieces: [[5,5,1],[7,7,1],[8,8,1],[9,9,1],[6,5,2],[7,6,2],[8,7,2]], desc: '跳跃斜向冲四，对角突破' },
            { pieces: [[9,5,1],[7,7,1],[6,8,1],[5,9,1],[8,6,2],[7,7,2],[9,7,2]], desc: '跳跃反斜冲四，迂回攻击' },
            { pieces: [[6,6,1],[7,7,1],[8,7,1],[9,8,1],[6,7,2],[7,8,2],[8,6,2]], desc: '混合跳跃冲四，复杂路径' },
            
            // 三角形攻击
            { pieces: [[6,6,1],[7,7,1],[8,6,1],[7,6,1],[6,7,2],[8,7,2],[7,8,2]], desc: '三角形布局，多点威胁' },
            { pieces: [[7,5,1],[6,6,1],[8,6,1],[7,7,1],[7,6,2],[6,7,2],[8,5,2]], desc: '倒三角布局，收缩攻击' },
            { pieces: [[6,7,1],[7,6,1],[8,7,1],[7,8,1],[7,7,2],[6,8,2],[8,6,2]], desc: '菱形布局，四方威胁' },
            { pieces: [[5,6,1],[6,7,1],[7,8,1],[6,6,1],[5,7,2],[7,7,2],[8,8,2]], desc: '斜线扩展，递进攻击' },
            { pieces: [[7,5,1],[6,6,1],[7,7,1],[8,6,1],[8,5,2],[7,6,2],[6,7,2]], desc: 'W型布局，波浪攻击' },
            
            // 双线攻击
            { pieces: [[6,6,1],[7,6,1],[8,6,1],[7,7,1],[7,8,1],[6,7,2],[8,7,2],[7,5,2]], desc: '横纵交叉，双线攻击' },
            { pieces: [[6,6,1],[7,7,1],[8,8,1],[6,8,1],[8,6,1],[7,6,2],[7,8,2],[9,7,2]], desc: '斜线交叉，X型攻击' },
            { pieces: [[5,7,1],[6,7,1],[7,7,1],[7,6,1],[7,5,1],[6,6,2],[8,7,2],[7,8,2]], desc: 'L型双线，角度夹击' },
            { pieces: [[7,5,1],[7,6,1],[8,6,1],[9,6,1],[8,7,1],[7,7,2],[9,7,2],[8,5,2]], desc: '阶梯型布局，逐步推进' },
            { pieces: [[6,5,1],[7,6,1],[8,7,1],[7,5,1],[8,5,1],[6,6,2],[7,7,2],[9,7,2]], desc: '斜线平行，多线进攻' },
        ];
        
        for (let i = 0; i < 50; i++) {
            const patternIndex = i % basePatterns.length;
            const pattern = basePatterns[patternIndex];
            const variation = Math.floor(i / basePatterns.length);
            
            const offsetX = (variation % 3) - 1;
            const offsetY = Math.floor(variation / 3) - 1;
            
            const pieces = pattern.pieces.map(([x, y, player]) => ({
                x: x + offsetX,
                y: y + offsetY,
                player
            }));
            
            puzzles.push({
                id: `vcf-level2-${String(i + 1).padStart(3, '0')}`,
                level: 2,
                title: `初级第${i + 1}题`,
                description: pattern.desc,
                initialBoard: this.createEmptyBoard(pieces),
                currentPlayer: 1,
                minMoves: 5,
                maxMoves: 15,
                tags: ['初级', '冲四', '组合']
            });
        }
        
        return puzzles;
    }
    
    /**
     * 生成等级3题库（中级）
     * 5-7步获胜，需要多方向配合
     */
    generateLevel3Puzzles() {
        const puzzles = [];
        const basePatterns = [
            // 复杂多方向攻击
            { pieces: [[6,6,1],[7,7,1],[8,8,1],[6,8,1],[8,6,1],[7,6,2],[6,7,2],[8,7,2],[7,8,2]], desc: '米字型布局，八方威胁' },
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[5,7,1],[7,5,1],[6,5,2],[5,6,2],[7,6,2],[6,7,2]], desc: '对角嵌套，层层推进' },
            { pieces: [[6,5,1],[7,6,1],[8,7,1],[6,7,1],[8,5,1],[7,5,2],[6,6,2],[7,7,2],[8,6,2]], desc: '锯齿型攻击，反复威胁' },
            { pieces: [[5,6,1],[6,6,1],[7,6,1],[6,7,1],[6,8,1],[5,7,2],[7,7,2],[6,5,2],[7,8,2]], desc: 'T字延伸，多点开花' },
            { pieces: [[6,6,1],[7,6,1],[8,6,1],[7,7,1],[7,8,1],[8,7,1],[6,7,2],[8,8,2],[7,5,2],[9,6,2]], desc: '十字扩展，四方合围' },
            
            // 迂回战术
            { pieces: [[5,7,1],[6,6,1],[7,7,1],[8,6,1],[9,7,1],[6,7,2],[7,6,2],[8,7,2],[7,8,2]], desc: '迂回包抄，侧翼突破' },
            { pieces: [[6,5,1],[7,6,1],[8,7,1],[7,5,1],[8,6,1],[6,6,2],[7,7,2],[9,7,2],[8,5,2]], desc: '斜线迂回，避实击虚' },
            { pieces: [[5,8,1],[6,7,1],[7,6,1],[6,8,1],[7,7,1],[6,6,2],[7,8,2],[8,6,2],[5,7,2]], desc: '反斜迂回，逆向包抄' },
            { pieces: [[5,6,1],[6,7,1],[7,8,1],[7,6,1],[9,6,1],[6,6,2],[7,7,2],[8,8,2],[8,6,2]], desc: '螺旋式攻击，盘旋上升' },
            { pieces: [[6,7,1],[7,6,1],[8,7,1],[7,8,1],[7,7,1],[6,6,2],[8,6,2],[6,8,2],[8,8,2]], desc: '环形包围，中心开花' },
            
            // 多线配合
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[5,7,1],[7,5,1],[8,8,1],[6,5,2],[5,6,2],[7,6,2],[6,7,2],[8,7,2]], desc: '三线交汇，立体攻击' },
            { pieces: [[6,5,1],[7,5,1],[8,5,1],[7,6,1],[7,7,1],[8,6,1],[6,6,2],[7,8,2],[8,7,2],[9,5,2]], desc: '横纵结合，层次推进' },
            { pieces: [[5,6,1],[6,7,1],[7,8,1],[7,6,1],[9,6,1],[8,7,1],[6,6,2],[7,7,2],[8,6,2],[6,8,2]], desc: '对角平行，双轨前进' },
            { pieces: [[6,6,1],[7,6,1],[8,6,1],[6,7,1],[6,8,1],[7,7,1],[7,5,2],[8,7,2],[5,7,2],[6,9,2]], desc: 'L型多路，分进合击' },
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[8,6,1],[9,5,1],[7,6,1],[6,5,2],[7,8,2],[8,7,2],[9,6,2]], desc: 'V字多线，收缩包围' },
            
            // 陷阱布局
            { pieces: [[6,6,1],[7,7,1],[8,8,1],[6,8,1],[9,7,1],[7,6,2],[7,8,2],[8,7,2],[6,7,2],[9,9,2]], desc: '陷阱式布局，诱敌深入' },
            { pieces: [[5,7,1],[7,7,1],[9,7,1],[7,5,1],[7,9,1],[6,7,2],[8,7,2],[7,6,2],[7,8,2],[7,7,2]], desc: '十字陷阱，中心诱导' },
            { pieces: [[6,5,1],[7,6,1],[8,7,1],[8,5,1],[10,5,1],[7,5,2],[8,6,2],[9,7,2],[9,5,2]], desc: '斜线陷阱，逐步收网' },
            { pieces: [[5,6,1],[6,7,1],[7,8,1],[6,6,1],[7,7,1],[5,7,2],[7,6,2],[8,8,2],[6,8,2],[8,7,2]], desc: '多点陷阱，处处设伏' },
            { pieces: [[6,6,1],[7,6,1],[8,6,1],[7,7,1],[7,8,1],[6,7,1],[6,5,2],[8,7,2],[7,9,2],[9,6,2]], desc: '复合陷阱，层层设防' },
        ];
        
        for (let i = 0; i < 50; i++) {
            const patternIndex = i % basePatterns.length;
            const pattern = basePatterns[patternIndex];
            const variation = Math.floor(i / basePatterns.length);
            
            const offsetX = (variation % 2) * 1;
            const offsetY = Math.floor(variation / 2) * 1;
            
            const pieces = pattern.pieces.map(([x, y, player]) => ({
                x: x + offsetX,
                y: y + offsetY,
                player
            }));
            
            puzzles.push({
                id: `vcf-level3-${String(i + 1).padStart(3, '0')}`,
                level: 3,
                title: `中级第${i + 1}题`,
                description: pattern.desc,
                initialBoard: this.createEmptyBoard(pieces),
                currentPlayer: 1,
                minMoves: 7,
                maxMoves: 20,
                tags: ['中级', '冲四', '战术']
            });
        }
        
        return puzzles;
    }
    
    /**
     * 生成等级4题库（高级）
     * 7+步获胜，复杂战术
     */
    generateLevel4Puzzles() {
        const puzzles = [];
        const basePatterns = [
            // 大师级布局
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[8,8,1],[5,9,1],[9,5,1],[6,5,2],[5,6,2],[7,6,2],[6,7,2],[7,8,2],[8,7,2],[9,8,2]], desc: '大师对角，全局掌控' },
            { pieces: [[4,7,1],[5,7,1],[7,7,1],[9,7,1],[10,7,1],[7,5,1],[7,9,1],[5,6,2],[6,7,2],[8,7,2],[7,6,2],[7,8,2],[9,6,2]], desc: '十字大阵，纵横交错' },
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[6,8,1],[8,6,1],[9,7,1],[10,8,1],[6,5,2],[5,6,2],[7,6,2],[7,8,2],[8,7,2],[9,8,2]], desc: '扇形展开，步步为营' },
            { pieces: [[5,6,1],[6,7,1],[7,8,1],[7,6,1],[9,6,1],[8,7,1],[10,7,1],[6,6,2],[7,7,2],[8,6,2],[8,8,2],[9,7,2]], desc: '波浪推进，连绵不绝' },
            { pieces: [[6,5,1],[7,6,1],[8,7,1],[9,8,1],[7,5,1],[8,6,1],[9,7,1],[7,7,2],[6,6,2],[8,8,2],[8,5,2],[9,6,2],[10,7,2]], desc: '双螺旋攻击，立体压制' },
            
            // 极限战术
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[8,8,1],[9,9,1],[5,9,1],[9,5,1],[6,5,2],[5,6,2],[7,6,2],[6,7,2],[7,8,2],[8,7,2]], desc: '十字对角，四向合围' },
            { pieces: [[4,6,1],[5,7,1],[6,8,1],[7,9,1],[6,6,1],[7,7,1],[8,8,1],[5,6,2],[6,7,2],[7,8,2],[8,9,2],[8,7,2]], desc: '平行斜线，双管齐下' },
            { pieces: [[5,7,1],[6,7,1],[8,7,1],[9,7,1],[10,7,1],[7,5,1],[7,6,1],[7,8,1],[6,6,2],[7,7,2],[8,8,2],[8,7,2],[9,6,2]], desc: '十字连环，环环相扣' },
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[8,8,1],[6,7,1],[7,8,1],[8,9,1],[6,5,2],[7,6,2],[8,7,2],[7,9,2],[9,8,2]], desc: '锯齿嵌套，犬牙交错' },
            { pieces: [[6,6,1],[7,6,1],[8,6,1],[9,6,1],[7,7,1],[8,7,1],[7,8,1],[6,7,2],[9,7,2],[7,5,2],[8,8,2],[10,6,2]], desc: '梯形压制，层层紧逼' },
            
            // 终极挑战
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[8,8,1],[5,8,1],[8,5,1],[6,7,1],[7,6,1],[6,5,2],[5,6,2],[7,8,2],[8,7,2],[9,9,2],[7,5,2]], desc: '终极米字，八方锁定' },
            { pieces: [[4,7,1],[5,6,1],[6,7,1],[7,8,1],[8,7,1],[9,6,1],[10,7,1],[5,7,2],[6,6,2],[7,7,2],[8,8,2],[9,7,2],[7,6,2]], desc: '星形阵法，中心突破' },
            { pieces: [[5,6,1],[6,5,1],[7,6,1],[8,7,1],[9,8,1],[7,7,1],[8,6,1],[6,6,2],[7,5,2],[8,8,2],[9,7,2],[6,7,2],[7,8,2]], desc: '龙形盘旋，游走制胜' },
            { pieces: [[5,7,1],[6,6,1],[7,7,1],[8,8,1],[9,7,1],[7,6,1],[8,7,1],[6,7,2],[7,8,2],[9,8,2],[8,6,2],[6,8,2],[10,7,2]], desc: '凤凰展翅，双翼齐飞' },
            { pieces: [[6,5,1],[7,6,1],[8,7,1],[7,7,1],[7,8,1],[9,7,1],[10,7,1],[7,5,2],[8,6,2],[8,8,2],[9,8,2],[6,7,2],[8,9,2]], desc: '蛇形游走，迂回制敌' },
            
            // 大师对决
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[8,8,1],[9,9,1],[5,9,1],[6,8,1],[7,9,1],[6,5,2],[5,6,2],[7,6,2],[8,7,2],[9,8,2],[7,8,2]], desc: '大师对角阵，棋逢对手' },
            { pieces: [[4,7,1],[5,7,1],[6,7,1],[8,7,1],[9,7,1],[7,5,1],[7,6,1],[7,8,1],[7,9,1],[6,6,2],[7,7,2],[8,8,2],[8,7,2],[7,4,2]], desc: '超级十字，纵横天下' },
            { pieces: [[5,6,1],[6,6,1],[7,6,1],[8,6,1],[6,7,1],[7,7,1],[8,7,1],[6,5,2],[8,8,2],[9,6,2],[7,8,2],[5,7,2],[7,5,2]], desc: '矩形压制，稳扎稳打' },
            { pieces: [[5,5,1],[6,6,1],[7,7,1],[8,8,1],[6,7,1],[7,6,1],[7,8,1],[8,7,1],[6,5,2],[5,6,2],[8,6,2],[9,8,2],[7,9,2]], desc: '交叉网格，天罗地网' },
            { pieces: [[6,5,1],[7,6,1],[8,7,1],[9,8,1],[7,5,1],[8,6,1],[9,7,1],[10,8,1],[7,7,2],[6,6,2],[8,8,2],[8,5,2],[9,6,2],[10,7,2]], desc: '双龙出海，并驾齐驱' },
        ];
        
        for (let i = 0; i < 50; i++) {
            const patternIndex = i % basePatterns.length;
            const pattern = basePatterns[patternIndex];
            const variation = Math.floor(i / basePatterns.length);
            
            const offsetX = (variation % 2) * 1;
            const offsetY = Math.floor(variation / 2) * 1;
            
            const pieces = pattern.pieces.map(([x, y, player]) => ({
                x: Math.min(14, Math.max(0, x + offsetX)),
                y: Math.min(14, Math.max(0, y + offsetY)),
                player
            }));
            
            puzzles.push({
                id: `vcf-level4-${String(i + 1).padStart(3, '0')}`,
                level: 4,
                title: `高级第${i + 1}题`,
                description: pattern.desc,
                initialBoard: this.createEmptyBoard(pieces),
                currentPlayer: 1,
                minMoves: 9,
                maxMoves: 30,
                tags: ['高级', '冲四', '大师']
            });
        }
        
        return puzzles;
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
     * 获取指定等级的题目
     */
    getPuzzleByLevel(level, index = null) {
        const levelPuzzles = this.puzzles.filter(p => p.level === level);
        
        if (levelPuzzles.length === 0) {
            console.error('[VCFPractice] 没有找到等级', level, '的题目');
            return null;
        }
        
        // 如果指定了索引，返回该索引的题目
        if (index !== null && index >= 0 && index < levelPuzzles.length) {
            return levelPuzzles[index];
        }
        
        // 过滤掉已完成的题目
        const uncompletedPuzzles = levelPuzzles.filter(p => 
            !this.progress.completedPuzzles.includes(p.id)
        );
        
        // 如果还有未完成的题目，随机选择一个
        if (uncompletedPuzzles.length > 0) {
            const randomIndex = Math.floor(Math.random() * uncompletedPuzzles.length);
            return uncompletedPuzzles[randomIndex];
        }
        
        // 如果都完成了，随机选择一个
        const randomIndex = Math.floor(Math.random() * levelPuzzles.length);
        return levelPuzzles[randomIndex];
    }
    
    /**
     * 开始新练习
     */
    startPractice(level = null) {
        // 如果没有指定等级，使用当前等级
        if (level === null) {
            level = this.currentLevel;
        }
        
        this.currentLevel = level;
        this.progress.currentLevel = level;
        this.currentPuzzle = this.getPuzzleByLevel(level);
        
        if (!this.currentPuzzle) {
            console.error('[VCFPractice] 无法获取题目');
            return null;
        }
        
        // 记录开始时间
        this.startTime = Date.now();
        
        // 预先保存进度，确保等级选择被记住
        this.saveProgress();
        
        console.log('[VCFPractice] 开始练习:', this.currentPuzzle.title, '等级:', level);
        
        return this.currentPuzzle;
    }
    
    /**
     * 完成练习
     */
    completePractice(isWin = false) {
        if (!this.currentPuzzle) {
            return { success: false, message: '没有进行中的练习' };
        }
        
        if (!isWin) {
            this.progress.currentStreak = 0;
            this.saveProgress();
            return { success: false, message: '未获胜，练习失败' };
        }
        
        // 计算用时
        const elapsedTime = Date.now() - this.startTime;
        const elapsedSeconds = Math.floor(elapsedTime / 1000);
        
        const puzzleId = this.currentPuzzle.id;
        const level = this.currentPuzzle.level;
        
        // 获取历史最佳时间
        const bestTime = this.progress.bestTimes[puzzleId] || null;
        const isNewRecord = !bestTime || elapsedSeconds < bestTime;
        
        // 更新最佳时间
        if (isNewRecord) {
            this.progress.bestTimes[puzzleId] = elapsedSeconds;
        }
        
        // 添加到已完成列表（如果还没完成过）
        if (!this.progress.completedPuzzles.includes(puzzleId)) {
            this.progress.completedPuzzles.push(puzzleId);
            this.progress.levelProgress[level - 1]++;
        }
        
        this.progress.currentStreak++;
        
        // 检查是否需要升级
        let shouldLevelUp = false;
        if (this.progress.currentStreak >= 5 && this.currentLevel < 4) {
            shouldLevelUp = true;
            this.currentLevel++;
            this.progress.currentLevel = this.currentLevel;
            this.progress.currentStreak = 0;
        }
        
        // 保存进度
        this.saveProgress();
        
        console.log('[VCFPractice] 完成练习:', puzzleId, '用时:', elapsedSeconds, '秒');
        
        return {
            success: true,
            elapsedTime: elapsedSeconds,
            bestTime: isNewRecord ? elapsedSeconds : bestTime,
            isNewRecord,
            shouldLevelUp,
            newLevel: shouldLevelUp ? this.currentLevel : null,
            streak: this.progress.currentStreak,
            levelProgress: this.progress.levelProgress[level - 1]
        };
    }
    
    /**
     * 加载进度
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('vcf_practice_progress');
            if (saved) {
                const progress = JSON.parse(saved);
                this.currentLevel = progress.currentLevel || 1;
                return progress;
            }
        } catch (e) {
            console.error('[VCFPractice] 加载进度失败:', e);
        }
        
        // 默认进度
        return {
            currentLevel: 1,
            levelProgress: [0, 0, 0, 0],
            completedPuzzles: [],
            currentStreak: 0,
            bestTimes: {}
        };
    }
    
    /**
     * 保存进度
     */
    saveProgress() {
        try {
            localStorage.setItem('vcf_practice_progress', JSON.stringify(this.progress));
            console.log('[VCFPractice] 进度已保存');
        } catch (e) {
            console.error('[VCFPractice] 保存进度失败:', e);
        }
    }
    
    /**
     * 重置进度
     */
    resetProgress() {
        this.progress = {
            currentLevel: 1,
            levelProgress: [0, 0, 0, 0],
            completedPuzzles: [],
            currentStreak: 0,
            bestTimes: {}
        };
        this.currentLevel = 1;
        this.saveProgress();
        console.log('[VCFPractice] 进度已重置');
    }
    
    /**
     * 获取进度统计
     */
    getProgressStats() {
        const stats = {
            currentLevel: this.currentLevel,
            totalCompleted: this.progress.completedPuzzles.length,
            levelProgress: this.progress.levelProgress,
            currentStreak: this.progress.currentStreak,
            totalPuzzles: this.puzzles.length,
            levelTotals: [50, 50, 50, 50],
            completion: Math.round((this.progress.completedPuzzles.length / this.puzzles.length) * 100)
        };
        
        return stats;
    }
    
    /**
     * 获取等级名称
     */
    getLevelName(level) {
        const names = {
            1: '入门',
            2: '初级',
            3: '中级',
            4: '高级'
        };
        return names[level] || '未知';
    }
}

// 模块信息
const VCF_PRACTICE_MODULE_INFO = {
    name: 'VCFPracticeManager',
    version: '2.0.0',
    author: '项目团队',
    dependencies: []
};

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.VCFPracticeManager = Object.assign(VCFPracticeManager, { 
        __moduleInfo: VCF_PRACTICE_MODULE_INFO 
    });
    
    console.log('[VCFPractice] VCF练习模块v2.0已加载');
    
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
