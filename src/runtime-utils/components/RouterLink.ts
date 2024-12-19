import { defineComponent, h, useRouter } from '#imports'

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
    const navigate = () => {}
    return () => {
      const route = useRouter().resolve(props.to)

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
  },
})
