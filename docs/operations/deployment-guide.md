# H5五子棋游戏部署指南

## 概述

本文档提供了H5五子棋游戏的完整部署指南，包括开发环境设置、生产环境构建、部署配置和维护说明。

## 目录

- [系统要求](#系统要求)
- [开发环境部署](#开发环境部署)
- [生产环境构建](#生产环境构建)
- [部署配置](#部署配置)
- [PWA配置](#pwa配置)
- [性能优化](#性能优化)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 系统要求

### 浏览器支持

- **现代浏览器**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **移动浏览器**: iOS Safari 11+, Android Chrome 60+
- **必需功能**: HTML5 Canvas, ES6, LocalStorage, Web Workers

### 服务器要求

- **Web服务器**: Apache 2.4+, Nginx 1.12+, 或任何支持静态文件的服务器
- **HTTPS**: 推荐使用HTTPS（PWA功能需要）
- **压缩**: 支持Gzip/Brotli压缩
- **缓存**: 支持HTTP缓存头设置

## 开发环境部署

### 1. 快速启动

```bash
# 使用Python启动本地服务器
python -m http.server 8000

# 或使用Node.js
npx http-server -p 8000

# 或使用PHP
php -S localhost:8000
```

### 2. 访问应用

打开浏览器访问: `http://localhost:8000`

### 3. 开发工具

- **浏览器开发者工具**: 用于调试和性能分析
- **系统集成检查**: 访问 `http://localhost:8000/test-system-integration.html`
- **功能测试**: 访问 `http://localhost:8000/test.html`

## 生产环境构建

### 1. 使用构建脚本

```bash
# 如果有Node.js环境
node build.js

# 或使用浏览器版本
# 在浏览器控制台中运行:
# BuildSystem.generateProductionHTML()
# BuildSystem.generateManifest()
```

### 2. 手动构建步骤

1. **创建构建目录**
   ```bash
   mkdir dist
   ```

2. **复制核心文件**
   ```bash
   cp index.html dist/
   cp -r js/ dist/js/
   cp -r styles/ dist/styles/
   cp test.html dist/
   ```

3. **优化文件**
   - 压缩HTML、CSS、JavaScript文件
   - 移除注释和多余空白
   - 优化图片资源

4. **生成PWA文件**
   - 创建 `manifest.json`
   - 生成 Service Worker (`sw.js`)
   - 添加图标文件

### 3. 构建验证

```bash
# 验证构建结果
ls -la dist/
du -sh dist/

# 测试构建版本
cd dist
python -m http.server 8080
```

## 部署配置

### 1. Apache配置

创建 `.htaccess` 文件：

```apache
# 启用压缩
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# 设置缓存
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType application/json "access plus 1 hour"
</IfModule>

# 设置MIME类型
AddType application/manifest+json .webmanifest
AddType application/x-web-app-manifest+json .webapp

# 安全头
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# PWA支持
<Files "sw.js">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</Files>
```

### 2. Nginx配置

```nginx
server {
    listen 80;
    server_name gomoku.example.com;
    root /var/www/gomoku;
    index index.html;

    # 启用Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # 设置缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(html|json)$ {
        expires 1h;
        add_header Cache-Control "public";
    }

    # Service Worker特殊处理
    location /sw.js {
        expires 0;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    # 安全头
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # 错误页面
    error_page 404 /index.html;
}
```

### 3. CDN配置

如果使用CDN，需要配置：

```javascript
// 在main.js中添加CDN支持
const CDN_BASE_URL = 'https://cdn.example.com/gomoku/';

// 动态加载资源
function loadResource(path) {
    const isProduction = window.location.hostname !== 'localhost';
    return isProduction ? CDN_BASE_URL + path : path;
}
```

## PWA配置

### 1. Manifest文件

确保 `manifest.json` 包含正确配置：

```json
{
  "name": "五子棋游戏",
  "short_name": "五子棋",
  "description": "经典五子棋游戏，支持离线游戏",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#2c3e50",
  "background_color": "#f5f5f5",
  "icons": [
    {
      "src": "icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker

确保Service Worker正确注册：

```javascript
// 在main.js中添加
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
```

### 3. 图标生成

创建不同尺寸的图标：

```bash
# 使用ImageMagick生成不同尺寸
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 72x72 icon-72x72.png
```

## 性能优化

### 1. 资源优化

- **JavaScript压缩**: 移除注释、空白和未使用代码
- **CSS压缩**: 合并选择器、移除冗余样式
- **图片优化**: 使用WebP格式、适当压缩
- **字体优化**: 使用字体子集、预加载关键字体

### 2. 加载优化

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="js/main.js" as="script">
<link rel="preload" href="styles/main.css" as="style">

<!-- 预连接外部资源 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- 延迟加载非关键资源 -->
<script src="js/analytics.js" defer></script>
```

### 3. 缓存策略

```javascript
// Service Worker缓存策略
const CACHE_STRATEGY = {
    // 核心文件 - 缓存优先
    core: 'cache-first',
    // 游戏数据 - 网络优先
    data: 'network-first',
    // 静态资源 - 仅缓存
    static: 'cache-only'
};
```

## 监控和维护

### 1. 性能监控

```javascript
// 添加性能监控
window.addEventListener('load', function() {
    // 记录关键性能指标
    const perfData = performance.getEntriesByType('navigation')[0];
    
    console.log('页面加载时间:', perfData.loadEventEnd - perfData.fetchStart);
    console.log('DOM解析时间:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
    
    // 发送到分析服务
    if (window.gtag) {
        gtag('event', 'timing_complete', {
            name: 'load',
            value: Math.round(perfData.loadEventEnd - perfData.fetchStart)
        });
    }
});
```

### 2. 错误监控

```javascript
// 全局错误处理
window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
    
    // 发送错误报告
    if (window.gtag) {
        gtag('event', 'exception', {
            description: event.error.message,
            fatal: false
        });
    }
});

// Promise错误处理
window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise拒绝:', event.reason);
});
```

### 3. 用户分析

```javascript
// 游戏事件跟踪
function trackGameEvent(action, category = 'game') {
    if (window.gtag) {
        gtag('event', action, {
            event_category: category,
            event_label: gameManager.gameState.mode
        });
    }
}

// 使用示例
trackGameEvent('game_start');
trackGameEvent('game_end', 'game');
trackGameEvent('ai_move', 'ai');
```

## 故障排除

### 1. 常见问题

**问题**: 游戏无法加载
- **检查**: 浏览器控制台是否有JavaScript错误
- **解决**: 确保所有JavaScript文件正确加载

**问题**: Canvas不显示
- **检查**: 浏览器是否支持Canvas
- **解决**: 添加Canvas支持检测和降级方案

**问题**: PWA无法安装
- **检查**: HTTPS协议、manifest.json格式、Service Worker注册
- **解决**: 使用浏览器开发者工具的Application面板检查

### 2. 调试工具

```javascript
// 调试模式
const DEBUG = window.location.hostname === 'localhost';

if (DEBUG) {
    // 启用详细日志
    console.log('调试模式已启用');
    
    // 添加调试工具
    window.debugTools = {
        gameManager: gameManager,
        systemIntegrator: new SystemIntegrator(),
        exportLogs: function() {
            // 导出调试日志
        }
    };
}
```

### 3. 性能分析

```javascript
// 性能分析工具
class PerformanceProfiler {
    static profile(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
    
    static async profileAsync(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        
        console.log(`${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
}

// 使用示例
PerformanceProfiler.profile('AI计算', () => {
    return aiEngine.makeMove(board, 2);
});
```

## 版本管理

### 1. 版本号规则

使用语义化版本号 (Semantic Versioning):
- **主版本号**: 不兼容的API修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 2. 更新策略

```javascript
// 版本检查
const VERSION = '1.0.0';
const STORAGE_VERSION_KEY = 'app_version';

function checkVersion() {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    
    if (storedVersion !== VERSION) {
        // 执行版本迁移
        performVersionMigration(storedVersion, VERSION);
        localStorage.setItem(STORAGE_VERSION_KEY, VERSION);
    }
}

function performVersionMigration(from, to) {
    console.log(`版本迁移: ${from} -> ${to}`);
    
    // 执行必要的数据迁移
    if (from === '0.9.0' && to === '1.0.0') {
        // 迁移设置格式
        migrateSettings();
    }
}
```

## 安全考虑

### 1. 内容安全策略 (CSP)

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    connect-src 'self';
    font-src 'self';
    object-src 'none';
    media-src 'self';
    frame-src 'none';
">
```

### 2. 数据保护

```javascript
// 敏感数据处理
class DataProtection {
    static sanitizeInput(input) {
        // 清理用户输入
        return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    static encryptSensitiveData(data) {
        // 加密敏感数据（如果需要）
        return btoa(JSON.stringify(data));
    }
    
    static decryptSensitiveData(encryptedData) {
        // 解密数据
        try {
            return JSON.parse(atob(encryptedData));
        } catch (e) {
            return null;
        }
    }
}
```

## 结论

本部署指南涵盖了H5五子棋游戏从开发到生产的完整部署流程。遵循这些指南可以确保应用的稳定性、性能和安全性。

如有问题或需要支持，请参考项目文档或联系开发团队。