'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Calculator,
  Calendar,
  Wallet,
  Settings,
  PlayCircle,
  RotateCcw,
  Home,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function InvestSimulator() {
  const router = useRouter()
  const [monthly, setMonthly] = useState(50000)
  const [start, setStart] = useState(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 5)
    return d.toISOString().slice(0, 10)
  })
  const [end, setEnd] = useState(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  })
  // 積立日は固定（末日）とし、UIでは選択不要
  // 年利データ（実績）: { 2020: 0.184, ... } を想定
  const [yearRates, setYearRates] = useState<Record<number, number> | null>(null)

  const [principal, setPrincipal] = useState<number | null>(null)
  const [estimated, setEstimated] = useState<number | null>(null)
  const [gain, setGain] = useState<number | null>(null)
  type TimelineRow = {
    y: number
    m: number
    dateStr: string
    contrib: number
    rMonth: number
    interest: number
    balance: number
    principalAccum: number
  }
  const [timeline, setTimeline] = useState<TimelineRow[]>([])

  const contribMonths = useMemo(() => {
    // start日から今日までの積立発生日の配列を生成（年, 月）
    const s = new Date(start)
    if (isNaN(s.getTime())) return [] as { y: number; m: number }[]
    const today = new Date()
    const periodEnd = (() => {
      if (!end) return today
      const e = new Date(end)
      return isNaN(e.getTime()) ? today : e
    })()

    // もし終了日が開始日より前なら空
    if (periodEnd.getTime() < s.getTime()) return [] as { y: number; m: number }[]
    const getScheduledDay = (y: number, m: number) => new Date(y, m + 1, 0).getDate() // 月末

    const items: { y: number; m: number }[] = []

    // 決定: 最初の積立月
    const sY = s.getFullYear()
    const sM = s.getMonth()
    const firstScheduled = getScheduledDay(sY, sM)
    let y = sY
    let m = sM
    if (s.getDate() > firstScheduled) {
      // 翌月から開始
      m += 1
      if (m > 11) {
        m = 0
        y += 1
      }
    }

    // ループ: 今日まで
    const endY = periodEnd.getFullYear()
    const endM = periodEnd.getMonth()
    const endScheduled = getScheduledDay(endY, endM)
    const includeEnd = periodEnd.getDate() >= endScheduled

    while (y < endY || (y === endY && (m < endM || (m === endM && includeEnd)))) {
      items.push({ y, m })
      m += 1
      if (m > 11) {
        m = 0
        y += 1
      }
    }

    return items
  }, [start, end])

  

  useEffect(() => {
    // 実績年利のロード（存在しなければフォールバック扱い）
    const load = async () => {
      try {
        const res = await fetch('/data/sp500-annual.json', { cache: 'no-store' })
        if (!res.ok) {
          setYearRates(null)
          setRateInfo('missing')
          return
        }
        const raw = (await res.json()) as Record<string, number>
        const map: Record<number, number> = {}
        for (const k of Object.keys(raw)) {
          const y = Number(k)
          const v = raw[k]
          if (!Number.isNaN(y) && typeof v === 'number') map[y] = v
        }
        setYearRates(map)
      } catch {
        setYearRates(null)
      }
    }
    load()
  }, [])

  const simulate = () => {
    const amt = Math.max(0, Math.floor(monthly))
    const monthsList = contribMonths
    const p = amt * monthsList.length

    let fv = 0
    const rows: TimelineRow[] = []
    let idx = 0
    for (const { y, m } of monthsList) {
      let rMonth = 0
      if (yearRates && typeof yearRates[y] === 'number') {
        const rYear = yearRates[y]
        rMonth = Math.pow(1 + rYear, 1 / 12) - 1
      } else {
        // フォールバック: 名目年率8%
        rMonth = Math.pow(1 + 0.08, 1 / 12) - 1
      }

      let interest = 0
      // 月末積立（期末入金）
      interest = fv * rMonth
      fv = fv + interest + amt

      const scheduledDay = new Date(y, m + 1, 0).getDate()
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(scheduledDay).padStart(2, '0')}`
      rows.push({
        y,
        m,
        dateStr,
        contrib: amt,
        rMonth,
        interest,
        balance: fv,
        principalAccum: amt * (idx + 1),
      })
      idx += 1
    }

    setPrincipal(p)
    setEstimated(fv)
    setGain(fv - p)
    setTimeline(rows)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="relative text-center mb-8">
          <button
            onClick={() => router.push('/')}
            title="ホームに戻る"
            aria-label="ホームに戻る"
            className="absolute left-0 top-0 -ml-2 -mt-2 p-2 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <Home className="w-5 h-5" />
          </button>
          <div className="flex justify-center items-center gap-3 mb-3">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <LineChart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              積立投資シミュレーション
            </h1>
          </div>
        </div>

        {/* 入力フォーム */}
        <div className="grid gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              パラメータ
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-900 mb-2">投資対象</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  defaultValue="sp500"
                >
                  <option value="sp500">S&amp;P 500</option>
                  <option value="nikkei" disabled>
                    日経平均（後で対応）
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-900 mb-2 flex items-center gap-1">
                  <Wallet className="w-4 h-4 text-gray-600" />
                  毎月の積立額（円）
                </label>
                <input
                  type="number"
                  min={0}
                  value={monthly}
                  onChange={e => setMonthly(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-900 mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  積立開始日
                </label>
                <input
                  type="date"
                  value={start}
                  onChange={e => setStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-900 mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  積立終了日
                </label>
                <input
                  type="date"
                  value={end}
                  onChange={e => setEnd(e.target.value)}
                  min={start}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">初期値は本日になっています</p>
              </div>

              

              {/* 積立日は固定（毎月末） */}
            </div>

            

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                onClick={simulate}
              >
                <PlayCircle className="w-4 h-4" />
                シミュレート
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  setMonthly(50000)
                  const d = new Date()
                  d.setFullYear(d.getFullYear() - 5)
                  setStart(d.toISOString().slice(0, 10))
                  const t = new Date()
                  setEnd(t.toISOString().slice(0, 10))
                  setPrincipal(null)
                  setEstimated(null)
                  setGain(null)
                }}
              >
                <RotateCcw className="w-4 h-4" />
                初期値に戻す
              </button>
            </div>
          </div>

        </div>

        
      </div>
      {/* 結果サマリー（明細の上） */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gray-600" />
            結果
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">元本合計</span>
              <span className="font-semibold text-gray-900">
                {principal == null ? '-- 円' : principal.toLocaleString('ja-JP') + ' 円'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">評価額（想定）</span>
              <span className="font-semibold text-gray-900">
                {estimated == null ? '-- 円' : Math.round(estimated).toLocaleString('ja-JP') + ' 円'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">含み益</span>
              <span className="font-semibold text-gray-900">
                {gain == null ? '-- 円' : Math.round(gain).toLocaleString('ja-JP') + ' 円'}
              </span>
            </div>
          </div>

          {/* チャート */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">評価額の推移</h3>
            {timeline.length > 1 ? (
              <ChartDetailed rows={timeline} />
            ) : (
              <p className="text-xs text-gray-500">シミュレーションを実行すると表示されます。</p>
            )}
          </div>
        </div>
      </div>

      {/* 明細テーブル */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">明細</h2>
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-500">シミュレーション後に明細が表示されます。</p>
          ) : (
            <TimelineTable rows={timeline} />
          )}
        </div>
      </div>
    </div>
  )
}

function ChartDetailed({ rows }: { rows: any[] }) {
  const w = 720
  const h = 260
  const pad = { left: 56, right: 16, top: 16, bottom: 28 }
  const n = rows.length
  const balances: number[] = rows.map((r: any) => r.balance)
  const principals: number[] = rows.map((r: any) => r.principalAccum)
  const maxVal = Math.max(1, Math.max(...balances, ...principals))
  const nice = (v: number) => {
    // nice max for axis
    const pow = Math.pow(10, Math.floor(Math.log10(v)))
    const step = [1, 2, 2.5, 5, 10]
    for (const s of step) {
      const m = s * pow
      if (m >= v) return m
    }
    return 10 * pow
  }
  const yMax = nice(maxVal)
  const yTicks = 5
  const sx = (i: number) => pad.left + (i * (w - pad.left - pad.right)) / (n - 1)
  const sy = (v: number) => pad.top + (1 - v / yMax) * (h - pad.top - pad.bottom)
  const path = (arr: number[]) =>
    arr
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${sx(i).toFixed(2)} ${sy(v).toFixed(2)}`)
      .join(' ')

  // X ticks: 年初ごと（m === 0）を優先し、最大8本に間引き
  const yearIndices = rows
    .map((r: any, i: number) => ({ i, y: r.y, m: r.m }))
    .filter(d => d.m === 0)
  let xTicks = yearIndices
  const maxXTicks = 8
  if (xTicks.length > maxXTicks) {
    const step = Math.ceil(xTicks.length / maxXTicks)
    xTicks = xTicks.filter((_, idx) => idx % step === 0)
  }
  if (xTicks.length === 0) xTicks = [{ i: 0, y: rows[0].y, m: rows[0].m }]

  // Hover
  const [hover, setHover] = useState<number | null>(null)
  const onMove = (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    const bounds = (e.target as SVGRectElement).getBoundingClientRect()
    const x = e.clientX - bounds.left
    const xi = Math.round(((x - pad.left) / (w - pad.left - pad.right)) * (n - 1))
    const idx = Math.max(0, Math.min(n - 1, xi))
    setHover(idx)
  }
  const onLeave = () => setHover(null)
  const fmt = (n: number) => Math.round(n).toLocaleString('ja-JP')

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[480px] h-64">
        {/* Grid Y */}
        {[...Array(yTicks + 1)].map((_, k) => {
          const y = pad.top + (k * (h - pad.top - pad.bottom)) / yTicks
          const val = yMax * (1 - k / yTicks)
          return (
            <g key={k}>
              <line x1={pad.left} x2={w - pad.right} y1={y} y2={y} stroke="#e5e7eb" />
              <text x={pad.left - 8} y={y} textAnchor="end" dominantBaseline="middle" fill="#6b7280" fontSize="10">
                {fmt(val)}
              </text>
            </g>
          )
        })}

        {/* X ticks */}
        {xTicks.map(t => (
          <g key={`x-${t.i}`}>
            <line
              x1={sx(t.i)}
              x2={sx(t.i)}
              y1={pad.top}
              y2={h - pad.bottom}
              stroke="#f3f4f6"
            />
            <text x={sx(t.i)} y={h - pad.bottom + 16} textAnchor="middle" fill="#6b7280" fontSize="10">
              {`${t.y}`}
            </text>
          </g>
        ))}

        {/* Series: Principal */}
        <path d={path(principals)} fill="none" stroke="#94a3b8" strokeWidth="2" />
        {/* Series: Balance */}
        <defs>
          <linearGradient id="areaBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d={`M ${pad.left} ${sy(0)} ${path(balances)} L ${w - pad.right} ${sy(0)} Z`}
          fill="url(#areaBalance)"
        />
        <path d={path(balances)} fill="none" stroke="#4f46e5" strokeWidth="2" />

        {/* Hover marker */}
        {hover != null && (
          <g>
            <line
              x1={sx(hover)}
              x2={sx(hover)}
              y1={pad.top}
              y2={h - pad.bottom}
              stroke="#c7d2fe"
            />
            <circle cx={sx(hover)} cy={sy(balances[hover])} r={3} fill="#4f46e5" />
            <circle cx={sx(hover)} cy={sy(principals[hover])} r={3} fill="#94a3b8" />

            {/* Tooltip */}
            {(() => {
              const r = rows[hover]
              const boxW = 220
              const boxH = 70
              const x = Math.min(Math.max(pad.left, sx(hover) + 8), w - pad.right - boxW)
              const y = pad.top + 8
              return (
                <g>
                  <rect x={x} y={y} width={boxW} height={boxH} rx={6} ry={6} fill="white" stroke="#e5e7eb" />
                  <text x={x + 10} y={y + 18} fill="#111827" fontSize="12">{r.dateStr}</text>
                  <text x={x + 10} y={y + 36} fill="#4f46e5" fontSize="12">
                    残高: {fmt(r.balance)} 円
                  </text>
                  <text x={x + 10} y={y + 52} fill="#374151" fontSize="12">
                    元本: {fmt(r.principalAccum)} 円 / 利息: {fmt(r.interest)} 円
                  </text>
                </g>
              )
            })()}
          </g>
        )}

        {/* Mouse capture */}
        <rect
          x={pad.left}
          y={pad.top}
          width={w - pad.left - pad.right}
          height={h - pad.top - pad.bottom}
          fill="transparent"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        />
      </svg>
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
        <div className="flex items-center gap-1"><span className="inline-block w-3 h-1 bg-indigo-600"></span> 残高</div>
        <div className="flex items-center gap-1"><span className="inline-block w-3 h-1 bg-slate-400"></span> 累計元本</div>
      </div>
    </div>
  )
}

