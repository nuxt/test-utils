import { defineComponent, h, useRouter, useNuxtApp } from '#imports'
import type { useLink as useLinkFn } from 'vue-router'

function getUseLink(nuxtApp: ReturnType<typeof useNuxtApp>) {
  const linkComponent = nuxtApp.vueApp._context.components.RouterLink
  if (!linkComponent || typeof linkComponent !== 'object') return undefined
  if (typeof linkComponent.useLink !== 'function') return undefined
  return linkComponent.useLink.bind(linkComponent) as typeof useLinkFn
}

export const RouterLink = defineComponent({
  functional: true,
  props: {
    to: {
      type: [String, Object],
      required: true,
    },
    custom: Boolean,
    replace: Boolean,
    // Not implemented
    activeClass: String,
    exactActiveClass: String,
    ariaCurrentValue: String,
  },
  setup: (props, { slots }) => {
    const app = useNuxtApp()
    const useLink = getUseLink(app)

    if (!useLink) {
      const navigate = () => {}
      const router = useRouter()
      return () => {
        const route = router.resolve(props.to)

        return props.custom
          ? slots.default?.({ href: route.href, navigate, route })
          : h(
              'a',
              {
                href: route.href,
                onClick: (e: MouseEvent) => {
                  e.preventDefault()
                  return navigate()
                },
              },
              slots,
            )
      }
    }

    const link = useLink(props)

    return () => {
      const route = link.route.value
      const href = link.href.value
      const isActive = link.isActive.value
      const isExactActive = link.isExactActive.value

      return props.custom
        ? slots.default?.({ href, navigate: link.navigate, route, isActive, isExactActive })
        : h(
            'a',
            {
              href,
              onClick: (e: MouseEvent) => {
                e.preventDefault()
                return link.navigate(e)
              },
            },
            slots,
          )
    }
  },
})
