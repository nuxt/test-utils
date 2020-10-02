---
title: Test module
description: ''
position: 4
category: Examples
categoryPosition: 3
---

```js
import { setupTest, getNuxt } from '@nuxtjs/module-test-utils'

describe('module', () => {
  setupTest({
    testDir: __dirname,
    fixture: 'example',
    config: {
      myModule: {
        test: 123
      }
    }
  })

  test('should inject plugin', () => {
    expectModuleToBeCalledWith('addPlugin', {
      src: expect.stringContaining('templates/plugin.js'),
      fileName: 'myPlugin.js',
      options: getNuxt().options.myModule
    })
  })
})
```
