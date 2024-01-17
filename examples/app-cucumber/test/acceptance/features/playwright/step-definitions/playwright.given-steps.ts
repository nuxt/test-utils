import { Given } from '@cucumber/cucumber'
import { createPage } from '@nuxt/test-utils/e2e'

Given(/^the user goes on the home page$/u, async function (): Promise<void> {
  await createPage('/')
})
