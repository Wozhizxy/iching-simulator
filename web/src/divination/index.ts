import type { YaoLine, HexagramResult } from './types'
import { getHexagramInfo } from './hexagrams'

/**
 * 模拟抛掷三枚硬币得到一爻
 *
 * 规则：
 *   正面(字)= 3，反面(花)= 2
 *   总和 6 → 老阴(变)  ⚋ → ⚊
 *   总和 7 → 少阳      ⚊
 *   总和 8 → 少阴      ⚋
 *   总和 9 → 老阳(变)  ⚊ → ⚋
 *
 * @param position 第几爻 (1-6)
 */
export function tossCoinsForYao(position: number): YaoLine {
  const coins: [boolean, boolean, boolean] = [
    Math.random() >= 0.5,
    Math.random() >= 0.5,
    Math.random() >= 0.5,
  ]

  const sum = coins.reduce<number>((s, c) => s + (c ? 3 : 2), 0)
  const value = sum as 6 | 7 | 8 | 9

  const isYang = value === 7 || value === 9
  const isChanging = value === 6 || value === 9

  return {
    position,
    coins,
    value,
    type: isYang ? 'yang' : 'yin',
    changing: isChanging,
  }
}

/**
 * 完整起卦：依次抛六次硬币，生成本卦和变卦
 */
export function performDivination(): HexagramResult {
  const lines: YaoLine[] = []

  for (let i = 1; i <= 6; i++) {
    lines.push(tossCoinsForYao(i))
  }

  // 本卦阴阳
  const originalLines = lines.map((l) => l.type === 'yang')

  // 变卦：变爻翻转
  const changedLines = lines.map((l) => {
    if (l.changing) return l.type !== 'yang'
    return l.type === 'yang'
  })

  const original = getHexagramInfo(originalLines)
  const changed = getHexagramInfo(changedLines)

  return {
    lines,
    hexagramIndex: original.index,
    changedHexagramIndex: changed.index,
    timestamp: Date.now(),
  }
}

export { getHexagramInfo }
export type { HexagramResult, YaoLine }
