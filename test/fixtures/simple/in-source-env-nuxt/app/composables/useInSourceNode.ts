export default function useInSourceNode() {
}

if (import.meta.vitest) {
  // @vitest-environment node
  const { it, expect } = import.meta.vitest

  it('window', () => {
    expect(globalThis.window).toBeUndefined()
  })
}
