<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts'
import { useOKX, generateCandles, fetchCandles } from '../composables/useOKX.js'
import { calcMA, backtest } from '../composables/ma.js'

const { price, changePercent24h, high24h, low24h, volume24h, connected, bids, asks, trades } = useOKX()

const chartContainer = ref(null)
const chartLoading = ref(false)
const btStats = ref({ totalReturn: 0, winRate: 0, trades: 0, maxDrawdown: 0 })

const intervals = [
  { label: '1分', value: '1m', days: 1, count: 240 },
  { label: '5分', value: '5m', days: 2, count: 240 },
  { label: '15分', value: '15m', days: 3, count: 200 },
  { label: '1时', value: '1H', days: 7, count: 168 },
  { label: '4时', value: '4H', days: 30, count: 180 },
  { label: '日线', value: '1D', days: 90, count: 90 },
  { label: '周线', value: '1W', days: 365, count: 52 },
]
const activeInterval = ref('1H')

let chart = null, candleSeries = null, volumeSeries = null, ma5Series = null, ma20Series = null, resizeObserver = null

function setChartData(candles) {
  if (!candleSeries || !volumeSeries || !candles.length) return

  // K线 + 成交量
  const ohlc = candles.map((k) => ({ time: k.time, open: k.open, high: k.high, low: k.low, close: k.close }))
  candleSeries.setData(ohlc)
  volumeSeries.setData(candles.map((k) => ({ time: k.time, value: k.volume, color: k.close >= k.open ? 'rgba(0,230,118,0.3)' : 'rgba(255,71,87,0.3)' })))

  // 均线
  const ma5 = calcMA(candles, 5)
  const ma20 = calcMA(candles, 20)
  ma5Series.setData(ma5)
  ma20Series.setData(ma20)

  // 回测统计
  btStats.value = backtest(candles, 5, 20)

  chart.timeScale().fitContent()
}

async function loadChart(bar, days, count) {
  chartLoading.value = true
  // 立即显示内置数据
  setChartData(generateCandles(bar, count))
  // 尝试获取真实数据
  try {
    const real = await fetchCandles(bar, days)
    if (real.length >= 5) {
      setChartData(real)
    }
  } catch (e) {
    // 内置数据保持显示
  }
  chartLoading.value = false
}

onMounted(async () => {
  await nextTick()
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: 500,
    layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#5a7a9a' },
    grid: { vertLines: { color: 'rgba(0,240,255,0.04)' }, horzLines: { color: 'rgba(0,240,255,0.04)' } },
    rightPriceScale: { borderColor: 'rgba(0,240,255,0.1)', scaleMargins: { top: 0.05, bottom: 0.25 } },
    timeScale: { borderColor: 'rgba(0,240,255,0.1)', timeVisible: true },
    crosshair: { mode: 1, vertLine: { color: 'rgba(0,240,255,0.2)', style: 2 }, horzLine: { color: 'rgba(0,240,255,0.2)', style: 2 } },
  })

  candleSeries = chart.addSeries(CandlestickSeries, {
    upColor: '#00e676', downColor: '#ff4757',
    borderUpColor: '#00e676', borderDownColor: '#ff4757',
    wickUpColor: '#00e676', wickDownColor: '#ff4757',
  })
  volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: { type: 'volume' },
    priceScaleId: 'volume',
  })
  chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

  // 均线
  ma5Series = chart.addSeries(LineSeries, {
    color: '#00f0ff', lineWidth: 1.5,
    priceLineVisible: false, lastValueVisible: true,
    crosshairMarkerVisible: false,
  })
  ma20Series = chart.addSeries(LineSeries, {
    color: '#bd93f9', lineWidth: 1.5,
    priceLineVisible: false, lastValueVisible: true,
    crosshairMarkerVisible: false,
  })

  const itv = intervals.find((i) => i.value === activeInterval.value) || intervals[3]
  await loadChart(itv.value, itv.days, itv.count)

  resizeObserver = new ResizeObserver(() => {
    if (chartContainer.value) chart.applyOptions({ width: chartContainer.value.clientWidth })
  })
  resizeObserver.observe(chartContainer.value)
})

function switchInterval(val) {
  activeInterval.value = val
  const itv = intervals.find((i) => i.value === val)
  if (itv) loadChart(itv.value, itv.days, itv.count)
}

// 实时更新当前 candle
watch(price, (np) => {
  if (!candleSeries || !np) return
  try {
    const data = candleSeries.data()
    if (data.length === 0) return
    const last = data[data.length - 1]
    candleSeries.update({
      time: last.time,
      close: np,
      high: Math.max(last.high, np),
      low: Math.min(last.low, np),
    })
  } catch (e) { /* ignore */ }
})

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (chart) chart.remove()
})

