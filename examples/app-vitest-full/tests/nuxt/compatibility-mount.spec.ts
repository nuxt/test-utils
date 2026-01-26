import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import CompostionApi from '~/components/TestComponentWithCompostionApi.vue'
import OptionsApiWithData from '~/components/TestComponentWithOptionsApiWithData.vue'
import OptionsApiWithSetup from '~/components/TestComponentWithOptionsApiWithSetup.vue'

type Options<T> = Parameters<typeof mountSuspended<T>>[1]

describe('mountSuspended() compatible to mount()', () => {
  describe.each([
    { Component: CompostionApi, type: 'CompostionApi', description: '<script setup>' } as const,
    { Component: OptionsApiWithData, type: 'OptionsApi', description: '<script> defineComponent with data' } as const,
    { Component: OptionsApiWithSetup, type: 'OptionsApi', description: '<script> defineComponent with setup' } as const,
  ])('$description', ({ Component, type }) => {
    it.each([
      'hello',
      () => 'hello',
      { template: '<span>hello</span>' },
    ] as const)('html() slot(%o)', async (slot) => {
      const options: Options<typeof Component> = {
        attrs: { class: 'c', title: 'title' },
        props: { modelValue: 'hello' },
        slots: { default: slot },
      }

      const vWrapper = mount(Component, options)
      const nWrapper = await mountSuspended(Component, options)

      expect(nWrapper.html()).toBe(vWrapper.html())
    })

    it('text()', async () => {
      const options: Options<typeof Component> = {
        attrs: { class: 'c', title: 'title' },
        props: { modelValue: 'hello' },
        slots: { default: () => 'world' },
      }

      const vWrapper = mount(Component, options)
      const nWrapper = await mountSuspended(Component, options)

      expect(nWrapper.text()).toBe(vWrapper.text())
    })

    describe('mount options', () => {
      it('global.mocks', async () => {
        const options: Options<typeof Component> = {
          global: { mocks: { $style: { label: 'label-class' } } },
        }

        const vWrapper = mount(Component, options)
        const nWrapper = await mountSuspended(Component, options)

        expect(nWrapper.html()).toBe(vWrapper.html())
      })

      it('global.stubs', async () => {
        const options: Options<typeof Component> = {
          global: { stubs: { SomeComponent: () => 'StubSomeComponent' } },
        }

        const vWrapper = mount(Component, options)
        const nWrapper = await mountSuspended(Component, options)

        expect(nWrapper.html()).toContain('StubSomeComponent')
        expect(nWrapper.html()).toBe(vWrapper.html())
      })
    })

    it('setValue()', async () => {
      const vWrapper = mount(Component, {
        props: {
          'onUpdate:modelValue'(value: string) {
            vWrapper.setProps({ modelValue: value })
          },
        },
      })
      const nWrapper = await mountSuspended(Component, {
        props: {
          'onUpdate:modelValue'(value: string) {
            nWrapper.setProps({ modelValue: value })
          },
        },
      })

      await vWrapper.setValue('hello')
      await nWrapper.setValue('hello')

      await nextTick()

      expect(nWrapper.html()).toBe(vWrapper.html())
    })

    it('setProps()', async () => {
      const vWrapper = mount(Component)
      const nWrapper = await mountSuspended(Component)

      await vWrapper.setProps({ label: 'hello' })
      await nWrapper.setProps({ label: 'hello' })

      expect(nWrapper.html()).toBe(vWrapper.html())
    })

    describe('setData()', () => {
      it.runIf(Component.setup)('throw error if setup is present', async () => {
        const vWrapper = mount(Component)
        const nWrapper = await mountSuspended(Component)

        await expect(async () => await vWrapper.setData({ data1: '1' })).rejects
          .toThrowError(/Cannot add property data1/)
        await expect(async () => await nWrapper.setData({ data1: '1' })).rejects
          .toThrowError(/Cannot add property data1/)
      })

      it.runIf(!Component.setup)('works if setup is absent', async () => {
        const vWrapper = mount(Component)
        const nWrapper = await mountSuspended(Component)

        expect(vWrapper.vm.$data).toEqual(nWrapper.vm.$data)

        await vWrapper.setData({ disabled: true })
        await nWrapper.setData({ disabled: true })

        expect(vWrapper.vm.$data).toEqual({ disabled: true })
        expect(nWrapper.vm.$data).toEqual(vWrapper.vm.$data)
      })
    })

    it('emitted()', async () => {
      const vWrapper = mount(Component)
      const nWrapper = await mountSuspended(Component)

      vWrapper.vm.$emit('blur')
      nWrapper.vm.$emit('blur')

      await nextTick()

      expect(vWrapper.emitted()).toEqual({ blur: [[]] })
      expect(nWrapper.emitted()).toEqual(vWrapper.emitted())
    })

    it('exists()', async () => {
      const vWrapper = mount(Component, { props: { none: true } })
      const nWrapper = await mountSuspended(Component, { props: { none: true } })

      expect(nWrapper.exists()).toBe(true)
      expect(nWrapper.exists()).toBe(vWrapper.exists())
    })

    it('isVisible()', async () => {
      const vWrapper = mount(Component, { props: { none: true } })
      const nWrapper = await mountSuspended(Component, { props: { none: true } })

      expect(nWrapper.isVisible()).toBe(false)
      expect(nWrapper.isVisible()).toBe(vWrapper.isVisible())
    })

    describe('attributes()', () => {
      it('attrs option is not specified', async () => {
        const vWrapper = mount(Component)
        const nWrapper = await mountSuspended(Component)

        expect(nWrapper.attributes()).toEqual(vWrapper.attributes())
      })

      it('attrs option is specified', async () => {
        const options: Options<typeof Component> = {
          attrs: { class: 'c', title: 'title' },
        }

        const vWrapper = mount(Component, options)
        const nWrapper = await mountSuspended(Component, options)

        expect(nWrapper.attributes('class')).toBe(vWrapper.attributes('class'))
      })
    })

    describe('classes()', () => {
      it('attrs.class option is not specified', async () => {
        const vWrapper = mount(Component)
        const nWrapper = await mountSuspended(Component)

        expect(vWrapper.classes()).toEqual([])
        expect(nWrapper.classes()).toEqual([])
      })

      it('attrs.class option is specified', async () => {
        const options: Options<typeof Component> = { attrs: { class: 'c' } }
        const vWrapper = mount(Component, options)
        const nWrapper = await mountSuspended(Component, options)

        expect(vWrapper.classes()).toEqual(['c'])
        expect(nWrapper.classes()).toEqual(['c'])
      })
    })

    it('unmount()', async () => {
      const vWrapper = mount(Component)
      const nWrapper = await mountSuspended(Component)

      vWrapper.unmount()
      nWrapper.unmount()

      await nextTick()

      expect(vWrapper.emitted()).toEqual({ unmount: [[]], unmounted: [[]] })
      expect(nWrapper.emitted()).toEqual(vWrapper.emitted())
    })

    describe('vm', () => {
      it('can read key in setupState', async () => {
        const vWrapper = mount(Component)
        const nWrapper = await mountSuspended(Component)

        expect(nWrapper.vm.disabled).toBe(vWrapper.vm.disabled)
        expect(nWrapper.vm.getValue()).toBe(vWrapper.vm.getValue())
      })

      it('modify value in exposes', async () => {
        const vWrapper = mount(Component)
        const nWrapper = await mountSuspended(Component)

        vWrapper.vm.disabled = true
        nWrapper.vm.disabled = true

        await nextTick()

        expect(nWrapper.html()).toBe(vWrapper.html())
      })

      it('modify value through function in exposes', async () => {
        const vWrapper = mount(Component, {
          props: {
            'onUpdate:modelValue': (value: string) => vWrapper.setProps({ modelValue: value }),
          },
        })

        const nWrapper = await mountSuspended(Component, {
          props: {
            'onUpdate:modelValue': (value: string) => nWrapper.setProps({ modelValue: value }),
          },
        })

        vWrapper.vm.setValue('hello')
        nWrapper.vm.setValue('hello')

        await nextTick()

        expect(nWrapper.html()).toBe(vWrapper.html())
      })
    })

    it('findComponent()', async () => {
      const vWrapper = mount(Component)
      const nWrapper = await mountSuspended(Component)

      const vChild = vWrapper.findComponent({ name: 'SomeComponent' })
      const nChild = nWrapper.findComponent({ name: 'SomeComponent' })

      expect(vChild.html()).toBe(nChild.html())
    })

    it('getComponent()', async () => {
      const vWrapper = mount(Component)
      const nWrapper = await mountSuspended(Component)

      const vChild = vWrapper.getComponent({ name: 'SomeComponent' })
      const nChild = nWrapper.getComponent({ name: 'SomeComponent' })

      expect(vChild.html()).toBe(nChild.html())
    })

    it('find()', async () => {
      const vWrapper = mount(Component)
      const nWrapper = await mountSuspended(Component)

      const vChild = vWrapper.find('[data-testid="container"]')
      const nChild = nWrapper.find('[data-testid="container"]')

      expect(vChild.html()).toBe(nChild.html())
    })

    it('get()', async () => {
      const vWrapper = mount(Component)
      const nWrapper = await mountSuspended(Component)

      const vChild = vWrapper.get('[data-testid="container"]')
      const nChild = nWrapper.get('[data-testid="container"]')

      expect(vChild.html()).toBe(nChild.html())
    })

    describe('getCurrentComponent()', async () => {
      let vWrapper: ReturnType<typeof mount<typeof Component>>
      let nWrapper: Awaited<ReturnType<typeof mountSuspended<typeof Component>>>

      let vComponent: ReturnType<typeof vWrapper['getCurrentComponent']>
      let nComponent: ReturnType<typeof nWrapper['getCurrentComponent']>

      beforeAll(async () => {
        const options: Options<typeof Component> = {
          props: { label: 'p', modelValue: 'i', modelModifiers: {} },
          attrs: { class: 'red' },
          slots: { default: () => h('span', 'hello') },
        }

        vWrapper = mount(Component, options)
        nWrapper = await mountSuspended(Component, options)

        vComponent = vWrapper.getCurrentComponent()
        nComponent = nWrapper.getCurrentComponent()
      })

      afterAll(() => {
        vWrapper.unmount()
        nWrapper.unmount()
      })

      it('props', () => {
        expect(vComponent.props).toEqual(
          { label: 'p', modelValue: 'i', modelModifiers: {}, none: false, show: true },
        )
        expect(nComponent.props).toEqual(
          { label: 'p', modelValue: 'i', modelModifiers: {}, none: false, show: true },
        )
      })

      it('attrs', () => {
        expect(vComponent.attrs).toEqual({ class: 'red' })
        expect(nComponent.attrs).toEqual({ class: 'red' })
      })

      describe('proxy', () => {
        it('(props)', () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const [vproxy, nproxy] = [vComponent.proxy, nComponent.proxy] as any[]

          expect(vproxy.label).toBe('p')
          expect(vproxy.modelValue).toBe('i')
          expect(vproxy.modelModifiers).toEqual({})
          expect(vproxy.none).toBe(false)
          expect(vproxy.show).toBe(true)

          expect(nproxy.label).toBe(vproxy.label)
          expect(nproxy.modelValue).toBe(vproxy.modelValue)
          expect(nproxy.modelModifiers).toEqual(vproxy.modelModifiers)
          expect(nproxy.none).toBe(vproxy.none)
          expect(nproxy.show).toBe(vproxy.show)
        })

        it.runIf(type === 'CompostionApi')('(not props)', () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const [vproxy, nproxy] = [vComponent.proxy, nComponent.proxy] as any[]

          // cannot access setupState data via the proxy in original mount()
          expect(vproxy.getValue).toBeUndefined()
          expect(vproxy.setValue).toBeUndefined()
          expect(vproxy.disabled).toBeUndefined()
          expect(vproxy.counter).toBeUndefined()

          // can access setupState data via the proxy
          // for compatibity for nuxt/test-utils v3.20.0
          expect(nproxy.setValue).toBeTypeOf('function')
          expect(nproxy.getValue()).toBe('i')
          expect(nproxy.disabled.value).toBe(false)
          expect(nproxy.counter.value).toBe('[1/30]')
        })

        it.runIf(type === 'OptionsApi' && Component.setup)('(not props)', () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const [vproxy, nproxy] = [vComponent.proxy, nComponent.proxy] as any[]

          expect(nproxy.modelValue).toBe(vproxy.modelValue)
          expect(nproxy.counter).toBe(vproxy.counter)
          expect(nproxy.getValue()).toBe(vproxy.getValue())
          expect(nproxy.setValue).toBeTypeOf('function')
          expect(vproxy.setValue).toBeTypeOf('function')

          // for compatibity for nuxt/test-utils v3.20.0
          expect(nproxy.disabled.value).toBe(vproxy.disabled)
        })

        it.runIf(type === 'OptionsApi' && !Component.setup)('(not props)', () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const [vproxy, nproxy] = [vComponent.proxy, nComponent.proxy] as any[]

          expect(nproxy.modelValue).toBe(vproxy.modelValue)
          expect(nproxy.counter).toBe(vproxy.counter)
          expect(nproxy.getValue()).toBe(vproxy.getValue())
          expect(nproxy.setValue).toBeTypeOf('function')
          expect(vproxy.setValue).toBeTypeOf('function')
          expect(nproxy.disabled).toBe(vproxy.disabled)
        })
      })

      it('refs', () => {
        expect(vComponent.refs.inputRef).toMatchObject({ id: 'input' })
        expect(nComponent.refs.inputRef).toMatchObject({ id: 'input' })
      })

      it('slots', () => {
        const vMount = mount(vComponent.slots.default)
        const nMount = mount(nComponent.slots.default)
        expect(vMount.text()).toBe('hello')
        expect(nMount.text()).toBe(vMount.text())
      })

      it('exposed', () => {
        expect(Reflect.ownKeys(nComponent.exposed ?? {})).toEqual(Reflect.ownKeys(vComponent.exposed ?? {}))
        expect(nComponent.exposed?.disabled?.value).toBe(vComponent.exposed?.disabled?.value)
        expect(typeof nComponent.exposed?.setValue).toBe(typeof vComponent.exposed?.setValue)
        expect(nComponent.exposed?.getValue?.()).toBe(vComponent.exposed?.getValue?.())
      })

      it('vnode', () => {
        const vtype = vComponent.vnode.type as Record<string, unknown>
        const ntype = nComponent.vnode.type as Record<string, unknown>
        expect(ntype.emits).not.toEqual([])
        expect(ntype.emits).toEqual(vtype.emits)
        expect(ntype.props).toHaveProperty('label')
        expect(ntype.props).toEqual(vtype.props)
        expect(ntype.components).toEqual({})
        expect(ntype.components).toEqual(vtype.components)
      })
    })
  })

  describe('defineComponent', () => {
    it('setup and render', async () => {
      const component = defineComponent({
        setup() {
          const data1 = ref([...'hello'])
          const data2 = [...'world']
          return { data1, data2 }
        },
        render() {
          return h('div', [this.data1.join(''), ' ', this.data2.join('')])
        },
      })

      const vWrapper = mount(component)
      const nWrapper = await mountSuspended(component)

      expect(nWrapper.html()).toBe(vWrapper.html())
    })

    it('setup and template', async () => {
      const component = defineComponent({
        setup() {
          const data1 = ref('hello')
          const data2 = 'world'
          return { data1, data2 }
        },
        template: '<div>{{ data1 }} {{ data2 }}</div>',
      })

      const vWrapper = mount(component)
      const nWrapper = await mountSuspended(component)

      expect(nWrapper.html()).toBe(vWrapper.html())
    })
  })

  it('wrapper writable', async () => {
    const component = defineComponent({
      template: 'hello',
    })

    const vWrapper = mount(component)
    const nWrapper = await mountSuspended(component)

    Object.assign(vWrapper, { data: 'hello' })
    Object.assign(nWrapper, { data: 'hello' })

    expect('data' in vWrapper).toBe(true)
    expect('data' in nWrapper).toBe(true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((nWrapper as any).data).toBe((vWrapper as any).data)
  })

  it('getCurrentComponent().proxy for compatibity for nuxt/test-utils v3.20.0', async () => {
    const wrapper = await mountSuspended(CompostionApi)
    const proxy = wrapper.getCurrentComponent().proxy as typeof wrapper.setupState

    expect(proxy.disabled.value).toBe(false)
    expect(proxy.getValue()).toBe('')
    expect(proxy.counter.value).toBe('[0/30]')

    proxy.setValue('world')
    expect(proxy.getValue()).toBe('world')
    expect(proxy.counter.value).toBe('[5/30]')

    proxy.disabled.value = true
    expect(proxy.disabled.value).toBe(true)
    expect(proxy.counter.value).toBe('')
  })
})
