/**
 * 六十四卦名称表
 * 索引用 6-bit 二进制表示（0=阴，1=阳），自下而上排列
 * bit0=初爻 … bit5=上爻
 *
 * 二进制 → 卦序映射来自先天八卦 + 上下卦组合规则
 */

/** 八卦基础名 (3-bit, bit0=下爻) */
const TRIGRAM_NAMES = [
  '坤', // 000
  '震', // 001
  '坎', // 010
  '兑', // 011 (注意：传统先天顺序不同，此处按二进制映射简化)
  '艮', // 100
  '离', // 101
  '巽', // 110
  '乾', // 111
] as const

/** 六十四卦名 — 以 [下卦index][上卦index] 查表 */
const HEXAGRAM_NAMES: readonly string[][] = [
  /* 坤下 */ ['坤为地', '地雷复', '地水师', '地泽临', '地山谦', '地火明夷', '地风升', '地天泰'],
  /* 震下 */ ['雷地豫', '震为雷', '雷水解', '雷泽归妹', '雷山小过', '雷火丰', '雷风恒', '雷天大壮'],
  /* 坎下 */ ['水地比', '水雷屯', '坎为水', '水泽节', '水山蹇', '水火既济', '水风井', '水天需'],
  /* 兑下 */ ['泽地萃', '泽雷随', '泽水困', '兑为泽', '泽山咸', '泽火革', '泽风大过', '泽天夬'],
  /* 艮下 */ ['山地剥', '山雷颐', '山水蒙', '山泽损', '艮为山', '山火贲', '山风蛊', '山天大畜'],
  /* 离下 */ ['火地晋', '火雷噬嗑', '火水未济', '火泽睽', '火山旅', '离为火', '火风鼎', '火天大有'],
  /* 巽下 */ ['风地观', '风雷益', '风水涣', '风泽中孚', '风山渐', '风火家人', '巽为风', '风天小畜'],
  /* 乾下 */ ['天地否', '天雷无妄', '天水讼', '天泽履', '天山遁', '天火同人', '天风姤', '乾为天'],
]

export interface HexagramInfo {
  index: number
  name: string
  lowerTrigram: string
  upperTrigram: string
}

/**
 * 从 6 条爻线的阴阳数组获取卦象信息
 * @param lines - 6 个布尔值，true=阳，false=阴，index 0=初爻
 */
export function getHexagramInfo(lines: boolean[]): HexagramInfo {
  if (lines.length !== 6) throw new Error('需要 6 条爻线')

  const lowerBits = (lines[0] ? 1 : 0) | (lines[1] ? 2 : 0) | (lines[2] ? 4 : 0)
  const upperBits = (lines[3] ? 1 : 0) | (lines[4] ? 2 : 0) | (lines[5] ? 4 : 0)

  // 线性编号 1-64
  const index = lowerBits * 8 + upperBits + 1

  return {
    index,
    name: HEXAGRAM_NAMES[lowerBits][upperBits],
    lowerTrigram: TRIGRAM_NAMES[lowerBits],
    upperTrigram: TRIGRAM_NAMES[upperBits],
  }
}
