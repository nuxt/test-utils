export const add = (...args: number[]) => {
  return args.reduce((a, b) => a + b, 0)
}

if (import.meta.vitest) {
  // @vitest-environment node
  const { it, expect } = import.meta.vitest

  it('add', () => {
    expect(add()).toBe(0)
    expect(add(1)).toBe(1)
    expect(add(1, 2, 3)).toBe(6)
  })

  it('window', () => {
    expect(globalThis.window).toBeUndefined()
  })
}
