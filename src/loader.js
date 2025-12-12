/**
 * 资源加载器
 * Promise-based 预加载系统
 */

export class AssetLoader {
    constructor() {
        this.images = {};
        this.audio = {};
        this.loadedCount = 0;
        this.totalCount = 0;
    }

    /**
     * 加载单张图片
     * @param {string} name - 资源名称
     * @param {string} src - 图片路径
     * @returns {Promise<HTMLImageElement>}
     */
    loadImage(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                this.loadedCount++;
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                // 创建占位图片而不是失败
                this.images[name] = this.createPlaceholder(32, 32);
                this.loadedCount++;
                resolve(this.images[name]);
            };
            img.src = src;
        });
    }

    /**
     * 加载音频
     * @param {string} name - 资源名称
     * @param {string} src - 音频路径
     * @returns {Promise<HTMLAudioElement>}
     */
    loadAudio(name, src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.audio[name] = audio;
                this.loadedCount++;
                resolve(audio);
            };
            audio.onerror = () => {
                console.warn(`Failed to load audio: ${src}`);
                this.loadedCount++;
                resolve(null);
            };
            audio.src = src;
        });
    }

    /**
     * 批量加载资源
     * @param {Array} manifest - 资源清单 [{type, name, src}]
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<void>}
     */
    async loadAll(manifest, onProgress) {
        this.totalCount = manifest.length;
        this.loadedCount = 0;

        const promises = manifest.map(async (item) => {
            if (item.type === 'image') {
                await this.loadImage(item.name, item.src);
            } else if (item.type === 'audio') {
                await this.loadAudio(item.name, item.src);
            }
            if (onProgress) {
                onProgress(this.loadedCount / this.totalCount);
            }
        });

        await Promise.all(promises);
    }

    /**
     * 获取已加载的图片
     * @param {string} name - 资源名称
     * @returns {HTMLImageElement}
     */
    getImage(name) {
        return this.images[name];
    }

    /**
     * 获取已加载的音频
     * @param {string} name - 资源名称
     * @returns {HTMLAudioElement}
     */
    getAudio(name) {
        return this.audio[name];
    }

    /**
     * 播放音效
     * @param {string} name - 音效名称
     */
    playSound(name) {
        const audio = this.audio[name];
        if (audio) {
            // 克隆音频以支持重叠播放
            const clone = audio.cloneNode();
            clone.volume = 0.5;
            clone.play().catch(() => {});
        }
    }

    /**
     * 创建占位图片
     * @param {number} width 
     * @param {number} height 
     * @returns {HTMLCanvasElement}
     */
    createPlaceholder(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(0, 0, width, height);
        return canvas;
    }

    /**
     * 获取加载进度
     * @returns {number} 0-1 之间的进度值
     */
    getProgress() {
        if (this.totalCount === 0) return 1;
        return this.loadedCount / this.totalCount;
    }
}
