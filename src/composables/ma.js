/**
 * 计算简单移动平均线
 */
export function calcMA(data, period) {
  const result = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null)
      continue
    }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close
    result.push({ time: data[i].time, value: sum / period })
  }
  return result.filter((p) => p !== null)
}

/**
 * 检测金叉/死叉信号
 * 返回 buy/sell 标记数组
 */
export function detectSignals(candles, fastPeriod = 5, slowPeriod = 20) {
  const maFast = calcMA(candles, fastPeriod)
  const maSlow = calcMA(candles, slowPeriod)
  const signals = []

  // 对齐时间
  const slowMap = new Map(maSlow.map((s) => [s.time, s.value]))
  for (let i = 1; i < maFast.length; i++) {
    const curr = maFast[i]
    const prev = maFast[i - 1]
    const currSlow = slowMap.get(curr.time)
    const prevSlow = slowMap.get(prev.time)
    if (currSlow == null || prevSlow == null) continue

    // 金叉：快线从下穿上慢线
    if (prev.value <= prevSlow && curr.value > currSlow) {
      signals.push({
        time: curr.time,
        position: 'belowBar',
        color: '#00e676',
        shape: 'arrowUp',
        text: '买',
        size: 2,
      })
    }
    // 死叉：快线从上穿下慢线
    if (prev.value >= prevSlow && curr.value < currSlow) {
      signals.push({
        time: curr.time,
        position: 'aboveBar',
        color: '#ff4757',
        shape: 'arrowDown',
        text: '卖',
        size: 2,
      })
    }
  }
  return signals
}

/**
 * 简单回测：按信号交易计算收益
 */
export function backtest(candles, fastPeriod = 5, slowPeriod = 20) {
  const signals = detectSignals(candles, fastPeriod, slowPeriod)
  if (signals.length === 0) return { totalReturn: 0, winRate: 0, trades: 0, maxDrawdown: 0 }

  const trades = []
  let entryPrice = null
  let entryIdx = -1

  for (const sig of signals) {
    const candle = candles.find((c) => c.time === sig.time)
    if (!candle) continue
    if (sig.text === '买' && entryPrice === null) {
      entryPrice = candle.close
      entryIdx = candles.indexOf(candle)
    } else if (sig.text === '卖' && entryPrice !== null) {
      const exitPrice = candle.close
      const pnl = (exitPrice - entryPrice) / entryPrice
      trades.push({ pnl, entryPrice, exitPrice, entryIdx, exitIdx: candles.indexOf(candle) })
      entryPrice = null
      entryIdx = -1
    }
  }

  if (trades.length === 0) return { totalReturn: 0, winRate: 0, trades: 0, maxDrawdown: 0 }

  const wins = trades.filter((t) => t.pnl > 0).length
  const totalReturn = trades.reduce((acc, t) => acc * (1 + t.pnl), 1) - 1
  let peak = 0, maxDD = 0, cum = 1
  for (const t of trades) {
    cum *= (1 + t.pnl)
    if (cum > peak) peak = cum
    const dd = (peak - cum) / peak
    if (dd > maxDD) maxDD = dd
  }

  return {
    totalReturn: totalReturn * 100,
    winRate: (wins / trades.length) * 100,
    trades: trades.length,
    maxDrawdown: maxDD * 100,
  }
}
