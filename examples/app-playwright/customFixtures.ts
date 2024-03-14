import { test as base } from '@playwright/test';
import type { TestHooks, setup } from '@nuxt/test-utils/e2e';
import { createTest, url } from '@nuxt/test-utils/e2e'

export type ConfigOptions = {
  nuxt: Parameters<typeof setup>[0];
}

type WorkerOptions = {
  hooks: TestHooks;
};

export const test = base.extend<ConfigOptions, WorkerOptions>({
  nuxt: [null, { option: true, scope: 'worker' }],
  hooks: [async ({nuxt}, use) => {
    const hooks = await createTest(nuxt);
    await hooks.setup();
    await use(hooks)
    await hooks.afterAll()
  }, { scope: 'worker' }],
  baseURL: async ({hooks}, use) => {
    await hooks.beforeEach();
    await use(url('/'))
    await hooks.afterEach()
  }
});

export { expect } from '@playwright/test';
