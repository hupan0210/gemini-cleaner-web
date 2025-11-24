/**
 * app.js
 * 负责页面交互、事件监听和 UI 状态管理
 */

// DOM 元素引用
const els = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    workspace: document.getElementById('workspace'),
    canvas: document.getElementById('main-canvas'),
    selectionBox: document.getElementById('selection-box'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    // Inputs & Buttons
    cropSlider: document.getElementById('crop-slider'),
    cropVal: document.getElementById('crop-val'),
    radiusSlider: document.getElementById('radius-slider'),
    radiusVal: document.getElementById('radius-val'),
    sharpSlider: document.getElementById('sharp-slider'),
    sharpVal: document.getElementById('sharp-val'),
    
    btnApplyCrop: document.getElementById('btn-apply-crop'),
    btnApplyInpaint: document.getElementById('btn-apply-inpaint'),
    btnApplyEnhance: document.getElementById('btn-apply-enhance'),
    btnReset: document.getElementById('btn-reset'),
    btnDownload: document.getElementById('btn-download')
};

// 状态管理
let state = {
    originalImg: null, // 保存原始 Image 对象
    isSelecting: false,
    startX: 0, startY: 0,
    selectionRect: null // {x, y, w, h} 真实坐标
};

// 1. 初始化事件监听
function init() {
    // 上传
    els.dropZone.addEventListener('click', () => els.fileInput.click());
    els.fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽
    els.dropZone.addEventListener('dragover', (e) => { e.preventDefault(); els.dropZone.style.borderColor = '#0071e3'; });
    els.dropZone.addEventListener('dragleave', () => { els.dropZone.style.borderColor = '#d2d2d7'; });
    els.dropZone.addEventListener('drop', handleDrop);

    // Tab 切换
    els.tabBtns.forEach(btn => btn.addEventListener('click', switchTab));

    // 滑块数值显示
    els.cropSlider.oninput = (e) => els.cropVal.textContent = e.target.value + 'px';
    els.radiusSlider.oninput = (e) => els.radiusVal.textContent = e.target.value + 'px';
    els.sharpSlider.oninput = (e) => els.sharpVal.textContent = (e.target.value / 10).toFixed(1);

    // 画布选区交互
    setupCanvasInteraction();

    // 功能按钮
    els.btnApplyCrop.onclick = () => {
        Processor.cropBottom(els.canvas, parseInt(els.cropSlider.value));
        resetSelection();
    };

    els.btnApplyInpaint.onclick = () => {
        if (!state.selectionRect) return;
        const radius = parseInt(els.radiusSlider.value);
        Processor.smartInpaint(els.canvas, state.selectionRect, radius);
        resetSelection();
    };

    els.btnApplyEnhance.onclick = () => {
        const amount = parseInt(els.sharpSlider.value) / 10;
        Processor.usmSharpen(els.canvas, amount);
    };

    els.btnReset.onclick = () => renderImage(state.originalImg);
    els.btnDownload.onclick = downloadImage;
}

// 2. 文件处理
function handleFileSelect(e) {
    if (e.target.files.length) loadImage(e.target.files[0]);
}

function handleDrop(e) {
    e.preventDefault();
    els.dropZone.style.borderColor = '#d2d2d7';
    if (e.dataTransfer.files.length) loadImage(e.dataTransfer.files[0]);
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.originalImg = img;
            renderImage(img);
            els.dropZone.style.display = 'none';
            els.workspace.style.display = 'grid';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function renderImage(img) {
    els.canvas.width = img.width;
    els.canvas.height = img.height;
    els.canvas.getContext('2d').drawImage(img, 0, 0);
    resetSelection();
}

// 3. Tab 切换
function switchTab(e) {
    const target = e.target.dataset.tab;
    els.tabBtns.forEach(b => b.classList.remove('active'));
    els.tabPanels.forEach(p => p.classList.remove('active'));
    
    e.target.classList.add('active');
    document.getElementById(`tab-${target}`).classList.add('active');
    
    // 只有在 Inpaint 模式下才显示选区相关提示/允许选区
    resetSelection();
}

// 4. 选区逻辑 (最复杂的部分)
function setupCanvasInteraction() {
    const wrapper = els.canvas.parentElement;

    wrapper.addEventListener('mousedown', (e) => {
        // 只有在 Inpaint 模式下允许框选
        if (!document.getElementById('tab-inpaint').classList.contains('active')) return;
        if (e.target !== els.canvas && e.target !== els.selectionBox) return;

        state.isSelecting = true;
        const rect = els.canvas.getBoundingClientRect();
        state.startX = e.clientX - rect.left;
        state.startY = e.clientY - rect.top;

        els.selectionBox.style.display = 'block';
        updateBox(state.startX, state.startY, 0, 0);
        els.btnApplyInpaint.disabled = true;
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!state.isSelecting) return;
        const rect = els.canvas.getBoundingClientRect();
        let currentX = e.clientX - rect.left;
        let currentY = e.clientY - rect.top;
        
        // 边界限制
        currentX = Math.max(0, Math.min(rect.width, currentX));
        currentY = Math.max(0, Math.min(rect.height, currentY));

        const w = currentX - state.startX;
        const h = currentY - state.startY;

        updateBox(state.startX, state.startY, w, h);
    });

    window.addEventListener('mouseup', () => {
        if (!state.isSelecting) return;
        state.isSelecting = false;
        
        // 计算真实图片坐标
        const rect = els.canvas.getBoundingClientRect();
        const scaleX = els.canvas.width / rect.width;
        const scaleY = els.canvas.height / rect.height;

        const boxStyle = window.getComputedStyle(els.selectionBox);
        const displayX = parseInt(boxStyle.left);
        const displayY = parseInt(boxStyle.top);
        const displayW = parseInt(boxStyle.width);
        const displayH = parseInt(boxStyle.height);

        if (displayW > 5 && displayH > 5) {
            state.selectionRect = {
                x: displayX * scaleX,
                y: displayY * scaleY,
                w: displayW * scaleX,
                h: displayH * scaleY
            };
            els.btnApplyInpaint.disabled = false;
        } else {
            resetSelection();
        }
    });
}

function updateBox(x, y, w, h) {
    // 处理负宽高（反向拖拽）
    const left = w < 0 ? x + w : x;
    const top = h < 0 ? y + h : y;
    const width = Math.abs(w);
    const height = Math.abs(h);

    els.selectionBox.style.left = left + 'px';
    els.selectionBox.style.top = top + 'px';
    els.selectionBox.style.width = width + 'px';
    els.selectionBox.style.height = height + 'px';
}

function resetSelection() {
    state.selectionRect = null;
    els.selectionBox.style.display = 'none';
    els.btnApplyInpaint.disabled = true;
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'gemini-fixed-' + Date.now() + '.png';
    link.href = els.canvas.toDataURL('image/png', 1.0);
    link.click();
}

// 启动
init();
