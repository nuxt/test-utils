import { defineComponent, useRouter, h } from '#imports'

export const RouterLink = defineComponent({
  functional: true,
  props: {
    to: [String, Object],
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
      const route = props.to ? useRouter().resolve(props.to) : {}
      return props.custom
        ? slots.default?.({ href: props.to, navigate, route })
        : h(
            'a',
            {
              href: props.to,
              onClick: (e: MouseEvent) => {
                e.preventDefault()
                return navigate()
              },
            },
            slots
          )
    }
  },
})
