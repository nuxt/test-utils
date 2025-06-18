import assert from 'node:assert'
import { Given } from '@cucumber/cucumber'
import { $fetch, createPage } from '@nuxt/test-utils/e2e'

Given(/^the user goes on the home page$/u, { timeout: 10000 }, async function (): Promise<void> {
  // Browser test
  const page = await createPage('/')
  // nuxt v3 or nuxt v4 welcome page text
  const text = await page.getByRole('heading', { name: /Welcome to Nuxt!|Get started/ }).textContent()
  assert.match(text!, /Welcome to Nuxt!|Get started/)
  await page.close()

  // SSR test
  const html: string = await $fetch('/')
  assert.match(html, /<!DOCTYPE html>/)
})
