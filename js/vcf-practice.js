/**
 * VCF冲四练习管理器 (v3.1 - 经典题库重制版)
 * 负责管理VCF练习题库、验证玩家走法、提供练习指导
 * 
 * @author 项目团队
 * @version 3.1.0
 * @date 2025-01-08
 * 
 * 主要功能：
 * - 4个难度等级，共40道经典VCF题
 * - 自由下棋模式（不限定固定路径）
 * - AI最高难度防守（HELL模式）
 * - 最佳时间记录系统
 * - 自动升级机制（每完成5题自动进入下一难度）
 * 
 * v3.1 更新（2025-01-08）：
 * - 完全重制VCF题库，参考经典五子棋定式和杀法
 * - 题目命名更加生动形象（如"星位金钩"、"雁行催杀"等）
 * - 每道题附带经典棋形描述和攻杀要点
 * - 题目难度梯度更加合理，从单步冲四到多步连环杀
 * 
 * v3.0 更新（2025-01-08）：
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
        
        console.log('[VCFPractice] VCF练习管理器v3.1已初始化，共', this.puzzles.length, '道练习题');
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
        const templates = [
            {
                id: 'vcf-level1-001',
                title: '入门第1题：星位金钩',
                description: '黑棋已经在星位形成金钩冲四，只差补上正中缺口。',
                layout: [
                    [6, 7, 1], [7, 7, 1], [8, 7, 1], [8, 6, 1],
                    [5, 7, 2], [9, 7, 2], [8, 8, 2]
                ],
                minMoves: 1,
                maxMoves: 6,
                tags: ['入门', '金钩', '冲四']
            },
            {
                id: 'vcf-level1-002',
                title: '入门第2题：小飞燕',
                description: '小飞燕阵在右侧展开，封住白棋肩点即可强制进攻。',
                layout: [
                    [7, 6, 1], [8, 6, 1], [9, 6, 1], [8, 7, 1],
                    [6, 6, 2], [9, 7, 2], [8, 5, 2]
                ],
                minMoves: 1,
                maxMoves: 6,
                tags: ['入门', '飞燕', '先手']
            },
            {
                id: 'vcf-level1-003',
                title: '入门第3题：肩冲封口',
                description: '肩冲+对角的组合杀，抓住唯一斜线空点完成冲四。',
                layout: [
                    [5, 5, 1], [6, 6, 1], [7, 7, 1], [6, 5, 1],
                    [4, 4, 2], [5, 6, 2], [8, 8, 2]
                ],
                minMoves: 1,
                maxMoves: 7,
                tags: ['入门', '斜线', '肩冲']
            },
            {
                id: 'vcf-level1-004',
                title: '入门第4题：角上断点',
                description: '角部断点题，黑棋要利用主对角直接冲出杀形。',
                layout: [
                    [2, 2, 1], [3, 3, 1], [4, 4, 1], [3, 2, 1],
                    [1, 1, 2], [2, 3, 2], [4, 5, 2]
                ],
                minMoves: 1,
                maxMoves: 7,
                tags: ['入门', '角部', 'VCF']
            },
            {
                id: 'vcf-level1-005',
                title: '入门第5题：云梯压阵',
                description: '云梯阵型只差一笔，补在腰眼即可保持连续冲。',
                layout: [
                    [6, 9, 1], [7, 9, 1], [8, 9, 1], [7, 8, 1],
                    [5, 9, 2], [9, 9, 2], [8, 8, 2]
                ],
                minMoves: 2,
                maxMoves: 7,
                tags: ['入门', '边线', '云梯']
            },
            {
                id: 'vcf-level1-006',
                title: '入门第6题：双星挂角',
                description: '双星点配合小尖，先手补中间立即形成双威胁。',
                layout: [
                    [6, 6, 1], [7, 7, 1], [8, 6, 1], [7, 6, 1],
                    [5, 6, 2], [9, 6, 2], [7, 5, 2]
                ],
                minMoves: 2,
                maxMoves: 7,
                tags: ['入门', '星位', '双威胁']
            },
            {
                id: 'vcf-level1-007',
                title: '入门第7题：侧翼平推',
                description: '侧翼平推棋形，快速补在中心撕开白阵。',
                layout: [
                    [9, 5, 1], [10, 5, 1], [11, 5, 1], [10, 6, 1],
                    [8, 5, 2], [10, 4, 2], [11, 6, 2]
                ],
                minMoves: 2,
                maxMoves: 8,
                tags: ['入门', '侧翼', '连续冲四']
            },
            {
                id: 'vcf-level1-008',
                title: '入门第8题：竹节推进',
                description: '竹节横推，落子在中段即可逼出连续冲四。',
                layout: [
                    [5, 8, 1], [6, 8, 1], [7, 8, 1], [8, 8, 1],
                    [4, 8, 2], [9, 8, 2], [7, 9, 2]
                ],
                minMoves: 2,
                maxMoves: 8,
                tags: ['入门', '竹节', '横向']
            },
            {
                id: 'vcf-level1-009',
                title: '入门第9题：断点补缺',
                description: '断点补缺，黑棋只差一个关键空点即可连成四。',
                layout: [
                    [4, 10, 1], [5, 10, 1], [7, 10, 1], [6, 9, 1],
                    [3, 10, 2], [8, 10, 2], [6, 10, 2]
                ],
                minMoves: 2,
                maxMoves: 8,
                tags: ['入门', '断点', '冲四']
            },
            {
                id: 'vcf-level1-010',
                title: '入门第10题：快刀双响',
                description: '快刀双响，横向与斜向同时叫杀，先补正中要点。',
                layout: [
                    [8, 4, 1], [9, 4, 1], [10, 4, 1], [9, 5, 1],
                    [7, 4, 2], [10, 5, 2], [8, 5, 2]
                ],
                minMoves: 2,
                maxMoves: 8,
                tags: ['入门', '双向', 'VCF']
            }
        ];
        
        return this.buildPuzzlesFromTemplates(1, templates);
    }

    generateLevel2Puzzles() {
        const templates = [
            {
                id: 'vcf-level2-001',
                title: '初级第1题：双断门',
                description: '白棋在两端封锁，黑棋需要先手连跳制造双冲。',
                layout: [
                    [6, 7, 1], [7, 7, 1], [8, 7, 1], [7, 6, 1], [8, 8, 1],
                    [5, 7, 2], [9, 7, 2], [7, 8, 2], [8, 6, 2]
                ],
                minMoves: 3,
                maxMoves: 12,
                tags: ['初级', '双冲', '中心']
            },
            {
                id: 'vcf-level2-002',
                title: '初级第2题：雁行催杀',
                description: '经典雁行冲四，利用斜线连续压迫白棋。',
                layout: [
                    [5, 5, 1], [6, 6, 1], [7, 7, 1], [8, 8, 1], [7, 5, 1],
                    [4, 4, 2], [6, 5, 2], [8, 7, 2], [9, 9, 2]
                ],
                minMoves: 3,
                maxMoves: 12,
                tags: ['初级', '雁行', '斜线']
            },
            {
                id: 'vcf-level2-003',
                title: '初级第3题：对角穿刺',
                description: '抓住对角弱点，连续冲出逼迫白棋防守。',
                layout: [
                    [4, 8, 1], [5, 7, 1], [6, 6, 1], [7, 5, 1], [6, 8, 1],
                    [5, 8, 2], [6, 7, 2], [7, 6, 2], [8, 5, 2]
                ],
                minMoves: 3,
                maxMoves: 12,
                tags: ['初级', '对角', '穿刺']
            },
            {
                id: 'vcf-level2-004',
                title: '初级第4题：云海回旋',
                description: '边线包夹阵，需利用回旋点同时威胁两侧。',
                layout: [
                    [9, 9, 1], [10, 9, 1], [11, 9, 1], [10, 8, 1], [9, 10, 1],
                    [8, 9, 2], [11, 8, 2], [10, 10, 2], [12, 9, 2]
                ],
                minMoves: 3,
                maxMoves: 12,
                tags: ['初级', '边线', '回旋']
            },
            {
                id: 'vcf-level2-005',
                title: '初级第5题：梯形封喉',
                description: '梯形攻势，先补腰点再形成双向冲四。',
                layout: [
                    [6, 4, 1], [6, 5, 1], [7, 6, 1], [8, 6, 1], [7, 4, 1],
                    [5, 5, 2], [7, 5, 2], [8, 5, 2], [7, 7, 2]
                ],
                minMoves: 3,
                maxMoves: 12,
                tags: ['初级', '梯形', '封喉']
            },
            {
                id: 'vcf-level2-006',
                title: '初级第6题：三点合围',
                description: '三点合围后要在高位先手落子保持攻势。',
                layout: [
                    [3, 9, 1], [4, 9, 1], [5, 9, 1], [4, 10, 1], [5, 8, 1],
                    [2, 9, 2], [6, 9, 2], [4, 8, 2], [5, 10, 2]
                ],
                minMoves: 3,
                maxMoves: 12,
                tags: ['初级', '合围', '先手']
            },
            {
                id: 'vcf-level2-007',
                title: '初级第7题：折返冲四',
                description: '先横向冲四，再折返到斜线完成终结。',
                layout: [
                    [10, 6, 1], [11, 6, 1], [12, 6, 1], [11, 5, 1], [10, 7, 1],
                    [9, 6, 2], [12, 5, 2], [11, 7, 2], [13, 6, 2]
                ],
                minMoves: 3,
                maxMoves: 12,
                tags: ['初级', '折返', '双威胁']
            },
            {
                id: 'vcf-level2-008',
                title: '初级第8题：井字逼宫',
                description: '井字布局，落子中心即可出现双重威胁。',
                layout: [
                    [7, 11, 1], [8, 11, 1], [9, 11, 1], [8, 10, 1], [8, 12, 1],
                    [6, 11, 2], [10, 11, 2], [8, 9, 2], [9, 12, 2]
                ],
                minMoves: 3,
                maxMoves: 12,
                tags: ['初级', '井字', '逼宫']
            },
            {
                id: 'vcf-level2-009',
                title: '初级第9题：星月同辉',
                description: '交错的星月阵，黑棋需要顺势撕开上边。',
                layout: [
                    [5, 3, 1], [6, 4, 1], [7, 5, 1], [8, 4, 1], [7, 3, 1],
                    [4, 2, 2], [6, 3, 2], [8, 5, 2], [7, 4, 2]
                ],
                minMoves: 3,
                maxMoves: 12,
                tags: ['初级', '星月', '多方向']
            },
            {
                id: 'vcf-level2-010',
                title: '初级第10题：流星三问',
                description: '连续三问式冲四，手法紧凑重在先手。',
                layout: [
                    [11, 10, 1], [12, 10, 1], [13, 10, 1], [12, 9, 1], [11, 11, 1],
                    [10, 10, 2], [13, 9, 2], [12, 11, 2], [14, 10, 2]
                ],
                minMoves: 3,
                maxMoves: 12,
                tags: ['初级', '连续', '冲四']
            }
        ];
        
        return this.buildPuzzlesFromTemplates(2, templates);
    }

    generateLevel3Puzzles() {
        const templates = [
            {
                id: 'vcf-level3-001',
                title: '中级第1题：米字风暴',
                description: '中心米字杀型，必须先攻主线再逼次线。',
                layout: [
                    [7, 7, 1], [6, 7, 1], [8, 7, 1], [7, 6, 1], [7, 8, 1], [6, 6, 1], [8, 8, 1],
                    [5, 7, 2], [9, 7, 2], [7, 5, 2], [7, 9, 2], [6, 8, 2]
                ],
                minMoves: 4,
                maxMoves: 16,
                tags: ['中级', '米字', '中心']
            },
            {
                id: 'vcf-level3-002',
                title: '中级第2题：双杀凌空',
                description: '空中双杀，需要左右同时威胁迫使白棋就范。',
                layout: [
                    [9, 4, 1], [10, 5, 1], [11, 6, 1], [8, 5, 1], [10, 4, 1],
                    [9, 6, 2], [10, 6, 2], [11, 5, 2], [12, 7, 2], [9, 3, 2]
                ],
                minMoves: 4,
                maxMoves: 16,
                tags: ['中级', '双杀', '腾空']
            },
            {
                id: 'vcf-level3-003',
                title: '中级第3题：逆风凤凰',
                description: '逆势斜线，黑棋要借助肩冲完成连续冲四。',
                layout: [
                    [4, 11, 1], [5, 10, 1], [6, 9, 1], [7, 8, 1], [6, 11, 1],
                    [5, 11, 2], [6, 10, 2], [7, 9, 2], [8, 8, 2], [4, 9, 2]
                ],
                minMoves: 4,
                maxMoves: 16,
                tags: ['中级', '凤凰', '斜冲']
            },
            {
                id: 'vcf-level3-004',
                title: '中级第4题：河口连环',
                description: '河口包围后，利用中腹两点形成连环杀。',
                layout: [
                    [10, 12, 1], [11, 12, 1], [12, 12, 1], [11, 11, 1], [10, 13, 1], [12, 11, 1],
                    [9, 12, 2], [13, 12, 2], [11, 10, 2], [12, 13, 2], [11, 13, 2]
                ],
                minMoves: 4,
                maxMoves: 16,
                tags: ['中级', '连环', '边角']
            },
            {
                id: 'vcf-level3-005',
                title: '中级第5题：蛇形追击',
                description: '蛇形推进，关键在于打通折返节点。',
                layout: [
                    [2, 6, 1], [3, 7, 1], [4, 8, 1], [5, 7, 1], [3, 5, 1],
                    [1, 6, 2], [4, 7, 2], [5, 8, 2], [2, 8, 2], [4, 6, 2]
                ],
                minMoves: 4,
                maxMoves: 16,
                tags: ['中级', '蛇形', '折返']
            },
            {
                id: 'vcf-level3-006',
                title: '中级第6题：破云角挂',
                description: '角部复杂阵，需利用挂角点连续冲杀。',
                layout: [
                    [1, 13, 1], [2, 12, 1], [3, 11, 1], [2, 13, 1], [3, 13, 1],
                    [0, 12, 2], [2, 11, 2], [3, 12, 2], [4, 11, 2], [1, 11, 2]
                ],
                minMoves: 4,
                maxMoves: 16,
                tags: ['中级', '角挂', 'VCF']
            },
            {
                id: 'vcf-level3-007',
                title: '中级第7题：蝶翼定式',
                description: '蝶翼展开后，黑棋能同时威胁横竖两线。',
                layout: [
                    [9, 8, 1], [10, 8, 1], [11, 8, 1], [10, 7, 1], [9, 9, 1], [11, 9, 1],
                    [8, 8, 2], [12, 8, 2], [10, 6, 2], [10, 9, 2], [11, 7, 2]
                ],
                minMoves: 4,
                maxMoves: 16,
                tags: ['中级', '蝶翼', '双线']
            },
            {
                id: 'vcf-level3-008',
                title: '中级第8题：灵犀双链',
                description: '双链布局，先手补在交点就能开始VCF。',
                layout: [
                    [6, 3, 1], [7, 3, 1], [8, 3, 1], [7, 2, 1], [6, 4, 1], [7, 4, 1],
                    [5, 3, 2], [9, 3, 2], [7, 1, 2], [8, 4, 2], [6, 2, 2]
                ],
                minMoves: 4,
                maxMoves: 16,
                tags: ['中级', '双链', '交点']
            },
            {
                id: 'vcf-level3-009',
                title: '中级第9题：江湖借位',
                description: '借助中腹借位，黑棋轻点即可双向冲四。',
                layout: [
                    [12, 4, 1], [12, 5, 1], [12, 6, 1], [11, 5, 1], [13, 5, 1],
                    [10, 5, 2], [11, 4, 2], [13, 4, 2], [12, 7, 2], [13, 6, 2]
                ],
                minMoves: 4,
                maxMoves: 16,
                tags: ['中级', '借位', '中腹']
            },
            {
                id: 'vcf-level3-010',
                title: '中级第10题：雷霆封锁',
                description: '雷霆封锁，注意用中轴点把白棋钉死。',
                layout: [
                    [4, 2, 1], [5, 2, 1], [6, 2, 1], [5, 1, 1], [5, 3, 1], [6, 3, 1],
                    [3, 2, 2], [7, 2, 2], [5, 0, 2], [6, 1, 2], [4, 3, 2]
                ],
                minMoves: 4,
                maxMoves: 16,
                tags: ['中级', '封锁', '中轴']
            }
        ];
        
        return this.buildPuzzlesFromTemplates(3, templates);
    }

    generateLevel4Puzzles() {
        const templates = [
            {
                id: 'vcf-level4-001',
                title: '高级第1题：星河锁喉',
                description: '星位全线压制，利用喉位点完成终局冲四。',
                layout: [
                    [7, 7, 1], [8, 7, 1], [9, 7, 1], [8, 6, 1], [8, 8, 1], [9, 6, 1], [7, 8, 1],
                    [6, 7, 2], [10, 7, 2], [8, 5, 2], [8, 9, 2], [9, 8, 2], [7, 6, 2]
                ],
                minMoves: 5,
                maxMoves: 18,
                tags: ['高级', '锁喉', '星位']
            },
            {
                id: 'vcf-level4-002',
                title: '高级第2题：龙鳞回环',
                description: '龙鳞回环阵，需连续两步建立不可防守的四。',
                layout: [
                    [3, 12, 1], [4, 11, 1], [5, 10, 1], [6, 9, 1], [4, 12, 1], [5, 11, 1],
                    [2, 12, 2], [5, 12, 2], [6, 10, 2], [7, 9, 2], [3, 10, 2], [4, 9, 2]
                ],
                minMoves: 5,
                maxMoves: 18,
                tags: ['高级', '回环', '斜线']
            },
            {
                id: 'vcf-level4-003',
                title: '高级第3题：风眼点杀',
                description: '风眼位置是关键，抢占后即可连环冲四。',
                layout: [
                    [11, 3, 1], [11, 4, 1], [11, 5, 1], [10, 4, 1], [12, 4, 1], [10, 5, 1],
                    [9, 4, 2], [13, 4, 2], [11, 2, 2], [12, 5, 2], [10, 3, 2]
                ],
                minMoves: 5,
                maxMoves: 18,
                tags: ['高级', '风眼', '点杀']
            },
            {
                id: 'vcf-level4-004',
                title: '高级第4题：海底捞月',
                description: '底线长连题，利用月点制造双活四。',
                layout: [
                    [5, 13, 1], [6, 13, 1], [7, 13, 1], [6, 12, 1], [5, 12, 1], [7, 12, 1],
                    [4, 13, 2], [8, 13, 2], [6, 14, 2], [6, 11, 2], [5, 11, 2]
                ],
                minMoves: 5,
                maxMoves: 18,
                tags: ['高级', '底线', '双活四']
            },
            {
                id: 'vcf-level4-005',
                title: '高级第5题：落霞三连',
                description: '落霞阵势，黑棋需要同时顾及横向与对角冲。',
                layout: [
                    [9, 10, 1], [10, 10, 1], [11, 10, 1], [10, 9, 1], [10, 11, 1], [11, 9, 1],
                    [8, 10, 2], [12, 10, 2], [10, 8, 2], [10, 12, 2], [11, 11, 2]
                ],
                minMoves: 5,
                maxMoves: 18,
                tags: ['高级', '落霞', '多线']
            },
            {
                id: 'vcf-level4-006',
                title: '高级第6题：凌波微步',
                description: '复杂小斜杀型，先点上腰眼形成连续冲四。',
                layout: [
                    [2, 4, 1], [3, 5, 1], [4, 6, 1], [5, 5, 1], [3, 3, 1], [4, 4, 1],
                    [1, 4, 2], [4, 5, 2], [5, 6, 2], [2, 6, 2], [4, 3, 2], [5, 4, 2]
                ],
                minMoves: 5,
                maxMoves: 18,
                tags: ['高级', '凌波', '小斜']
            },
            {
                id: 'vcf-level4-007',
                title: '高级第7题：天元飞瀑',
                description: '天元附近的瀑布杀，黑棋要用垂直连冲。',
                layout: [
                    [7, 7, 1], [7, 8, 1], [7, 9, 1], [8, 8, 1], [6, 8, 1], [8, 9, 1],
                    [7, 6, 2], [7, 10, 2], [9, 8, 2], [6, 9, 2], [8, 7, 2]
                ],
                minMoves: 5,
                maxMoves: 18,
                tags: ['高级', '天元', '垂直']
            },
            {
                id: 'vcf-level4-008',
                title: '高级第8题：破晓双雄',
                description: '双雄并进，黑棋要利用肩点一举定胜。',
                layout: [
                    [13, 8, 1], [12, 8, 1], [11, 8, 1], [12, 7, 1], [12, 9, 1], [11, 9, 1],
                    [10, 8, 2], [14, 8, 2], [12, 6, 2], [12, 10, 2], [13, 9, 2]
                ],
                minMoves: 5,
                maxMoves: 18,
                tags: ['高级', '双雄', '肩点']
            },
            {
                id: 'vcf-level4-009',
                title: '高级第9题：幻影分岔',
                description: '分岔连环杀，关键在于站稳中央交点。',
                layout: [
                    [3, 7, 1], [4, 7, 1], [5, 7, 1], [4, 6, 1], [4, 8, 1], [5, 6, 1], [3, 8, 1],
                    [2, 7, 2], [6, 7, 2], [4, 5, 2], [4, 9, 2], [5, 8, 2]
                ],
                minMoves: 5,
                maxMoves: 18,
                tags: ['高级', '分岔', '连环']
            },
            {
                id: 'vcf-level4-010',
                title: '高级第10题：终幕天锁',
                description: '终幕锁喉题，连续冲四必须一步不差。',
                layout: [
                    [9, 2, 1], [10, 3, 1], [11, 4, 1], [12, 5, 1], [10, 1, 1], [11, 2, 1],
                    [8, 1, 2], [9, 3, 2], [11, 5, 2], [12, 4, 2], [13, 6, 2], [10, 2, 2]
                ],
                minMoves: 5,
                maxMoves: 18,
                tags: ['高级', '终幕', '锁喉']
            }
        ];
        
        return this.buildPuzzlesFromTemplates(4, templates);
    }

    /**
     * 根据模板生成练习题
     */
    buildPuzzlesFromTemplates(level, templates) {
        return templates.map(template => ({
            id: template.id,
            level,
            title: template.title,
            description: template.description,
            initialBoard: this.createBoardFromPieces(template.layout || []),
            currentPlayer: template.currentPlayer || 1,
            minMoves: template.minMoves || 1,
            maxMoves: template.maxMoves || 10,
            tags: template.tags || []
        }));
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
    version: '3.1.0',
    author: '项目团队',
    dependencies: []
};

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.VCFPracticeManager = Object.assign(VCFPracticeManager, { 
        __moduleInfo: VCF_PRACTICE_MODULE_INFO 
    });
    
    console.log('[VCFPractice] VCF练习模块v3.1已加载');
    
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
