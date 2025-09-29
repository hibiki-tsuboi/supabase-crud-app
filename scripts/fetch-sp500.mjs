#!/usr/bin/env node

// Fetch S&P 500 annual total returns (incl. dividends) from Prof. Damodaran
// Source: https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html
// CSV:   https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.csv

import fs from 'node:fs'
import path from 'node:path'

const SOURCE =
  'https://pages.stern.nyu.edu/~adamodar/pc/datasets/histretSP.csv'

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length === 0) return []
  const header = lines[0].split(',').map(h => h.trim())
  const yearIdx = header.findIndex(h => /^year$/i.test(h))
  const retIdx = header.findIndex(h => /includes\s*dividends/i.test(h))
  if (yearIdx === -1 || retIdx === -1) {
    throw new Error('Unexpected CSV header: ' + header.join(', '))
  }
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim())
    if (!cols[yearIdx]) continue
    const y = Number(cols[yearIdx])
    if (!Number.isFinite(y)) continue
    const rRaw = cols[retIdx]
    if (!rRaw) continue
    // Handle values like "11.9%" or "11.9"
    let v = Number(String(rRaw).replace(/%/g, ''))
    if (!Number.isFinite(v)) continue
    // Convert percent to decimal if needed
    if (Math.abs(v) > 1) v = v / 100
    rows.push({ year: y, return: v })
  }
  return rows
}

async function main() {
  console.log('[fetch-sp500] Downloading CSV from:', SOURCE)
  const res = await fetch(SOURCE, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`)
  }
  const text = await res.text()
  const rows = parseCSV(text)
  if (rows.length === 0) throw new Error('Parsed 0 rows')

  const map = Object.fromEntries(
    rows.map(r => [String(r.year), Number(r.return.toFixed(6))])
  )

  const outDir = path.join(process.cwd(), 'public', 'data')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'sp500-annual.json')
  fs.writeFileSync(outFile, JSON.stringify(map, null, 2) + '\n', 'utf-8')
  console.log('[fetch-sp500] Wrote', outFile)
}

main().catch(err => {
  console.error('[fetch-sp500] Error:', err)
  process.exit(1)
})

