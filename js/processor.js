/**
 * processor.js (V2.1 - 修复通道错误版)
 */

const Processor = {
    checkReady: function() {
        if (typeof cv === 'undefined' || !window.cvReady) {
            alert('AI 引擎正在初始化...');
            return false;
        }
        return true;
    },

    cropBottom: function(canvas, pixels) {
        if (pixels <= 0) return;
        const tempCanvas = document.createElement('canvas');
        const newHeight = canvas.height - pixels;
        if (newHeight <= 0) return;

        tempCanvas.width = canvas.width;
        tempCanvas.height = newHeight;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, canvas.width, newHeight, 0, 0, canvas.width, newHeight);
        canvas.height = newHeight;
        canvas.getContext('2d').drawImage(tempCanvas, 0, 0);
    },

    smartInpaint: function(canvas, rect, radius) {
        if (!this.checkReady()) return;

        let src = null, srcRGB = null, mask = null, dst = null;
        try {
            src = cv.imread(canvas);
            srcRGB = new cv.Mat();
            // 关键修正：转为 RGB 3通道
            cv.cvtColor(src, srcRGB, cv.COLOR_RGBA2RGB, 0);

            mask = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
            let point1 = new cv.Point(rect.x, rect.y);
            let point2 = new cv.Point(rect.x + rect.w, rect.y + rect.h);
            cv.rectangle(mask, point1, point2, [255, 255, 255, 255], -1);

            dst = new cv.Mat();
            cv.inpaint(srcRGB, mask, dst, radius, cv.INPAINT_TELEA);
            cv.imshow(canvas, dst);

        } catch (err) {
            console.error("Inpaint Error:", err);
            alert("修复出错，请查看控制台");
        } finally {
            if (src) src.delete();
            if (srcRGB) srcRGB.delete();
            if (mask) mask.delete();
            if (dst) dst.delete();
        }
    },

    usmSharpen: function(canvas, amount) {
        if (!this.checkReady()) return;
        let src = null, srcRGB = null, blurred = null, dst = null;
        try {
            src = cv.imread(canvas);
            srcRGB = new cv.Mat();
            cv.cvtColor(src, srcRGB, cv.COLOR_RGBA2RGB, 0);

            blurred = new cv.Mat();
            dst = new cv.Mat();
            let ksize = new cv.Size(0, 0);
            cv.GaussianBlur(srcRGB, blurred, ksize, 3);
            cv.addWeighted(srcRGB, 1 + amount, blurred, -amount, 0, dst);
            cv.imshow(canvas, dst);
        } catch (err) {
            console.error("Sharpen Error:", err);
        } finally {
            if (src) src.delete();
            if (srcRGB) srcRGB.delete();
            if (blurred) blurred.delete();
            if (dst) dst.delete();
        }
    }
};
