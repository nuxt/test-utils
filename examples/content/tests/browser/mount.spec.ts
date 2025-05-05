import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'
import { SomeComponent, ProseH3, ProseP, ComponentWithUseRuntimeConfig, ComponentWithProse } from '#components'

it('should render any component', async () => {
  const { getByText } = await render(SomeComponent)
  expect(getByText('This is an auto-imported component')).toBeInTheDocument()
})

it('should render a ProseP component', async () => {
  const { getByText } = await render(ProseP, { slots: { default: 'This is a Prose Paragraph component' } })
  expect(getByText('This is a Prose Paragraph component')).toBeInTheDocument()
})

it.skip('should render a ProseH3 component', async () => {
  const { getByText } = await render(ProseH3, { slots: { default: 'This is a Prose heading component' } })
  expect(getByText('This is a Prose heading component')).toBeInTheDocument()
})

it.skip('should render a ComponentWithUseRuntimeConfig component', async () => {
  const { getByText } = await render(ComponentWithUseRuntimeConfig)
  expect(getByText('Use Runtime Config')).toBeInTheDocument()
})

it.skip('should render a ComponentWithProse component', async () => {
  const headingText = 'Text rendered within ProseH3'
  const paragraphText = 'Text rendered within p'
  const { getByText } = await render(ComponentWithProse, { props: { heading: headingText, content: paragraphText } })
  expect(getByText(headingText)).toBeInTheDocument()
  expect(getByText(paragraphText)).toBeInTheDocument()
})
