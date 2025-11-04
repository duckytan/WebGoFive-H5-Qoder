/**
 * 五子棋游戏通用工具模块
 * 提供通用功能函数，避免代码重复
 * 
 * @author 项目团队
 * @version 1.0.0
 */

const GameUtils = {
    /**
     * 显示消息提示
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型: 'info'|'success'|'warning'|'error'
     * @param {number} duration - 显示时长(ms)，默认3000
     */
    showMessage(message, type = 'info', duration = 3000) {
        const hintMessage = document.getElementById('hint-message');
        if (!hintMessage) {
            console.log(`[${type.toUpperCase()}] ${message}`);
            return;
        }

        hintMessage.textContent = message;
        
        // 根据类型设置样式
        hintMessage.className = 'hint-message';
        const colorMap = {
            error: '#d32f2f',
            success: '#388e3c',
            warning: '#f57c00',
            info: ''
        };
        
        const color = colorMap[type] || '';
        hintMessage.style.color = color;
        hintMessage.style.borderColor = color;
        
        // 指定时长后恢复默认样式
        if (duration > 0) {
            setTimeout(() => {
                hintMessage.style.color = '';
                hintMessage.style.borderColor = '';
            }, duration);
        }
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    },

    /**
     * 格式化时间戳为可读字符串
     * @param {Date|number} timestamp - 时间戳或Date对象
     * @returns {string} 格式化的时间字符串
     */
    formatTime(timestamp) {
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    },

    /**
     * 格式化游戏时长
     * @param {number} seconds - 秒数
     * @returns {string} 格式化的时长字符串
     */
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    /**
     * 生成文件名
     * @param {string} prefix - 文件名前缀
     * @param {string} extension - 文件扩展名（不含点）
     * @returns {string} 生成的文件名
     */
    generateFileName(prefix = 'gomoku', extension = 'json') {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        
        return `${prefix}_${year}${month}${day}_${hour}${minute}${second}.${extension}`;
    },

    /**
     * 深度克隆对象
     * @param {*} obj - 要克隆的对象
     * @returns {*} 克隆后的对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} delay - 延迟时间(ms)
     * @returns {Function} 节流后的函数
     */
    throttle(func, delay = 100) {
        let lastCall = 0;
        return function(...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} delay - 延迟时间(ms)
     * @returns {Function} 防抖后的函数
     */
    debounce(func, delay = 300) {
        let timeoutId = null;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    },

    /**
     * 验证坐标是否在棋盘范围内
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} size - 棋盘大小，默认15
     * @returns {boolean} 是否有效
     */
    isValidPosition(x, y, size = 15) {
        return x >= 0 && x < size && y >= 0 && y < size;
    },

    /**
     * 转换坐标为字母-数字表示法
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {string} 如 "H8"
     */
    positionToNotation(x, y) {
        const letters = 'ABCDEFGHIJKLMNO';
        return `${letters[x]}${y + 1}`;
    },

    /**
     * 转换字母-数字表示法为坐标
     * @param {string} notation - 如 "H8"
     * @returns {Object} {x, y} 坐标对象，无效时返回null
     */
    notationToPosition(notation) {
        if (!notation || notation.length < 2) return null;
        
        const letters = 'ABCDEFGHIJKLMNO';
        const x = letters.indexOf(notation[0].toUpperCase());
        const y = parseInt(notation.substring(1)) - 1;
        
        if (x === -1 || isNaN(y) || !this.isValidPosition(x, y)) {
            return null;
        }
        
        return { x, y };
    },

    /**
     * 保存数据到LocalStorage
     * @param {string} key - 键名
     * @param {*} data - 数据（将被JSON序列化）
     * @returns {boolean} 是否成功
     */
    saveToLocalStorage(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            console.error('保存到LocalStorage失败:', error);
            return false;
        }
    },

    /**
     * 从LocalStorage加载数据
     * @param {string} key - 键名
     * @returns {*} 解析后的数据，失败返回null
     */
    loadFromLocalStorage(key) {
        try {
            const jsonData = localStorage.getItem(key);
            if (!jsonData) return null;
            return JSON.parse(jsonData);
        } catch (error) {
            console.error('从LocalStorage加载失败:', error);
            return null;
        }
    },

    /**
     * 下载数据为JSON文件
     * @param {*} data - 要下载的数据
     * @param {string} filename - 文件名
     * @returns {boolean} 是否成功
     */
    downloadAsJSON(data, filename) {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('下载文件失败:', error);
            return false;
        }
    },

    /**
     * 安全地获取嵌套对象属性
     * @param {Object} obj - 对象
     * @param {string} path - 属性路径，如 'a.b.c'
     * @param {*} defaultValue - 默认值
     * @returns {*} 属性值或默认值
     */
    getNestedProperty(obj, path, defaultValue = undefined) {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return defaultValue;
            }
        }
        
        return result;
    }
};

const GAME_UTILS_MODULE_INFO = {
    name: 'GameUtils',
    version: '1.0.2',
    author: '项目团队',
    dependencies: []
};

GameUtils.__moduleInfo = GAME_UTILS_MODULE_INFO;

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.GameUtils = GameUtils;
    if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('moduleLoaded', {
            detail: GAME_UTILS_MODULE_INFO
        }));
    }
}

// 支持ES模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameUtils;
}
