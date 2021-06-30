/**
 * @jest-environment ../../../environment
 * @features server
 * @fixture fixtures/basic
 */

import { get } from '../../src'

describe('environment', () => {
  test('request page', async () => {
    const html = await get('/')
    expect(html).toContain('Works!')
  })
})
