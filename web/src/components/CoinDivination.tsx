import { useState, useCallback } from 'react'
import { performDivination, getHexagramInfo } from '../divination'
import type { HexagramResult, YaoLine } from '../divination'
import './CoinDivination.css'

/** 爻线值含义映射 */
const VALUE_LABELS: Record<number, string> = {
  6: '老阴 ⚋ (变)',
  7: '少阳 ⚊',
  8: '少阴 ⚋',
  9: '老阳 ⚊ (变)',
}

export default function CoinDivination() {
  const [result, setResult] = useState<HexagramResult | null>(null)
  const [tossing, setTossing] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)

  const startDivination = useCallback(() => {
    setTossing(true)
    setResult(null)
    setRevealedCount(0)

    const hexResult = performDivination()

    // 逐爻揭示动画：每爻间隔 600ms
    let revealed = 0
    const timer = setInterval(() => {
      revealed++
      setRevealedCount(revealed)
      if (revealed >= 6) {
        clearInterval(timer)
        setResult(hexResult)
        setTossing(false)
      }
    }, 600)

    // 立即存储用于逐步显示
    setResult(hexResult)
  }, [])

  const hasChanging = result?.lines.some((l) => l.changing) ?? false

  const originalLines = result ? result.lines.map((l) => l.type === 'yang') : []
  const changedLines = result
    ? result.lines.map((l) => (l.changing ? l.type !== 'yang' : l.type === 'yang'))
    : []

  const originalInfo = originalLines.length === 6 ? getHexagramInfo(originalLines) : null
  const changedInfo = changedLines.length === 6 ? getHexagramInfo(changedLines) : null

  return (
    <section className="divination">
      <h2 className="divination-title">硬币起卦</h2>
      <p className="divination-desc">
        虔心默念所问之事，点击下方开始占卜。<br />
        系统将模拟抛掷三枚铜钱六次，逐爻生成卦象。
      </p>

      <button
        className="divination-btn"
        onClick={startDivination}
        disabled={tossing}
      >
        {tossing ? '起卦中…' : result ? '重新起卦' : '🪙 开始起卦'}
      </button>

      {/* 逐爻展示 */}
      {result && (
        <div className="yao-list">
          {result.lines.map((line, i) => (
            <YaoRow
              key={i}
              line={line}
              visible={i < revealedCount}
              animating={i === revealedCount - 1 && tossing}
            />
          ))}
        </div>
      )}

      {/* 卦象总结 */}
      {result && !tossing && (
        <div className="hex-summary">
          <HexagramCard
            label="本卦"
            lines={originalLines}
            name={originalInfo?.name ?? ''}
            upper={originalInfo?.upperTrigram ?? ''}
            lower={originalInfo?.lowerTrigram ?? ''}
          />
          {hasChanging && changedInfo && (
            <>
              <span className="hex-arrow">➜</span>
              <HexagramCard
                label="变卦"
                lines={changedLines}
                name={changedInfo.name}
                upper={changedInfo.upperTrigram}
                lower={changedInfo.lowerTrigram}
              />
            </>
          )}
        </div>
      )}
    </section>
  )
}

/* ---------- 子组件 ---------- */

function YaoRow({
  line,
  visible,
  animating,
}: {
  line: YaoLine
  visible: boolean
  animating: boolean
}) {
  return (
    <div
      className={`yao-row${visible ? ' visible' : ''}${animating ? ' animating' : ''}${line.changing ? ' changing' : ''}`}
    >
      {/* 爻位 */}
      <span className="yao-pos">{positionName(line.position)}</span>

      {/* 三枚硬币 */}
      <span className="yao-coins">
        {line.coins.map((c, j) => (
          <span key={j} className={`coin ${c ? 'heads' : 'tails'}`}>
            {c ? '字' : '花'}
          </span>
        ))}
      </span>

      {/* 爻线图形 */}
      <span className="yao-symbol">{yaoSymbol(line)}</span>

      {/* 数值标签 */}
      <span className="yao-label">{VALUE_LABELS[line.value]}</span>
    </div>
  )
}

function HexagramCard({
  label,
  lines,
  name,
  upper,
  lower,
}: {
  label: string
  lines: boolean[]
  name: string
  upper: string
  lower: string
}) {
  return (
    <div className="hex-card">
      <span className="hex-card-label">{label}</span>
      <div className="hex-card-lines">
        {/* 从上爻到初爻显示 */}
        {[...lines].reverse().map((yang, i) => (
          <div key={i} className={`hex-line ${yang ? 'yang' : 'yin'}`}>
            {yang ? (
              <span className="bar full" />
            ) : (
              <>
                <span className="bar half" />
                <span className="bar-gap" />
                <span className="bar half" />
              </>
            )}
          </div>
        ))}
      </div>
      <span className="hex-card-name">{name}</span>
      <span className="hex-card-trigrams">
        {upper}上 · {lower}下
      </span>
    </div>
  )
}

/* ---------- 辅助 ---------- */

function positionName(pos: number): string {
  const names = ['初', '二', '三', '四', '五', '上']
  return names[pos - 1] ?? String(pos)
}

function yaoSymbol(line: YaoLine): string {
  if (line.type === 'yang') return line.changing ? '⚊ →' : '⚊'
  return line.changing ? '⚋ →' : '⚋'
}
