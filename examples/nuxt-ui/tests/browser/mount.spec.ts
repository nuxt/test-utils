import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'
import SomeComponent from '~/components/SomeComponent.vue'

it('should render any component', () => {
  const { getByText } = render(SomeComponent)
  expect(getByText('This component has a dependency on Nuxt UI.')).toBeInTheDocument()
})
