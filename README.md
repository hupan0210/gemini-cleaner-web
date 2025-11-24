# Gemini Watermark Remover (Web Pro)

一个基于纯前端技术 (HTML5 + OpenCV.js) 的智能图片去水印工具，专为消除 Google Gemini 生成图片的底部水印而设计。

🚀 **在线演示**: [https://gemini.112583.xyz/](https://gemini.112583.xyz/)

## ✨ 特性

* **🛡️ 隐私优先**: 所有处理均在浏览器本地进行 (Local Processing)，图片**永远不会**上传到服务器。
* **🧠 智能修复**: 集成 OpenCV (WebAssembly) 引擎，使用 Telea 算法智能填充背景纹理，而非简单的像素拉伸。
* **⚡ 极致性能**: 无需安装 Python 环境，无需 GPU，打开网页即可使用。
* **✂️ 多模式支持**:
    * **裁剪模式**: 一键切除底部版权条。
    * **涂抹模式**: 框选区域进行智能内容填充。
    * **画质增强**: 内置 USM 锐化滤镜，提升图片清晰度。

## 🛠️ 技术栈

* **核心**: OpenCV.js (WebAssembly)
* **界面**: HTML5 / CSS3 (Apple-style UI)
* **逻辑**: Vanilla JavaScript (无第三方重型框架)

## 📖 如何部署

本项目为纯静态网站，你可以轻松部署在任何静态托管服务上（如 GitHub Pages, Vercel, Cloudflare Pages, 或任何 Nginx/Apache 服务器）。

1. 克隆本项目。
2. 将 `opencv.js` 放入 `js/` 目录。
3. 启动 Web 服务器即可。

## 📄 License

MIT License. 欢迎 Star ⭐ 和 Fork！
