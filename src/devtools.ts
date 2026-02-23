import { h } from 'vue'
import { provider } from 'std-env'
import { debounce } from 'perfect-debounce'
import { addDevServerHandler, useNuxt } from '@nuxt/kit'
import { addCustomTab, refreshCustomTabs } from '@nuxt/devtools-kit'
import type { ModuleCustomTab } from '@nuxt/devtools-kit/types'

import type { VitestWrapper } from './vitest-wrapper/host'

export async function setupDevTools(
  vitestWrapper: VitestWrapper,
  nuxt = useNuxt(),
) {
  const iframeSrc = '/__test_utils_vitest__/'

  const updateTabs = debounce(() => {
    refreshCustomTabs(nuxt)
  }, 100)

  addCustomTab(() => createVitestCustomTab(vitestWrapper, { iframeSrc }), nuxt)

  addDevServerHandler({
    route: iframeSrc,
    handler: Object.assign(() => iframeContentHtml(vitestWrapper.uiUrl), { __is_handler__: true as const }),
  })

  vitestWrapper.ons({
    started() {
      updateTabs()
    },
    updated() {
      updateTabs()
    },
    finished() {
      updateTabs()
    },
    exited() {
      updateTabs()
    },
  })
}

function createVitestCustomTab(
  vitest: VitestWrapper,
  { iframeSrc }: { iframeSrc: string },
) {
  const launchView: ModuleCustomTab['view'] = {
    type: 'launch',
    description: 'Start tests along with Nuxt',
    actions: [
      {
        get label() {
          switch (vitest.status) {
            case 'starting': return 'Starting...'
            case 'running': return 'Running Vitest'
            case 'stopped': return 'Start Vitest'
            case 'finished': return 'Start Vitest'
          }
        },
        get pending() {
          return vitest.status === 'starting' || vitest.status === 'running'
        },
        handle: () => {
          vitest.start()
        },
      },
    ],
  }

  const uiView: ModuleCustomTab['view'] = {
    type: 'iframe',
    persistent: false,
    src: iframeSrc,
  }

  const tab: ModuleCustomTab = {
    title: 'Vitest',
    name: 'vitest',
    icon: 'logos-vitest',
    get view() {
      if (vitest.status === 'stopped' || vitest.status === 'starting' || !vitest.uiUrl) {
        return launchView
      }
      else {
        return uiView
      }
    },
    extraTabVNode: vitest.testSummary.totalCount
      ? h('div', { style: { color: vitest.testSummary.failedCount ? 'orange' : 'green' } }, [
          h('span', {}, vitest.testSummary.passedCount),
          h('span', { style: { opacity: '0.5', fontSize: '0.9em' } }, '/'),
          h(
            'span',
            { style: { opacity: '0.8', fontSize: '0.9em' } },
            vitest.testSummary.totalCount,
          ),
        ])
      : undefined,
  }

  return tab
}

function iframeContentHtml(uiUrl: string | undefined) {
  return [
    '<html><head><script>',
    `(${function redirect(uiUrl: string, provider: string) {
      if (typeof window === 'undefined') return

      if (!uiUrl) return

      if (provider === 'stackblitz') {
        const url = new URL(window.location.href)
        const newUrl = new URL(uiUrl)
        newUrl.host = url.host.replace(/--\d+--/, `--${newUrl.port}--`)
        newUrl.protocol = url.protocol
        newUrl.port = url.port
        uiUrl = newUrl.toString()
      }

      window.location.replace(uiUrl)
    }})(${JSON.stringify(uiUrl)}, ${JSON.stringify(provider)})`,
    '</script></head></html>',
  ].join('\n')
}
