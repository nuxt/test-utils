import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import type { FullConfig, FullResult, Reporter } from '@playwright/test/reporter'

export interface A11yResultFile {
  projectName: string
  threshold: number
  routeCount: number
  totalViolations: number
  violations: unknown[]
}

export const A11Y_BASE_DIR = join(tmpdir(), '.nuxt-test-a11y')

export function getSignalPath(key: string): string {
  const hash = createHash('md5').update(key).digest('hex').slice(0, 12)
  return join(A11Y_BASE_DIR, `signal-${hash}`)
}

class NuxtA11yReporter implements Reporter {
  private runId = ''
  private signalPath = ''
  private runDir = ''

  onBegin(_config: FullConfig): void {
    this.runId = `run-${Date.now()}-${process.pid}`
    this.runDir = join(A11Y_BASE_DIR, this.runId)
    mkdirSync(this.runDir, { recursive: true })

    this.signalPath = getSignalPath(process.cwd())
    mkdirSync(A11Y_BASE_DIR, { recursive: true })
    writeFileSync(this.signalPath, this.runId, 'utf-8')
  }

  async onEnd(_result: FullResult): Promise<{ status?: FullResult['status'] } | undefined> {
    try {
      return await this.aggregateAndReport()
    }
    finally {
      this.cleanup()
    }
  }

  private async aggregateAndReport(): Promise<{ status?: FullResult['status'] } | undefined> {
    if (!existsSync(this.runDir)) return undefined

    const files = readdirSync(this.runDir).filter(f => f.endsWith('.json'))
    if (files.length === 0) return undefined

    const byProject = new Map<string, {
      threshold: number
      totalViolations: number
      routeCount: number
      allViolations: unknown[]
    }>()

    for (const file of files) {
      const data: A11yResultFile = JSON.parse(readFileSync(join(this.runDir, file), 'utf-8'))
      const key = data.projectName || ''
      const existing = byProject.get(key)
      if (existing) {
        existing.threshold = Math.min(existing.threshold, data.threshold)
        existing.totalViolations += data.totalViolations
        existing.routeCount += data.routeCount
        existing.allViolations.push(...data.violations)
      }
      else {
        byProject.set(key, {
          threshold: data.threshold,
          totalViolations: data.totalViolations,
          routeCount: data.routeCount,
          allViolations: [...data.violations],
        })
      }
    }

    let failed = false
    for (const [projectName, data] of byProject) {
      const label = projectName ? `[@nuxt/a11y:${projectName}]` : '[@nuxt/a11y]'
      console.log(`${label} Scanned ${data.routeCount} route(s) — ${data.totalViolations} violation(s)`)

      if (data.totalViolations > data.threshold) {
        failed = true
        let detail = ''
        try {
          const { formatViolations } = await import('@nuxt/a11y/test-utils')
          detail = '\n\n' + formatViolations(data.allViolations as Parameters<typeof formatViolations>[0])
        }
        catch {
          // formatViolations is optional
        }
        console.error(`${label} Violation count (${data.totalViolations}) exceeds threshold (${data.threshold})${detail}`)
      }
    }

    return failed ? { status: 'failed' } : undefined
  }

  private cleanup(): void {
    try {
      if (existsSync(this.signalPath)) rmSync(this.signalPath)
      if (existsSync(this.runDir)) rmSync(this.runDir, { recursive: true })
    }
    catch {
      // best-effort cleanup
    }
  }
}

export default NuxtA11yReporter