function fmt(n) { return (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function fmtVol(n) {
  if (!n) return '0'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toFixed(0)
}
function fmtSize(n) { return n ? n.toFixed(4) : '0.0000' }
function timeAgo(ts) {
  const s = Math.floor((Date.now() - parseInt(ts)) / 1000)
  if (s < 60) return s + 's'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  return Math.floor(s / 3600) + 'h'
}
</script>

<template>
  <div class="container">
    <h1 class="section-title">Crypto</h1>

    <!-- 价格条 -->
    <div class="price-bar">
      <div class="price-bar-left">
        <span class="price-bar-symbol">BTC / USDT</span>
        <span class="price-bar-price">${{ fmt(price) }}</span>
        <span class="price-bar-change" :class="changePercent24h >= 0 ? 'up' : 'down'">
          {{ changePercent24h >= 0 ? '+' : '' }}{{ changePercent24h.toFixed(2) }}%
        </span>
      </div>
      <span class="price-bar-status" :class="{ online: connected }">
        {{ connected ? 'LIVE' : 'CONNECTING' }}
      </span>
    </div>

    <!-- 24h 统计 -->
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-label">24h 高</span>
        <span class="stat-value up">${{ fmt(high24h) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">24h 低</span>
        <span class="stat-value down">${{ fmt(low24h) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">24h 量 (BTC)</span>
        <span class="stat-value">{{ fmtVol(volume24h) }}</span>
      </div>
    </div>

    <!-- 周期切换按钮 -->
    <div class="interval-bar">
      <button
        v-for="itv in intervals"
        :key="itv.value"
        class="interval-btn"
        :class="{ active: activeInterval === itv.value }"
        :disabled="chartLoading"
        @click="switchInterval(itv.value)"
      >
        {{ itv.label }}
        <span v-if="activeInterval === itv.value && chartLoading" class="spinner"></span>
      </button>
    </div>

    <!-- 策略统计 -->
    <div class="strategy-bar">
      <span class="strategy-label">MA 策略 (5/20)</span>
      <span class="strategy-legend"><i class="dot" style="background:#00f0ff"></i> MA5</span>
      <span class="strategy-legend"><i class="dot" style="background:#bd93f9"></i> MA20</span>
      <span class="strategy-legend"><i class="dot" style="background:#00e676"></i> 金叉买</span>
      <span class="strategy-legend"><i class="dot" style="background:#ff4757"></i> 死叉卖</span>
      <span class="strategy-divider">|</span>
      <span class="bt-stat">总收益 <b :class="btStats.totalReturn >= 0 ? 'up' : 'down'">{{ btStats.totalReturn >= 0 ? '+' : '' }}{{ btStats.totalReturn.toFixed(2) }}%</b></span>
      <span class="bt-stat">胜率 <b>{{ btStats.winRate.toFixed(1) }}%</b></span>
      <span class="bt-stat">交易 <b>{{ btStats.trades }}</b> 次</span>
      <span class="bt-stat">最大回撤 <b class="down">{{ btStats.maxDrawdown.toFixed(2) }}%</b></span>
    </div>

    <!-- 主区域 -->
    <div class="main-grid">
      <div class="chart-panel">
        <div ref="chartContainer" class="chart-wrap"></div>
      </div>

      <!-- 右侧面板 -->
      <div class="side-panels">
        <!-- 订单簿 -->
        <div class="orderbook">
          <div class="ob-header"><span>价格(USDT)</span><span>数量(BTC)</span><span>累计</span></div>
          <div class="ob-asks">
            <div v-for="(a, i) in [...asks].reverse()" :key="'a'+i" class="ob-row ask">
              <span class="ob-price down">{{ fmt(a[0]) }}</span>
              <span>{{ fmtSize(a[1]) }}</span>
              <span>{{ fmtSize(a[2]) }}</span>
              <div class="ob-bar ask-bar" :style="{ width: (a[2] / (asks[asks.length-1]?.[2] || 1)) * 100 + '%' }"></div>
            </div>
          </div>
          <div class="ob-spread"><span class="ob-spread-price">${{ fmt(price) }}</span></div>
          <div class="ob-bids">
            <div v-for="(b, i) in bids" :key="'b'+i" class="ob-row bid">
              <span class="ob-price up">{{ fmt(b[0]) }}</span>
              <span>{{ fmtSize(b[1]) }}</span>
              <span>{{ fmtSize(b[2]) }}</span>
              <div class="ob-bar bid-bar" :style="{ width: (b[2] / (bids[0]?.[2] || 1)) * 100 + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 最新成交 -->
        <div class="trades-panel">
          <div class="trades-header"><span>最新成交</span></div>
          <div class="trades-list">
            <div v-for="(t, i) in trades.slice(0, 20)" :key="'t'+i" class="trade-row">
              <span class="trade-price" :class="t[3] === 'buy' ? 'up' : 'down'">{{ fmt(t[1]) }}</span>
              <span>{{ fmtSize(t[2]) }}</span>
              <span class="trade-time">{{ timeAgo(t[0]) }}</span>
            </div>
            <div v-if="trades.length === 0" class="trade-empty">等待成交数据...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 价格条 */
.price-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; background: var(--bg-card); backdrop-filter: blur(12px);
  border: 1px solid var(--border); margin-bottom: 0.75rem;
  clip-path: polygon(0 6px, 6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px));
}
.price-bar-left { display: flex; align-items: baseline; gap: 1.25rem; }
.price-bar-symbol { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: var(--cyan); letter-spacing: 1px; }
.price-bar-price { font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; }
.price-bar-change { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 600; }
.price-bar-change.up { color: var(--green); } .price-bar-change.down { color: #ff4757; }
.price-bar-status {
  font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; letter-spacing: 2px;
  padding: 0.25rem 0.7rem; border: 1px solid rgba(255,71,87,0.4); color: #ff4757;
}
.price-bar-status.online { border-color: rgba(0,230,118,0.4); color: var(--green); animation: livePulse 2s ease-in-out infinite; }
@keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* 统计 */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.75rem; }
.stat-item { text-align: center; padding: 0.5rem; background: var(--bg-card); border: 1px solid var(--border); }
.stat-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 0.15rem; text-transform: uppercase; }
.stat-value { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 600; color: var(--text); }
.stat-value.up { color: var(--green); } .stat-value.down { color: #ff4757; }

/* ====== 周期按钮（高可见度）====== */
.interval-bar {
  display: flex; gap: 6px; margin-bottom: 0.75rem;
  padding: 6px; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 4px; flex-wrap: wrap;
}
.interval-btn {
  font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600;
  padding: 6px 14px; border: 1px solid rgba(255,255,255,0.1); color: #8899aa;
  background: rgba(255,255,255,0.03); cursor: pointer; transition: all 0.2s;
  border-radius: 3px; letter-spacing: 0.5px;
  display: inline-flex; align-items: center; gap: 4px;
}
.interval-btn:hover:not(:disabled) {
  border-color: var(--cyan); color: #fff; background: rgba(0,240,255,0.1);
}
.interval-btn.active {
  background: rgba(0,240,255,0.15); border-color: var(--cyan); color: var(--cyan);
  box-shadow: 0 0 12px rgba(0,240,255,0.2);
}
.interval-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.spinner {
  width: 8px; height: 8px; border: 1px solid var(--cyan); border-top-color: transparent;
  border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 主布局 */
.main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 0.75rem; }
.chart-panel { min-width: 0; }
.chart-wrap { width: 100%; height: 500px; background: var(--bg-card); border: 1px solid var(--border); }

/* 订单簿 */
.orderbook {
  background: var(--bg-card); border: 1px solid var(--border); overflow: hidden;
  clip-path: polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px));
}
.ob-header {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.25rem;
  padding: 0.4rem 0.6rem; font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
  color: var(--text-muted); border-bottom: 1px solid var(--border); letter-spacing: 0.5px;
}
.ob-asks, .ob-bids { max-height: 180px; overflow: hidden; }
.ob-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.25rem;
  padding: 0.18rem 0.6rem; font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
  position: relative; color: var(--text-muted);
}
.ob-price.up { color: var(--green); } .ob-price.down { color: #ff4757; }
.ob-bar { position: absolute; right: 0; top: 0; bottom: 0; opacity: 0.1; pointer-events: none; }
.ask-bar { background: #ff4757; } .bid-bar { background: var(--green); }
.ob-spread {
  text-align: center; padding: 0.3rem; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
  background: rgba(0,240,255,0.03);
}
.ob-spread-price { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 700; color: var(--cyan); }

/* 成交 */
.trades-panel {
  background: var(--bg-card); border: 1px solid var(--border); flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  clip-path: polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px));
}
.trades-header { padding: 0.4rem 0.6rem; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); border-bottom: 1px solid var(--border); letter-spacing: 1px; }
.trades-list { flex: 1; overflow: hidden; min-height: 0; }
.trade-row { display: flex; justify-content: space-between; padding: 0.15rem 0.6rem; font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: var(--text-muted); }
.trade-price.up { color: var(--green); } .trade-price.down { color: #ff4757; }
.trade-time { opacity: 0.5; }
.trade-empty { padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; }

/* 策略统计条 */
.strategy-bar {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 8px 14px; margin-bottom: 0.75rem;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: var(--text-muted);
}
.strategy-label { color: var(--cyan); font-weight: 600; letter-spacing: 1px; }
.strategy-legend { display: flex; align-items: center; gap: 4px; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.strategy-divider { color: var(--border); }
.bt-stat b { font-weight: 600; color: var(--text); }
.bt-stat b.up { color: var(--green); }
.bt-stat b.down { color: #ff4757; }

@media (max-width: 900px) {
  .main-grid { grid-template-columns: 1fr; }
  .side-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .price-bar-price { font-size: 1.3rem; }
}
@media (max-width: 640px) {
  .side-panels { grid-template-columns: 1fr; }
  .chart-wrap { height: 350px; }
}
</style>
