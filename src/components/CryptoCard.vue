<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { createChart, ColorType, LineSeries } from 'lightweight-charts'
import { useOKX, generateCandles, fetchCandles } from '../composables/useOKX.js'

const { price, changePercent24h, high24h, low24h, volume24h, connected } = useOKX()

const chartContainer = ref(null)
let chart = null
let lineSeries = null
let prices = []

onMounted(async () => {
  await nextTick()
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    width: chartContainer.value.clientWidth,
    height: 200,
    layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#5a7a9a' },
    grid: { vertLines: { color: 'rgba(0,240,255,0.04)' }, horzLines: { color: 'rgba(0,240,255,0.04)' } },
    rightPriceScale: { borderColor: 'rgba(0,240,255,0.1)', scaleMargins: { top: 0.1, bottom: 0.1 } },
    timeScale: { borderColor: 'rgba(0,240,255,0.1)', timeVisible: false },
    crosshair: { mode: 0 },
    handleScroll: false,
    handleScale: false,
  })

  lineSeries = chart.addSeries(LineSeries, {
    color: '#00f0ff', lineWidth: 2,
    crosshairMarkerVisible: false, priceLineVisible: false, lastValueVisible: false,
  })

  // 1. 立即用内置数据显示
  const mock = generateCandles('5m', 200)
  prices = mock.map((k) => ({ time: k.time, value: k.close }))
  lineSeries.setData(prices)

  // 2. 后台尝试获取真实数据替换
  try {
    const real = await fetchCandles('5m', 1)
    if (real.length > 10) {
      prices = real.map((k) => ({ time: k.time, value: k.close }))
      lineSeries.setData(prices)
    }
  } catch (e) { /* 用内置数据即可 */ }

  const ro = new ResizeObserver(() => {
    if (chartContainer.value) chart.applyOptions({ width: chartContainer.value.clientWidth })
  })
  ro.observe(chartContainer.value)
  onUnmounted(() => ro.disconnect())
})

watch(price, (np) => {
  if (!lineSeries || !np) return
  const now = Math.floor(Date.now() / 1000)
  const last = prices[prices.length - 1]
  if (last && now - last.time < 60) {
    prices[prices.length - 1] = { time: last.time, value: np }
    lineSeries.update({ time: last.time, value: np })
  } else {
    prices.push({ time: now, value: np })
    lineSeries.update({ time: now, value: np })
    if (prices.length > 300) prices.shift()
  }
})

onUnmounted(() => { if (chart) chart.remove() })

function fmt(n) { return (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function fmtVol(n) {
  if (!n) return '0'; if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'; return n.toFixed(0)
}
</script>

<template>
  <div class="crypto-card">
    <div class="crypto-card-header">
      <span class="crypto-card-symbol">BTC / USDT</span>
      <span class="crypto-card-status" :class="{ online: connected }">{{ connected ? 'LIVE' : 'CONNECTING...' }}</span>
    </div>
    <div class="crypto-card-price-row">
      <span class="crypto-card-price">${{ fmt(price) }}</span>
      <span class="crypto-card-change" :class="changePercent24h >= 0 ? 'up' : 'down'">{{ changePercent24h >= 0 ? '+' : '' }}{{ changePercent24h.toFixed(2) }}%</span>
    </div>
    <div ref="chartContainer" class="crypto-card-chart"></div>
    <div class="crypto-card-stats">
      <div class="crypto-stat"><span class="crypto-stat-label">24h 高</span><span class="crypto-stat-value">${{ fmt(high24h) }}</span></div>
      <div class="crypto-stat"><span class="crypto-stat-label">24h 低</span><span class="crypto-stat-value">${{ fmt(low24h) }}</span></div>
      <div class="crypto-stat"><span class="crypto-stat-label">24h 量</span><span class="crypto-stat-value">{{ fmtVol(volume24h) }}</span></div>
    </div>
  </div>
</template>

<style scoped>
.crypto-card { background: var(--bg-card); backdrop-filter: blur(12px); border: 1px solid var(--border); padding: 1.5rem; position: relative; clip-path: polygon(0 8px, 8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px)); transition: all 0.35s; margin-bottom: 2rem; }
.crypto-card:hover { border-color: rgba(0, 240, 255, 0.3); box-shadow: 0 0 30px rgba(0, 240, 255, 0.06), 0 8px 32px rgba(0,0,0,0.5); }
.crypto-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.crypto-card-symbol { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 600; color: var(--cyan); letter-spacing: 1px; }
.crypto-card-status { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #ff4757; letter-spacing: 1px; }
.crypto-card-status.online { color: var(--green); text-shadow: 0 0 6px rgba(0, 230, 118, 0.4); }
.crypto-card-price-row { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 0.75rem; }
.crypto-card-price { font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; color: var(--text); }
.crypto-card-change { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 600; }
.crypto-card-change.up { color: var(--green); } .crypto-card-change.down { color: #ff4757; }
.crypto-card-chart { width: 100%; height: 200px; margin-bottom: 0.75rem; }
.crypto-card-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.crypto-stat { text-align: center; padding: 0.4rem; background: rgba(0, 240, 255, 0.03); border: 1px solid rgba(0, 240, 255, 0.06); }
.crypto-stat-label { display: block; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 0.15rem; }
.crypto-stat-value { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text); font-weight: 500; }
</style>
