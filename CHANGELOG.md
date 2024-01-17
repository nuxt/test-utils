# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v3.10.0

[compare changes](https://github.com/nuxt/test-utils/compare/v3.9.0...v3.10.0)

### 🚀 Enhancements

- **e2e:** Add `cucumber` test runner ([#711](https://github.com/nuxt/test-utils/pull/711))
- **e2e:** Support `env` option for `startServer` ([#640](https://github.com/nuxt/test-utils/pull/640))

### 🩹 Fixes

- **runtime-utils:** Resolve `to` in `RouterLink` stub ([#687](https://github.com/nuxt/test-utils/pull/687))
- Mark `afterAll` and `setup` hooks as async ([#702](https://github.com/nuxt/test-utils/pull/702))
- **module:** Always append import when mocking ([#701](https://github.com/nuxt/test-utils/pull/701))

### 🏡 Chore

- Add required dev deps to `app-vitest` example ([#712](https://github.com/nuxt/test-utils/pull/712))
- Pin vue/nuxt versions ([00674cd0](https://github.com/nuxt/test-utils/commit/00674cd0))

### ✅ Tests

- Update config key ([25060645](https://github.com/nuxt/test-utils/commit/25060645))
- Add example test for nuxt-injected value ([#663](https://github.com/nuxt/test-utils/pull/663))
- Update to actually use `$t` ([#675](https://github.com/nuxt/test-utils/pull/675))

### 🤖 CI

- Fetch-depth: 0 ([269df289](https://github.com/nuxt/test-utils/commit/269df289))

### ❤️ Contributors

- Bobbie Goede <bobbiegoede@gmail.com>
- Daniel Roe <daniel@roe.dev>
- Julien Huang <julien.huang@outlook.fr>
- Steve Pewsey <stevenpewsey@gmail.com>

## v3.9.0

[compare changes](https://github.com/nuxt/test-utils/compare/v3.8.1...v3.9.0)

### 🚀 Enhancements

- Add nuxt-vitest re-exports ([#230](https://github.com/nuxt/test-utils/pull/230))
- Add nuxt-vitest and vitest-environment-nuxt code and tests ([f4ae58ac](https://github.com/nuxt/test-utils/commit/f4ae58ac))
- Use internal implementation of nuxt-vitest ([#235](https://github.com/nuxt/test-utils/pull/235))
- **e2e:** Auto-detect jest runner ([ae37b0ee](https://github.com/nuxt/test-utils/commit/ae37b0ee))
- ⚠️  Read .env.test + allow overriding with nuxt.dotenv ([#655](https://github.com/nuxt/test-utils/pull/655))

### 🩹 Fixes

- Add @nuxt/test-utils-nightly to deps to inline ([0caf44d0](https://github.com/nuxt/test-utils/commit/0caf44d0))
- Use implied .d.mts types ([d9694f21](https://github.com/nuxt/test-utils/commit/d9694f21))
- Add setupState type to mountSuspended return type ([#400](https://github.com/nuxt/test-utils/pull/400))
- Add runtime fixture to workspace and address regressions ([#240](https://github.com/nuxt/test-utils/pull/240))
- Opt-in to future vitest option ([#247](https://github.com/nuxt/test-utils/pull/247))
- Use vite-ignore for playwright dynamic import ([c1ac4a08](https://github.com/nuxt/test-utils/commit/c1ac4a08))
- Do not set process.browser globally ([#250](https://github.com/nuxt/test-utils/pull/250))
- Support transpiling nuxt nightly releases ([c63f69c8](https://github.com/nuxt/test-utils/commit/c63f69c8))
- Rewrite mock plugin for compat with vite 5/rollup 4 ([d0ba5af3](https://github.com/nuxt/test-utils/commit/d0ba5af3))
- Do not skip transforms on test files ([3bbcc1ea](https://github.com/nuxt/test-utils/commit/3bbcc1ea))
- Add @vitest/ui to peer deps ([7f4f6053](https://github.com/nuxt/test-utils/commit/7f4f6053))
- Use buildDir option ([#596](https://github.com/nuxt/test-utils/pull/596))
- ⚠️  Load nuxt app within setupFiles ([#260](https://github.com/nuxt/test-utils/pull/260))
- Teardown build directories after tests ([#597](https://github.com/nuxt/test-utils/pull/597))
- Import useRouter explicitly in entry ([129d8335](https://github.com/nuxt/test-utils/commit/129d8335))
- Return absolute path for stub entry ([180bb306](https://github.com/nuxt/test-utils/commit/180bb306))
- Don't return absolute path in dev mode ([f47dd9a3](https://github.com/nuxt/test-utils/commit/f47dd9a3))
- Clone overrides ([df84d0c1](https://github.com/nuxt/test-utils/commit/df84d0c1))
- Skip vite-plugin-vue-inspector:post plugin ([8a6a0523](https://github.com/nuxt/test-utils/commit/8a6a0523))
- Clean up wrappers when calling renderSuspended ([5b189115](https://github.com/nuxt/test-utils/commit/5b189115))
- Exclude vite-plugin-checker from runtime vitest config ([053a5dff](https://github.com/nuxt/test-utils/commit/053a5dff))
- Resolve devtools url after vitest config is resolved ([1206db79](https://github.com/nuxt/test-utils/commit/1206db79))
- Remove module override of app.rootId ([e662c1f0](https://github.com/nuxt/test-utils/commit/e662c1f0))
- Remove rootId environment option ([dead5e3d](https://github.com/nuxt/test-utils/commit/dead5e3d))
- Add back rootId environment option" ([827180ec](https://github.com/nuxt/test-utils/commit/827180ec))
- **runtime-utils:** Don't stub helpers when shallow ([#632](https://github.com/nuxt/test-utils/pull/632))
- Avoid enumerating keys on render context ([43b2724b](https://github.com/nuxt/test-utils/commit/43b2724b))
- Support typescript entry file ([c5806009](https://github.com/nuxt/test-utils/commit/c5806009))
- **vitest-environment:** Normalise setupFiles before merge ([#653](https://github.com/nuxt/test-utils/pull/653))
- **module:** Close nuxt before shutting down ([17cf9435](https://github.com/nuxt/test-utils/commit/17cf9435))
- **runtime:** Do not assign readonly setup state ([8d799275](https://github.com/nuxt/test-utils/commit/8d799275))
- **runtime:** Implement setProps ([522f8bf5](https://github.com/nuxt/test-utils/commit/522f8bf5))
- **vitest-environment:** Handle different entry format ([5c07bb48](https://github.com/nuxt/test-utils/commit/5c07bb48))
- **runtime:** Import reactive and unref ([d68cdae9](https://github.com/nuxt/test-utils/commit/d68cdae9))

### 💅 Refactors

- Move to monorepo ([#31](https://github.com/nuxt/test-utils/pull/31))
- Split core utils to core/ ([f144cb40](https://github.com/nuxt/test-utils/commit/f144cb40))
- Clean up internal code imports ([#245](https://github.com/nuxt/test-utils/pull/245))
- Use defu rather than mergeConfig from vite ([#246](https://github.com/nuxt/test-utils/pull/246))
- Further split vitest from vite config ([ef58e4cb](https://github.com/nuxt/test-utils/commit/ef58e4cb))
- Split out mock transform plugin w/ tests ([a37fa408](https://github.com/nuxt/test-utils/commit/a37fa408))
- Remove rollup implementation of transform plugin ([71345967](https://github.com/nuxt/test-utils/commit/71345967))
- **module:** Rename config key to testUtils ([c2b09732](https://github.com/nuxt/test-utils/commit/c2b09732))

### 📖 Documentation

- **playground:** Demo usage of co-exists unit and nuxt testing ([#6](https://github.com/nuxt/test-utils/pull/6))
- Add JSDoc comments ([#205](https://github.com/nuxt/test-utils/pull/205))
- Add documentation for mountSuspended ([#227](https://github.com/nuxt/test-utils/pull/227))
- Add basic README and missing LICENCE ([51eb9de2](https://github.com/nuxt/test-utils/commit/51eb9de2))
- Remove links to nuxt-vitest ([254605df](https://github.com/nuxt/test-utils/commit/254605df))
- Update links to nuxt docs on testing ([2e619a89](https://github.com/nuxt/test-utils/commit/2e619a89))

### 📦 Build

- Fix build issues and correct dependencies ([3e2f8b29](https://github.com/nuxt/test-utils/commit/3e2f8b29))
- Move runtime-utils.mjs -> runtime-utils/index.mjs ([#634](https://github.com/nuxt/test-utils/pull/634))
- ⚠️  Use /runtime subpath export ([de9a2a81](https://github.com/nuxt/test-utils/commit/de9a2a81))
- Prefer /e2e subpath export ([88952fb0](https://github.com/nuxt/test-utils/commit/88952fb0))

### ✅ Tests

- Update playground to 0.4.5 devtools ([7d4a6b28](https://github.com/nuxt/test-utils/commit/7d4a6b28))
- Add useHead to fixture ([6d4bb420](https://github.com/nuxt/test-utils/commit/6d4bb420))
- Add type tests ([9de62b6e](https://github.com/nuxt/test-utils/commit/9de62b6e))
- Await 2 ticks after navigation for route to update ([cb6c1e3a](https://github.com/nuxt/test-utils/commit/cb6c1e3a))
- Correct test assertion ([c644bdb3](https://github.com/nuxt/test-utils/commit/c644bdb3))
- Avoid depending on specific number of ticks ([e98d71ea](https://github.com/nuxt/test-utils/commit/e98d71ea))
- Update test to use server rather than live api ([7df6be28](https://github.com/nuxt/test-utils/commit/7df6be28))
- Add a few more basic examples for e2e tests ([490753c4](https://github.com/nuxt/test-utils/commit/490753c4))
- Add jest example/test ([#224](https://github.com/nuxt/test-utils/pull/224))
- Add type test ([#241](https://github.com/nuxt/test-utils/pull/241))
- Make indexeddb plugin client-only ([0477e414](https://github.com/nuxt/test-utils/commit/0477e414))
- Add tests for events emitted from defineModel ([#629](https://github.com/nuxt/test-utils/pull/629))
- Add failing test for exposed methods on components within suspense ([a4ec3f83](https://github.com/nuxt/test-utils/commit/a4ec3f83))
- Remove workaround for route update ([c9699ad1](https://github.com/nuxt/test-utils/commit/c9699ad1))
- Add example of importing a dynamic route ([fe420b9c](https://github.com/nuxt/test-utils/commit/fe420b9c))
- Re-organise test suite ([9c877821](https://github.com/nuxt/test-utils/commit/9c877821))
- Add failing test for setProps ([dc93e003](https://github.com/nuxt/test-utils/commit/dc93e003))
- Reenable expose test ([204037e4](https://github.com/nuxt/test-utils/commit/204037e4))
- Add example fixture with @nuxt/content ([#631](https://github.com/nuxt/test-utils/pull/631))
- Add example fixture with @nuxtjs/i18n ([#633](https://github.com/nuxt/test-utils/pull/633))
- Add generate assertion and enable browser ([94513939](https://github.com/nuxt/test-utils/commit/94513939))

### 🎨 Styles

- Lint ([35ee16ef](https://github.com/nuxt/test-utils/commit/35ee16ef))
- Lint and update test ([cd4dbf9d](https://github.com/nuxt/test-utils/commit/cd4dbf9d))
- Lint ([91723acc](https://github.com/nuxt/test-utils/commit/91723acc))
- Lint ([caf4d827](https://github.com/nuxt/test-utils/commit/caf4d827))
- Lint ([8b428b46](https://github.com/nuxt/test-utils/commit/8b428b46))
- Sort imports ([6c84c9e4](https://github.com/nuxt/test-utils/commit/6c84c9e4))

### 🤖 CI

- Add testing workflow ([ce74b0b5](https://github.com/nuxt/test-utils/commit/ce74b0b5))
- Add lint workflow for pushes to main ([f141b8d4](https://github.com/nuxt/test-utils/commit/f141b8d4))
- Add workflow to test examples ([0c3c318f](https://github.com/nuxt/test-utils/commit/0c3c318f))
- Prepare environment before running module test ([5be069dc](https://github.com/nuxt/test-utils/commit/5be069dc))
- 'nightly' releases on pushes to main ([#210](https://github.com/nuxt/test-utils/pull/210))
- Fetch full history ([d61614b1](https://github.com/nuxt/test-utils/commit/d61614b1))
- Install playwright manually ([58906de3](https://github.com/nuxt/test-utils/commit/58906de3))
- Remove extra branch from release workflow ([e24d884f](https://github.com/nuxt/test-utils/commit/e24d884f))
- Prepare build environment ([6d8e71ad](https://github.com/nuxt/test-utils/commit/6d8e71ad))
- Run unit tests in ci ([cbd5616a](https://github.com/nuxt/test-utils/commit/cbd5616a))
- Support automated release prs ([#623](https://github.com/nuxt/test-utils/pull/623))
- Fetch all commits in creating changelog ([6f22b096](https://github.com/nuxt/test-utils/commit/6f22b096))
- Disable changelog creation script for now ([5ef70c35](https://github.com/nuxt/test-utils/commit/5ef70c35))
- Reenable changelogensets ([fb754d54](https://github.com/nuxt/test-utils/commit/fb754d54))

#### ⚠️ Breaking Changes

- ⚠️  Read .env.test + allow overriding with nuxt.dotenv ([#655](https://github.com/nuxt/test-utils/pull/655))
- ⚠️  Ignore query params when checking if an endpoint is mocked ([c1f8890b](https://github.com/nuxt/test-utils/commit/c1f8890b))
- ⚠️  Load nuxt app within setupFiles ([#260](https://github.com/nuxt/test-utils/pull/260))
- ⚠️  Use /runtime subpath export ([de9a2a81](https://github.com/nuxt/test-utils/commit/de9a2a81))
- ⚠️  Drop support for vitest < 0.34 ([#654](https://github.com/nuxt/test-utils/pull/654))

### ❤️ Contributors

- Daniel Roe <daniel@roe.dev>
- Harlan Wilton ([@harlan-zw](http://github.com/harlan-zw))
- Tim Van Den Eijnden 
- Juho Rutila ([@nice-game-hints](http://github.com/nice-game-hints))
- Ola Alsaker ([@OlaAlsaker](http://github.com/OlaAlsaker))
- Erikwu 
- Yasser Lahbibi ([@yassilah](http://github.com/yassilah))
- Pooya Parsa <pyapar@gmail.com>
- Julien Huang ([@huang-julien](http://github.com/huang-julien))
- Niko-chaffinchicas 
- Oskar Olsson 
- Aapo Kiiso ([@aapokiiso](http://github.com/aapokiiso))
- Anthony Fu <anthonyfu117@hotmail.com>
- Ryoji-yamauchi-blc 
- Enkot ([@enkot](http://github.com/enkot))
- 邓超 ([@DevDengChao](http://github.com/DevDengChao))
- Vasily Kuzin ([@ExEr7um](http://github.com/ExEr7um))
- Maarten Van Hunsel 
- Odynn Aguilar <fenix_xg0d@outlook.com>
- Floriankapaun 
- Mark Van Alphen ([@mvanalphen](http://github.com/mvanalphen))
- Ghazi Alhouwari 
- Paul Melero


