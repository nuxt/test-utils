import { defineComponent, h } from '#imports'
import { useLink } from 'vue-router'

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
