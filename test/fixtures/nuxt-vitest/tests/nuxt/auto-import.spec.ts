import { expect, it } from 'vitest'

it('should not mock', () => {
  expect(useAutoImportedTarget()).toMatchInlineSnapshot('"the original"')
  expect(useAutoImportedNonTarget()).toMatchInlineSnapshot('"the original"')
})
