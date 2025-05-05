import { expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { ComponentWithUseRuntimeConfig, ComponentWithProse, SomeComponent, ProseH3, ProseP } from '#components'

it('should render any component', async () => {
  const component = await mountSuspended(SomeComponent)
  expect(component.html()).toContain('This is an auto-imported component')
})

it('should render a ProseH3 component', async () => {
  const headingText = 'This is a Prose Heading component'
  const component = await mountSuspended(ProseH3, { slots: { default: headingText } })
  expect(component.html()).toContain(headingText)
})

it('should render a ProseP component', async () => {
  const paragraphText = 'This is a Prose Paragraph component'
  const component = await mountSuspended(ProseP, { slots: { default: paragraphText } })
  expect(component.html()).toContain(paragraphText)
})

it('should render a ComponentWithUseRuntimeConfig component', async () => {
  const component = await mountSuspended(ComponentWithUseRuntimeConfig)
  expect(component.html()).toContain('Use Runtime Config')
})

it('should render a ComponentWithProse component', async () => {
  const headingText = 'Text rendered within ProseH3'
  const paragraphText = 'Text rendered within p'
  const component = await mountSuspended(ComponentWithProse, { props: { heading: headingText, content: paragraphText } })
  expect(component.html()).toContain(headingText)
  expect(component.html()).toContain(paragraphText)
})
