# iching-simulator · 前端

基于 **Vite + React (TypeScript)** 的易经占卜模拟器前端，可部署到 GitHub Pages。

---

## 本地开发

```bash
# 进入 web/ 目录
cd web

# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev
```

默认访问地址：`http://localhost:5173/iching-simulator/`

---

## 构建与预览

```bash
# 生产构建
npm run build

# 本地预览构建产物
npm run preview
```

构建产物输出到 `web/dist/`，所有静态文件已按 `/iching-simulator/` 基路径配置。

---

## 部署到 GitHub Pages

本项目使用 [`gh-pages`](https://github.com/tschaub/gh-pages) 一键部署。

```bash
npm run deploy
```

该命令会自动执行 `build` 后将 `dist/` 推送到仓库的 `gh-pages` 分支。
部署成功后访问地址为：

```
https://wozhizxy.github.io/iching-simulator/
```

> **前提**：在 GitHub 仓库设置 → Pages 中，将 Source 设置为 `gh-pages` 分支 / `/ (root)`。

---

## 两种 AI 接口调用方式

### 方式一：浏览器前端直连（离线模式）

适用于接口提供商**明确支持 CORS 的场景**（即可从浏览器直接请求）。

1. 打开前端设置页
2. 填入 `API Key`、`Base URL`、`Model`
3. 点击"连接测试"，通过后即可使用

> ⚠️ 注意：部分 OpenAI 兼容接口（如阿里云 DashScope）默认不对浏览器开放 CORS，此时浏览器会拦截请求。建议改用本地代理方式。

---

### 方式二：本地代理（推荐，解决跨域）

在本地运行 `proxy/` 目录下的代理服务，由代理转发请求到模型 API，前端只与本地通信。

**步骤：**

```bash
# 进入代理目录
cd proxy

# 复制配置文件
cp .env.example .env

# 编辑 .env，填入你的 API 信息
# BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
# API_KEY=sk-xxxxxxxx
# MODEL=qwen-turbo

# 安装依赖并启动
npm install
npm start
```

代理启动后监听 `http://localhost:8787`，前端会自动检测并切换到代理模式。

---

## 示例代码

```tsx
// 前端统一调用示例（SSE 流式）
const response = await fetch('http://localhost:8787/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: '此卦对近期事业有何指引？',
    divinationResult: { hexagram: 1, changingLines: [3] },
  }),
})
// 读取 SSE 流...
```

---

## 目录结构

```
web/
├── public/          # 静态资源
├── src/
│   ├── App.tsx      # 首页组件
│   ├── App.css      # 首页样式
│   └── main.tsx     # 入口文件
├── index.html
├── vite.config.ts   # base: '/iching-simulator/'
├── package.json     # homepage + deploy 脚本
└── README.md        # 本文件
```
