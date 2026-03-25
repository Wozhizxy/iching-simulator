/** 单爻结果 */
export interface YaoLine {
  /** 第几爻 (1-6，自下而上) */
  position: number
  /** 三枚硬币各自正反：true=正(字)，false=反(花) */
  coins: [boolean, boolean, boolean]
  /** 三枚硬币数值总和 (6|7|8|9) */
  value: 6 | 7 | 8 | 9
  /** 阴阳属性 */
  type: 'yang' | 'yin'
  /** 是否为变爻 */
  changing: boolean
}

/** 完整卦象结果 */
export interface HexagramResult {
  /** 六爻（index 0=初爻，index 5=上爻） */
  lines: YaoLine[]
  /** 本卦编号 (1-64) */
  hexagramIndex: number
  /** 变卦编号 (1-64)，无变爻时与本卦相同 */
  changedHexagramIndex: number
  /** 时间戳 */
  timestamp: number
}
