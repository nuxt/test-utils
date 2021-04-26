---
title: Introduction
description: Easily create tests for your Nuxt projects and modules
position: 1
category: ''
categoryPosition: 1
items:
 - Easy to setup tests
 - Test in browser
 - Extend Jest matchers
 - Written in TypeScript
---

<img src="/preview.svg" class="light-img" :alt="description" />
<img src="/preview-dark.svg" class="dark-img" :alt="description" />

Now it's easy to create tests for projects and modules using Nuxt.

## Key features

<list :items="items"></list>

## Nuxt Framework vs Vue Component Testing
@nuxt/test-utils will build an app (or generate a website), launch a server and will provide a browser (all are optional). For example, @nuxt/test-utils might help to check if Nuxt routes, middleware, modules, etc work and if pages are rendered as expected (e.g. collection of components). Focus is on routes, browsing and Nuxt instance, but not Vue components.

Use [@vue/test-utils](https://vue-test-utils.vuejs.org/) to test single Vue components. (vue/test-utils does not build Nuxt apps and knows nothing about Nuxt instances)
