import cron from "node-cron"

let scheduledTask: cron.ScheduledTask | null = null

export function startDailySnapshotJob() {
  if (scheduledTask) {
    console.log("[Cron] 每日快照任务已在运行中")
    return
  }

  scheduledTask = cron.schedule(
    "1 0 * * *",
    async () => {
      console.log("[Cron] 开始执行每日快照任务:", new Date().toISOString())
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/daily-snapshots`, {
          method: "POST",
        })
        const result = await response.json()
        console.log("[Cron] 每日快照任务完成:", result)
      } catch (error) {
        console.error("[Cron] 每日快照任务失败:", error)
      }
    },
    {
      timezone: "Asia/Shanghai",
    }
  )

  console.log("[Cron] 每日快照任务已启动 - 每天00:01执行")
}

export function stopDailySnapshotJob() {
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
    console.log("[Cron] 每日快照任务已停止")
  }
}

export function isJobRunning() {
  return scheduledTask !== null
}
