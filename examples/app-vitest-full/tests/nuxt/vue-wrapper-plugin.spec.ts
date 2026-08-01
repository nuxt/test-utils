import { afterEach, describe, it, expect } from 'vitest'
import { enableAutoUnmount, config } from '@vue/test-utils'
import { mountSuspended, renderSuspended } from '@nuxt/test-utils/runtime'

import type { Component, DefineComponent } from 'vue'

import { NuxtLayout, NuxtPage } from '#components'

import App from '~/app.vue'

describe('vue-wrapper-plugin', () => {
  const wrapperFns = [
    mountSuspended,
    renderSuspended,
  ].map(wrapperFn => ({ wrapperFn, wrapperFnName: wrapperFn.name }))

  describe('hasNuxtPage', () => {
    enableAutoUnmount(afterEach)

    const components: ReadonlyArray<Component | DefineComponent> = [
      { name: 'App', ...App },
      { name: 'setup1', setup: () => () => h(NuxtPage) },
      { name: 'setup2', setup: () => () => h(NuxtLayout, {}, () => h(NuxtPage)) },
      { name: 'render1', render: () => h(NuxtLayout, {}, () => h(NuxtPage)) },
    ]

    it.each(wrapperFns.flatMap(
      ({ wrapperFn, wrapperFnName }) => components.map(Component => ({
        wrapperFnName,
        wrapperFn,
        Component,
        componentName: Component.name,
      }))),
    )('should return true if <NuxtPage> is exists $wrapperFnName $componentName',
      async ({ wrapperFn, Component }) => {
        expect(hasNuxtPage()).toBe(false)
        await wrapperFn(Component)
        expect(hasNuxtPage()).toBe(true)
      })

    it.each(wrapperFns)(
      'should return false if <NuxtPage> is unmounted $wrapperFnName',
      async ({ wrapperFn }) => {
        expect(hasNuxtPage()).toBe(false)
        const wrapper = await wrapperFn(
          { setup: () => () => h(NuxtPage) },
        )
        expect(hasNuxtPage()).toBe(true)
        wrapper.unmount()
        expect(hasNuxtPage()).toBe(false)
      })

    it.each(wrapperFns)(
      'should return false if <NuxtPage> is not exists $wrapperFnName',
      async ({ wrapperFn }) => {
        expect(hasNuxtPage()).toBe(false)
        await wrapperFn(
          { setup: () => () => h('div') },
        )
        expect(hasNuxtPage()).toBe(false)
      })
  })

  function getVueWrapperPlugin() {
    const plugins = config.plugins.VueWrapper.installedPlugins
    return plugins.find(
      ({ options }) => options._name === 'nuxt-test-utils',
    )!.options
  }

  function hasNuxtPage() {
    return getVueWrapperPlugin().hasNuxtPage()
  }
})
