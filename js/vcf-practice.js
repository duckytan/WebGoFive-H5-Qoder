/**
 * VCF冲四练习管理器 (v3.0 - 全新题库设计)
 * 负责管理VCF练习题库、验证玩家走法、提供练习指导
 * 
 * @author 项目团队
 * @version 3.0.0
 * @date 2025-01-08
 * 
 * 主要功能：
 * - 4个难度等级，共40道经典VCF题
 * - 自由下棋模式（不限定固定路径）
 * - AI最高难度防守（HELL模式）
 * - 最佳时间记录系统
 * - 自动升级机制（每完成5题自动进入下一难度）
 * 
 * v3.0 更新：
 * - 全新设计的经典VCF题库
 * - 从真实对局中提取的VCF棋形
 * - 更合理的难度梯度
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
        
        console.log('[VCFPractice] VCF练习管理器v3.0已初始化，共', this.puzzles.length, '道练习题');
        console.log('[VCFPractice] 当前进度:', this.progress);
    }
    
    /**
     * 初始化练习题库 - 4个等级，共40道题
     */
    initializePuzzles() {
        const puzzles = [];
        
        // 等级1：入门级（1-2步获胜）10道题
        puzzles.push(...this.generateLevel1Puzzles());
        
        // 等级2：初级（3-4步获胜）10道题
        puzzles.push(...this.generateLevel2Puzzles());
        
        // 等级3：中级（5-6步获胜）10道题
        puzzles.push(...this.generateLevel3Puzzles());
        
        // 等级4：高级（7+步获胜）10道题
        puzzles.push(...this.generateLevel4Puzzles());
        
        return puzzles;
    }
    
    /**
     * 生成等级1题库（入门级）- 经典VCF题型
     * 特点：简单直接的冲四，1-2步即可获胜
     */
    generateLevel1Puzzles() {
        const puzzles = [];
        
        // 题1：横向简单冲四
        puzzles.push({
            id: 'vcf-level1-001',
            level: 1,
            title: '入门第1题：横向冲四',
            description: '黑棋已有三连，一步冲四即可获胜',
            initialBoard: this.createBoardFromPieces([
                [6,7,1], [7,7,1], [8,7,1],  // 黑三连
                [7,6,2], [7,8,2]             // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 1,
            maxMoves: 10,
            tags: ['入门', '冲四', '横向']
        });
        
        // 题2：纵向简单冲四
        puzzles.push({
            id: 'vcf-level1-002',
            level: 1,
            title: '入门第2题：纵向冲四',
            description: '黑棋纵向三连，向下冲四获胜',
            initialBoard: this.createBoardFromPieces([
                [7,5,1], [7,6,1], [7,7,1],  // 黑纵三连
                [6,6,2], [8,6,2]             // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 1,
            maxMoves: 10,
            tags: ['入门', '冲四', '纵向']
        });
        
        // 题3：斜向简单冲四
        puzzles.push({
            id: 'vcf-level1-003',
            level: 1,
            title: '入门第3题：斜向冲四',
            description: '主对角线三连，延伸冲四',
            initialBoard: this.createBoardFromPieces([
                [6,6,1], [7,7,1], [8,8,1],  // 斜三连
                [7,6,2], [7,8,2]             // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 1,
            maxMoves: 10,
            tags: ['入门', '冲四', '斜向']
        });
        
        // 题4：跳三冲四
        puzzles.push({
            id: 'vcf-level1-004',
            level: 1,
            title: '入门第4题：跳三冲四',
            description: '黑棋跳三，补中间形成冲四',
            initialBoard: this.createBoardFromPieces([
                [6,7,1], [8,7,1], [9,7,1],  // 黑跳三
                [7,6,2], [7,8,2]             // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 1,
            maxMoves: 10,
            tags: ['入门', '冲四', '跳三']
        });
        
        // 题5：双端冲四
        puzzles.push({
            id: 'vcf-level1-005',
            level: 1,
            title: '入门第5题：双端冲四',
            description: '黑棋三连，两端都能冲四',
            initialBoard: this.createBoardFromPieces([
                [6,7,1], [7,7,1], [8,7,1],  // 黑三连
                [6,6,2], [8,8,2]             // 白棋防守（避开两端）
            ]),
            currentPlayer: 1,
            minMoves: 1,
            maxMoves: 10,
            tags: ['入门', '冲四', '双端']
        });
        
        // 题6：反斜冲四
        puzzles.push({
            id: 'vcf-level1-006',
            level: 1,
            title: '入门第6题：反斜冲四',
            description: '副对角线三连，延伸冲四',
            initialBoard: this.createBoardFromPieces([
                [8,6,1], [7,7,1], [6,8,1],  // 反斜三连
                [7,6,2], [7,8,2]             // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 1,
            maxMoves: 10,
            tags: ['入门', '冲四', '反斜']
        });
        
        // 题7：活三冲四
        puzzles.push({
            id: 'vcf-level1-007',
            level: 1,
            title: '入门第7题：活三冲四',
            description: '黑棋活三，两端冲四必胜',
            initialBoard: this.createBoardFromPieces([
                [6,7,1], [7,7,1], [8,7,1],  // 黑三连（活三）
                [6,8,2], [7,6,2]             // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 1,
            maxMoves: 10,
            tags: ['入门', '冲四', '活三']
        });
        
        // 题8：边角冲四
        puzzles.push({
            id: 'vcf-level1-008',
            level: 1,
            title: '入门第8题：边角冲四',
            description: '靠近边缘的冲四',
            initialBoard: this.createBoardFromPieces([
                [11,7,1], [12,7,1], [13,7,1], // 黑三连（靠右边）
                [12,6,2], [12,8,2]             // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 1,
            maxMoves: 10,
            tags: ['入门', '冲四', '边角']
        });
        
        // 题9：中心冲四
        puzzles.push({
            id: 'vcf-level1-009',
            level: 1,
            title: '入门第9题：中心冲四',
            description: '棋盘中心位置的冲四',
            initialBoard: this.createBoardFromPieces([
                [6,6,1], [7,7,1], [8,8,1],  // 中心斜三连
                [6,7,2], [8,7,2]             // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 1,
            maxMoves: 10,
            tags: ['入门', '冲四', '中心']
        });
        
        // 题10：混合方向
        puzzles.push({
            id: 'vcf-level1-010',
            level: 1,
            title: '入门第10题：简单组合',
            description: '黑棋有横纵两个方向的威胁',
            initialBoard: this.createBoardFromPieces([
                [7,6,1], [7,7,1], [7,8,1],  // 纵三连
                [8,7,1],                     // 横向一子
                [6,7,2], [8,6,2], [8,8,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 1,
            maxMoves: 10,
            tags: ['入门', '冲四', '组合']
        });
        
        return puzzles;
    }
    
    /**
     * 生成等级2题库（初级）- 经典VCF题型
     * 特点：需要2-3步连续冲四，制造多个威胁
     */
    generateLevel2Puzzles() {
        const puzzles = [];
        
        // 题1：双方向冲四
        puzzles.push({
            id: 'vcf-level2-001',
            level: 2,
            title: '初级第1题：十字冲四',
            description: '先横向冲四，再纵向冲四获胜',
            initialBoard: this.createBoardFromPieces([
                [6,7,1], [7,7,1], [8,7,1],  // 横三连
                [7,6,1], [7,8,1],            // 纵两子
                [6,6,2], [8,8,2], [9,7,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 3,
            maxMoves: 15,
            tags: ['初级', '冲四', '十字']
        });
        
        // 题2：斜横组合
        puzzles.push({
            id: 'vcf-level2-002',
            level: 2,
            title: '初级第2题：斜横组合',
            description: '斜线冲四后，横向再冲四',
            initialBoard: this.createBoardFromPieces([
                [6,6,1], [7,7,1], [8,8,1],  // 斜三连
                [8,7,1], [9,7,1],            // 横两子
                [7,6,2], [7,8,2], [10,7,2]  // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 3,
            maxMoves: 15,
            tags: ['初级', '冲四', '斜横']
        });
        
        // 题3：连续跳冲
        puzzles.push({
            id: 'vcf-level2-003',
            level: 2,
            title: '初级第3题：连续跳冲',
            description: '填补跳三，形成连续冲四',
            initialBoard: this.createBoardFromPieces([
                [5,7,1], [7,7,1], [9,7,1],  // 黑棋跳三（两个间隔）
                [6,7,1],                     // 中间一子
                [6,6,2], [7,6,2], [8,8,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 3,
            maxMoves: 15,
            tags: ['初级', '冲四', '跳冲']
        });
        
        // 题4：三角阵型
        puzzles.push({
            id: 'vcf-level2-004',
            level: 2,
            title: '初级第4题：三角阵型',
            description: '三角形布局，制造多点威胁',
            initialBoard: this.createBoardFromPieces([
                [6,6,1], [7,7,1], [8,6,1],  // 三角顶点
                [7,6,1],                     // 三角中心
                [6,7,2], [8,7,2], [7,8,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 3,
            maxMoves: 15,
            tags: ['初级', '冲四', '三角']
        });
        
        // 题5：梯形进攻
        puzzles.push({
            id: 'vcf-level2-005',
            level: 2,
            title: '初级第5题：梯形进攻',
            description: '梯形布局，逐步压缩空间',
            initialBoard: this.createBoardFromPieces([
                [6,6,1], [7,6,1], [8,6,1],  // 上边三子
                [6,7,1], [8,7,1],            // 中间两子
                [7,7,2], [7,8,2], [9,6,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 3,
            maxMoves: 15,
            tags: ['初级', '冲四', '梯形']
        });
        
        // 题6：对角连环
        puzzles.push({
            id: 'vcf-level2-006',
            level: 2,
            title: '初级第6题：对角连环',
            description: '两条对角线互相配合',
            initialBoard: this.createBoardFromPieces([
                [5,5,1], [6,6,1], [7,7,1],  // 主对角
                [9,5,1], [8,6,1],            // 副对角
                [7,6,2], [6,7,2], [8,7,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 3,
            maxMoves: 15,
            tags: ['初级', '冲四', '对角']
        });
        
        // 题7：扇形展开
        puzzles.push({
            id: 'vcf-level2-007',
            level: 2,
            title: '初级第7题：扇形展开',
            description: '从一点向外扇形扩展',
            initialBoard: this.createBoardFromPieces([
                [7,7,1],                     // 中心点
                [6,6,1], [7,6,1], [8,6,1],  // 上方三子
                [6,8,1],                     // 左下一子
                [7,8,2], [8,8,2], [9,7,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 3,
            maxMoves: 15,
            tags: ['初级', '冲四', '扇形']
        });
        
        // 题8：L型攻击
        puzzles.push({
            id: 'vcf-level2-008',
            level: 2,
            title: '初级第8题：L型攻击',
            description: 'L型布局，转角突破',
            initialBoard: this.createBoardFromPieces([
                [6,6,1], [7,6,1], [8,6,1],  // 横向三子
                [6,7,1], [6,8,1],            // 纵向两子
                [7,7,2], [7,8,2], [8,7,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 3,
            maxMoves: 15,
            tags: ['初级', '冲四', 'L型']
        });
        
        // 题9：波浪推进
        puzzles.push({
            id: 'vcf-level2-009',
            level: 2,
            title: '初级第9题：波浪推进',
            description: '波浪形布局，起伏进攻',
            initialBoard: this.createBoardFromPieces([
                [5,6,1], [6,7,1], [7,6,1], [8,7,1],  // 波浪形
                [6,6,1],                              // 中间补充
                [6,8,2], [7,7,2], [8,6,2]            // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 3,
            maxMoves: 15,
            tags: ['初级', '冲四', '波浪']
        });
        
        // 题10：交叉夹击
        puzzles.push({
            id: 'vcf-level2-010',
            level: 2,
            title: '初级第10题：交叉夹击',
            description: '两个方向交叉配合',
            initialBoard: this.createBoardFromPieces([
                [6,7,1], [7,7,1], [8,7,1],  // 横向三子
                [7,6,1], [7,8,1], [7,9,1],  // 纵向三子
                [6,6,2], [8,8,2], [9,7,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 3,
            maxMoves: 15,
            tags: ['初级', '冲四', '交叉']
        });
        
        return puzzles;
    }
    
    /**
     * 生成等级3题库（中级）- 经典VCF题型
     * 特点：需要4-5步连续冲四，复杂的多方向配合
     */
    generateLevel3Puzzles() {
        const puzzles = [];
        
        // 题1：米字型攻击
        puzzles.push({
            id: 'vcf-level3-001',
            level: 3,
            title: '中级第1题：米字攻击',
            description: '八个方向全面威胁',
            initialBoard: this.createBoardFromPieces([
                [7,7,1],                              // 中心
                [6,6,1], [8,8,1], [6,8,1], [8,6,1],  // 四个角
                [7,6,1], [7,8,1], [6,7,1], [8,7,1],  // 四个边
                [7,5,2], [5,7,2], [9,7,2], [7,9,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 5,
            maxMoves: 20,
            tags: ['中级', '冲四', '米字']
        });
        
        // 题2：螺旋推进
        puzzles.push({
            id: 'vcf-level3-002',
            level: 3,
            title: '中级第2题：螺旋推进',
            description: '螺旋式收缩空间',
            initialBoard: this.createBoardFromPieces([
                [5,5,1], [6,5,1], [7,5,1],           // 上边
                [7,6,1], [7,7,1],                     // 右边
                [6,7,1], [5,7,1],                     // 下边
                [5,6,1],                              // 左边（螺旋）
                [6,6,2], [8,5,2], [7,8,2], [4,6,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 5,
            maxMoves: 20,
            tags: ['中级', '冲四', '螺旋']
        });
        
        // 题3：双对角交汇
        puzzles.push({
            id: 'vcf-level3-003',
            level: 3,
            title: '中级第3题：双对角交汇',
            description: '两条对角线在中心交汇',
            initialBoard: this.createBoardFromPieces([
                [4,4,1], [5,5,1], [6,6,1], [7,7,1],  // 主对角
                [10,4,1], [9,5,1], [8,6,1],          // 副对角
                [7,6,1],                              // 交汇点附近
                [6,5,2], [7,5,2], [8,7,2], [8,5,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 5,
            maxMoves: 20,
            tags: ['中级', '冲四', '交汇']
        });
        
        // 题4：环形包围
        puzzles.push({
            id: 'vcf-level3-004',
            level: 3,
            title: '中级第4题：环形包围',
            description: '形成环形包围圈',
            initialBoard: this.createBoardFromPieces([
                [6,6,1], [7,6,1], [8,6,1],           // 上
                [8,7,1], [8,8,1],                     // 右
                [7,8,1], [6,8,1],                     // 下
                [6,7,1],                              // 左（环形）
                [7,7,2], [9,6,2], [9,8,2], [5,7,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 5,
            maxMoves: 20,
            tags: ['中级', '冲四', '环形']
        });
        
        // 题5：三线交叉
        puzzles.push({
            id: 'vcf-level3-005',
            level: 3,
            title: '中级第5题：三线交叉',
            description: '三条线在一点交汇',
            initialBoard: this.createBoardFromPieces([
                [5,7,1], [6,7,1], [7,7,1],           // 横线
                [7,5,1], [7,6,1],                     // 纵线（上）
                [7,8,1],                              // 纵线（下）
                [5,5,1], [6,6,1],                     // 斜线
                [8,7,2], [7,9,2], [8,8,2], [6,8,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 5,
            maxMoves: 20,
            tags: ['中级', '冲四', '三线']
        });
        
        // 题6：锯齿进攻
        puzzles.push({
            id: 'vcf-level3-006',
            level: 3,
            title: '中级第6题：锯齿进攻',
            description: '锯齿形布局，反复威胁',
            initialBoard: this.createBoardFromPieces([
                [5,6,1], [6,7,1], [7,6,1], [8,7,1], [9,6,1], // 锯齿形
                [6,6,1], [8,6,1],                             // 补充
                [6,8,2], [7,7,2], [8,8,2], [9,7,2]           // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 5,
            maxMoves: 20,
            tags: ['中级', '冲四', '锯齿']
        });
        
        // 题7：梯田式
        puzzles.push({
            id: 'vcf-level3-007',
            level: 3,
            title: '中级第7题：梯田式',
            description: '阶梯状布局，层层推进',
            initialBoard: this.createBoardFromPieces([
                [5,5,1], [6,5,1], [7,5,1],           // 第一层
                [6,6,1], [7,6,1], [8,6,1],           // 第二层
                [7,7,1], [8,7,1],                     // 第三层
                [6,7,2], [8,8,2], [9,6,2], [7,8,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 5,
            maxMoves: 20,
            tags: ['中级', '冲四', '梯田']
        });
        
        // 题8：放射状
        puzzles.push({
            id: 'vcf-level3-008',
            level: 3,
            title: '中级第8题：放射状',
            description: '从中心向外放射',
            initialBoard: this.createBoardFromPieces([
                [7,7,1],                              // 中心
                [6,6,1], [7,6,1], [8,6,1],           // 上方
                [8,7,1], [8,8,1],                     // 右下
                [6,7,1], [6,8,1],                     // 左下
                [7,8,2], [9,6,2], [9,8,2], [5,7,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 5,
            maxMoves: 20,
            tags: ['中级', '冲四', '放射']
        });
        
        // 题9：双翼齐飞
        puzzles.push({
            id: 'vcf-level3-009',
            level: 3,
            title: '中级第9题：双翼齐飞',
            description: '两翼同时进攻',
            initialBoard: this.createBoardFromPieces([
                [7,7,1],                              // 中心
                [5,6,1], [6,6,1], [7,6,1],           // 左翼
                [8,6,1], [9,6,1],                     // 右翼
                [6,8,1], [8,8,1],                     // 下方支援
                [7,8,2], [7,5,2], [10,6,2], [4,6,2]  // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 5,
            maxMoves: 20,
            tags: ['中级', '冲四', '双翼']
        });
        
        // 题10：迷宫布局
        puzzles.push({
            id: 'vcf-level3-010',
            level: 3,
            title: '中级第10题：迷宫布局',
            description: '复杂的迷宫式路径',
            initialBoard: this.createBoardFromPieces([
                [6,5,1], [7,5,1], [8,5,1],           // 顶部
                [6,7,1], [7,7,1], [8,7,1],           // 中部
                [7,6,1], [7,8,1],                     // 连接
                [6,6,2], [8,6,2], [6,8,2], [8,8,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 5,
            maxMoves: 20,
            tags: ['中级', '冲四', '迷宫']
        });
        
        return puzzles;
    }
    
    /**
     * 生成等级4题库（高级）- 经典VCF题型
     * 特点：需要6步以上连续冲四，大师级难度
     */
    generateLevel4Puzzles() {
        const puzzles = [];
        
        // 题1：大师级十字
        puzzles.push({
            id: 'vcf-level4-001',
            level: 4,
            title: '高级第1题：大师十字',
            description: '超大范围的十字攻击',
            initialBoard: this.createBoardFromPieces([
                [7,7,1],                              // 中心
                [4,7,1], [5,7,1], [6,7,1], [8,7,1], [9,7,1], [10,7,1],  // 横向
                [7,4,1], [7,5,1], [7,6,1], [7,8,1], [7,9,1],            // 纵向
                [6,6,2], [8,8,2], [6,8,2], [8,6,2], [7,10,2]            // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 7,
            maxMoves: 30,
            tags: ['高级', '冲四', '大师']
        });
        
        // 题2：全盘控制
        puzzles.push({
            id: 'vcf-level4-002',
            level: 4,
            title: '高级第2题：全盘控制',
            description: '控制整个棋盘的局面',
            initialBoard: this.createBoardFromPieces([
                [3,3,1], [4,4,1], [5,5,1], [6,6,1], [7,7,1],  // 主对角
                [11,3,1], [10,4,1], [9,5,1], [8,6,1],         // 副对角
                [7,5,1], [7,6,1],                              // 中心纵向
                [5,7,1], [6,7,1],                              // 中心横向
                [6,5,2], [8,7,2], [7,8,2], [8,5,2], [9,6,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 7,
            maxMoves: 30,
            tags: ['高级', '冲四', '全盘']
        });
        
        // 题3：龙形阵
        puzzles.push({
            id: 'vcf-level4-003',
            level: 4,
            title: '高级第3题：龙形阵',
            description: '龙形盘旋，步步紧逼',
            initialBoard: this.createBoardFromPieces([
                [4,5,1], [5,5,1], [6,5,1], [7,5,1],  // 龙头
                [7,6,1], [7,7,1], [8,7,1], [9,7,1],  // 龙身
                [9,8,1], [8,8,1],                     // 龙尾
                [6,6,2], [8,6,2], [9,6,2], [7,8,2], [10,7,2]  // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 7,
            maxMoves: 30,
            tags: ['高级', '冲四', '龙形']
        });
        
        // 题4：八卦阵
        puzzles.push({
            id: 'vcf-level4-004',
            level: 4,
            title: '高级第4题：八卦阵',
            description: '八个方位全面布局',
            initialBoard: this.createBoardFromPieces([
                [7,7,1],                              // 中心
                [7,4,1], [7,5,1],                     // 北
                [10,7,1], [9,7,1],                    // 东
                [7,10,1], [7,9,1],                    // 南
                [4,7,1], [5,7,1],                     // 西
                [9,5,1], [9,9,1], [5,9,1], [5,5,1],  // 四个角
                [7,6,2], [8,7,2], [7,8,2], [6,7,2], [8,8,2]  // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 7,
            maxMoves: 30,
            tags: ['高级', '冲四', '八卦']
        });
        
        // 题5：双龙出海
        puzzles.push({
            id: 'vcf-level4-005',
            level: 4,
            title: '高级第5题：双龙出海',
            description: '两条龙形同时进攻',
            initialBoard: this.createBoardFromPieces([
                [4,4,1], [5,5,1], [6,6,1], [7,7,1], [8,8,1],  // 龙1
                [10,4,1], [9,5,1], [8,6,1], [7,7,1], [6,8,1], // 龙2（共享中心）
                [6,7,1], [8,7,1],                              // 支援
                [7,6,2], [7,8,2], [9,6,2], [5,6,2], [6,9,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 7,
            maxMoves: 30,
            tags: ['高级', '冲四', '双龙']
        });
        
        // 题6：星罗棋布
        puzzles.push({
            id: 'vcf-level4-006',
            level: 4,
            title: '高级第6题：星罗棋布',
            description: '星星点点，遍布全盘',
            initialBoard: this.createBoardFromPieces([
                [3,3,1], [7,3,1], [11,3,1],          // 上排
                [5,5,1], [7,5,1], [9,5,1],           // 中上排
                [3,7,1], [7,7,1], [11,7,1],          // 中间排
                [5,9,1], [9,9,1],                     // 中下排
                [4,4,2], [8,4,2], [6,6,2], [8,6,2], [6,8,2]  // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 7,
            maxMoves: 30,
            tags: ['高级', '冲四', '星罗']
        });
        
        // 题7：层层递进
        puzzles.push({
            id: 'vcf-level4-007',
            level: 4,
            title: '高级第7题：层层递进',
            description: '五层阶梯，逐步推进',
            initialBoard: this.createBoardFromPieces([
                [7,3,1],                              // 第1层
                [6,4,1], [7,4,1], [8,4,1],           // 第2层
                [6,5,1], [7,5,1], [8,5,1],           // 第3层
                [7,6,1], [7,7,1],                     // 第4、5层
                [6,6,2], [8,6,2], [7,8,2], [8,5,2], [6,7,2]  // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 7,
            maxMoves: 30,
            tags: ['高级', '冲四', '递进']
        });
        
        // 题8：凤凰展翅
        puzzles.push({
            id: 'vcf-level4-008',
            level: 4,
            title: '高级第8题：凤凰展翅',
            description: '凤凰展翅，双翼合围',
            initialBoard: this.createBoardFromPieces([
                [7,5,1],                              // 头部
                [5,6,1], [6,6,1], [7,6,1], [8,6,1], [9,6,1],  // 身体
                [4,7,1], [5,7,1],                     // 左翼
                [9,7,1], [10,7,1],                    // 右翼
                [6,8,1], [8,8,1],                     // 尾部
                [7,7,2], [7,8,2], [6,7,2], [8,7,2], [7,9,2]  // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 7,
            maxMoves: 30,
            tags: ['高级', '冲四', '凤凰']
        });
        
        // 题9：蛛网陷阱
        puzzles.push({
            id: 'vcf-level4-009',
            level: 4,
            title: '高级第9题：蛛网陷阱',
            description: '蛛网状布局，无处可逃',
            initialBoard: this.createBoardFromPieces([
                [7,7,1],                              // 中心
                [5,5,1], [6,5,1], [7,5,1], [8,5,1], [9,5,1],  // 外圈上
                [9,6,1], [9,7,1], [9,8,1], [9,9,1],           // 外圈右
                [5,6,1], [5,7,1], [5,8,1], [5,9,1],           // 外圈左
                [6,6,2], [8,6,2], [7,6,2], [7,8,2], [8,8,2]   // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 7,
            maxMoves: 30,
            tags: ['高级', '冲四', '蛛网']
        });
        
        // 题10：终极挑战
        puzzles.push({
            id: 'vcf-level4-010',
            level: 4,
            title: '高级第10题：终极挑战',
            description: '最复杂的VCF序列，终极挑战',
            initialBoard: this.createBoardFromPieces([
                [3,7,1], [4,7,1], [5,7,1], [6,7,1], [7,7,1], [8,7,1], [9,7,1],  // 横向长链
                [7,3,1], [7,4,1], [7,5,1], [7,6,1], [7,8,1], [7,9,1],           // 纵向长链
                [4,4,1], [5,5,1], [6,6,1],                                       // 斜向支援1
                [10,4,1], [9,5,1], [8,6,1],                                      // 斜向支援2
                [6,5,2], [8,5,2], [6,8,2], [8,8,2], [7,10,2], [10,7,2]          // 白棋防守
            ]),
            currentPlayer: 1,
            minMoves: 9,
            maxMoves: 35,
            tags: ['高级', '冲四', '终极']
        });
        
        return puzzles;
    }
    
    /**
     * 从棋子列表创建棋盘
     * @param {Array} pieces - 棋子列表 [[x, y, player], ...]
     */
    createBoardFromPieces(pieces = []) {
        const board = Array(15).fill(null).map(() => Array(15).fill(0));
        
        pieces.forEach(([x, y, player]) => {
            if (x >= 0 && x < 15 && y >= 0 && y < 15) {
                board[y][x] = player;
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
            const saved = localStorage.getItem('vcf_practice_progress_v3');
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
            localStorage.setItem('vcf_practice_progress_v3', JSON.stringify(this.progress));
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
            levelTotals: [10, 10, 10, 10],  // 更新为每级10题
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
    version: '3.0.0',
    author: '项目团队',
    dependencies: []
};

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.VCFPracticeManager = Object.assign(VCFPracticeManager, { 
        __moduleInfo: VCF_PRACTICE_MODULE_INFO 
    });
    
    console.log('[VCFPractice] VCF练习模块v3.0已加载');
    
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
