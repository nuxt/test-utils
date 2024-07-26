import assert from 'node:assert'
import { Given } from '@cucumber/cucumber'
import { $fetch, createPage } from '@nuxt/test-utils/e2e'

Given(/^the user goes on the home page$/u, async function (): Promise<void> {
  // Browser test
  const page = await createPage('/')
  const text = await page.getByRole('heading', { name: 'Welcome to Nuxt!' }).textContent()
  assert.match(text!, /Welcome to Nuxt!/)
  await page.close()

  // SSR test
  const html: string = await $fetch('/')
  assert.match(html, /<!DOCTYPE html>/)
})
