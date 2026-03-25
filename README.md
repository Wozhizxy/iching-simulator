# iching-simulator

基于 **Vite + React (TypeScript)** 的易经占卜模拟器，可部署到 GitHub Pages。

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

## 构建与部署到 GitHub Pages

```bash
cd web

# 生产构建
npm run build

# 推送到 gh-pages 分支
npm run deploy
```

部署成功后访问地址：`https://wozhizxy.github.io/iching-simulator/`

> **前提**：在 GitHub 仓库设置 → Pages 中，将 Source 设置为 `gh-pages` 分支 / `/ (root)`。

---

详细说明请参阅 [web/README.md](web/README.md)。
