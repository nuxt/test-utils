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
    const message = ref('message')
    const number = ref(0)
    const object = ref({ a: 1, b: new Date(), c: true as boolean | undefined })
    return {
      message,
      number,
      object,
      method: () => message.value,
      method2: (v: number) => number.value + v,
    }
  },
})

type SuspendedAdditionalOptions = {
  route?: RouteLocationRaw | false
  spy?: boolean
  scoped?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySetupState = Record<string, any>

type SuspendedAdditionalResult = {
  setupState: {
    message: Ref<string>
    number: Ref<number>
    object: Ref<{ a: number, b: Date, c: boolean | undefined }>
    method: () => string
    method2: (v: number) => number
  } & AnySetupState
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

describe('wrapper.setupState', () => {
  type WrapperSetupStates<C> = {
    mountSuspended: Awaited<ReturnType<typeof mountSuspended<C>>>['setupState']
    renderSuspended: Awaited<ReturnType<typeof renderSuspended<C>>>['setupState']
    render: Awaited<ReturnType<typeof render<C>>>['setupState']
  }

  type ExpectedSetupStates<T = AnySetupState> = {
    mountSuspended: T & AnySetupState
    renderSuspended: T & AnySetupState
    render: T & AnySetupState
  }

  it('when setup returns state, infers setupState from it', () => {
    const setup = () => ({
      message: ref(''),
      method: () => '' as string,
    })

    type Expected = ExpectedSetupStates<ReturnType<typeof setup>>

    const _c1 = defineComponent({ setup })
    expectTypeOf<WrapperSetupStates<typeof _c1>>().toEqualTypeOf<Expected>()

    const _c2 = defineComponent({ setup: async () => setup() })
    expectTypeOf<WrapperSetupStates<typeof _c2>>().toEqualTypeOf<Expected>()
  })

  it('when setup returns void, falls back to any setupState', () => {
    const setup = (): void => {}

    type Expected = ExpectedSetupStates

    const _c1 = defineComponent({ setup })
    expectTypeOf<WrapperSetupStates<typeof _c1>>().toEqualTypeOf<Expected>()

    const _c2 = defineComponent({ setup: async () => setup() })
    expectTypeOf<WrapperSetupStates<typeof _c2>>().toEqualTypeOf<Expected>()
  })

  it('when setup returns undefined, falls back to any setupState', () => {
    const setup = (): undefined => {}

    type Expected = ExpectedSetupStates

    const _c1 = defineComponent({ setup })
    expectTypeOf<WrapperSetupStates<typeof _c1>>().toEqualTypeOf<Expected>()

    const _c2 = defineComponent({ setup: async () => setup() })
    expectTypeOf<WrapperSetupStates<typeof _c2>>().toEqualTypeOf<Expected>()
  })

  it('when setup returns a union of states, keeps the union in setupState', async () => {
    const setup = (props: object) => {
      const method = () => '' as string
      return props
        ? {
            tag: '1' as const,
            message: ref(''),
            method,
            cMethod: () => new Date(),
          }
        : {
            tag: '2' as const,
            method,
            cMethod: () => 1 as number,
          }
    }

    type Expected = ExpectedSetupStates<ReturnType<typeof setup>>

    const _c1 = defineComponent({ setup })
    expectTypeOf<WrapperSetupStates<typeof _c1>>().toEqualTypeOf<Expected>()

    const _c2 = defineComponent({ setup: async props => setup(props) })
    expectTypeOf<WrapperSetupStates<typeof _c2>>().toEqualTypeOf<Expected>()
  })

  it('when setup may return undefined, makes setupState partial', async () => {
    const setup = (props: unknown) => {
      if (!props) return
      return {
        message: ref(''),
        method: () => '' as string,
      }
    }

    type Expected = ExpectedSetupStates<{
      message?: Ref<string>
      method?: () => string
    }>

    const _c1 = defineComponent({ setup })
    expectTypeOf<WrapperSetupStates<typeof _c1>>().toEqualTypeOf<Expected>()

    const _c2 = defineComponent({ setup: async props => setup(props) })
    expectTypeOf<WrapperSetupStates<typeof _c2>>().toEqualTypeOf<Expected>()
  })

  it('when setup returns a render function, falls back to any setupState', () => {
    const setup = () => {
      const message = ref('hello')
      return () => h('div', message.value)
    }

    type Expected = ExpectedSetupStates

    expectTypeOf<WrapperSetupStates<typeof setup>>().toEqualTypeOf<Expected>()

    const _c1 = defineComponent(setup)
    expectTypeOf<WrapperSetupStates<typeof _c1>>().toEqualTypeOf<Expected>()

    const _c2 = defineComponent({ setup })
    expectTypeOf<WrapperSetupStates<typeof _c2>>().toEqualTypeOf<Expected>()

    const _c3 = defineComponent({ render: setup })
    expectTypeOf<WrapperSetupStates<typeof _c3>>().toEqualTypeOf<Expected>()
  })
})
