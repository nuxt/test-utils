export default function useInSourceNuxt() {
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('window', () => {
    expect(globalThis.window).toBeDefined()
  })
}
