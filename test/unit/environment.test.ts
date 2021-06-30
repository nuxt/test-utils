/**
 * @jest-environment ../../../environment
 * @features server
 * @fixture fixtures/basic
 */

import { get } from '../../src'

describe('environment', () => {
  test('request page', async () => {
    const { body } = await get('/')
    expect(body).toContain('Works!')
  })
})
