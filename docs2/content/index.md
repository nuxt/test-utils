---
title: Introduction
description: Easily set up tests for your Nuxt projects
position: 1
---

<img src="/preview.svg" class="light-img"/>
<img src="/preview-dark.svg" class="dark-img"/>

Nuxt Test Utils aims to make it easier to set up tests for your Nuxt projects.

## Features

::list
- Easy to set up tests
- Test in browser
- Extend Jest matchers
- Written in TypeScript
::

## Why `@nuxt/test-utils`?

This library allows you to test your Nuxt projects. It includes unit and end-to-end test helpers, but is not intended as a substitute for component test libraries like [`@vue/test-utils`](https://vue-test-utils.vuejs.org/).

With this library you can interact with a Nuxt instance - whether that is verifying a plugin or module is behaving as expected, getting a fully-rendered server response or conducting client-side browser tests using [`playwright`](https://playwright.dev/).
