import { describe, expect, it, vi } from 'vitest'

describe('auto-imports', () => {
  it('can use core nuxt composables within test file', () => {
    expect(useAppConfig().hey).toMatchInlineSnapshot('false')
  })

  it('can access auto-imported composables from within project', () => {
    const state = useSingleState()
    expect(state.value).toMatchInlineSnapshot('{}')
    state.value.field = 'new value'
    expect(state.value.field).toMatchInlineSnapshot('"new value"')
    expect(useSingleState().value.field).toMatchInlineSnapshot('"new value"')
  })

  it('should not mock imports that are mocked in another test file', () => {
    expect(useAutoImportedTarget()).toMatchInlineSnapshot('"the original"')
    expect(useAutoImportedNonTarget()).toMatchInlineSnapshot('"the original"')
  })

  it('setInterval is not auto-imported', () => {
    vi.useFakeTimers()

    let triggerd = false
    setInterval(() => {
      triggerd = true
    }, 1000)

    vi.advanceTimersByTime(1000)

    expect(triggerd).toBe(true)
  })
})
