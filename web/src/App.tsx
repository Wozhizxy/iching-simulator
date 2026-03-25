import './App.css'

function App() {
  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">🔮 iching-simulator</h1>
        <p className="app-subtitle">易经占卜模拟器 · I Ching Divination Simulator</p>
      </header>

      <section className="app-intro">
        <p>
          本项目是一个易经起卦与 AI 解读工具，支持硬币起卦、蓍草模拟等方式，并通过 AI 引用古籍给出解读。
        </p>
        <p>
          <strong>本项目支持两种调用方式：</strong>
        </p>
        <ul className="mode-list">
          <li>
            <span className="mode-badge offline">离线模式</span>
            <span>
              <strong>浏览器前端直连</strong>——在设置页填入你自己的 API Key，前端直接请求 OpenAI 兼容接口（需接口支持跨域）。
            </span>
          </li>
          <li>
            <span className="mode-badge proxy">本地代理</span>
            <span>
              <strong>本地代理中转</strong>——在本地启动 <code>proxy/</code> 代理脚本，前端通过
              {' '}<code>localhost</code> 通信，彻底解决跨域问题，API Key 不进浏览器更安全。
            </span>
          </li>
        </ul>
        <div className="notice">
          <span className="notice-icon">🚧</span>
          <span>
            本项目尚在开发中，功能持续完善。示例代码与详细说明请参阅{' '}
            <a
              href="https://github.com/Wozhizxy/iching-simulator/blob/main/web/README.md"
              target="_blank"
              rel="noreferrer"
            >
              web/README.md
            </a>
            。
          </span>
        </div>
      </section>

      <footer className="app-footer">
        <a
          href="https://github.com/Wozhizxy/iching-simulator"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        {' · '}
        <span>MIT License</span>
      </footer>
    </main>
  )
}

export default App
