import { describe, it, expectTypeOf } from 'vitest'

import type { PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { LocatorSelectors, page } from 'vitest/browser'

import type { mount } from '@vue/test-utils'
import type { render as _render } from '@testing-library/vue'

import type { render } from '@nuxt/test-utils/browser'
import type { mountSuspended, renderSuspended } from '@nuxt/test-utils/runtime'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Component = defineComponent({
  props: {
    p1: {
      type: String,
      required: true,
    },
    p2: {
      type: Boolean,
      default: false,
    },
    p3: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    modelValue: {
      type: String,
    },
  },
  emits: ['update:modelValue'],
  expose: ['method'],
  setup: () => {
    return {
      method: () => '',
    }
  },
})

type SuspendedAdditionalOptions = {
  route?: RouteLocationRaw | false
  spy?: boolean
  scoped?: boolean
}

type SuspendedAdditionalResult = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setupState: Record<string, any>
}

type ComponentType = typeof Component

describe('mountSuspended', () => {
  describe('options', () => {
    type Options = NonNullable<Parameters<typeof mountSuspended<ComponentType>>[1]>

    it('is optional', () => {
      expectTypeOf<Parameters<typeof mountSuspended<ComponentType>>[1]>().toBeNullable()
    })

    it('has suspended additional options', () => {
      expectTypeOf<Pick<Options, keyof SuspendedAdditionalOptions>>()
        .toEqualTypeOf<SuspendedAdditionalOptions>()
    })

    it('has mount fn options', () => {
      type VueOptions = NonNullable<Parameters<typeof mount<ComponentType>>[1]>
      expectTypeOf<Options['attrs']>().toEqualTypeOf<VueOptions['attrs']>()
      expectTypeOf<Options['data']>().toEqualTypeOf<VueOptions['data']>()
      expectTypeOf<Options['props']>().toEqualTypeOf<VueOptions['props']>()
      expectTypeOf<Options['slots']>().toEqualTypeOf<VueOptions['slots']>()
      expectTypeOf<Options['global']>().toEqualTypeOf<VueOptions['global']>()
      expectTypeOf<Options['shallow']>().toEqualTypeOf<VueOptions['shallow']>()
    })
  })

  describe('return', () => {
    type Result = Awaited<ReturnType<typeof mountSuspended<ComponentType>>>

    it('has additional property', () => {
      expectTypeOf<Pick<Result, keyof SuspendedAdditionalResult>>()
        .toEqualTypeOf<SuspendedAdditionalResult>()
    })

    it('has mount property', () => {
      type VueWrapper = ReturnType<typeof mount<ComponentType>>
      expectTypeOf<Pick<Result, keyof VueWrapper>>()
        .toEqualTypeOf<Pick<VueWrapper, keyof VueWrapper>>()
    })
  })
})

describe('renderSuspended', () => {
  describe('options', () => {
    type Options = NonNullable<Parameters<typeof renderSuspended<ComponentType>>[1]>

    it('is optional', () => {
      expectTypeOf<Parameters<typeof renderSuspended<ComponentType>>[1]>().toBeNullable()
    })

    it('has suspended additional options', () => {
      expectTypeOf<Pick<Options, keyof SuspendedAdditionalOptions>>()
        .toEqualTypeOf<SuspendedAdditionalOptions>()
    })

    it('has render fn options', () => {
      type VueOptions = NonNullable<Parameters<typeof _render<ComponentType>>[1]>
      expectTypeOf<Options['attrs']>().toEqualTypeOf<VueOptions['attrs']>()
      expectTypeOf<Options['data']>().toEqualTypeOf<VueOptions['data']>()
      expectTypeOf<Options['props']>().toEqualTypeOf<VueOptions['props']>()
      expectTypeOf<Options['slots']>().toEqualTypeOf<VueOptions['slots']>()
      expectTypeOf<Options['global']>().toEqualTypeOf<VueOptions['global']>()
      expectTypeOf<Options['container']>().toEqualTypeOf<VueOptions['container']>()
      expectTypeOf<Options['baseElement']>().toEqualTypeOf<VueOptions['baseElement']>()
    })
  })

  describe('return', () => {
    type Result = Awaited<ReturnType<typeof renderSuspended<ComponentType>>>

    it('has additional property', () => {
      expectTypeOf<Pick<Result, keyof SuspendedAdditionalResult>>()
        .toEqualTypeOf<SuspendedAdditionalResult>()
    })

    it('has mount property', () => {
      type RenderResult = ReturnType<typeof _render<ComponentType>>
      expectTypeOf<Pick<Result, keyof RenderResult>>()
        .toEqualTypeOf<Pick<RenderResult, keyof RenderResult>>()
    })
  })
})

describe('browser.render', () => {
  describe('options', () => {
    type Options = NonNullable<Parameters<typeof render<ComponentType>>[1]>

    it('is optional', () => {
      expectTypeOf<Parameters<typeof render<ComponentType>>[1]>().toBeNullable()
    })

    it('has suspended additional options', () => {
      expectTypeOf<Pick<Options, keyof SuspendedAdditionalOptions>>()
        .toEqualTypeOf<SuspendedAdditionalOptions>()
    })

    it('has render additional options', () => {
      expectTypeOf<Options>().toMatchObjectType<{
        container?: HTMLElement
        baseElement?: HTMLElement
      }>()
    })

    it('has not attachTo options', () => {
      expectTypeOf<Options>().not.toHaveProperty('attachTo')
    })

    it('has mount fn options', () => {
      type VueOptions = NonNullable<Parameters<typeof mount<ComponentType>>[1]>
      expectTypeOf<Options['attrs']>().toEqualTypeOf<VueOptions['attrs']>()
      expectTypeOf<Options['data']>().toEqualTypeOf<VueOptions['data']>()
      expectTypeOf<Options['props']>().toEqualTypeOf<VueOptions['props']>()
      expectTypeOf<Options['slots']>().toEqualTypeOf<VueOptions['slots']>()
      expectTypeOf<Options['global']>().toEqualTypeOf<VueOptions['global']>()
      expectTypeOf<Options['shallow']>().toEqualTypeOf<VueOptions['shallow']>()
    })
  })

  describe('return', () => {
    type Result = Awaited<ReturnType<typeof render<ComponentType>>>

    it('has additional property', () => {
      expectTypeOf<Pick<Result, keyof SuspendedAdditionalResult>>()
        .toEqualTypeOf<SuspendedAdditionalResult>()
    })

    it('has LocatorSelectors property', () => {
      expectTypeOf<Pick<Result, keyof LocatorSelectors>>()
        .toEqualTypeOf<Pick<LocatorSelectors, keyof LocatorSelectors>>()
    })
  })

  describe('browser.page', () => {
    it('export render to page', () => {
      expectTypeOf<typeof page.render>().toEqualTypeOf<typeof render>()
    })
  })
})
