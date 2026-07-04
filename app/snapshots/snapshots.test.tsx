import { describe, it, expect } from 'vitest'

// 模拟资产快照数据
const mockSnapshots = [
  { id: '1', assetId: '1', amount: 1500, recordedAt: '2026-04-09T10:00:00Z' },
  { id: '2', assetId: '1', amount: 1600, recordedAt: '2026-04-10T10:00:00Z' },
  { id: '3', assetId: '1', amount: 1400, recordedAt: '2026-04-11T10:00:00Z' },
]

const mockAssets = [{ id: '1', name: '测试资产', type: 'cash' }]

// --- Functions extracted from SnapshotsPage for testing ---

function getUniqueSnapshotTimes(snapshots: typeof mockSnapshots) {
  const times = [...new Set(snapshots.map((s) => s.recordedAt))]
  return times.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
}

function getTotalByTime(snapshots: typeof mockSnapshots, recordedAt: string) {
  return snapshots
    .filter((s) => s.recordedAt === recordedAt)
    .reduce((sum, s) => sum + s.amount, 0)
}

function getSnapshotsByTime(snapshots: typeof mockSnapshots, recordedAt: string) {
  return snapshots.filter((s) => s.recordedAt === recordedAt)
}

function getAssetChanges(snapshots: typeof mockSnapshots) {
  const times = getUniqueSnapshotTimes(snapshots)
  if (times.length < 2) return { fromFirst: null, fromLastMonth: null, firstTime: null, lastMonthTime: null }

  const latestTime = times[0]
  const latestTotal = getTotalByTime(snapshots, latestTime)
  const firstTime = times[times.length - 1]
  const firstTotal = getTotalByTime(snapshots, firstTime)
  const fromFirst = latestTotal - firstTotal

  const latestDate = new Date(latestTime)
  const lastMonthMonth = latestDate.getMonth() - 1
  let lastMonthTime: string | null = null

  if (lastMonthMonth < 0) {
    const candidates = times.filter((t) => {
      const d = new Date(t)
      return d.getFullYear() === latestDate.getFullYear() - 1 && d.getMonth() === 11
    })
    if (candidates.length > 0) lastMonthTime = candidates[0]
  } else {
    const candidates = times.filter((t) => {
      const d = new Date(t)
      return d.getFullYear() === latestDate.getFullYear() && d.getMonth() === lastMonthMonth
    })
    if (candidates.length > 0) lastMonthTime = candidates[0]
  }

  const fromLastMonth = lastMonthTime ? latestTotal - getTotalByTime(snapshots, lastMonthTime) : null
  return { fromFirst, fromLastMonth, firstTime, lastMonthTime }
}

function getUniqueDates(snapshots: typeof mockSnapshots) {
  const dates = [...new Set(snapshots.map((s) => {
    const d = new Date(s.recordedAt)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }))]
  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
}


describe('资产快照页面功能测试', () => {
  // --- Original mock-data tests (kept for backward compat) ---
  it('应该正确计算资产价值变化', () => {
    const firstSnapshot = mockSnapshots[0]
    const lastSnapshot = mockSnapshots[mockSnapshots.length - 1]
    const valueChange = lastSnapshot.amount - firstSnapshot.amount
    expect(valueChange).toBe(-100)
  })

  it('应该正确计算资产价值变化百分比', () => {
    const first = mockSnapshots[0]
    const last = mockSnapshots[mockSnapshots.length - 1]
    const change = ((last.amount - first.amount) / first.amount) * 100
    expect(change).toBeCloseTo(-6.67, 2)
  })

  it('应该正确按日期排序快照', () => {
    const sorted = [...mockSnapshots].sort((a, b) =>
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )
    expect(sorted[0].id).toBe('1')
    expect(sorted[2].id).toBe('3')
  })

  it('应该正确计算平均资产价值', () => {
    const avg = mockSnapshots.reduce((s, n) => s + n.amount, 0) / mockSnapshots.length
    expect(avg).toBe(1500)
  })

  it('应该正确识别最高和最低资产价值', () => {
    const amounts = mockSnapshots.map((s) => s.amount)
    expect(Math.max(...amounts)).toBe(1600)
    expect(Math.min(...amounts)).toBe(1400)
  })

  // --- Logic function tests ---
  describe('getUniqueSnapshotTimes', () => {
    it('返回去重降序的时间列表', () => {
      const times = getUniqueSnapshotTimes(mockSnapshots)
      expect(times).toHaveLength(3)
      expect(new Date(times[0]).getTime()).toBeGreaterThan(new Date(times[1]).getTime())
    })

    it('空数组返回空数组', () => {
      expect(getUniqueSnapshotTimes([])).toEqual([])
    })

    it('相同时间归并为一条', () => {
      const snapshots = [
        { id: '1', assetId: '1', amount: 100, recordedAt: '2026-04-09T10:00:00Z' },
        { id: '2', assetId: '2', amount: 200, recordedAt: '2026-04-09T10:00:00Z' },
      ]
      expect(getUniqueSnapshotTimes(snapshots)).toHaveLength(1)
    })
  })

  describe('getTotalByTime', () => {
    it('正确汇总指定时间的总额', () => {
      expect(getTotalByTime(mockSnapshots, '2026-04-09T10:00:00Z')).toBe(1500)
    })

    it('找不到时返回0', () => {
      expect(getTotalByTime(mockSnapshots, '2099-01-01T00:00:00Z')).toBe(0)
    })
  })

  describe('getAssetChanges', () => {
    it('少于2次快照返回null', () => {
      expect(getAssetChanges([mockSnapshots[0]])).toEqual({
        fromFirst: null, fromLastMonth: null, firstTime: null, lastMonthTime: null,
      })
    })

    it('空数组返回null', () => {
      expect(getAssetChanges([])).toEqual({
        fromFirst: null, fromLastMonth: null, firstTime: null, lastMonthTime: null,
      })
    })

    it('正确计算首尾变化', () => {
      const result = getAssetChanges(mockSnapshots)
      expect(result.fromFirst).toBe(-100) // 1400 - 1500
      expect(result.firstTime).toBe('2026-04-09T10:00:00Z')
    })
  })

  describe('getUniqueDates', () => {
    it('返回去重的日期字符串', () => {
      const dates = getUniqueDates(mockSnapshots)
      expect(dates).toContain('2026-04-09')
      expect(dates).toContain('2026-04-11')
    })

    it('空数组返回空数组', () => {
      expect(getUniqueDates([])).toEqual([])
    })
  })
})
