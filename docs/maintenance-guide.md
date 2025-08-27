# H5五子棋游戏维护指南

## 概述

本文档提供了H5五子棋游戏的日常维护、监控、故障排除和更新指南，帮助维护人员确保系统的稳定运行。

## 目录

- [日常维护任务](#日常维护任务)
- [系统监控](#系统监控)
- [性能优化](#性能优化)
- [故障排除](#故障排除)
- [数据管理](#数据管理)
- [安全维护](#安全维护)
- [版本更新](#版本更新)
- [备份和恢复](#备份和恢复)

## 日常维护任务

### 每日检查

1. **系统状态检查**
   ```bash
   # 检查服务器状态
   curl -I https://your-domain.com
   
   # 检查响应时间
   curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com
   ```

2. **错误日志检查**
   ```bash
   # 检查Web服务器错误日志
   tail -f /var/log/nginx/error.log
   tail -f /var/log/apache2/error.log
   
   # 检查访问日志中的异常
   grep "5[0-9][0-9]" /var/log/nginx/access.log
   ```

3. **性能指标监控**
   - 页面加载时间
   - 资源加载速度
   - 用户交互响应时间
   - 内存使用情况

### 每周维护

1. **缓存清理**
   ```bash
   # 清理过期缓存
   find /var/cache/nginx -type f -mtime +7 -delete
   
   # 重启缓存服务
   systemctl restart nginx
   ```

2. **数据库维护**（如果使用）
   ```sql
   -- 清理过期数据
   DELETE FROM game_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
   
   -- 优化表
   OPTIMIZE TABLE game_logs;
   ```

3. **安全扫描**
   ```bash
   # 检查文件权限
   find /var/www/gomoku -type f -perm 777
   
   # 检查可疑文件
   find /var/www/gomoku -name "*.php" -o -name "*.jsp"
   ```

### 每月维护

1. **性能分析报告**
2. **用户行为分析**
3. **系统资源使用评估**
4. **安全漏洞扫描**
5. **备份验证**

## 系统监控

### 1. 实时监控脚本

创建监控脚本 `monitor.sh`:

```bash
#!/bin/bash

# 配置
DOMAIN="your-domain.com"
LOG_FILE="/var/log/gomoku-monitor.log"
ALERT_EMAIL="admin@your-domain.com"

# 检查网站可用性
check_availability() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
    
    if [ "$response" != "200" ]; then
        echo "$(date): 网站不可用 - HTTP $response" >> $LOG_FILE
        send_alert "网站不可用" "HTTP响应码: $response"
        return 1
    fi
    
    return 0
}

# 检查响应时间
check_response_time() {
    local response_time=$(curl -w "%{time_total}" -o /dev/null -s https://$DOMAIN)
    local threshold=3.0
    
    if (( $(echo "$response_time > $threshold" | bc -l) )); then
        echo "$(date): 响应时间过慢 - ${response_time}s" >> $LOG_FILE
        send_alert "响应时间过慢" "当前响应时间: ${response_time}s"
    fi
}

# 检查SSL证书
check_ssl_certificate() {
    local expiry_date=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    local expiry_timestamp=$(date -d "$expiry_date" +%s)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    if [ $days_until_expiry -lt 30 ]; then
        echo "$(date): SSL证书即将过期 - $days_until_expiry 天" >> $LOG_FILE
        send_alert "SSL证书即将过期" "剩余天数: $days_until_expiry"
    fi
}

# 发送警报
send_alert() {
    local subject="$1"
    local message="$2"
    
    echo "$message" | mail -s "[$DOMAIN] $subject" $ALERT_EMAIL
}

# 主监控循环
main() {
    echo "$(date): 开始监控检查" >> $LOG_FILE
    
    check_availability
    check_response_time
    check_ssl_certificate
    
    echo "$(date): 监控检查完成" >> $LOG_FILE
}

# 运行监控
main
```

### 2. 性能监控

创建性能监控脚本 `performance-monitor.js`:

```javascript
// 性能监控类
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: [],
            renderTime: [],
            memoryUsage: [],
            errorCount: 0,
            userSessions: 0
        };
        
        this.thresholds = {
            pageLoadTime: 3000, // 3秒
            renderTime: 16, // 16ms (60fps)
            memoryUsage: 50 * 1024 * 1024, // 50MB
            errorRate: 0.05 // 5%
        };
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        // 监控页面加载时间
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.recordMetric('pageLoad', loadTime);
            
            if (loadTime > this.thresholds.pageLoadTime) {
                this.sendAlert('页面加载时间过长', `加载时间: ${loadTime}ms`);
            }
        });
        
        // 监控内存使用
        if (performance.memory) {
            setInterval(() => {
                const memoryUsage = performance.memory.usedJSHeapSize;
                this.recordMetric('memoryUsage', memoryUsage);
                
                if (memoryUsage > this.thresholds.memoryUsage) {
                    this.sendAlert('内存使用过高', `内存使用: ${this.formatBytes(memoryUsage)}`);
                }
            }, 30000); // 每30秒检查一次
        }
        
        // 监控错误
        window.addEventListener('error', (event) => {
            this.metrics.errorCount++;
            this.recordError(event.error);
        });
        
        // 监控用户会话
        this.metrics.userSessions++;
        
        // 定期发送报告
        setInterval(() => {
            this.generateReport();
        }, 300000); // 每5分钟生成一次报告
    }
    
    recordMetric(type, value) {
        this.metrics[type].push({
            value: value,
            timestamp: Date.now()
        });
        
        // 保持最近100条记录
        if (this.metrics[type].length > 100) {
            this.metrics[type].shift();
        }
    }
    
    recordError(error) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // 发送错误报告
        this.sendErrorReport(errorData);
    }
    
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: {
                avgPageLoadTime: this.calculateAverage('pageLoad'),
                avgRenderTime: this.calculateAverage('renderTime'),
                avgMemoryUsage: this.calculateAverage('memoryUsage'),
                errorCount: this.metrics.errorCount,
                userSessions: this.metrics.userSessions
            },
            alerts: this.checkThresholds()
        };
        
        console.log('性能报告:', report);
        
        // 发送报告到监控服务
        this.sendReport(report);
    }
    
    calculateAverage(metricType) {
        const metrics = this.metrics[metricType];
        if (metrics.length === 0) return 0;
        
        const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
        return sum / metrics.length;
    }
    
    checkThresholds() {
        const alerts = [];
        
        const avgPageLoad = this.calculateAverage('pageLoad');
        if (avgPageLoad > this.thresholds.pageLoadTime) {
            alerts.push(`平均页面加载时间过长: ${avgPageLoad.toFixed(2)}ms`);
        }
        
        const avgMemory = this.calculateAverage('memoryUsage');
        if (avgMemory > this.thresholds.memoryUsage) {
            alerts.push(`平均内存使用过高: ${this.formatBytes(avgMemory)}`);
        }
        
        const errorRate = this.metrics.errorCount / this.metrics.userSessions;
        if (errorRate > this.thresholds.errorRate) {
            alerts.push(`错误率过高: ${(errorRate * 100).toFixed(2)}%`);
        }
        
        return alerts;
    }
    
    sendAlert(title, message) {
        console.warn(`[警报] ${title}: ${message}`);
        
        // 发送到监控服务
        if (window.monitoringService) {
            window.monitoringService.sendAlert(title, message);
        }
    }
    
    sendErrorReport(errorData) {
        console.error('错误报告:', errorData);
        
        // 发送到错误跟踪服务
        if (window.errorTrackingService) {
            window.errorTrackingService.reportError(errorData);
        }
    }
    
    sendReport(report) {
        // 发送到分析服务
        if (window.analyticsService) {
            window.analyticsService.sendReport(report);
        }
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 启动性能监控
if (typeof window !== 'undefined') {
    window.performanceMonitor = new PerformanceMonitor();
}
```

## 性能优化

### 1. 定期性能审计

```javascript
// 性能审计工具
class PerformanceAuditor {
    static async runAudit() {
        const results = {
            timestamp: Date.now(),
            tests: []
        };
        
        // 测试页面加载时间
        results.tests.push(await this.testPageLoadTime());
        
        // 测试渲染性能
        results.tests.push(await this.testRenderPerformance());
        
        // 测试内存使用
        results.tests.push(await this.testMemoryUsage());
        
        // 测试AI响应时间
        results.tests.push(await this.testAIResponseTime());
        
        return results;
    }
    
    static async testPageLoadTime() {
        const startTime = performance.now();
        
        // 模拟页面重新加载
        await new Promise(resolve => {
            const iframe = document.createElement('iframe');
            iframe.src = window.location.href;
            iframe.style.display = 'none';
            
            iframe.onload = () => {
                document.body.removeChild(iframe);
                resolve();
            };
            
            document.body.appendChild(iframe);
        });
        
        const loadTime = performance.now() - startTime;
        
        return {
            name: '页面加载时间',
            value: loadTime,
            unit: 'ms',
            passed: loadTime < 3000,
            threshold: 3000
        };
    }
    
    static async testRenderPerformance() {
        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 480;
        document.body.appendChild(canvas);
        
        try {
            const renderer = new CanvasRenderer(canvas.id = 'audit-canvas');
            const board = new Board();
            
            const startTime = performance.now();
            
            // 渲染100次
            for (let i = 0; i < 100; i++) {
                renderer.render(board, { currentPlayer: 1 });
            }
            
            const renderTime = (performance.now() - startTime) / 100;
            
            return {
                name: '平均渲染时间',
                value: renderTime,
                unit: 'ms',
                passed: renderTime < 16,
                threshold: 16
            };
        } finally {
            document.body.removeChild(canvas);
        }
    }
    
    static async testMemoryUsage() {
        if (!performance.memory) {
            return {
                name: '内存使用测试',
                value: 0,
                unit: 'bytes',
                passed: true,
                note: '浏览器不支持内存监控'
            };
        }
        
        const initialMemory = performance.memory.usedJSHeapSize;
        
        // 创建一些对象来测试内存管理
        const objects = [];
        for (let i = 0; i < 1000; i++) {
            objects.push(new GameManager());
        }
        
        const peakMemory = performance.memory.usedJSHeapSize;
        
        // 清理对象
        objects.length = 0;
        
        // 强制垃圾回收（如果支持）
        if (window.gc) {
            window.gc();
        }
        
        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryLeak = finalMemory - initialMemory;
        
        return {
            name: '内存泄漏测试',
            value: memoryLeak,
            unit: 'bytes',
            passed: memoryLeak < 1024 * 1024, // 小于1MB
            threshold: 1024 * 1024,
            details: {
                initial: initialMemory,
                peak: peakMemory,
                final: finalMemory
            }
        };
    }
    
    static async testAIResponseTime() {
        const aiEngine = new AIEngine(new RuleEngine());
        const board = new Board();
        
        const startTime = performance.now();
        const move = await aiEngine.makeMove(board, 2);
        const responseTime = performance.now() - startTime;
        
        return {
            name: 'AI响应时间',
            value: responseTime,
            unit: 'ms',
            passed: responseTime < 3000,
            threshold: 3000,
            moveGenerated: !!move
        };
    }
}
```

### 2. 缓存优化

```javascript
// 缓存管理器
class CacheManager {
    static optimizeCache() {
        // 清理过期的localStorage数据
        this.cleanupLocalStorage();
        
        // 优化Service Worker缓存
        this.optimizeServiceWorkerCache();
        
        // 预加载关键资源
        this.preloadCriticalResources();
    }
    
    static cleanupLocalStorage() {
        const keysToCheck = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('gomoku_')) {
                keysToCheck.push(key);
            }
        }
        
        keysToCheck.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                
                // 检查是否有过期时间
                if (data.expiry && Date.now() > data.expiry) {
                    localStorage.removeItem(key);
                    console.log(`清理过期数据: ${key}`);
                }
            } catch (error) {
                // 损坏的数据也清理掉
                localStorage.removeItem(key);
                console.log(`清理损坏数据: ${key}`);
            }
        });
    }
    
    static async optimizeServiceWorkerCache() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            
            if (registration.active) {
                registration.active.postMessage({
                    command: 'OPTIMIZE_CACHE'
                });
            }
        }
    }
    
    static preloadCriticalResources() {
        const criticalResources = [
            'js/GameManager.js',
            'js/Board.js',
            'js/RuleEngine.js',
            'js/CanvasRenderer.js'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = resource;
            document.head.appendChild(link);
        });
    }
}
```

## 故障排除

### 1. 常见问题诊断

```javascript
// 系统诊断工具
class SystemDiagnostics {
    static async runDiagnostics() {
        const results = {
            timestamp: Date.now(),
            browser: this.getBrowserInfo(),
            system: this.getSystemInfo(),
            tests: []
        };
        
        // 运行各种诊断测试
        results.tests.push(this.testJavaScriptSupport());
        results.tests.push(this.testCanvasSupport());
        results.tests.push(this.testLocalStorageSupport());
        results.tests.push(this.testWebWorkerSupport());
        results.tests.push(await this.testNetworkConnectivity());
        
        return results;
    }
    
    static getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
    }
    
    static getSystemInfo() {
        return {
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            memory: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }
    
    static testJavaScriptSupport() {
        try {
            // 测试ES6功能
            const arrow = () => 'test';
            const [a, b] = [1, 2];
            const obj = { a, b };
            
            return {
                name: 'JavaScript支持',
                passed: true,
                details: 'ES6功能正常'
            };
        } catch (error) {
            return {
                name: 'JavaScript支持',
                passed: false,
                error: error.message
            };
        }
    }
    
    static testCanvasSupport() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            return {
                name: 'Canvas支持',
                passed: !!ctx,
                details: ctx ? 'Canvas 2D上下文可用' : 'Canvas不支持'
            };
        } catch (error) {
            return {
                name: 'Canvas支持',
                passed: false,
                error: error.message
            };
        }
    }
    
    static testLocalStorageSupport() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            
            return {
                name: 'LocalStorage支持',
                passed: true,
                details: 'LocalStorage可用'
            };
        } catch (error) {
            return {
                name: 'LocalStorage支持',
                passed: false,
                error: error.message
            };
        }
    }
    
    static testWebWorkerSupport() {
        return {
            name: 'Web Worker支持',
            passed: typeof Worker !== 'undefined',
            details: typeof Worker !== 'undefined' ? 'Web Worker可用' : 'Web Worker不支持'
        };
    }
    
    static async testNetworkConnectivity() {
        try {
            const response = await fetch(window.location.href, {
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            return {
                name: '网络连接',
                passed: response.ok,
                details: `HTTP ${response.status} ${response.statusText}`
            };
        } catch (error) {
            return {
                name: '网络连接',
                passed: false,
                error: error.message
            };
        }
    }
}
```

### 2. 自动修复工具

```javascript
// 自动修复工具
class AutoRepair {
    static async attemptRepair() {
        const repairs = [];
        
        // 修复损坏的localStorage数据
        repairs.push(await this.repairLocalStorage());
        
        // 重置游戏状态
        repairs.push(await this.resetGameState());
        
        // 清理缓存
        repairs.push(await this.clearCache());
        
        return repairs;
    }
    
    static async repairLocalStorage() {
        try {
            let repairedCount = 0;
            
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                
                if (key && key.startsWith('gomoku_')) {
                    try {
                        JSON.parse(localStorage.getItem(key));
                    } catch (error) {
                        localStorage.removeItem(key);
                        repairedCount++;
                    }
                }
            }
            
            return {
                name: 'LocalStorage修复',
                success: true,
                details: `修复了${repairedCount}个损坏的数据项`
            };
        } catch (error) {
            return {
                name: 'LocalStorage修复',
                success: false,
                error: error.message
            };
        }
    }
    
    static async resetGameState() {
        try {
            if (window.gameManager) {
                window.gameManager.startNewGame();
            }
            
            return {
                name: '游戏状态重置',
                success: true,
                details: '游戏状态已重置'
            };
        } catch (error) {
            return {
                name: '游戏状态重置',
                success: false,
                error: error.message
            };
        }
    }
    
    static async clearCache() {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }
            
            return {
                name: '缓存清理',
                success: true,
                details: '所有缓存已清理'
            };
        } catch (error) {
            return {
                name: '缓存清理',
                success: false,
                error: error.message
            };
        }
    }
}
```

## 数据管理

### 1. 数据备份策略

```bash
#!/bin/bash

# 数据备份脚本
BACKUP_DIR="/backup/gomoku"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="gomoku_backup_$DATE.tar.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份网站文件
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    --exclude='*.log' \
    --exclude='node_modules' \
    --exclude='.git' \
    /var/www/gomoku/

# 保留最近30天的备份
find $BACKUP_DIR -name "gomoku_backup_*.tar.gz" -mtime +30 -delete

echo "备份完成: $BACKUP_FILE"
```

### 2. 数据清理脚本

```javascript
// 数据清理工具
class DataCleaner {
    static async cleanupOldData() {
        const results = {
            localStorage: await this.cleanupLocalStorage(),
            indexedDB: await this.cleanupIndexedDB(),
            cache: await this.cleanupCache()
        };
        
        return results;
    }
    
    static async cleanupLocalStorage() {
        let cleanedItems = 0;
        const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30天前
        
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            
            if (key && key.startsWith('gomoku_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    
                    if (data.timestamp && data.timestamp < cutoffTime) {
                        localStorage.removeItem(key);
                        cleanedItems++;
                    }
                } catch (error) {
                    // 损坏的数据也清理
                    localStorage.removeItem(key);
                    cleanedItems++;
                }
            }
        }
        
        return {
            type: 'localStorage',
            cleanedItems: cleanedItems
        };
    }
    
    static async cleanupIndexedDB() {
        // 如果使用IndexedDB，在这里添加清理逻辑
        return {
            type: 'indexedDB',
            cleanedItems: 0,
            note: '未使用IndexedDB'
        };
    }
    
    static async cleanupCache() {
        let cleanedCaches = 0;
        
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            
            for (const cacheName of cacheNames) {
                if (cacheName.includes('old') || cacheName.includes('v0')) {
                    await caches.delete(cacheName);
                    cleanedCaches++;
                }
            }
        }
        
        return {
            type: 'cache',
            cleanedItems: cleanedCaches
        };
    }
}
```

## 安全维护

### 1. 安全检查清单

- [ ] SSL证书有效性检查
- [ ] 安全头配置验证
- [ ] 文件权限检查
- [ ] 输入验证测试
- [ ] XSS防护测试
- [ ] CSRF防护验证
- [ ] 内容安全策略检查

### 2. 安全扫描脚本

```bash
#!/bin/bash

# 安全扫描脚本
DOMAIN="your-domain.com"
REPORT_FILE="/var/log/security-scan-$(date +%Y%m%d).log"

echo "开始安全扫描: $(date)" > $REPORT_FILE

# 检查SSL配置
echo "=== SSL检查 ===" >> $REPORT_FILE
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -dates >> $REPORT_FILE

# 检查HTTP头
echo "=== HTTP头检查 ===" >> $REPORT_FILE
curl -I https://$DOMAIN >> $REPORT_FILE

# 检查文件权限
echo "=== 文件权限检查 ===" >> $REPORT_FILE
find /var/www/gomoku -type f -perm 777 >> $REPORT_FILE

# 检查可疑文件
echo "=== 可疑文件检查 ===" >> $REPORT_FILE
find /var/www/gomoku -name "*.php" -o -name "*.jsp" -o -name "*.asp" >> $REPORT_FILE

echo "安全扫描完成: $(date)" >> $REPORT_FILE
```

## 版本更新

### 1. 更新流程

1. **准备阶段**
   - 备份当前版本
   - 测试新版本
   - 准备回滚计划

2. **部署阶段**
   - 停止服务（如需要）
   - 更新文件
   - 更新配置
   - 重启服务

3. **验证阶段**
   - 功能测试
   - 性能测试
   - 用户验收测试

### 2. 自动更新脚本

```bash
#!/bin/bash

# 自动更新脚本
VERSION=$1
BACKUP_DIR="/backup/gomoku"
WEB_DIR="/var/www/gomoku"

if [ -z "$VERSION" ]; then
    echo "使用方法: $0 <version>"
    exit 1
fi

echo "开始更新到版本: $VERSION"

# 1. 创建备份
echo "创建备份..."
tar -czf "$BACKUP_DIR/pre-update-backup-$(date +%Y%m%d_%H%M%S).tar.gz" $WEB_DIR

# 2. 下载新版本
echo "下载新版本..."
wget -O "/tmp/gomoku-$VERSION.tar.gz" "https://releases.example.com/gomoku-$VERSION.tar.gz"

# 3. 解压并部署
echo "部署新版本..."
tar -xzf "/tmp/gomoku-$VERSION.tar.gz" -C /tmp/
rsync -av "/tmp/gomoku-$VERSION/" $WEB_DIR/

# 4. 更新权限
echo "更新权限..."
chown -R www-data:www-data $WEB_DIR
chmod -R 644 $WEB_DIR
find $WEB_DIR -type d -exec chmod 755 {} \;

# 5. 重启服务
echo "重启服务..."
systemctl reload nginx

# 6. 验证部署
echo "验证部署..."
sleep 5
if curl -f https://your-domain.com > /dev/null 2>&1; then
    echo "更新成功!"
else
    echo "更新失败，开始回滚..."
    # 回滚逻辑
    tar -xzf "$BACKUP_DIR/pre-update-backup-$(date +%Y%m%d)*.tar.gz" -C /
    systemctl reload nginx
    echo "已回滚到之前版本"
fi

# 7. 清理临时文件
rm -f "/tmp/gomoku-$VERSION.tar.gz"
rm -rf "/tmp/gomoku-$VERSION"

echo "更新流程完成"
```

## 备份和恢复

### 1. 自动备份脚本

```bash
#!/bin/bash

# 自动备份脚本
BACKUP_DIR="/backup/gomoku"
WEB_DIR="/var/www/gomoku"
RETENTION_DAYS=30

# 创建备份目录
mkdir -p $BACKUP_DIR

# 创建备份
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/gomoku_backup_$DATE.tar.gz"

tar -czf $BACKUP_FILE \
    --exclude='*.log' \
    --exclude='tmp/*' \
    $WEB_DIR

# 压缩备份
gzip $BACKUP_FILE

# 清理旧备份
find $BACKUP_DIR -name "gomoku_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# 验证备份
if [ -f "$BACKUP_FILE.gz" ]; then
    echo "备份成功: $BACKUP_FILE.gz"
    
    # 发送通知
    echo "Gomoku备份完成: $DATE" | mail -s "备份通知" admin@your-domain.com
else
    echo "备份失败!"
    echo "Gomoku备份失败: $DATE" | mail -s "备份失败警报" admin@your-domain.com
fi
```

### 2. 恢复脚本

```bash
#!/bin/bash

# 恢复脚本
BACKUP_FILE=$1
WEB_DIR="/var/www/gomoku"

if [ -z "$BACKUP_FILE" ]; then
    echo "使用方法: $0 <backup_file>"
    echo "可用备份:"
    ls -la /backup/gomoku/
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "备份文件不存在: $BACKUP_FILE"
    exit 1
fi

echo "开始恢复: $BACKUP_FILE"

# 确认操作
read -p "确定要恢复吗？这将覆盖当前文件 (y/N): " confirm
if [ "$confirm" != "y" ]; then
    echo "操作已取消"
    exit 0
fi

# 创建当前状态备份
echo "创建当前状态备份..."
tar -czf "/backup/gomoku/pre-restore-backup-$(date +%Y%m%d_%H%M%S).tar.gz" $WEB_DIR

# 恢复文件
echo "恢复文件..."
tar -xzf $BACKUP_FILE -C /

# 设置权限
echo "设置权限..."
chown -R www-data:www-data $WEB_DIR
chmod -R 644 $WEB_DIR
find $WEB_DIR -type d -exec chmod 755 {} \;

# 重启服务
echo "重启服务..."
systemctl reload nginx

echo "恢复完成"
```

## 总结

本维护指南提供了H5五子棋游戏的全面维护方案，包括：

- 日常、周期性维护任务
- 实时监控和性能分析
- 故障诊断和自动修复
- 数据管理和清理
- 安全维护和扫描
- 版本更新流程
- 备份和恢复策略

遵循这些维护指南可以确保系统的稳定运行、最佳性能和数据安全。建议根据实际环境和需求调整相关配置和脚本。