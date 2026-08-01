import { describe, it, expectTypeOf } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

describe('mockNuxtImport', () => {
  describe('type parameter T', () => {
    it('string', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expectTypeOf(mockNuxtImport<string>).parameter(1).toEqualTypeOf<(original: any) => any>()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expectTypeOf(mockNuxtImport<'useRoute'>).parameter(1).toEqualTypeOf<(original: any) => any>()
    })

    it('target', () => {
      expectTypeOf(mockNuxtImport<typeof useRoute>)
        .parameter(1)
        .toEqualTypeOf<(original: typeof useRoute) => typeof useRoute | Promise<typeof useRoute>>()
    })
  })

  describe('with name based', () => {
    it('mock factory without original parameter', () => {
      mockNuxtImport('useRoute', () => () => ({ path: '/mocked' }))
      mockNuxtImport('useRoute', () => Promise.resolve(() => ({ path: '/mocked' })))
    })

    it('mock factory with original parameter', () => {
      mockNuxtImport('useRoute', (original) => {
        expectTypeOf(original).toBeAny()
        return () => original()
      })

      mockNuxtImport('useRoute', original => Promise.resolve(original))
    })
  })

  describe('with name based and type parameter', () => {
    it('mock factory without original parameter', () => {
      mockNuxtImport<typeof useRoute>('useRoute', () => () => ({ ...useRoute() }))
      mockNuxtImport<typeof useRoute>('useRoute', () => Promise.resolve(() => ({ ...useRoute() })))

      // @ts-expect-error return type is not correct
      mockNuxtImport<typeof useRoute>('useRoute', () => '')
      // @ts-expect-error return type is not correct
      mockNuxtImport<typeof useRoute>('useRoute', () => () => '')
    })

    it('mock factory with original parameter', () => {
      mockNuxtImport<typeof useRoute>('useRoute', (original) => {
        expectTypeOf(original).toEqualTypeOf<typeof useRoute>()
        return original
      })

      mockNuxtImport<typeof useRoute>('useRoute', original => Promise.resolve(original))
      // @ts-expect-error return type is not correct
      mockNuxtImport<typeof useRoute>('useRoute', _ => '')
      // @ts-expect-error return type is not correct
      mockNuxtImport<typeof useRoute>('useRoute', _ => () => ({}))
    })
  })

  describe('with target based', () => {
    it('mock factory without original parameter', () => {
      mockNuxtImport(useRoute, () => () => ({ ...useRoute() }))
      mockNuxtImport(useRoute, () => Promise.resolve(() => ({ ...useRoute() })))

      // @ts-expect-error return type is not correct
      mockNuxtImport(useRoute, () => '')
      // @ts-expect-error return type is not correct
      mockNuxtImport(useRoute, () => () => '')
    })

    it('mock factory with original parameter', () => {
      mockNuxtImport(useRoute, (original) => {
        expectTypeOf(original).toEqualTypeOf<typeof useRoute>()
        return original
      })

      mockNuxtImport(useRoute, original => Promise.resolve(original))
      // @ts-expect-error return type is not correct
      mockNuxtImport(useRoute, _ => '')
      // @ts-expect-error return type is not correct
      mockNuxtImport(useRoute, _ => () => ({}))
    })
  })
})
