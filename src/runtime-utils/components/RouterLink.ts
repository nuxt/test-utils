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
    const navigate = () => { }
    const router = useRouter()

    return () => {
      const route = router.resolve(props.to)
      const currentRoute = router.currentRoute.value

      const isActive = route.path === currentRoute.path
      const isExactActive = isActive

      return props.custom
        ? slots.default?.({ href: route.href, navigate, route, isActive, isExactActive })
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
