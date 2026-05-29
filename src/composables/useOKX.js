import { ref, onUnmounted } from 'vue'

const WS_URL = 'wss://ws.okx.com:8443/ws/v5/public'
const REST_TICKER = 'https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT'
const CG_BASE = 'https://api.coingecko.com/api/v3'

export function useOKX() {
  const price = ref(75000)
  const changePercent24h = ref(0)
  const high24h = ref(75000)
  const low24h = ref(75000)
  const volume24h = ref(0)
  const connected = ref(false)
  const bids = ref([])   // [[price, size, total], ...]
  const asks = ref([])   // [[price, size, total], ...]
  const trades = ref([]) // [[time, price, size, side], ...]

  let ws = null, reconnectTimer = null, pollTimer = null
  let tickerSubscribed = false

  // ---- 每秒 REST 轮询价格（最快更新） ----
  async function pollPrice() {
    try {
      const r = await fetch(REST_TICKER)
      const j = await r.json()
      const d = j.data?.[0]
      if (!d) return
      const last = parseFloat(d.last)
      const open24h = parseFloat(d.open24h)
      if (last && last !== price.value) {
        price.value = last
        high24h.value = parseFloat(d.high24h)
        low24h.value = parseFloat(d.low24h)
        volume24h.value = parseFloat(d.vol24h)
        changePercent24h.value = open24h ? ((last - open24h) / open24h) * 100 : 0
      }
    } catch (e) { /* ignore */ }
  }

  function startPolling() {
    pollTimer = setInterval(pollPrice, 1000)
    pollPrice()
  }

  // ---- WebSocket ----
  function connect() {
    if (ws) { try { ws.close() } catch (e) {} }
    ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      connected.value = true
      tickerSubscribed = false
      // 订阅 ticker + depth5 + trades
      ws.send(JSON.stringify({
        op: 'subscribe',
        args: [
          { channel: 'tickers', instId: 'BTC-USDT' },
          { channel: 'books5', instId: 'BTC-USDT' },
          { channel: 'trades', instId: 'BTC-USDT' },
        ],
      }))
    }

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.event) return
        const arg = msg.arg
        if (!arg) return

        // ticker
        if (arg.channel === 'tickers') {
          const d = msg.data?.[0]
          if (!d) return
          const last = parseFloat(d.last)
          const o24 = parseFloat(d.open24h)
          price.value = last
          high24h.value = parseFloat(d.high24h)
          low24h.value = parseFloat(d.low24h)
          volume24h.value = parseFloat(d.vol24h)
          changePercent24h.value = o24 ? ((last - o24) / o24) * 100 : 0
          if (!tickerSubscribed) tickerSubscribed = true
        }

        // depth5
        if (arg.channel === 'books5') {
          const data = msg.data?.[0]
          if (!data) return
          // asks: 卖盘 (升序), bids: 买盘 (降序)
          const rawAsks = (data.asks || []).map((a) => [parseFloat(a[0]), parseFloat(a[1])])
          const rawBids = (data.bids || []).map((b) => [parseFloat(b[0]), parseFloat(b[1])])
          rawAsks.sort((a, b) => a[0] - b[0])
          rawBids.sort((a, b) => b[0] - a[0])
          let bidTotal = 0, askTotal = 0
          bids.value = rawBids.slice(0, 12).map((b) => { bidTotal += b[1]; return [b[0], b[1], bidTotal] })
          asks.value = rawAsks.slice(0, 12).map((a) => { askTotal += a[1]; return [a[0], a[1], askTotal] })
        }

        // trades
        if (arg.channel === 'trades') {
          const items = msg.data || []
          const now = Date.now()
          for (const t of items) {
            const side = parseFloat(t.sz) > 0 ? (t.side === 'buy' ? 'buy' : 'sell') : (t.side === 'buy' ? 'buy' : 'sell')
            trades.value.unshift([t.ts, parseFloat(t.px), parseFloat(t.sz), side])
          }
          // 只保留最近 50 条
          if (trades.value.length > 50) trades.value.length = 50
        }
      } catch (err) { /* ignore */ }
    }

    ws.onclose = () => {
      connected.value = false
      tickerSubscribed = false
      reconnectTimer = setTimeout(connect, 3000)
    }

    ws.onerror = () => { try { ws.close() } catch (e) {} }
  }

  connect()
  startPolling()

  onUnmounted(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (pollTimer) clearInterval(pollTimer)
    if (ws) { ws.onclose = null; try { ws.close() } catch (e) {} }
  })

  return { price, changePercent24h, high24h, low24h, volume24h, connected, bids, asks, trades }
}

/* ---- 内置 K 线生成 ---- */
export function generateCandles(bar = '1H', count = 168) {
  const intervalMin = barToMinutes(bar)
  const now = Math.floor(Date.now() / 1000)
  const basePrice = 75300
  const candles = []
  let prevClose = basePrice
  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * intervalMin * 60
    const vol = basePrice * 0.002 * Math.sqrt(intervalMin / 60)
    const change = (Math.random() - 0.48) * vol
    const open = prevClose
    const close = open + change
    const w = vol * Math.random() * 0.5
    candles.push({ time, open: +open.toFixed(1), high: +Math.max(open, close).toFixed(1) + +Math.abs(w).toFixed(1), low: +Math.min(open, close).toFixed(1) - +Math.abs(w).toFixed(1), close: +close.toFixed(1), volume: +(50 + Math.random() * 200).toFixed(2) })
    prevClose = close
  }
  return candles
}

/* ---- CoinGecko 历史 K 线 ---- */
export async function fetchCandles(bar = '1H', days = 7) {
  const intervalMin = barToMinutes(bar)
  const url = `${CG_BASE}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`
  const res = await fetch(url)
  const json = await res.json()
  const prices = json.prices || []
  const volumes = json.total_volumes || []
  const bucketMap = new Map()
  for (let i = 0; i < prices.length; i++) {
    const [ts, p] = prices[i]
    const bucketTs = Math.floor(ts / 1000 / (intervalMin * 60)) * (intervalMin * 60)
    const vol = volumes[i] ? volumes[i][1] : 0
    if (!bucketMap.has(bucketTs)) bucketMap.set(bucketTs, { open: p, high: p, low: p, close: p, volume: 0 })
    const b = bucketMap.get(bucketTs)
    b.close = p; b.high = Math.max(b.high, p); b.low = Math.min(b.low, p); b.volume += vol
  }
  return Array.from(bucketMap.entries()).map(([t, v]) => ({ time: t, ...v })).sort((a, b) => a.time - b.time)
}

function barToMinutes(bar) {
  const map = { '1m': 1, '5m': 5, '15m': 15, '1H': 60, '4H': 240, '1D': 1440, '1W': 10080 }
  return map[bar] || 60
}
