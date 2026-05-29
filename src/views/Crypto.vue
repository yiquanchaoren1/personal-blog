<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts'
import { useOKX, generateCandles, fetchCandles } from '../composables/useOKX.js'
import { calcMA, backtest } from '../composables/ma.js'

const { price, changePercent24h, high24h, low24h, volume24h, connected, bids, asks, trades } = useOKX()

const visible = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})

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

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

onMounted(async () => {
  await nextTick()
  if (!chartContainer.value) return

  const textMuted = cssVar('--text-muted') || '#999'
  const borderColor = cssVar('--border') || '#e8e4e0'
  const greenColor = cssVar('--green') || '#52b788'
  const accentColor = cssVar('--accent') || '#d4836c'

  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: 500,
    layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: textMuted },
    grid: { vertLines: { color: borderColor + '40' }, horzLines: { color: borderColor + '40' } },
    rightPriceScale: { borderColor: borderColor + '60', scaleMargins: { top: 0.05, bottom: 0.25 } },
    timeScale: { borderColor: borderColor + '60', timeVisible: true },
    crosshair: { mode: 1, vertLine: { color: borderColor, style: 2 }, horzLine: { color: borderColor, style: 2 } },
  })

  candleSeries = chart.addSeries(CandlestickSeries, {
    upColor: greenColor, downColor: '#e74c3c',
    borderUpColor: greenColor, borderDownColor: '#e74c3c',
    wickUpColor: greenColor, wickDownColor: '#e74c3c',
  })
  volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: { type: 'volume' },
    priceScaleId: 'volume',
  })
  chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } })

  // 均线
  ma5Series = chart.addSeries(LineSeries, {
    color: accentColor, lineWidth: 1.5,
    priceLineVisible: false, lastValueVisible: true,
    crosshairMarkerVisible: false,
  })
  ma20Series = chart.addSeries(LineSeries, {
    color: '#8b5cf6', lineWidth: 1.5,
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
  <div class="container crypto-page page-view" :class="{ 'page-visible': visible }">
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

