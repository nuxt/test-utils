import { expect, it } from 'vitest'
import { render } from 'vitest-browser-vue'
import { SomeComponent, ProseH3, ProseP, ComponentWithUseRuntimeConfig, ComponentWithProse } from '#components'

it('should render any component', () => {
  const { getByText } = render(SomeComponent)
  expect(getByText('This is an auto-imported component')).toBeInTheDocument()
})

it('should render a ProseP component', () => {
  const { getByText } = render(ProseP, { slots: { default: 'This is a Prose Paragraph component' } })
  expect(getByText('This is a Prose Paragraph component')).toBeInTheDocument()
})

it('should render a ProseH3 component', () => {
  const { getByText } = render(ProseH3, { slots: { default: 'This is a Prose heading component' } })
  expect(getByText('This is a Prose heading component')).toBeInTheDocument()
})

it('should render a ComponentWithUseRuntimeConfig component', () => {
  const { getByText } = render(ComponentWithUseRuntimeConfig)
  expect(getByText('Use Runtime Config')).toBeInTheDocument()
})

it('should render a ComponentWithProse component', () => {
  const headingText = 'Text rendered within ProseH3'
  const paragraphText = 'Text rendered within paragraph'
  const { getByText } = render(ComponentWithProse, { props: { heading: headingText, content: paragraphText } })
  expect(getByText(headingText)).toBeInTheDocument()
  expect(getByText(paragraphText)).toBeInTheDocument()
})
