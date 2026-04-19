import { useState, useCallback, useRef } from 'react'
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

/** 单次抛掷动画持续时间 ms */
const TOSS_DURATION = 1200
/** 落地后停留时间 ms */
const SETTLE_DELAY = 300

interface Props {
  question?: string
}

export default function CoinDivination({ question }: Props) {
  const [result, setResult] = useState<HexagramResult | null>(null)
  const [savedQuestion, setSavedQuestion] = useState<string>('')
  const [tossing, setTossing] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)

  /** 当前正在播放抛掷动画的硬币面（用于 3 枚硬币展示） */
  const [tossCoins, setTossCoins] = useState<boolean[] | null>(null)
  /** 是否处于硬币飞行阶段 */
  const [coinFlying, setCoinFlying] = useState(false)
  /** 硬币已落地，短暂展示结果 */
  const [coinLanded, setCoinLanded] = useState(false)

  /** AI解释相关状态 */
  const [aiInterpretation, setAiInterpretation] = useState<string>('')
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const startDivination = useCallback(() => {
    setTossing(true)
    setResult(null)
    setRevealedCount(0)
    setSavedQuestion(question?.trim() || '')
    setTossCoins(null)
    setCoinFlying(false)
    setCoinLanded(false)
    // 重置AI解释状态
    setAiInterpretation('')
    setIsLoadingAi(false)
    setAiError(null)

    const hexResult = performDivination()
    // 立即存储用于逐步显示
    setResult(hexResult)

    let revealed = 0

    const revealNext = () => {
      const line = hexResult.lines[revealed]
      // 1) 发射硬币
      setTossCoins(line.coins)
      setCoinFlying(true)
      setCoinLanded(false)

      // 2) 飞行结束 → 落地
      timerRef.current = setTimeout(() => {
        setCoinFlying(false)
        setCoinLanded(true)

        // 3) 短暂停留后揭示该爻
        timerRef.current = setTimeout(() => {
          revealed++
          setRevealedCount(revealed)
          setCoinLanded(false)

          if (revealed >= 6) {
            setTossCoins(null)
            setTossing(false)
          } else {
            // 下一爻
            timerRef.current = setTimeout(revealNext, 200)
          }
        }, SETTLE_DELAY)
      }, TOSS_DURATION)
    }

    // 启动第一次抛掷
    timerRef.current = setTimeout(revealNext, 300)
  }, [question])

  const hasChanging = result?.lines.some((l) => l.changing) ?? false

  const originalLines = result ? result.lines.map((l) => l.type === 'yang') : []
  const changedLines = result
    ? result.lines.map((l) => (l.changing ? l.type !== 'yang' : l.type === 'yang'))
    : []

  const originalInfo = originalLines.length === 6 ? getHexagramInfo(originalLines) : null
  const changedInfo = changedLines.length === 6 ? getHexagramInfo(changedLines) : null

  // 调用AI解释API - SSE版本
  const getAiInterpretation = useCallback(async () => {
    if (!result) return

    setIsLoadingAi(true)
    setAiError(null)
    setAiInterpretation('') // 初始化为空字符串用于流式输出

    try {
      // 构建API请求数据
      const requestData = {
        question: savedQuestion || '请分析此卦象',
        hexagramResult: {
          ...result,
          originalInfo: originalInfo || null,
          changedInfo: changedInfo || null
        }
      }

      console.log('Sending request to AI API:', requestData)

      // 调用本地代理服务器 - 使用SSE
      const response = await fetch('http://localhost:3001/api/ai-interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      console.log('AI API response status:', response.status)

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        console.log('Starting to read SSE stream')
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log('SSE stream ended')
            break
          }

          const chunk = decoder.decode(value)
          console.log('Received SSE chunk:', chunk)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                console.log('Parsed SSE data:', data)
                if (data.success) {
                  if (data.content) {
                    // 流式追加内容
                    setAiInterpretation(prev => (prev || '') + data.content)
                  }
                  if (data.done) {
                    // 完成
                    console.log('AI interpretation completed')
                    setIsLoadingAi(false)
                  }
                } else {
                  console.error('AI API error:', data.error)
                  setAiError(data.error || '获取AI解释失败，请稍后再试')
                  setIsLoadingAi(false)
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e)
              }
            }
          }
        }
      } else {
        console.error('No response body')
        setAiError('没有收到服务器响应')
        setIsLoadingAi(false)
      }
    } catch (error) {
      console.error('Error calling AI API:', error)
      setAiError('网络错误，请检查代理服务器是否运行')
      setIsLoadingAi(false)
    }
  }, [result, savedQuestion, originalInfo, changedInfo])

  return (
    <section className="divination">
      <button
        className="divination-btn"
        onClick={startDivination}
        disabled={tossing}
      >
        {tossing ? '起卦中…' : result ? '重新起卦' : '🪙 开始起卦'}
      </button>

      {/* 抛掷动画区域 */}
      {tossCoins && (
        <div className="toss-stage">
          <div className="toss-coins-row">
            {tossCoins.map((face, i) => (
              <div
                key={`${revealedCount}-${i}`}
                className={`toss-coin${coinFlying ? ' flying' : ''}${coinLanded ? ' landed' : ''}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="toss-coin-inner">
                  <div className="toss-coin-front">字</div>
                  <div className="toss-coin-back">花</div>
                </div>
                {/* 落地后显示实际结果 */}
                {coinLanded && (
                  <div className={`toss-coin-result ${face ? 'heads' : 'tails'}`}>
                    {face ? '字' : '花'}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* 地面阴影 */}
          <div className="toss-shadows">
            {tossCoins.map((_, i) => (
              <div
                key={i}
                className={`toss-shadow${coinFlying ? ' flying' : ''}${coinLanded ? ' landed' : ''}`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 所问之事 */}
      {result && savedQuestion && !tossing && (
        <div className="question-banner">
          <span className="question-banner-label">所问</span>
          <span className="question-banner-text">{savedQuestion}</span>
        </div>
      )}

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
          {/* 动爻提示 */}
          {hasChanging && (
            <div className="changing-yao-hint">
              <span className="changing-yao-icon">◈</span>
              动爻在：{result.lines
                .filter(l => l.changing)
                .map(l => yaoFullName(l))
                .join('、')}
            </div>
          )}

          <div className="hex-cards-row">
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

          {/* 断卦指引 */}
          <div className="reading-guidance">
            <span className="reading-guidance-icon">📖</span>
            <span>{getReadingGuidance(result.lines, originalInfo?.name ?? '', changedInfo?.name ?? '')}</span>
          </div>

          {/* AI解释 */}
          <div className="ai-section">
            <button
              className="ai-btn"
              onClick={getAiInterpretation}
              disabled={isLoadingAi || aiInterpretation.length > 0}
            >
              {isLoadingAi ? 'AI分析中...' : aiInterpretation.length > 0 ? '已分析' : '🤖 AI卦象分析'}
            </button>

            {isLoadingAi && aiInterpretation.length === 0 && (
              <div className="ai-loading">正在分析卦象，请稍候...</div>
            )}

            {aiError && (
              <div className="ai-error">{aiError}</div>
            )}

            {aiInterpretation.length > 0 && (
              <div className="ai-interpretation">
                <h3 className="ai-title">AI卦象分析</h3>
                <div className="ai-content">{aiInterpretation}</div>
              </div>
            )}
          </div>
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

      {/* 动爻标记 */}
      {line.changing && <span className="yao-changing-tag">动</span>}
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

/** 爻的完整名称，如"初九"、"六三"、"上六" */
function yaoFullName(line: YaoLine): string {
  const posNames = ['初', '二', '三', '四', '五', '上']
  const posStr = posNames[line.position - 1] ?? String(line.position)
  // 阳爻用"九"，阴爻用"六"
  const typeStr = line.type === 'yang' ? '九' : '六'
  // 传统命名：初X、X二、X三…上X（初和上位置在前）
  if (line.position === 1) return `${posStr}${typeStr}`
  if (line.position === 6) return `${posStr}${typeStr}`
  return `${typeStr}${posStr}`
}

/**
 * 根据变爻数量给出断卦指引（朱熹《筮仪》体系）
 */
function getReadingGuidance(
  lines: YaoLine[],
  originalName: string,
  changedName: string,
): string {
  const changingLines = lines.filter(l => l.changing)
  const count = changingLines.length

  if (count === 0) {
    return `六爻皆不变，看本卦「${originalName}」卦辞。`
  }
  if (count === 1) {
    return `一爻变，看本卦「${originalName}」${yaoFullName(changingLines[0])}爻辞。`
  }
  if (count === 2) {
    const upper = changingLines[changingLines.length - 1]
    return `二爻变，看本卦「${originalName}」两个变爻爻辞，以${yaoFullName(upper)}为主。`
  }
  if (count === 3) {
    return `三爻变，本卦「${originalName}」卦辞为主，变卦「${changedName}」卦辞为辅。`
  }
  if (count === 4) {
    const stableLines = lines.filter(l => !l.changing)
    const lower = stableLines[0]
    return `四爻变，看变卦「${changedName}」中两个不变爻爻辞，以${yaoFullName(lower)}为主。`
  }
  if (count === 5) {
    const stableLine = lines.find(l => !l.changing)!
    return `五爻变，看变卦「${changedName}」${yaoFullName(stableLine)}爻辞。`
  }
  // count === 6
  const isQianKun = originalName === '乾为天' || originalName === '坤为地'
  if (isQianKun) {
    return originalName === '乾为天'
      ? `六爻全变，看「乾」卦"用九"。`
      : `六爻全变，看「坤」卦"用六"。`
  }
  return `六爻全变，看变卦「${changedName}」卦辞。`
}