function TimelineTable({ rows }: { rows: any[] }) {
  const maxRows = 120
  const slice = rows.length > maxRows ? rows.slice(-maxRows) : rows
  const omitted = rows.length - slice.length
  const fmt = (n: number) => Math.round(n).toLocaleString('ja-JP')
  const pct = (n: number) => (n * 100).toFixed(2)
  return (
    <div className="overflow-x-auto">
      {omitted > 0 && (
        <p className="text-xs text-gray-500 mb-2">直近 {maxRows} ヶ月のみ表示（{omitted} ヶ月は省略）</p>
      )}
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-2 pr-4">月</th>
            <th className="py-2 pr-4">月利(%)</th>
            <th className="py-2 pr-4">積立額</th>
            <th className="py-2 pr-4">利息</th>
            <th className="py-2 pr-4">累計元本</th>
            <th className="py-2 pr-4">残高</th>
          </tr>
        </thead>
        <tbody>
          {slice.map((r, i) => (
            <tr key={`${r.dateStr}-${i}`} className="border-b last:border-0">
              <td className="py-2 pr-4 text-gray-900">{r.dateStr}</td>
              <td className="py-2 pr-4 text-gray-900">{pct(r.rMonth)}</td>
              <td className="py-2 pr-4 text-gray-900">{fmt(r.contrib)} 円</td>
              <td className="py-2 pr-4 text-gray-900">{fmt(r.interest)} 円</td>
              <td className="py-2 pr-4 text-gray-900">{fmt(r.principalAccum)} 円</td>
              <td className="py-2 pr-4 text-gray-900">{fmt(r.balance)} 円</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
